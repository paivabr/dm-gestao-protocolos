import { eq, and, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clientes, processos, checklistItens, auditoria, calendario, parcelas, Cliente, InsertCliente, Processo, InsertProcesso, ChecklistItem, InsertChecklistItem, Auditoria, InsertAuditoria, Calendario, InsertCalendario, Parcela, InsertParcela } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return null;
  }

  try {
    const result = await db.insert(users).values(user);
    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    return null;
  }
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
  }
}

export async function updateUserProfile(userId: number, data: { name?: string; email?: string; fotoPerfil?: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user profile: database not available");
    return false;
  }

  try {
    await db.update(users).set(data).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update user profile:", error);
    return false;
  }
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update password: database not available");
    return false;
  }

  try {
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update password:", error);
    return false;
  }
}

export async function setResetPasswordToken(userId: number, token: string, expiresIn: number = 3600000) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot set reset token: database not available");
    return false;
  }

  try {
    const expiresAt = new Date(Date.now() + expiresIn);
    await db.update(users).set({ resetPasswordToken: token, resetPasswordExpires: expiresAt }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to set reset token:", error);
    return false;
  }
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by reset token: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.resetPasswordToken, token)).limit(1);
    if (result.length > 0) {
      const user = result[0];
      if (user.resetPasswordExpires && user.resetPasswordExpires > new Date()) {
        return user;
      }
    }
    return undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by reset token:", error);
    return undefined;
  }
}

export async function clearResetPasswordToken(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot clear reset token: database not available");
    return false;
  }

  try {
    await db.update(users).set({ resetPasswordToken: null, resetPasswordExpires: null }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to clear reset token:", error);
    return false;
  }
}

// ============ CLIENTE FUNCTIONS ============

export async function createCliente(cliente: InsertCliente): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create cliente: database not available");
    return null;
  }

  try {
    const result = await db.insert(clientes).values(cliente);
    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create cliente:", error);
    return null;
  }
}

export async function getClientes(): Promise<Cliente[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get clientes: database not available");
    return [];
  }

  try {
    return await db.select().from(clientes);
  } catch (error) {
    console.error("[Database] Failed to get clientes:", error);
    return [];
  }
}

export async function getClienteById(id: number): Promise<Cliente | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get cliente: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get cliente:", error);
    return undefined;
  }
}

export async function updateCliente(id: number, updates: Partial<InsertCliente>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update cliente: database not available");
    return;
  }

  try {
    await db.update(clientes).set(updates).where(eq(clientes.id, id));
  } catch (error) {
    console.error("[Database] Failed to update cliente:", error);
  }
}

export async function deleteCliente(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete cliente: database not available");
    return;
  }

  try {
    await db.delete(clientes).where(eq(clientes.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete cliente:", error);
  }
}

// ============ PROCESSO FUNCTIONS ============

export async function createProcesso(processo: InsertProcesso): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create processo: database not available");
    return null;
  }

  try {
    const result = await db.insert(processos).values(processo);
    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create processo:", error);
    return null;
  }
}

export async function getProcessos() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get processos: database not available");
    return [];
  }

  try {
    return await db.select().from(processos);
  } catch (error) {
    console.error("[Database] Failed to get processos:", error);
    return [];
  }
}

export async function getProcessoById(id: number): Promise<Processo | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get processo: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(processos).where(eq(processos.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get processo:", error);
    return undefined;
  }
}

export async function updateProcesso(id: number, updates: Partial<InsertProcesso>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update processo: database not available");
    return;
  }

  try {
    await db.update(processos).set(updates).where(eq(processos.id, id));
  } catch (error) {
    console.error("[Database] Failed to update processo:", error);
  }
}

export async function deleteProcesso(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete processo: database not available");
    return;
  }

  try {
    await db.delete(processos).where(eq(processos.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete processo:", error);
  }
}

export async function getProcessosByClienteId(clienteId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get processos: database not available");
    return [];
  }

  try {
    return await db.select().from(processos).where(eq(processos.clienteId, clienteId));
  } catch (error) {
    console.error("[Database] Failed to get processos:", error);
    return [];
  }
}

// ============ CHECKLIST FUNCTIONS ============

export async function createChecklistItem(item: InsertChecklistItem): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create checklist item: database not available");
    return null;
  }

  try {
    const result = await db.insert(checklistItens).values(item);
    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create checklist item:", error);
    return null;
  }
}

export async function getChecklistItens(processoId: number): Promise<ChecklistItem[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get checklist itens: database not available");
    return [];
  }

  try {
    return await db.select().from(checklistItens).where(eq(checklistItens.processoId, processoId));
  } catch (error) {
    console.error("[Database] Failed to get checklist itens:", error);
    return [];
  }
}

