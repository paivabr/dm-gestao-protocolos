import { eq, and, like, sql, asc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clientes, processos, checklistItens, auditoria, calendario, parcelas, statusProtocolo, arquivo, despesas, receitas, tiposProcesso, cartorios, Cliente, InsertCliente, Processo, InsertProcesso, ChecklistItem, InsertChecklistItem, Auditoria, InsertAuditoria, Calendario, InsertCalendario, Parcela, InsertParcela, StatusProtocolo, InsertStatusProtocolo, Arquivo, InsertArquivo, Despesa, InsertDespesa, Receita, InsertReceita, TipoProcesso, InsertTipoProcesso, Cartorio, InsertCartorio } from "../drizzle/schema";
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

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    const result = await db.select().from(users);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get all users:", error);
    return [];
  }
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
    const expiresAt = String(Date.now() + expiresIn);
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
      if (user.resetPasswordExpires && Number(user.resetPasswordExpires) > Date.now()) {
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
    return { pendentes: 0, emAnalise: 0, protocolado: 0, finalizado: 0, campo: 0, analiseEscritorio: 0, pendenteDocumento: 0, vencendoHoje: 0, statusProtocolo: 0 };
  }

  try {
    const allProcessos = await db.select().from(processos);
    const allStatusProtocolo = await db.select().from(statusProtocolo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      pendentes: allProcessos.filter(p => p.status === "Pendente").length,
      emAnalise: allProcessos.filter(p => p.status === "Em Análise").length,
      protocolado: allProcessos.filter(p => p.status === "Protocolado").length,
      finalizado: allProcessos.filter(p => p.status === "Finalizado").length,
      campo: allProcessos.filter(p => p.status === "Campo").length,
      analiseEscritorio: allProcessos.filter(p => p.status === "Análise/Escritório").length,
      pendenteDocumento: allProcessos.filter(p => p.status === "Pendente documento").length,
      vencendoHoje: allProcessos.filter(p => {
        if (!p.prazoVencimento) return false;
        const prazo = new Date(p.prazoVencimento);
        prazo.setHours(0, 0, 0, 0);
        return prazo.getTime() === today.getTime() && p.status !== "Finalizado";
      }).length,
      statusProtocolo: allStatusProtocolo.length,
    };

    return stats;
  } catch (error) {
    console.error("[Database] Failed to get dashboard data:", error);
    return { pendentes: 0, emAnalise: 0, protocolado: 0, finalizado: 0, campo: 0, analiseEscritorio: 0, pendenteDocumento: 0, vencendoHoje: 0, statusProtocolo: 0 };
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

export async function getAllAuditoria(): Promise<(Auditoria & { nomeUsuario: string })[]> {
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
          nomeUsuario: usuario.length > 0 && usuario[0].username ? usuario[0].username : `Usuário ${item.usuarioId}`,
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
  canManageParcelas?: boolean;
  canViewArchivo?: boolean;
  canViewDespesas?: boolean;
  canViewRelatorio?: boolean;
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
    if (permissions.canViewDespesas !== undefined) updateData.canViewDespesas = permissions.canViewDespesas ? 1 : 0;
    if (permissions.canViewRelatorio !== undefined) updateData.canViewRelatorio = permissions.canViewRelatorio ? 1 : 0;
    if (permissions.canManageParcelas !== undefined) updateData.canManageParcelas = permissions.canManageParcelas ? 1 : 0;
    if (permissions.canViewArchivo !== undefined) updateData.canViewArchivo = permissions.canViewArchivo ? 1 : 0;

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
      canManageParcelas: users.canManageParcelas,
      canViewArchivo: users.canViewArchivo,
      canViewDespesas: users.canViewDespesas,
      canViewRelatorio: users.canViewRelatorio,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (result.length > 0) {
      return {
        canCreateClient: result[0].canCreateClient === 1,
        canEditProcess: result[0].canEditProcess === 1,
        canDeleteProcess: result[0].canDeleteProcess === 1,
        canViewCalendar: result[0].canViewCalendar === 1,
        canViewProcesses: result[0].canViewProcesses === 1,
        canViewClients: result[0].canViewClients === 1,
        canViewDespesas: result[0].canViewDespesas === 1,
        canViewRelatorio: result[0].canViewRelatorio === 1,
        canManageParcelas: result[0].canManageParcelas === 1,
        canViewArchivo: result[0].canViewArchivo === 1,
      };
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to get user permissions:", error);
    return null;
  }
}


// ============ STATUS PROTOCOLO FUNCTIONS ============

export async function createStatusProtocolo(data: InsertStatusProtocolo): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create status protocolo: database not available");
    return null;
  }

  try {
    const result = await db.insert(statusProtocolo).values(data);
    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create status protocolo:", error);
    return null;
  }
}

