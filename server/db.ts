import { eq, and, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clientes, processos, checklistItens, Cliente, InsertCliente, Processo, InsertProcesso, ChecklistItem, InsertChecklistItem } from "../drizzle/schema";
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