export async function updateChecklistItem(id: number, updates: Partial<InsertChecklistItem>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update checklist item: database not available");
    return;
  }

  try {
    await db.update(checklistItens).set(updates).where(eq(checklistItens.id, id));
  } catch (error) {
    console.error("[Database] Failed to update checklist item:", error);
  }
}

export async function deleteChecklistItem(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete checklist item: database not available");
    return;
  }

  try {
    await db.delete(checklistItens).where(eq(checklistItens.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete checklist item:", error);
  }
}

// ============ DASHBOARD FUNCTIONS ============

export async function getProcessosDashboard() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get dashboard data: database not available");
    return { pendentes: 0, emAnalise: 0, protocolado: 0, finalizado: 0, vencendoHoje: 0 };
  }

  try {
    const allProcessos = await db.select().from(processos);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      pendentes: allProcessos.filter(p => p.status === "Pendente").length,
      emAnalise: allProcessos.filter(p => p.status === "Em Análise").length,
      protocolado: allProcessos.filter(p => p.status === "Protocolado").length,
      finalizado: allProcessos.filter(p => p.status === "Finalizado").length,
      vencendoHoje: allProcessos.filter(p => {
        if (!p.prazoVencimento) return false;
        const prazo = new Date(p.prazoVencimento);
        prazo.setHours(0, 0, 0, 0);
        return prazo.getTime() === today.getTime() && p.status !== "Finalizado";
      }).length,
    };

    return stats;
  } catch (error) {
    console.error("[Database] Failed to get dashboard data:", error);
    return { pendentes: 0, emAnalise: 0, protocolado: 0, finalizado: 0, vencendoHoje: 0 };
  }
}

// ============ AUDITORIA FUNCTIONS ============

export async function createAuditoria(audit: InsertAuditoria): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create auditoria: database not available");
    return null;
  }

  try {
    const result = await db.insert(auditoria).values(audit);
    console.log("[Database] Auditoria created:", result);
    // Drizzle retorna um objeto com insertId
    const insertId = (result as any).insertId || (result as any)[0]?.insertId;
    return insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create auditoria:", error);
    return null;
  }
}

export async function getAuditoriaByProcesso(processoId: number): Promise<Auditoria[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get auditoria: database not available");
    return [];
  }

  try {
    return await db.select().from(auditoria).where(
      and(
        eq(auditoria.tabela, "processos"),
        eq(auditoria.registroId, processoId)
      )
    );
  } catch (error) {
    console.error("[Database] Failed to get auditoria:", error);
    return [];
  }
}

export async function getAuditoriaByUsuario(usuarioId: number): Promise<Auditoria[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get auditoria: database not available");
    return [];
  }

  try {
    return await db.select().from(auditoria).where(eq(auditoria.usuarioId, usuarioId));
  } catch (error) {
    console.error("[Database] Failed to get auditoria:", error);
    return [];
  }
}

export async function getAllAuditoria(): Promise<(Auditoria & { nomeUsuario?: string })[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get auditoria: database not available");
    return [];
  }

  try {
    const auditoriaData = await db.select().from(auditoria);
    
    // Buscar nome do usuário para cada registro
    const auditoriaComNomes = await Promise.all(
      auditoriaData.map(async (item) => {
        const usuario = await db.select().from(users).where(eq(users.id, item.usuarioId)).limit(1);
        return {
          ...item,
          nomeUsuario: usuario.length > 0 ? usuario[0].username : `Usuário ${item.usuarioId}`,
        };
      })
    );
    
    return auditoriaComNomes;
  } catch (error) {
    console.error("[Database] Failed to get auditoria:", error);
    return [];
  }
}

// ============ CALENDARIO FUNCTIONS ============

export async function createCalendario(cal: InsertCalendario): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create calendario: database not available");
    return null;
  }

  try {
    const result = await db.insert(calendario).values(cal);
    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create calendario:", error);
    return null;
  }
}

export async function getCalendarioByUsuario(usuarioId: number): Promise<Calendario[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get calendario: database not available");
    return [];
  }

  try {
    return await db.select().from(calendario).where(eq(calendario.usuarioId, usuarioId));
  } catch (error) {
    console.error("[Database] Failed to get calendario:", error);
    return [];
  }
}

export async function getCalendarioById(id: number): Promise<Calendario | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get calendario: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(calendario).where(eq(calendario.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get calendario:", error);
    return undefined;
  }
}

export async function updateCalendario(id: number, updates: Partial<InsertCalendario>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update calendario: database not available");
    return;
  }

  try {
    await db.update(calendario).set(updates).where(eq(calendario.id, id));
  } catch (error) {
    console.error("[Database] Failed to update calendario:", error);
  }
}