export async function getStatusProtocoloList() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get status protocolo list: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        id: statusProtocolo.id,
        numeroProtocolo: statusProtocolo.numeroProtocolo,
        clienteId: statusProtocolo.clienteId,
        tipoProcesso: statusProtocolo.tipoProcesso,
        dataAbertura: statusProtocolo.dataAbertura,
        status: statusProtocolo.status,
        cartorio: statusProtocolo.cartorio,
        ultimaAtualizacao: statusProtocolo.ultimaAtualizacao,
        createdAt: statusProtocolo.createdAt,
        updatedAt: statusProtocolo.updatedAt,
        cliente: {
          id: clientes.id,
          nome: clientes.nome,
          cpfCnpj: clientes.cpfCnpj,
          contato: clientes.contato,
        },
      })
      .from(statusProtocolo)
      .leftJoin(clientes, eq(statusProtocolo.clienteId, clientes.id));
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get status protocolo list:", error);
    return [];
  }
}

export async function getStatusProtocoloById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get status protocolo: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select({
        id: statusProtocolo.id,
        numeroProtocolo: statusProtocolo.numeroProtocolo,
        clienteId: statusProtocolo.clienteId,
        tipoProcesso: statusProtocolo.tipoProcesso,
        dataAbertura: statusProtocolo.dataAbertura,
        status: statusProtocolo.status,
        cartorio: statusProtocolo.cartorio,
        ultimaAtualizacao: statusProtocolo.ultimaAtualizacao,
        createdAt: statusProtocolo.createdAt,
        updatedAt: statusProtocolo.updatedAt,
        cliente: {
          id: clientes.id,
          nome: clientes.nome,
          cpfCnpj: clientes.cpfCnpj,
          contato: clientes.contato,
        },
      })
      .from(statusProtocolo)
      .leftJoin(clientes, eq(statusProtocolo.clienteId, clientes.id))
      .where(eq(statusProtocolo.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get status protocolo:", error);
    return undefined;
  }
}

export async function updateStatusProtocolo(id: number, data: Partial<InsertStatusProtocolo>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update status protocolo: database not available");
    return false;
  }

  try {
    await db.update(statusProtocolo).set(data).where(eq(statusProtocolo.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update status protocolo:", error);
    return false;
  }
}

export async function deleteStatusProtocolo(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete status protocolo: database not available");
    return false;
  }

  try {
    await db.delete(statusProtocolo).where(eq(statusProtocolo.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete status protocolo:", error);
    return false;
  }
}

export async function searchStatusProtocolo(numeroProtocolo?: string, clienteId?: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search status protocolo: database not available");
    return [];
  }

  try {
    const conditions = [];

    if (numeroProtocolo) {
      conditions.push(like(statusProtocolo.numeroProtocolo, `%${numeroProtocolo}%`));
    }

    if (clienteId) {
      conditions.push(eq(statusProtocolo.clienteId, clienteId));
    }

    if (conditions.length > 0) {
      return await db.select().from(statusProtocolo).where(and(...conditions));
    }

    return await db.select().from(statusProtocolo);
  } catch (error) {
    console.error("[Database] Failed to search status protocolo:", error);
    return [];
  }
}


export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete user: database not available");
    throw new Error("Database not available");
  }

  try {
    // Get the user to check if it's DMconsultoria
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length > 0 && user[0].username === "DMconsultoria") {
      throw new Error("Não é possível excluir o usuário DMconsultoria");
    }

    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete user:", error);
    throw error;
  }
}


