import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as auth from "./auth";
import * as db from "./db";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

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
  }),

  // ============ CLIENTE ROUTES ============
  clientes: router({
    list: protectedProcedure.query(async () => {
      return await db.getClientes();
    }),

    create: protectedProcedure
      .input(
        z.object({
          nome: z.string().min(1, "Nome é obrigatório"),
          cpfCnpj: z.string().min(1, "CPF/CNPJ é obrigatório"),
          contato: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
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
      .mutation(async ({ input }) => {
        await db.updateCliente(input.id, {
          nome: input.nome,
          cpfCnpj: input.cpfCnpj,
          contato: input.contato,
        });

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

    create: protectedProcedure
      .input(
        z.object({
          titulo: z.string().min(1, "Título é obrigatório"),
          clienteId: z.number(),
          status: z.enum(["Pendente", "Em Análise", "Protocolado", "Finalizado"]),
          prazoVencimento: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
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

        return await db.getProcessoById(processoId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          titulo: z.string().optional(),
          status: z.enum(["Pendente", "Em Análise", "Protocolado", "Finalizado"]).optional(),
          prazoVencimento: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateProcesso(input.id, {
          titulo: input.titulo,
          status: input.status,
          prazoVencimento: input.prazoVencimento,
        });

        return await db.getProcessoById(input.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProcesso(input.id);
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
      .mutation(async ({ input }) => {
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

        return { success: true, itemId };
      }),

    toggleItem: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          concluido: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateChecklistItem(input.id, {
          concluido: input.concluido,
        });

        return { success: true };
      }),

    deleteItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteChecklistItem(input.id);
        return { success: true };
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
});

export type AppRouter = typeof appRouter;