export async function deleteCalendario(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete calendario: database not available");
    return;
  }

  try {
    await db.delete(calendario).where(eq(calendario.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete calendario:", error);
  }
}

export async function getCalendarioByMes(usuarioId: number, mes: number, ano: number): Promise<Calendario[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get calendario: database not available");
    return [];
  }

  try {
    const startDate = new Date(ano, mes - 1, 1);
    const endDate = new Date(ano, mes, 0, 23, 59, 59);

    return await db.select().from(calendario).where(
      and(
        eq(calendario.usuarioId, usuarioId),
        // Filtro por data entre o primeiro e último dia do mês
      )
    );
  } catch (error) {
    console.error("[Database] Failed to get calendario by mes:", error);
    return [];
  }
}

// ============ PARCELAS FUNCTIONS ============

export async function createParcela(parcela: InsertParcela): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create parcela: database not available");
    return null;
  }

  try {
    const result = await db.insert(parcelas).values(parcela);
    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create parcela:", error);
    return null;
  }
}

export async function getParcelasByProcesso(processoId: number): Promise<Parcela[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get parcelas: database not available");
    return [];
  }

  try {
    return await db.select().from(parcelas).where(eq(parcelas.processoId, processoId));
  } catch (error) {
    console.error("[Database] Failed to get parcelas:", error);
    return [];
  }
}

export async function getParcelaById(id: number): Promise<Parcela | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get parcela: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(parcelas).where(eq(parcelas.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get parcela:", error);
    return undefined;
  }
}

export async function updateParcela(id: number, updates: Partial<InsertParcela>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update parcela: database not available");
    return;
  }

  try {
    await db.update(parcelas).set(updates).where(eq(parcelas.id, id));
  } catch (error) {
    console.error("[Database] Failed to update parcela:", error);
  }
}

export async function deleteParcela(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete parcela: database not available");
    return;
  }

  try {
    await db.delete(parcelas).where(eq(parcelas.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete parcela:", error);
  }
}

export async function deleteParcelasByProcesso(processoId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete parcelas: database not available");
    return;
  }

  try {
    await db.delete(parcelas).where(eq(parcelas.processoId, processoId));
  } catch (error) {
    console.error("[Database] Failed to delete parcelas:", error);
  }
}

export async function marcarParcelaComoPaga(id: number, dataPagamento: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update parcela: database not available");
    return;
  }

  try {
    await db.update(parcelas).set({
      pago: 1,
      dataPagamento: dataPagamento,
    }).where(eq(parcelas.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark parcela as paid:", error);
  }
}

export async function marcarParcelaComoNaoPaga(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update parcela: database not available");
    return;
  }

  try {
    await db.update(parcelas).set({
      pago: 0,
      dataPagamento: null,
    }).where(eq(parcelas.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark parcela as unpaid:", error);
  }
}


// ============ PERMISSIONS FUNCTIONS ============

export async function updateUserPermissions(userId: number, permissions: {
  canCreateClient?: boolean;
  canEditProcess?: boolean;
  canDeleteProcess?: boolean;
  canViewCalendar?: boolean;
  canViewProcesses?: boolean;
  canViewClients?: boolean;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user permissions: database not available");
    return;
  }

  try {
    const updateData: any = {};
    if (permissions.canCreateClient !== undefined) updateData.canCreateClient = permissions.canCreateClient ? 1 : 0;
    if (permissions.canEditProcess !== undefined) updateData.canEditProcess = permissions.canEditProcess ? 1 : 0;
    if (permissions.canDeleteProcess !== undefined) updateData.canDeleteProcess = permissions.canDeleteProcess ? 1 : 0;
    if (permissions.canViewCalendar !== undefined) updateData.canViewCalendar = permissions.canViewCalendar ? 1 : 0;
    if (permissions.canViewProcesses !== undefined) updateData.canViewProcesses = permissions.canViewProcesses ? 1 : 0;
    if (permissions.canViewClients !== undefined) updateData.canViewClients = permissions.canViewClients ? 1 : 0;

    await db.update(users).set(updateData).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user permissions:", error);
  }
}

export async function getUserPermissions(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user permissions: database not available");
    return null;
  }

  try {
    const result = await db.select({
      canCreateClient: users.canCreateClient,
      canEditProcess: users.canEditProcess,
      canDeleteProcess: users.canDeleteProcess,
      canViewCalendar: users.canViewCalendar,
      canViewProcesses: users.canViewProcesses,
      canViewClients: users.canViewClients,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (result.length > 0) {
      return {
        canCreateClient: result[0].canCreateClient === 1,
        canEditProcess: result[0].canEditProcess === 1,
        canDeleteProcess: result[0].canDeleteProcess === 1,
        canViewCalendar: result[0].canViewCalendar === 1,
        canViewProcesses: result[0].canViewProcesses === 1,
        canViewClients: result[0].canViewClients === 1,
      };
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to get user permissions:", error);
    return null;
  }
}