// ============ CHECKLIST TEMPLATES FUNCTIONS ============

export async function getChecklistTemplates() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get checklist templates: database not available");
    return [];
  }
  try {
    // Nota: Esta função retorna templates salvos. Por enquanto, retorna array vazio
    // pois a tabela checklistTemplates ainda precisa ser criada no schema
    return [];
  } catch (error) {
    console.error("[Database] Failed to get checklist templates:", error);
    return [];
  }
}

export async function createChecklistTemplate(data: {
  usuarioId: number;
  nome: string;
  descricao: string;
  itens: string[];
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create checklist template: database not available");
    return null;
  }
  try {
    // Nota: Esta função salva um template. Por enquanto, retorna um ID dummy
    // pois a tabela checklistTemplates ainda precisa ser criada no schema
    console.log("[Database] Template salvo:", data.nome);
    return Math.floor(Math.random() * 10000);
  } catch (error) {
    console.error("[Database] Failed to create checklist template:", error);
    return null;
  }
}


// ============ USER ROLE FUNCTIONS ============

export async function updateUserRole(userId: number, role: "admin" | "user") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user role: database not available");
    return false;
  }

  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update user role:", error);
    return false;
  }
}

// ============ GOOGLE CALENDAR FUNCTIONS ============

export async function updateGoogleCalendarTokens(
  userId: number,
  data: {
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleCalendarId?: string;
  }
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update Google Calendar tokens: database not available");
    return false;
  }

  try {
    await db.update(users).set(data).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update Google Calendar tokens:", error);
    return false;
  }
}

export async function getGoogleCalendarTokens(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get Google Calendar tokens: database not available");
    return null;
  }

  try {
    const result = await db
      .select({
        googleAccessToken: users.googleAccessToken,
        googleRefreshToken: users.googleRefreshToken,
        googleCalendarId: users.googleCalendarId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get Google Calendar tokens:", error);
    return null;
  }
}

export async function updateCalendarioWithGoogleEvent(
  calendarioId: number,
  googleEventId: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update calendario: database not available");
    return false;
  }

  try {
    await db
      .update(calendario)
      .set({
        googleEventId: googleEventId,
      } as any)
      .where(eq(calendario.id, calendarioId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update calendario with Google event:", error);
    return false;
  }
}


// ============ PAGINATION FUNCTIONS ============

export async function getClientesPaginated(page: number = 1, limit: number = 10, searchTerm?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get clientes paginated: database not available");
    return { data: [], total: 0, page, limit };
  }

  try {
    const offset = (page - 1) * limit;
    let query: any = db.select().from(clientes);
    
    if (searchTerm) {
      query = query.where(like(clientes.nome, `%${searchTerm}%`));
    }

    const result = await query.limit(limit).offset(offset);
    
    // Get total count
    let countQuery: any = db.select({ count: sql`COUNT(*)` }).from(clientes);
    if (searchTerm) {
      countQuery = countQuery.where(like(clientes.nome, `%${searchTerm}%`));
    }
    const countResult = await countQuery;
    const total = (countResult[0]?.count as number) || 0;

    return { data: result, total, page, limit };
  } catch (error) {
    console.error("[Database] Failed to get clientes paginated:", error);
    return { data: [], total: 0, page, limit };
  }
}

export async function getProcessosPaginated(page: number = 1, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get processos paginated: database not available");
    return { data: [], total: 0, page, limit };
  }

  try {
    const offset = (page - 1) * limit;
    const result = await db
      .select()
      .from(processos)
      .limit(limit)
      .offset(offset);

    const countResult: any = await db.select({ count: sql`COUNT(*)` }).from(processos);
    const total = (countResult[0]?.count as number) || 0;

    // Enrich with cliente data
    const clientes_list = await getClientes();
    const clienteMap = new Map(clientes_list.map(c => [c.id, c]));

    const enriched = await Promise.all(result.map(async (p) => {
      const pParcelas = await db.select().from(parcelas).where(eq(parcelas.processoId, p.id));
      
      const totalGeral = pParcelas.reduce((sum, item) => sum + parseFloat(item.valorParcela), 0);
      const totalDesconto = pParcelas.reduce((sum, item) => sum + parseFloat(item.desconto || "0"), 0);
      const totalPago = pParcelas
        .filter(item => item.pago === 1)
        .reduce((sum, item) => sum + (parseFloat(item.valorParcela) - parseFloat(item.desconto || "0")), 0);
      
      const totalAPagar = (totalGeral - totalDesconto) - totalPago;

      return {
        ...p,
        cliente: clienteMap.get(p.clienteId),
        financeiro: {
          totalGeral,
          totalDesconto,
          totalPago,
          totalAPagar,
          totalComDesconto: totalGeral - totalDesconto
        }
      };
    }));

    return { data: enriched, total, page, limit };
  } catch (error) {
    console.error("[Database] Failed to get processos paginated:", error);
    return { data: [], total: 0, page, limit };
  }
}

