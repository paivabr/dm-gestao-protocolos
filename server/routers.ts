import { TRPCError } from "@trpc/server";
import { googleCalendarRouter } from "./routers-google";
import { z } from "zod";
import * as auth from "./auth";
import * as db from "./db";
import { storagePut } from "./storage";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as googleCalendar from "./google-calendar";

export const appRouter = router({
  // ============ AUTH ROUTES ============
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(
        z.object({
          username: z.string().min(1, "Username é obrigatório"),
          password: z.string().min(1, "Senha é obrigatória"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await auth.loginUser(input.username, input.password);

        if (!result.success) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: result.error,
          });
        }

        const cookieOptions = getSessionCookieOptions(ctx.req);
        const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
        ctx.res.cookie(COOKIE_NAME, result.sessionToken, {
          ...cookieOptions,
          maxAge: sessionDuration,
        });

        return { success: true, user: result.user };
      }),

    register: publicProcedure
      .input(
        z.object({
          username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
          email: z.string().email("Email inválido"),
          password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
          name: z.string().min(1, "Nome é obrigatório"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await auth.registerUser(
          input.username,
          input.email,
          input.password,
          input.name
        );

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error,
          });
        }

        const cookieOptions = getSessionCookieOptions(ctx.req);
        const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
        ctx.res.cookie(COOKIE_NAME, result.sessionToken, {
          ...cookieOptions,
          maxAge: sessionDuration,
        });

        return { success: true, user: result.user };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          fotoPerfil: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // If fotoPerfil is provided as base64, upload to S3
        let updateData: any = { ...input };
        if (input.fotoPerfil && input.fotoPerfil.startsWith('data:')) {
          try {
            // Convert base64 to buffer
            const base64Data = input.fotoPerfil.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Upload to S3
            const fileKey = `users/${ctx.user.id}/profile-photo-${Date.now()}.jpg`;
            const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
            
            updateData.fotoPerfil = url;
          } catch (error) {
            console.error('[Upload] Failed to upload profile photo:', error);
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao fazer upload da foto' });
          }
        }
        
        const success = await db.updateUserProfile(ctx.user.id, updateData);
        return { success, fotoPerfil: updateData.fotoPerfil };
      }),

    updatePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1, "Senha atual eh obrigatoria"),
          newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const user = await db.getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Usuario nao encontrado" });
        if (!user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não tem senha" });
        
        const isValid = auth.verifyPassword(input.currentPassword, user.passwordHash);
        if (!isValid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha atual incorreta" });
        
        const newPasswordHash = await auth.hashPassword(input.newPassword);
        const success = await db.updateUserPassword(ctx.user.id, newPasswordHash);
        return { success };
      }),
  }),

  // ============ CLIENTE ROUTES ============
  clientes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Verificar permissão
      if (ctx.user?.role !== "admin") {
        const permissions = await db.getUserPermissions(ctx.user?.id || 0);
        if (!permissions?.canViewClients) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para visualizar clientes" });
        }
      }
      return await db.getClientes();
    }),

    listPaginated: protectedProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
        })
      )
      .query(async ({ input }) => {
        return await db.getClientesPaginated(input.page, input.limit);
      }),

    create: protectedProcedure
      .input(
        z.object({
          nome: z.string().min(1, "Nome é obrigatório"),
          cpfCnpj: z.string().min(1, "CPF/CNPJ é obrigatório"),
          contato: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar permissão
        if (ctx.user?.role !== "admin") {
          const permissions = await db.getUserPermissions(ctx.user?.id || 0);
          if (!permissions?.canCreateClient) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para criar clientes" });
          }
        }
        const clienteId = await db.createCliente({
          nome: input.nome,
          cpfCnpj: input.cpfCnpj,
          contato: input.contato,
        });

        if (!clienteId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar cliente",
          });
        }

        // Registrar auditoria
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: 'clientes',
            registroId: clienteId,
            acao: 'criar',
            alteracoes: `Criou cliente: ${input.nome}`,
          });
        }

        return await db.getClienteById(clienteId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          nome: z.string().optional(),
          cpfCnpj: z.string().optional(),
          contato: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.updateCliente(input.id, {
          nome: input.nome,
          cpfCnpj: input.cpfCnpj,
          contato: input.contato,
        });

        // Registrar auditoria
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: 'clientes',
            registroId: input.id,
            acao: 'editar',
            alteracoes: `Editou cliente: ${input.nome || 'sem nome'}`,
          });
        }

        return await db.getClienteById(input.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCliente(input.id);
        return { success: true };
      }),
  }),

  // ============ PROCESSO ROUTES ============
  processos: router({
    list: protectedProcedure.query(async () => {
      const processos = await db.getProcessos();
      const clientes = await db.getClientes();
      const clienteMap = new Map(clientes.map(c => [c.id, c]));

      return processos.map(p => ({
        ...p,
        cliente: clienteMap.get(p.clienteId),
      }));
    }),

    listPaginated: protectedProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
        })
      )
      .query(async ({ input }) => {
        return await db.getProcessosPaginated(input.page, input.limit);
      }),

    create: protectedProcedure
      .input(
        z.object({
          titulo: z.string().min(1, "Título é obrigatório"),
          clienteId: z.number(),
          status: z.enum(["Pendente", "Em Análise", "Protocolado", "Finalizado", "Campo", "Análise/Escritório", "Pendente documento"]),
          prazoVencimento: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const processoId = await db.createProcesso({
          titulo: input.titulo,
          clienteId: input.clienteId,
          status: input.status,
          prazoVencimento: input.prazoVencimento,
        });

        if (!processoId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar processo",
          });
        }

        // Registrar auditoria
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            acao: "criar",
            tabela: "processos",
            registroId: processoId,
            alteracoes: JSON.stringify(input),
          });
        }

        return await db.getProcessoById(processoId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          titulo: z.string().optional(),
          clienteId: z.number().optional(),
          status: z.enum(["Pendente", "Em Análise", "Protocolado", "Finalizado", "Campo", "Análise/Escritório", "Pendente documento"]).optional(),
          prazoVencimento: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar permissão
        if (ctx.user?.role !== "admin") {
          const permissions = await db.getUserPermissions(ctx.user?.id || 0);
          if (!permissions?.canEditProcess) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para editar processos" });
          }
        }
        await db.updateProcesso(input.id, {
          titulo: input.titulo,
          status: input.status,
          prazoVencimento: input.prazoVencimento,
        });

        // Registrar auditoria
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            acao: "editar",
            tabela: "processos",
            registroId: input.id,
            alteracoes: JSON.stringify(input),
          });
        }

        return await db.getProcessoById(input.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verificar permissão
        if (ctx.user?.role !== "admin") {
          const permissions = await db.getUserPermissions(ctx.user?.id || 0);
          if (!permissions?.canDeleteProcess) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para deletar processos" });
          }
        }
        await db.deleteProcesso(input.id);

        // Registrar auditoria
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            acao: "deletar",
            tabela: "processos",
            registroId: input.id,
            alteracoes: null,
          });
        }

        return { success: true };
      }),
  }),

  // ============ CHECKLIST ROUTES ============
  checklist: router({
    getByProcesso: protectedProcedure
      .input(z.object({ processoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChecklistItens(input.processoId);
      }),

    addItem: protectedProcedure
      .input(
        z.object({
          processoId: z.number(),
          item: z.string().min(1, "Item é obrigatório"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const itemId = await db.createChecklistItem({
          processoId: input.processoId,
          item: input.item,
        });

        if (!itemId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao adicionar item",
          });
        }

        // Registrar auditoria
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: 'checklist',
            registroId: input.processoId,
            acao: 'criar',
            alteracoes: `Adicionou item no checklist: ${input.item}`,
          });
        }

        return { success: true, itemId };
      }),

    toggleItem: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          concluido: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.updateChecklistItem(input.id, {
          concluido: input.concluido,
        });

        // Registrar auditoria
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: 'checklist',
            registroId: input.id,
            acao: 'editar',
            alteracoes: `Marcou item como ${input.concluido ? 'concluido' : 'nao concluido'}`,
          });
        }

        return { success: true };
      }),

    deleteItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteChecklistItem(input.id);
        
        // Registrar auditoria
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: 'checklist',
            registroId: input.id,
            acao: 'deletar',
            alteracoes: 'Deletou item do checklist',
          });
        }
        
        return { success: true };
      }),
  }),

  checklistTemplates: router({
    list: protectedProcedure.query(async () => {
      return await db.getChecklistTemplates();
    }),

    create: protectedProcedure
      .input(
        z.object({
          nome: z.string().min(1, "Nome é obrigatório"),
          descricao: z.string().optional(),
          itens: z.array(z.string().min(1)),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const templateId = await db.createChecklistTemplate({
          usuarioId: ctx.user?.id || 0,
          nome: input.nome,
          descricao: input.descricao || "",
          itens: input.itens,
        });

        if (!templateId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao salvar template",
          });
        }

        // Registrar auditoria
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: 'checklistTemplates',
            registroId: templateId,
            acao: 'criar',
            alteracoes: `Criou template: ${input.nome}`,
          });
        }

        return { success: true, templateId };
      }),
  }),

  // ============ DASHBOARD ROUTES ============
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await db.getProcessosDashboard();
    }),
  }),

  // ============ SYSTEM ROUTES ============
  system: router({
    notifyOwner: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Placeholder for owner notification
        console.log("[System] Notification:", input.title, input.content);
        return { success: true };
      }),
  }),

  // ============ AUDITORIA ROUTES ============
  auditoria: router({
    getByProcesso: protectedProcedure
      .input(z.object({ processoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAuditoriaByProcesso(input.processoId);
      }),

    getByUsuario: protectedProcedure
      .input(z.object({ usuarioId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin" && ctx.user?.id !== input.usuarioId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        return await db.getAuditoriaByUsuario(input.usuarioId);
      }),

    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas admin pode acessar" });
        }
        return await db.getAllAuditoria();
      }),
  }),

  // ============ PARCELAS ROUTES ============
  parcelas: router({
    create: protectedProcedure
      .input(
        z.object({
          processoId: z.number(),
          numeroParcela: z.number(),
          valorParcela: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createParcela({
          processoId: input.processoId,
          numeroParcela: input.numeroParcela,
          valorParcela: input.valorParcela,
          pago: 0,
        });
        return { id, success: id !== null };
      }),

    getByProcesso: protectedProcedure
      .input(z.object({ processoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getParcelasByProcesso(input.processoId);
      }),

    marcarComoPaga: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.marcarParcelaComoPaga(input.id, new Date());
        return { success: true };
      }),

    marcarComoNaoPaga: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.marcarParcelaComoNaoPaga(input.id);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteParcela(input.id);
        return { success: true };
      }),

    updateDesconto: protectedProcedure
      .input(z.object({ id: z.number(), desconto: z.string() }))
      .mutation(async ({ input }) => {
        await db.updateParcela(input.id, { desconto: input.desconto });
        return { success: true };
      }),
  }),

  // ============ CALENDARIO ROUTES ============
  calendario: router({
    create: protectedProcedure
      .input(
        z.object({
          titulo: z.string().min(1, "Título é obrigatório"),
          descricao: z.string().optional(),
          data: z.date(),
          informacoesAdicionais: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const id = await db.createCalendario({
          usuarioId: ctx.user.id,
          titulo: input.titulo,
          descricao: input.descricao,
          data: input.data,
          informacoesAdicionais: input.informacoesAdicionais,
        });
        
        // Sincronizar automaticamente com Google Calendar
        if (id) {
          try {
            const userTokens = await db.getGoogleCalendarTokens(ctx.user.id);
            if (userTokens?.googleAccessToken) {
              const googleEventId = await googleCalendar.createGoogleCalendarEvent(
                userTokens.googleAccessToken,
                {
                  title: input.titulo,
                  description: input.descricao || '',
                  startTime: new Date(input.data),
                  endTime: new Date(new Date(input.data).getTime() + 60 * 60 * 1000),
                }
              );
              
              if (googleEventId) {
                if (googleEventId && typeof googleEventId === 'string') {
                await db.updateCalendarioWithGoogleEvent(id, googleEventId);
              }
              }
            }
          } catch (error) {
            console.error('[Calendario] Erro ao sincronizar com Google Calendar:', error);
          }
        }
        
        return { id, success: id !== null };
      }),

    getByUsuario: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getCalendarioByUsuario(ctx.user.id);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCalendarioById(input.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          titulo: z.string().optional(),
          descricao: z.string().optional(),
          data: z.date().optional(),
          informacoesAdicionais: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const cal = await db.getCalendarioById(input.id);
        if (cal?.usuarioId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        await db.updateCalendario(input.id, {
          titulo: input.titulo,
          descricao: input.descricao,
          data: input.data,
          informacoesAdicionais: input.informacoesAdicionais,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const cal = await db.getCalendarioById(input.id);
        if (cal?.usuarioId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        
        // Deletar do Google Calendar se estiver sincronizado
        if (cal?.googleEventId) {
          try {
            const userTokens = await db.getGoogleCalendarTokens(ctx.user.id);
            if (userTokens?.googleAccessToken) {
              await googleCalendar.deleteGoogleCalendarEvent(
                userTokens.googleAccessToken,
                cal.googleEventId
              );
            }
          } catch (error) {
            console.error('[Calendario] Erro ao deletar evento do Google Calendar:', error);
          }
        }
        
        await db.deleteCalendario(input.id);
        return { success: true };
      }),
  }),

  // ============ PERMISSIONS ROUTES ============
  permissions: router({
    updateUserPermissions: protectedProcedure
      .input(z.object({
        userId: z.number(),
        canCreateClient: z.boolean().optional(),
        canEditProcess: z.boolean().optional(),
        canDeleteProcess: z.boolean().optional(),
        canViewCalendar: z.boolean().optional(),
        canViewProcesses: z.boolean().optional(),
        canViewClients: z.boolean().optional(),
        canManageParcelas: z.boolean().optional(),
        canViewArchivo: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can update permissions
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem alterar permissões" });
        }

        await db.updateUserPermissions(input.userId, {
          canCreateClient: input.canCreateClient,
          canEditProcess: input.canEditProcess,
          canDeleteProcess: input.canDeleteProcess,
          canViewCalendar: input.canViewCalendar,
          canViewProcesses: input.canViewProcesses,
          canViewClients: input.canViewClients,
          canManageParcelas: input.canManageParcelas,
          canViewArchivo: input.canViewArchivo,
        });

        return { success: true };
      }),

    getUserPermissions: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Only admins can view permissions
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem ver permissões" });
        }

        return await db.getUserPermissions(input.userId);
      }),

    getMyPermissions: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getUserPermissions(ctx.user.id);
      }),

    getAllUsers: protectedProcedure
      .query(async ({ ctx }) => {
        // Only admins can view all users
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem ver todos os usuários" });
        }
        return await db.getAllUsers();
      }),

    deleteUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can delete users
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem deletar usuários" });
        }

        // Prevent deleting yourself
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode deletar sua própria conta" });
        }

        await db.deleteUser(input.userId);
        return { success: true };
      }),

    promoteToAdmin: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem promover usuários" });
        }

        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Você já é um administrador" });
        }

        await db.updateUserRole(input.userId, "admin");
        
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: 'users',
            registroId: input.userId,
            acao: 'editar',
            alteracoes: 'Promovido para administrador',
          });
        }

        return { success: true };
      }),

    demoteFromAdmin: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem rebaixar usuários" });
        }

        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode rebaixar a si mesmo" });
        }

        await db.updateUserRole(input.userId, "user");
        
        if (ctx.user) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: 'users',
            registroId: input.userId,
            acao: 'editar',
            alteracoes: 'Rebaixado para usuário comum',
          });
        }

        return { success: true };
      }),
  }),

  statusProtocolo: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getStatusProtocoloList();
      }),

    listPaginated: protectedProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
        })
      )
      .query(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getStatusProtocoloPaginated(input.page, input.limit);
      }),

    create: protectedProcedure
      .input(z.object({
        clienteId: z.number(),
        numeroProtocolo: z.string(),
        tipoProcesso: z.string(),
        dataAbertura: z.date(),
        status: z.enum(["Pronto", "Reingressado", "Reingressado pós pagamento", "Nota de Pagamento", "Exigência", "Protocolado", "Vencido"]).default("Pronto"),
        cartorio: z.string(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const id = await db.createStatusProtocolo(input);
        if (id) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: "statusProtocolo",
            registroId: id,
            acao: "criar",
            alteracoes: JSON.stringify(input),
          });
        }
        return id;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        clienteId: z.number().optional(),
        numeroProtocolo: z.string().optional(),
        tipoProcesso: z.string().optional(),
        dataAbertura: z.date().optional(),
        status: z.enum(["Pronto", "Reingressado", "Reingressado pós pagamento", "Nota de Pagamento", "Exigência", "Protocolado", "Vencido"]).optional(),
        cartorio: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const { id, ...updateData } = input;
        const success = await db.updateStatusProtocolo(id, updateData);
        if (success) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: "statusProtocolo",
            registroId: input.id,
            acao: "editar",
            alteracoes: JSON.stringify(input),
          });
        }
        return success;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const success = await db.deleteStatusProtocolo(input.id);
        if (success) {
          await db.createAuditoria({
            usuarioId: ctx.user.id,
            tabela: "statusProtocolo",
            registroId: input.id,
            acao: "deletar",
            alteracoes: null,
          });
        }
        return success;
      }),

    search: protectedProcedure
      .input(z.object({
        numeroProtocolo: z.string().optional(),
        clienteId: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.searchStatusProtocolo(input.numeroProtocolo, input.clienteId);
      }),
  }),

  arquivo: router({
    criar: protectedProcedure
      .input(z.object({
        statusProtocoloId: z.number(),
        processoId: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const id = await db.arquivarProtocolo(input.statusProtocoloId, input.observacoes);
        return { success: id !== null, id };
      }),

    listar: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return await db.getArquivados();
      }),

    deletar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return await db.deleteArquivo(input.id);
      }),
  }),

  despesas: router({
    criar: protectedProcedure
      .input(z.object({
        statusProtocoloId: z.number(),
        processoId: z.number().optional(),
        descricao: z.string(),
        valor: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const id = await db.createDespesa(input as any);
        return { success: id !== null, id };
      }),

    listarPorProtocolo: protectedProcedure
      .input(z.object({ statusProtocoloId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDespesasByProtocolo(input.statusProtocoloId);
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        descricao: z.string().optional(),
        valor: z.string().optional(),
        pago: z.number().optional(),
        dataPagamento: z.date().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const { id, ...data } = input;
        return await db.updateDespesa(id, data as any);
      }),

    deletar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.deleteDespesa(input.id);
      }),
  }),

  receitas: router({
    criar: protectedProcedure
      .input(z.object({
        statusProtocoloId: z.number(),
        processoId: z.number().optional(),
        descricao: z.string(),
        valor: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const id = await db.createReceita(input as any);
        return { success: id !== null, id };
      }),

    listarPorProtocolo: protectedProcedure
      .input(z.object({ statusProtocoloId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReceitasByProtocolo(input.statusProtocoloId);
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        descricao: z.string().optional(),
        valor: z.string().optional(),
        recebido: z.number().optional(),
        dataRecebimento: z.date().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const { id, ...data } = input;
        return await db.updateReceita(id, data as any);
      }),

    deletar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.deleteReceita(input.id);
      }),
  }),

  // ============ RELATORIO ============
  relatorio: router({
    gerarProtocolosPDF: protectedProcedure
      .input(z.object({ protocoloIds: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        try {
          const { generateProtocolosReport } = await import("./pdf-generator");
          const protocolos = await db.getRelatorioProtocolos(input.protocoloIds);
          const pdfBuffer = await generateProtocolosReport(protocolos as any);
          return { success: true, pdf: pdfBuffer.toString("base64") };
        } catch (error) {
          console.error("[PDF] Failed to generate protocolos report:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao gerar PDF" });
        }
      }),

    gerarProcessosPDF: protectedProcedure
      .input(z.object({ processoIds: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        try {
          const { generateProcessosReport } = await import("./pdf-generator");
          const processos = await db.getRelatorioProcessos(input.processoIds);
          const pdfBuffer = await generateProcessosReport(processos as any);
          return { success: true, pdf: pdfBuffer.toString("base64") };
        } catch (error) {
          console.error("[PDF] Failed to generate processos report:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao gerar PDF" });
        }
      }),
  }),

  googleCalendar: googleCalendarRouter,

  // ============ TIPOS DE PROCESSO ============
  tiposProcesso: router({
    list: publicProcedure.query(async () => {
      return await db.getTiposProcesso();
    }),

    create: protectedProcedure
      .input(
        z.object({
          nome: z.string().min(1, "Nome é obrigatório"),
          descricao: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.createTipoProcesso(input);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.deleteTipoProcesso(input.id);
      }),
  }),

  // ============ CARTÓRIOS ============
  cartorios: router({
    list: publicProcedure.query(async () => {
      return await db.getCartorios();
    }),

    create: protectedProcedure
      .input(
        z.object({
          nome: z.string().min(1, "Nome é obrigatório"),
          localizacao: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.createCartorio(input);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.deleteCartorio(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