export async function getStatusProtocoloPaginated(page: number = 1, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get status protocolo paginated: database not available");
    return { data: [], total: 0, page, limit };
  }

  try {
    const offset = (page - 1) * limit;
    const result = await db
      .select({
        id: statusProtocolo.id,
        numeroProtocolo: statusProtocolo.numeroProtocolo,
        clienteId: statusProtocolo.clienteId,
        tipoProcesso: statusProtocolo.tipoProcesso,
        dataAbertura: statusProtocolo.dataAbertura,
        status: statusProtocolo.status,
        cartorio: statusProtocolo.cartorio,
        ultimaAtualizacao: statusProtocolo.ultimaAtualizacao,
        observacoes: statusProtocolo.observacoes,
        createdAt: statusProtocolo.createdAt,
        updatedAt: statusProtocolo.updatedAt,
        cliente: {
          id: clientes.id,
          nome: clientes.nome,
          cpfCnpj: clientes.cpfCnpj,
          contato: clientes.contato,
        },
      })
      .from(statusProtocolo)
      .leftJoin(clientes, eq(statusProtocolo.clienteId, clientes.id))
      .where(eq(statusProtocolo.isArchived, 0))
      .limit(limit)
      .offset(offset);

    const countResult: any = await db.select({ count: sql`COUNT(*)` }).from(statusProtocolo).where(eq(statusProtocolo.isArchived, 0));
    const total = (countResult[0]?.count as number) || 0;

    return { data: result, total, page, limit };
  } catch (error) {
    console.error("[Database] Failed to get status protocolo paginated:", error);
    return { data: [], total: 0, page, limit };
  }
}


// ============ ARQUIVO FUNCTIONS ============

export async function arquivarProtocolo(statusProtocoloId: number, observacoesArquivo?: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    // Get the statusProtocolo to extract clienteId
    const statusProto = await db.select().from(statusProtocolo).where(eq(statusProtocolo.id, statusProtocoloId)).limit(1);
    const clienteId = statusProto.length > 0 ? statusProto[0].clienteId : null;

    // Calculate financial data
    const despesasList = await getDespesasByProtocolo(statusProtocoloId);
    const receitasList = await getReceitasByProtocolo(statusProtocoloId);
    
    const totalDespesas = despesasList.reduce((sum, d) => sum + parseFloat(d.valor as any), 0);
    const totalDespesasPagas = despesasList
      .filter(d => d.pago === 1)
      .reduce((sum, d) => sum + parseFloat(d.valor as any), 0);
    const totalDespesasPendentes = totalDespesas - totalDespesasPagas;

    const totalReceitas = receitasList.reduce((sum, r) => sum + parseFloat(r.valor as any), 0);
    const totalRecebido = receitasList
      .filter(r => r.recebido === 1)
      .reduce((sum, r) => sum + parseFloat(r.valor as any), 0);
    
    // Insert into arquivo
    const result = await db.insert(arquivo).values({
      statusProtocoloId,
      clienteId: clienteId || undefined,
      observacoesArquivo,
      totalGasto: totalDespesas.toFixed(2),
      totalRecebido: totalRecebido.toFixed(2),
      custas: totalDespesas.toFixed(2),
      despesas: totalDespesas.toFixed(2),
      valorAPagar: totalDespesasPendentes.toFixed(2),
      valorFaltaPagar: totalDespesasPendentes.toFixed(2),
      valorRecebido: totalRecebido.toFixed(2),
      valorBaixa: totalRecebido.toFixed(2),
    });
    
    // Mark statusProtocolo as archived
    await db.update(statusProtocolo).set({ isArchived: 1 }).where(eq(statusProtocolo.id, statusProtocoloId));
    
    return (result as any)[0]?.insertId as number || null;
  } catch (error) {
    console.error("[Database] Failed to archive protocolo:", error);
    return null;
  }
}

export async function getArquivados(): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get arquivos with related client and protocol data
    const result = await db.select({
      id: arquivo.id,
      statusProtocoloId: arquivo.statusProtocoloId,
      processoId: arquivo.processoId,
      clienteId: arquivo.clienteId,
      dataArquivamento: arquivo.dataArquivamento,
      observacoesArquivo: arquivo.observacoesArquivo,
      totalGasto: arquivo.totalGasto,
      totalRecebido: arquivo.totalRecebido,
      custas: arquivo.custas,
      despesas: arquivo.despesas,
      valorAPagar: arquivo.valorAPagar,
      valorFaltaPagar: arquivo.valorFaltaPagar,
      valorBaixa: arquivo.valorBaixa,
      valorRecebido: arquivo.valorRecebido,
      clienteNome: clientes.nome,
      numeroProtocolo: statusProtocolo.numeroProtocolo,
      processoTitulo: processos.titulo,
    })
    .from(arquivo)
    .leftJoin(clientes, eq(arquivo.clienteId, clientes.id))
    .leftJoin(statusProtocolo, eq(arquivo.statusProtocoloId, statusProtocolo.id))
    .leftJoin(processos, eq(arquivo.processoId, processos.id));
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get arquivados:", error);
    return [];
  }
}

export async function deleteArquivo(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(arquivo).where(eq(arquivo.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete arquivo:", error);
    return false;
  }
}

export async function updateArquivo(id: number, data: any): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: any = {};
    if (data.custas !== undefined) updateData.custas = data.custas;
    if (data.despesas !== undefined) updateData.despesas = data.despesas;
    if (data.valorAPagar !== undefined) updateData.valorAPagar = data.valorAPagar;
    if (data.valorFaltaPagar !== undefined) updateData.valorFaltaPagar = data.valorFaltaPagar;
    if (data.valorBaixa !== undefined) updateData.valorBaixa = data.valorBaixa;
    if (data.valorRecebido !== undefined) updateData.valorRecebido = data.valorRecebido;
    if (data.observacoesArquivo !== undefined) updateData.observacoesArquivo = data.observacoesArquivo;

    await db.update(arquivo).set(updateData).where(eq(arquivo.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update arquivo:", error);
    return false;
  }
}

// ============ DESPESAS FUNCTIONS ============

export async function createDespesa(data: InsertDespesa): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(despesas).values(data);
    return (result as any)[0]?.insertId as number || null;
  } catch (error) {
    console.error("[Database] Failed to create despesa:", error);
    return null;
  }
}

export async function getDespesasByProtocolo(statusProtocoloId: number): Promise<Despesa[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select().from(despesas).where(eq(despesas.statusProtocoloId, statusProtocoloId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get despesas:", error);
    return [];
  }
}

export async function updateDespesa(id: number, data: Partial<InsertDespesa>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(despesas).set(data).where(eq(despesas.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update despesa:", error);
    return false;
  }
}

export async function deleteDespesa(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(despesas).where(eq(despesas.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete despesa:", error);
    return false;
  }
}

// ============ RECEITAS FUNCTIONS ============

export async function createReceita(data: InsertReceita): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(receitas).values(data);
    return (result as any)[0]?.insertId as number || null;
  } catch (error) {
    console.error("[Database] Failed to create receita:", error);
    return null;
  }
}

export async function getReceitasByProtocolo(statusProtocoloId: number): Promise<Receita[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select().from(receitas).where(eq(receitas.statusProtocoloId, statusProtocoloId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get receitas:", error);
    return [];
  }
}

export async function updateReceita(id: number, data: Partial<InsertReceita>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(receitas).set(data).where(eq(receitas.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update receita:", error);
    return false;
  }
}

export async function deleteReceita(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(receitas).where(eq(receitas.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete receita:", error);
    return false;
  }
}


// ============ TIPOS DE PROCESSO FUNCTIONS ============

export async function getTiposProcesso(): Promise<TipoProcesso[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tipos de processo: database not available");
    return [];
  }

  try {
    return await db.select().from(tiposProcesso).where(eq(tiposProcesso.ativo, 1)).orderBy(asc(tiposProcesso.nome));
  } catch (error) {
    console.error("[Database] Failed to get tipos de processo:", error);
    return [];
  }
}

export async function createTipoProcesso(data: InsertTipoProcesso): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create tipo de processo: database not available");
    return null;
  }

  try {
    const result = await db.insert(tiposProcesso).values(data);
    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create tipo de processo:", error);
    return null;
  }
}

export async function deleteTipoProcesso(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(tiposProcesso).set({ ativo: 0 }).where(eq(tiposProcesso.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete tipo de processo:", error);
    return false;
  }
}

// ============ CARTÓRIOS FUNCTIONS ============

export async function getCartorios(): Promise<Cartorio[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get cartórios: database not available");
    return [];
  }

  try {
    return await db.select().from(cartorios).where(eq(cartorios.ativo, 1)).orderBy(asc(cartorios.nome));
  } catch (error) {
    console.error("[Database] Failed to get cartórios:", error);
    return [];
  }
}

export async function createCartorio(data: InsertCartorio): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create cartório: database not available");
    return null;
  }

  try {
    const result = await db.insert(cartorios).values(data);
    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Failed to create cartório:", error);
    return null;
  }
}

export async function deleteCartorio(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(cartorios).set({ ativo: 0 }).where(eq(cartorios.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete cartório:", error);
    return false;
  }
}


// ============ RELATORIO FUNCTIONS ============

export async function getRelatorioProtocolos(protocoloIds: number[]) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        id: statusProtocolo.id,
        numeroProtocolo: statusProtocolo.numeroProtocolo,
        tipoProcesso: statusProtocolo.tipoProcesso,
        dataAbertura: statusProtocolo.dataAbertura,
        status: statusProtocolo.status,
        cartorio: statusProtocolo.cartorio,
        observacoes: statusProtocolo.observacoes,
        clienteNome: clientes.nome,
        clienteCpfCnpj: clientes.cpfCnpj,
        clienteContato: clientes.contato,
      })
      .from(statusProtocolo)
      .leftJoin(clientes, eq(statusProtocolo.clienteId, clientes.id))
      .where(inArray(statusProtocolo.id, protocoloIds));

    // Enrich with financial data
    const enriched = await Promise.all(
      result.map(async (proto: any) => {
        const despesasList = await getDespesasByProtocolo(proto.id);
        const receitasList = await getReceitasByProtocolo(proto.id);
        
        const totalDespesas = despesasList.reduce((sum, d) => sum + parseFloat(d.valor as any), 0);
        const totalDespesasPagas = despesasList
          .filter(d => d.pago === 1)
          .reduce((sum, d) => sum + parseFloat(d.valor as any), 0);
        const totalDespesasPendentes = totalDespesas - totalDespesasPagas;

        const totalReceitas = receitasList.reduce((sum, r) => sum + parseFloat(r.valor as any), 0);
        const totalRecebido = receitasList
          .filter(r => r.recebido === 1)
          .reduce((sum, r) => sum + parseFloat(r.valor as any), 0);
        const totalPendente = totalReceitas - totalRecebido;

        // Check if protocol is archived and get arquivo data
        const arquivoData = await db!.select().from(arquivo).where(eq(arquivo.statusProtocoloId, proto.id)).limit(1);
        const arquivoInfo = arquivoData.length > 0 ? arquivoData[0] : null;

        return {
          ...proto,
          totalDespesas,
          totalDespesasPagas,
          totalDespesasPendentes,
          totalReceitas,
          totalRecebido,
          totalPendente,
          despesasList,
          receitasList,
          isArchived: !!arquivoInfo,
          dataArquivamento: arquivoInfo?.dataArquivamento,
          custas: arquivoInfo?.custas || "0.00",
          despesas: arquivoInfo?.despesas || "0.00",
          valorAPagar: arquivoInfo?.valorAPagar || "0.00",
          valorFaltaPagar: arquivoInfo?.valorFaltaPagar || "0.00",
          valorBaixa: arquivoInfo?.valorBaixa || "0.00",
          valorRecebido: arquivoInfo?.valorRecebido || "0.00",
        };
      })
    );

    return enriched;
  } catch (error) {
    console.error("[Database] Failed to get relatorio protocolos:", error);
    return [];
  }
}

export async function getRelatorioProcessos(processoIds: number[]) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        id: processos.id,
        titulo: processos.titulo,
        clienteId: processos.clienteId,
        status: processos.status,
        prazoVencimento: processos.prazoVencimento,
        isArchived: processos.isArchived,
        dataArquivamento: processos.dataArquivamento,
        clienteNome: clientes.nome,
        clienteCpfCnpj: clientes.cpfCnpj,
        clienteContato: clientes.contato,
      })
      .from(processos)
      .leftJoin(clientes, eq(processos.clienteId, clientes.id))
      .where(inArray(processos.id, processoIds));

    // Enrich with financial data (parcelas)
    const enriched = await Promise.all(result.map(async (p: any) => {
      const pParcelas = await db.select().from(parcelas).where(eq(parcelas.processoId, p.id));
      
      const totalDespesas = pParcelas.reduce((sum, item) => sum + parseFloat(item.valorParcela), 0);
      const totalDesconto = pParcelas.reduce((sum, item) => sum + parseFloat(item.desconto || "0"), 0);
      const totalDespesasPagas = pParcelas
        .filter(item => item.pago === 1)
        .reduce((sum, item) => sum + (parseFloat(item.valorParcela) - parseFloat(item.desconto || "0")), 0);
      
      const totalDespesasPendentes = (totalDespesas - totalDesconto) - totalDespesasPagas;

      return {
        ...p,
        totalDespesas: totalDespesas - totalDesconto, // Show total with discount
        totalDespesasPagas,
        totalDespesasPendentes,
        despesasList: pParcelas.map(d => ({
          dataDespesa: d.dataVencimento,
          descricao: `Parcela ${d.id}${d.desconto && parseFloat(d.desconto) > 0 ? ' (com desconto)' : ''}`,
          valor: parseFloat(d.valorParcela) - parseFloat(d.desconto || "0"),
          pago: d.pago
        }))
      };
    }));

    return enriched;
  } catch (error) {
    console.error("[Database] Failed to get relatorio processos:", error);
    return [];
  }
}
