// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/auth.ts
import crypto2 from "crypto";

// server/db.ts
import { eq, and, like, sql, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, tinyint, decimal } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  fotoPerfil: varchar("fotoPerfil", { length: 255 }),
  resetPasswordToken: varchar("resetPasswordToken", { length: 255 }),
  resetPasswordExpires: varchar("resetPasswordExpires", { length: 20 }),
  // Permissões de funcionalidades
  canCreateClient: tinyint("canCreateClient").default(0).notNull(),
  canEditProcess: tinyint("canEditProcess").default(0).notNull(),
  canDeleteProcess: tinyint("canDeleteProcess").default(0).notNull(),
  canViewCalendar: tinyint("canViewCalendar").default(0).notNull(),
  canViewProcesses: tinyint("canViewProcesses").default(0).notNull(),
  canViewClients: tinyint("canViewClients").default(0).notNull(),
  canManageParcelas: tinyint("canManageParcelas").default(0).notNull(),
  canViewArchivo: tinyint("canViewArchivo").default(0).notNull(),
  canViewDespesas: tinyint("canViewDespesas").default(0).notNull(),
  canViewRelatorio: tinyint("canViewRelatorio").default(0).notNull(),
  // Google Calendar Integration
  googleAccessToken: text("googleAccessToken"),
  googleRefreshToken: text("googleRefreshToken"),
  googleCalendarId: varchar("googleCalendarId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn")
});
var clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }).notNull().unique(),
  contato: varchar("contato", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var processos = mysqlTable("processos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  clienteId: int("clienteId").notNull(),
  status: mysqlEnum("status", ["Pendente", "Em An\xE1lise", "Protocolado", "Finalizado", "Campo", "An\xE1lise/Escrit\xF3rio", "Pendente documento"]).default("Pendente").notNull(),
  prazoVencimento: timestamp("prazoVencimento"),
  isArchived: tinyint("isArchived").default(0).notNull(),
  dataArquivamento: timestamp("dataArquivamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var tiposProcesso = mysqlTable("tiposProcesso", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull().unique(),
  descricao: text("descricao"),
  ativo: tinyint("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var cartorios = mysqlTable("cartorios", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull().unique(),
  localizacao: varchar("localizacao", { length: 255 }),
  ativo: tinyint("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var checklistItens = mysqlTable("checklistItens", {
  id: int("id").autoincrement().primaryKey(),
  processoId: int("processoId").notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  concluido: int("concluido").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var auditoria = mysqlTable("auditoria", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  tabela: varchar("tabela", { length: 100 }).notNull(),
  registroId: int("registroId").notNull(),
  acao: mysqlEnum("acao", ["criar", "editar", "deletar"]).notNull(),
  alteracoes: text("alteracoes"),
  criadoEm: timestamp("criadoEm").defaultNow().notNull()
});
var calendario = mysqlTable("calendario", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  data: timestamp("data").notNull(),
  informacoesAdicionais: text("informacoesAdicionais"),
  googleEventId: varchar("googleEventId", { length: 255 }),
  sincronizadoComGoogle: tinyint("sincronizadoComGoogle").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var parcelas = mysqlTable("parcelas", {
  id: int("id").autoincrement().primaryKey(),
  processoId: int("processoId").notNull(),
  numeroParcela: int("numeroParcela").notNull(),
  valorParcela: varchar("valorParcela", { length: 20 }).notNull(),
  desconto: varchar("desconto", { length: 20 }).default("0").notNull(),
  dataPagamento: timestamp("dataPagamento"),
  pago: int("pago").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var statusProtocolo = mysqlTable("statusProtocolo", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId"),
  numeroProtocolo: varchar("numeroProtocolo", { length: 50 }).notNull(),
  tipoProcesso: mysqlEnum("tipoProcesso", [
    "Georreferenciamento",
    "Certid\xE3o de Localiza\xE7\xE3o"
  ]).notNull(),
  dataAbertura: timestamp("dataAbertura").notNull(),
  status: mysqlEnum("status", ["Pronto", "Reingressado", "Reingressado p\xF3s pagamento", "Nota de Pagamento", "Exig\xEAncia", "Protocolado", "Vencido", "Campo", "An\xE1lise/Escrit\xF3rio", "Pendente documento"]).default("Pronto").notNull(),
  cartorio: varchar("cartorio", { length: 100 }).notNull(),
  ultimaAtualizacao: timestamp("ultimaAtualizacao").defaultNow().onUpdateNow().notNull(),
  observacoes: text("observacoes"),
  isArchived: tinyint("isArchived").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var arquivo = mysqlTable("arquivo", {
  id: int("id").autoincrement().primaryKey(),
  statusProtocoloId: int("statusProtocoloId"),
  processoId: int("processoId"),
  clienteId: int("clienteId"),
  dataArquivamento: timestamp("dataArquivamento").defaultNow().notNull(),
  observacoesArquivo: text("observacoesArquivo"),
  totalGasto: decimal("totalGasto", { precision: 10, scale: 2 }).default("0.00"),
  totalRecebido: decimal("totalRecebido", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var despesas = mysqlTable("despesas", {
  id: int("id").autoincrement().primaryKey(),
  statusProtocoloId: int("statusProtocoloId").notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  dataDespesa: timestamp("dataDespesa").defaultNow().notNull(),
  pago: tinyint("pago").default(0).notNull(),
  dataPagamento: timestamp("dataPagamento"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var receitas = mysqlTable("receitas", {
  id: int("id").autoincrement().primaryKey(),
  statusProtocoloId: int("statusProtocoloId").notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  dataReceita: timestamp("dataReceita").defaultNow().notNull(),
  recebido: tinyint("recebido").default(0).notNull(),
  dataRecebimento: timestamp("dataRecebimento"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
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
async function getUserByUsername(username) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllUsers() {
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
async function createUser(user) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return null;
  }
  try {
    const result = await db.insert(users).values(user);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    return null;
  }
}
async function updateUserLastSignedIn(userId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }
  try {
    await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
  }
}
async function updateUserProfile(userId, data) {
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
async function updateUserPassword(userId, passwordHash) {
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
async function createCliente(cliente) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create cliente: database not available");
    return null;
  }
  try {
    const result = await db.insert(clientes).values(cliente);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create cliente:", error);
    return null;
  }
}
async function getClientes() {
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
async function getClienteById(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get cliente: database not available");
    return void 0;
  }
  try {
    const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    return result.length > 0 ? result[0] : void 0;
  } catch (error) {
    console.error("[Database] Failed to get cliente:", error);
    return void 0;
  }
}
async function updateCliente(id, updates) {
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
async function deleteCliente(id) {
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
async function createProcesso(processo) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create processo: database not available");
    return null;
  }
  try {
    const result = await db.insert(processos).values(processo);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create processo:", error);
    return null;
  }
}
async function getProcessos() {
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
async function getProcessoById(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get processo: database not available");
    return void 0;
  }
  try {
    const result = await db.select().from(processos).where(eq(processos.id, id)).limit(1);
    return result.length > 0 ? result[0] : void 0;
  } catch (error) {
    console.error("[Database] Failed to get processo:", error);
    return void 0;
  }
}
async function updateProcesso(id, updates) {
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
async function deleteProcesso(id) {
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
async function createChecklistItem(item) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create checklist item: database not available");
    return null;
  }
  try {
    const result = await db.insert(checklistItens).values(item);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create checklist item:", error);
    return null;
  }
}
async function getChecklistItens(processoId) {
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
async function updateChecklistItem(id, updates) {
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
async function deleteChecklistItem(id) {
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
async function getProcessosDashboard() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get dashboard data: database not available");
    return { pendentes: 0, emAnalise: 0, protocolado: 0, finalizado: 0, campo: 0, analiseEscritorio: 0, pendenteDocumento: 0, vencendoHoje: 0, statusProtocolo: 0 };
  }
  try {
    const allProcessos = await db.select().from(processos);
    const allStatusProtocolo = await db.select().from(statusProtocolo);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const stats = {
      pendentes: allProcessos.filter((p) => p.status === "Pendente").length,
      emAnalise: allProcessos.filter((p) => p.status === "Em An\xE1lise").length,
      protocolado: allProcessos.filter((p) => p.status === "Protocolado").length,
      finalizado: allProcessos.filter((p) => p.status === "Finalizado").length,
      campo: allProcessos.filter((p) => p.status === "Campo").length,
      analiseEscritorio: allProcessos.filter((p) => p.status === "An\xE1lise/Escrit\xF3rio").length,
      pendenteDocumento: allProcessos.filter((p) => p.status === "Pendente documento").length,
      vencendoHoje: allProcessos.filter((p) => {
        if (!p.prazoVencimento) return false;
        const prazo = new Date(p.prazoVencimento);
        prazo.setHours(0, 0, 0, 0);
        return prazo.getTime() === today.getTime() && p.status !== "Finalizado";
      }).length,
      statusProtocolo: allStatusProtocolo.length
    };
    return stats;
  } catch (error) {
    console.error("[Database] Failed to get dashboard data:", error);
    return { pendentes: 0, emAnalise: 0, protocolado: 0, finalizado: 0, campo: 0, analiseEscritorio: 0, pendenteDocumento: 0, vencendoHoje: 0, statusProtocolo: 0 };
  }
}
async function createAuditoria(audit) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create auditoria: database not available");
    return null;
  }
  try {
    const result = await db.insert(auditoria).values(audit);
    console.log("[Database] Auditoria created:", result);
    const insertId = result.insertId || result[0]?.insertId;
    return insertId;
  } catch (error) {
    console.error("[Database] Failed to create auditoria:", error);
    return null;
  }
}
async function getAuditoriaByProcesso(processoId) {
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
async function getAuditoriaByUsuario(usuarioId) {
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
async function getAllAuditoria() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get auditoria: database not available");
    return [];
  }
  try {
    const auditoriaData = await db.select().from(auditoria);
    const auditoriaComNomes = await Promise.all(
      auditoriaData.map(async (item) => {
        const usuario = await db.select().from(users).where(eq(users.id, item.usuarioId)).limit(1);
        return {
          ...item,
          nomeUsuario: usuario.length > 0 && usuario[0].username ? usuario[0].username : `Usu\xE1rio ${item.usuarioId}`
        };
      })
    );
    return auditoriaComNomes;
  } catch (error) {
    console.error("[Database] Failed to get auditoria:", error);
    return [];
  }
}
async function createCalendario(cal) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create calendario: database not available");
    return null;
  }
  try {
    const result = await db.insert(calendario).values(cal);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create calendario:", error);
    return null;
  }
}
async function getCalendarioByUsuario(usuarioId) {
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
async function getCalendarioById(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get calendario: database not available");
    return void 0;
  }
  try {
    const result = await db.select().from(calendario).where(eq(calendario.id, id)).limit(1);
    return result.length > 0 ? result[0] : void 0;
  } catch (error) {
    console.error("[Database] Failed to get calendario:", error);
    return void 0;
  }
}
async function updateCalendario(id, updates) {
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
async function deleteCalendario(id) {
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
async function createParcela(parcela) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create parcela: database not available");
    return null;
  }
  try {
    const result = await db.insert(parcelas).values(parcela);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create parcela:", error);
    return null;
  }
}
async function getParcelasByProcesso(processoId) {
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
async function updateParcela(id, updates) {
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
async function deleteParcela(id) {
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
async function marcarParcelaComoPaga(id, dataPagamento) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update parcela: database not available");
    return;
  }
  try {
    await db.update(parcelas).set({
      pago: 1,
      dataPagamento
    }).where(eq(parcelas.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark parcela as paid:", error);
  }
}
async function marcarParcelaComoNaoPaga(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update parcela: database not available");
    return;
  }
  try {
    await db.update(parcelas).set({
      pago: 0,
      dataPagamento: null
    }).where(eq(parcelas.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark parcela as unpaid:", error);
  }
}
async function updateUserPermissions(userId, permissions) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user permissions: database not available");
    return;
  }
  try {
    const updateData = {};
    if (permissions.canCreateClient !== void 0) updateData.canCreateClient = permissions.canCreateClient ? 1 : 0;
    if (permissions.canEditProcess !== void 0) updateData.canEditProcess = permissions.canEditProcess ? 1 : 0;
    if (permissions.canDeleteProcess !== void 0) updateData.canDeleteProcess = permissions.canDeleteProcess ? 1 : 0;
    if (permissions.canViewCalendar !== void 0) updateData.canViewCalendar = permissions.canViewCalendar ? 1 : 0;
    if (permissions.canViewProcesses !== void 0) updateData.canViewProcesses = permissions.canViewProcesses ? 1 : 0;
    if (permissions.canViewClients !== void 0) updateData.canViewClients = permissions.canViewClients ? 1 : 0;
    if (permissions.canViewDespesas !== void 0) updateData.canViewDespesas = permissions.canViewDespesas ? 1 : 0;
    if (permissions.canViewRelatorio !== void 0) updateData.canViewRelatorio = permissions.canViewRelatorio ? 1 : 0;
    if (permissions.canManageParcelas !== void 0) updateData.canManageParcelas = permissions.canManageParcelas ? 1 : 0;
    if (permissions.canViewArchivo !== void 0) updateData.canViewArchivo = permissions.canViewArchivo ? 1 : 0;
    await db.update(users).set(updateData).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user permissions:", error);
  }
}
async function getUserPermissions(userId) {
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
      canViewRelatorio: users.canViewRelatorio
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
        canViewArchivo: result[0].canViewArchivo === 1
      };
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to get user permissions:", error);
    return null;
  }
}
async function createStatusProtocolo(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create status protocolo: database not available");
    return null;
  }
  try {
    const result = await db.insert(statusProtocolo).values(data);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create status protocolo:", error);
    return null;
  }
}
async function getStatusProtocoloList() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get status protocolo list: database not available");
    return [];
  }
  try {
    const result = await db.select({
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
        contato: clientes.contato
      }
    }).from(statusProtocolo).leftJoin(clientes, eq(statusProtocolo.clienteId, clientes.id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get status protocolo list:", error);
    return [];
  }
}
async function updateStatusProtocolo(id, data) {
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
async function deleteStatusProtocolo(id) {
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
async function searchStatusProtocolo(numeroProtocolo, clienteId) {
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
async function deleteUser(userId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete user: database not available");
    throw new Error("Database not available");
  }
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length > 0 && user[0].username === "DMconsultoria") {
      throw new Error("N\xE3o \xE9 poss\xEDvel excluir o usu\xE1rio DMconsultoria");
    }
    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete user:", error);
    throw error;
  }
}
async function getChecklistTemplates() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get checklist templates: database not available");
    return [];
  }
  try {
    return [];
  } catch (error) {
    console.error("[Database] Failed to get checklist templates:", error);
    return [];
  }
}
async function createChecklistTemplate(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create checklist template: database not available");
    return null;
  }
  try {
    console.log("[Database] Template salvo:", data.nome);
    return Math.floor(Math.random() * 1e4);
  } catch (error) {
    console.error("[Database] Failed to create checklist template:", error);
    return null;
  }
}
async function updateUserRole(userId, role) {
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
async function updateGoogleCalendarTokens(userId, data) {
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
async function getGoogleCalendarTokens(userId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get Google Calendar tokens: database not available");
    return null;
  }
  try {
    const result = await db.select({
      googleAccessToken: users.googleAccessToken,
      googleRefreshToken: users.googleRefreshToken,
      googleCalendarId: users.googleCalendarId
    }).from(users).where(eq(users.id, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get Google Calendar tokens:", error);
    return null;
  }
}
async function updateCalendarioWithGoogleEvent(calendarioId, googleEventId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update calendario: database not available");
    return false;
  }
  try {
    await db.update(calendario).set({
      googleEventId
    }).where(eq(calendario.id, calendarioId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update calendario with Google event:", error);
    return false;
  }
}
async function getClientesPaginated(page = 1, limit = 10, searchTerm) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get clientes paginated: database not available");
    return { data: [], total: 0, page, limit };
  }
  try {
    const offset = (page - 1) * limit;
    let query = db.select().from(clientes);
    if (searchTerm) {
      query = query.where(like(clientes.nome, `%${searchTerm}%`));
    }
    const result = await query.limit(limit).offset(offset);
    let countQuery = db.select({ count: sql`COUNT(*)` }).from(clientes);
    if (searchTerm) {
      countQuery = countQuery.where(like(clientes.nome, `%${searchTerm}%`));
    }
    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;
    return { data: result, total, page, limit };
  } catch (error) {
    console.error("[Database] Failed to get clientes paginated:", error);
    return { data: [], total: 0, page, limit };
  }
}
async function getProcessosPaginated(page = 1, limit = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get processos paginated: database not available");
    return { data: [], total: 0, page, limit };
  }
  try {
    const offset = (page - 1) * limit;
    const result = await db.select().from(processos).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql`COUNT(*)` }).from(processos);
    const total = countResult[0]?.count || 0;
    const clientes_list = await getClientes();
    const clienteMap = new Map(clientes_list.map((c) => [c.id, c]));
    const enriched = result.map((p) => ({
      ...p,
      cliente: clienteMap.get(p.clienteId)
    }));
    return { data: enriched, total, page, limit };
  } catch (error) {
    console.error("[Database] Failed to get processos paginated:", error);
    return { data: [], total: 0, page, limit };
  }
}
async function getStatusProtocoloPaginated(page = 1, limit = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get status protocolo paginated: database not available");
    return { data: [], total: 0, page, limit };
  }
  try {
    const offset = (page - 1) * limit;
    const result = await db.select({
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
        contato: clientes.contato
      }
    }).from(statusProtocolo).leftJoin(clientes, eq(statusProtocolo.clienteId, clientes.id)).where(eq(statusProtocolo.isArchived, 0)).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql`COUNT(*)` }).from(statusProtocolo).where(eq(statusProtocolo.isArchived, 0));
    const total = countResult[0]?.count || 0;
    return { data: result, total, page, limit };
  } catch (error) {
    console.error("[Database] Failed to get status protocolo paginated:", error);
    return { data: [], total: 0, page, limit };
  }
}
async function arquivarProtocolo(statusProtocoloId, observacoesArquivo) {
  const db = await getDb();
  if (!db) return null;
  try {
    const statusProto = await db.select().from(statusProtocolo).where(eq(statusProtocolo.id, statusProtocoloId)).limit(1);
    const clienteId = statusProto.length > 0 ? statusProto[0].clienteId : null;
    const result = await db.insert(arquivo).values({
      statusProtocoloId,
      clienteId: clienteId || void 0,
      observacoesArquivo,
      totalGasto: "0.00",
      totalRecebido: "0.00"
    });
    await db.update(statusProtocolo).set({ isArchived: 1 }).where(eq(statusProtocolo.id, statusProtocoloId));
    return result[0]?.insertId || null;
  } catch (error) {
    console.error("[Database] Failed to archive protocolo:", error);
    return null;
  }
}
async function getArquivados() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select({
      id: arquivo.id,
      statusProtocoloId: arquivo.statusProtocoloId,
      processoId: arquivo.processoId,
      clienteId: arquivo.clienteId,
      dataArquivamento: arquivo.dataArquivamento,
      observacoesArquivo: arquivo.observacoesArquivo,
      totalGasto: arquivo.totalGasto,
      totalRecebido: arquivo.totalRecebido,
      clienteNome: clientes.nome,
      numeroProtocolo: statusProtocolo.numeroProtocolo,
      processoTitulo: processos.titulo
    }).from(arquivo).leftJoin(clientes, eq(arquivo.clienteId, clientes.id)).leftJoin(statusProtocolo, eq(arquivo.statusProtocoloId, statusProtocolo.id)).leftJoin(processos, eq(arquivo.processoId, processos.id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get arquivados:", error);
    return [];
  }
}
async function deleteArquivo(id) {
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
async function createDespesa(data) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(despesas).values(data);
    return result[0]?.insertId || null;
  } catch (error) {
    console.error("[Database] Failed to create despesa:", error);
    return null;
  }
}
async function getDespesasByProtocolo(statusProtocoloId) {
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
async function updateDespesa(id, data) {
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
async function deleteDespesa(id) {
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
async function createReceita(data) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(receitas).values(data);
    return result[0]?.insertId || null;
  } catch (error) {
    console.error("[Database] Failed to create receita:", error);
    return null;
  }
}
async function getReceitasByProtocolo(statusProtocoloId) {
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
async function updateReceita(id, data) {
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
async function deleteReceita(id) {
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
async function getTiposProcesso() {
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
async function createTipoProcesso(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create tipo de processo: database not available");
    return null;
  }
  try {
    const result = await db.insert(tiposProcesso).values(data);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create tipo de processo:", error);
    return null;
  }
}
async function deleteTipoProcesso(id) {
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
async function getCartorios() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get cart\xF3rios: database not available");
    return [];
  }
  try {
    return await db.select().from(cartorios).where(eq(cartorios.ativo, 1)).orderBy(asc(cartorios.nome));
  } catch (error) {
    console.error("[Database] Failed to get cart\xF3rios:", error);
    return [];
  }
}
async function createCartorio(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create cart\xF3rio: database not available");
    return null;
  }
  try {
    const result = await db.insert(cartorios).values(data);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create cart\xF3rio:", error);
    return null;
  }
}
async function deleteCartorio(id) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.update(cartorios).set({ ativo: 0 }).where(eq(cartorios.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete cart\xF3rio:", error);
    return false;
  }
}

// server/auth.ts
var SESSION_DURATION = 7 * 24 * 60 * 60 * 1e3;
function hashPassword(password) {
  const salt = crypto2.randomBytes(16).toString("hex");
  const hash = crypto2.pbkdf2Sync(password, salt, 1e5, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, hash) {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) return false;
  const computedHash = crypto2.pbkdf2Sync(password, salt, 1e5, 64, "sha256").toString("hex");
  return computedHash === storedHash;
}
function createSessionToken(userId) {
  const token = crypto2.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DURATION;
  return JSON.stringify({ token, userId, expiresAt });
}
function verifySessionToken(tokenString) {
  try {
    const { token, userId, expiresAt } = JSON.parse(tokenString);
    if (Date.now() > expiresAt) {
      return null;
    }
    return { userId };
  } catch {
    return null;
  }
}
async function loginUser(username, password) {
  const user = await getUserByUsername(username);
  if (!user) {
    return { success: false, error: "Usu\xE1rio n\xE3o encontrado" };
  }
  if (!user.passwordHash) {
    return { success: false, error: "Usu\xE1rio n\xE3o tem senha configurada" };
  }
  const isPasswordValid = verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: "Senha incorreta" };
  }
  await updateUserLastSignedIn(user.id);
  const sessionToken = createSessionToken(user.id);
  return { success: true, sessionToken, user };
}
async function registerUser(username, email, password, name) {
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return { success: false, error: "Usu\xE1rio j\xE1 existe" };
  }
  const passwordHash = hashPassword(password);
  const userId = await createUser({
    username,
    email,
    passwordHash,
    name,
    role: "user"
  });
  if (!userId) {
    return { success: false, error: "Erro ao criar usu\xE1rio" };
  }
  const user = await getUserById(userId);
  const sessionToken = createSessionToken(userId);
  return { success: true, sessionToken, user };
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/google-calendar.ts
import { OAuth2Client } from "google-auth-library";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  appUrl: process.env.APP_URL ?? "http://localhost:3000"
};

// server/google-calendar.ts
console.log("[Google Calendar] ENV.googleClientId:", ENV.googleClientId ? "SET" : "MISSING");
console.log("[Google Calendar] ENV.googleClientSecret:", ENV.googleClientSecret ? "SET" : "MISSING");
var getRedirectUri = () => {
  return `${ENV.appUrl}/api/google-callback`;
};
var redirectUri = getRedirectUri();
console.log("[Google Calendar] APP_URL:", ENV.appUrl);
console.log("[Google Calendar] Redirect URI:", redirectUri);
if (!ENV.googleClientId || !ENV.googleClientSecret) {
  console.error("[Google Calendar] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}
var oauth2Client = new OAuth2Client(
  ENV.googleClientId || "",
  ENV.googleClientSecret || "",
  redirectUri
);
console.log("[Google Calendar] OAuth2Client initialized");
function getGoogleAuthUrl(userId) {
  try {
    const state = JSON.stringify({ userId });
    const stateBase64 = Buffer.from(state).toString("base64");
    const params = new URLSearchParams({
      client_id: ENV.googleClientId || "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar",
      access_type: "offline",
      state: stateBase64,
      prompt: "consent"
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log("[Google Calendar] Generated auth URL with client_id:", ENV.googleClientId?.substring(0, 20) + "...");
    console.log("[Google Calendar] Full auth URL:", authUrl.substring(0, 150) + "...");
    return authUrl;
  } catch (error) {
    console.error("[Google Calendar] Error generating auth URL:", error);
    throw error;
  }
}
async function exchangeCodeForTokens(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error("[Google Calendar] Error exchanging code for tokens:", error);
    throw error;
  }
}
async function createGoogleCalendarEvent(accessToken, event) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    const { google } = await import("googleapis");
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const endTime = event.endTime || new Date(event.startTime.getTime() + 60 * 60 * 1e3);
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: "America/Sao_Paulo"
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "America/Sao_Paulo"
        }
      }
    });
    return response.data;
  } catch (error) {
    console.error("[Google Calendar] Error creating event:", error);
    throw error;
  }
}
async function deleteGoogleCalendarEvent(accessToken, eventId) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    const { google } = await import("googleapis");
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.delete({
      calendarId: "primary",
      eventId
    });
    return { success: true };
  } catch (error) {
    console.error("[Google Calendar] Error deleting event:", error);
    throw error;
  }
}

// server/google-callback.ts
async function handleGoogleCallback(req, res) {
  try {
    const { code, state, error } = req.query;
    console.log("[Google Callback] Received callback with:", { code: code ? "SET" : "MISSING", state: state ? "SET" : "MISSING", error });
    if (error) {
      console.log("[Google Callback] Authorization error:", error);
      return res.redirect(`/?error=google_auth_failed&message=${error}`);
    }
    if (!code || typeof code !== "string") {
      console.error("[Google Callback] Missing or invalid authorization code");
      return res.status(400).json({ error: "Missing authorization code" });
    }
    let userId;
    try {
      const stateStr = typeof state === "string" ? state : "";
      const decodedState = JSON.parse(Buffer.from(stateStr, "base64").toString());
      userId = decodedState.userId;
    } catch (e) {
      return res.status(400).json({ error: "Invalid state parameter" });
    }
    console.log("[Google Callback] Exchanging code for tokens...");
    const tokens = await exchangeCodeForTokens(code);
    console.log("[Google Callback] Tokens received:", { access_token: tokens.access_token ? "SET" : "MISSING", refresh_token: tokens.refresh_token ? "SET" : "MISSING" });
    if (!tokens.access_token) {
      return res.status(400).json({ error: "Failed to get access token" });
    }
    console.log("[Google Callback] Saving tokens to database for userId:", userId);
    const success = await updateGoogleCalendarTokens(userId, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token || void 0,
      googleCalendarId: "primary"
      // Usar calendário principal
    });
    if (!success) {
      console.error("[Google Callback] Failed to save tokens to database");
      return res.status(500).json({ error: "Failed to save tokens" });
    }
    console.log("[Google Callback] Tokens saved successfully");
    return res.redirect("/?google_auth_success=true");
  } catch (error) {
    console.error("[Google Callback] Error:", error);
    console.error("[Google Callback] Error details:", error instanceof Error ? error.message : String(error));
    return res.status(500).json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) });
  }
}

// server/debug-google.ts
async function debugGoogleAuthUrl(req, res) {
  try {
    const userId = parseInt(req.query.userId) || 1;
    console.log("=== DEBUG GOOGLE AUTH URL ===");
    console.log("APP_URL:", ENV.appUrl);
    console.log("GOOGLE_CLIENT_ID:", ENV.googleClientId?.substring(0, 20) + "...");
    console.log("GOOGLE_CLIENT_SECRET:", ENV.googleClientSecret ? "SET" : "MISSING");
    const authUrl = getGoogleAuthUrl(userId);
    console.log("Generated Auth URL:", authUrl);
    console.log("URL Length:", authUrl.length);
    console.log("Contains client_id:", authUrl.includes("client_id="));
    console.log("Contains redirect_uri:", authUrl.includes("redirect_uri="));
    const url = new URL(authUrl);
    console.log("URL Parameters:");
    url.searchParams.forEach((value, key) => {
      console.log(`  ${key}: ${value.substring(0, 50)}${value.length > 50 ? "..." : ""}`);
    });
    return res.json({
      success: true,
      authUrl,
      urlLength: authUrl.length,
      parameters: {
        client_id: url.searchParams.get("client_id") || "MISSING",
        redirect_uri: url.searchParams.get("redirect_uri") || "MISSING",
        response_type: url.searchParams.get("response_type") || "MISSING",
        scope: url.searchParams.get("scope") || "MISSING",
        access_type: url.searchParams.get("access_type") || "MISSING",
        state: url.searchParams.get("state") ? "SET" : "MISSING",
        prompt: url.searchParams.get("prompt") || "MISSING"
      },
      environment: {
        appUrl: ENV.appUrl,
        nodeEnv: process.env.NODE_ENV,
        isProduction: ENV.isProduction
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    return res.status(500).json({ error: "Internal server error", details: String(error) });
  }
}

// server/_core/oauth.ts
function getBodyParam(req, key) {
  const value = req.body[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.post("/api/auth/login", async (req, res) => {
    const username = getBodyParam(req, "username");
    const password = getBodyParam(req, "password");
    if (!username || !password) {
      res.status(400).json({ error: "username and password are required" });
      return;
    }
    try {
      const result = await loginUser(username, password);
      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }
      const cookieOptions = getSessionCookieOptions(req);
      const sessionDuration = 7 * 24 * 60 * 60 * 1e3;
      res.cookie(COOKIE_NAME, result.sessionToken, {
        ...cookieOptions,
        maxAge: sessionDuration
      });
      res.json({ success: true, user: result.user });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app.post("/api/auth/register", async (req, res) => {
    const username = getBodyParam(req, "username");
    const email = getBodyParam(req, "email");
    const password = getBodyParam(req, "password");
    const name = getBodyParam(req, "name");
    if (!username || !email || !password || !name) {
      res.status(400).json({
        error: "username, email, password, and name are required"
      });
      return;
    }
    try {
      const result = await registerUser(username, email, password, name);
      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }
      const cookieOptions = getSessionCookieOptions(req);
      const sessionDuration = 7 * 24 * 60 * 60 * 1e3;
      res.cookie(COOKIE_NAME, result.sessionToken, {
        ...cookieOptions,
        maxAge: sessionDuration
      });
      res.json({ success: true, user: result.user });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  app.get("/api/google-callback", async (req, res) => {
    await handleGoogleCallback(req, res);
  });
  app.get("/api/debug/google-auth-url", async (req, res) => {
    await debugGoogleAuthUrl(req, res);
  });
}

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/routers-google.ts
import { z } from "zod";
import { TRPCError as TRPCError2 } from "@trpc/server";
var googleCalendarRouter = router({
  getAuthUrl: protectedProcedure.query(({ ctx }) => {
    if (!ctx.user?.id) throw new TRPCError2({ code: "UNAUTHORIZED" });
    const url = getGoogleAuthUrl(ctx.user.id);
    return { url };
  }),
  syncEvent: protectedProcedure.input(z.object({
    calendarioId: z.number(),
    titulo: z.string(),
    descricao: z.string().optional(),
    data: z.date()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user?.id) throw new TRPCError2({ code: "UNAUTHORIZED" });
    const tokens = await getGoogleCalendarTokens(ctx.user.id);
    if (!tokens?.googleAccessToken) {
      throw new TRPCError2({
        code: "UNAUTHORIZED",
        message: "Usu\xE1rio n\xE3o autorizou acesso ao Google Calendar"
      });
    }
    try {
      const event = await createGoogleCalendarEvent(
        tokens.googleAccessToken,
        {
          title: input.titulo,
          description: input.descricao,
          startTime: input.data
        }
      );
      await updateCalendarioWithGoogleEvent(input.calendarioId, event.id);
      return { success: true, googleEventId: event.id };
    } catch (error) {
      console.error("Failed to sync event with Google Calendar:", error);
      throw new TRPCError2({
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao sincronizar com Google Calendar"
      });
    }
  }),
  deleteEvent: protectedProcedure.input(z.object({
    calendarioId: z.number(),
    googleEventId: z.string()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user?.id) throw new TRPCError2({ code: "UNAUTHORIZED" });
    const tokens = await getGoogleCalendarTokens(ctx.user.id);
    if (!tokens?.googleAccessToken) {
      throw new TRPCError2({ code: "UNAUTHORIZED" });
    }
    try {
      await deleteGoogleCalendarEvent(
        tokens.googleAccessToken,
        input.googleEventId
      );
      return { success: true };
    } catch (error) {
      console.error("Failed to delete event from Google Calendar:", error);
      throw new TRPCError2({
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao deletar evento do Google Calendar"
      });
    }
  })
});

// server/routers.ts
import { z as z2 } from "zod";

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const segmentStart = relKey.lastIndexOf("/");
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1 || lastDot <= segmentStart) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/routers.ts
var appRouter = router({
  // ============ AUTH ROUTES ============
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure.input(
      z2.object({
        username: z2.string().min(1, "Username \xE9 obrigat\xF3rio"),
        password: z2.string().min(1, "Senha \xE9 obrigat\xF3ria")
      })
    ).mutation(async ({ input, ctx }) => {
      const result = await loginUser(input.username, input.password);
      if (!result.success) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: result.error
        });
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const sessionDuration = 7 * 24 * 60 * 60 * 1e3;
      ctx.res.cookie(COOKIE_NAME, result.sessionToken, {
        ...cookieOptions,
        maxAge: sessionDuration
      });
      return { success: true, user: result.user };
    }),
    register: publicProcedure.input(
      z2.object({
        username: z2.string().min(3, "Username deve ter pelo menos 3 caracteres"),
        email: z2.string().email("Email inv\xE1lido"),
        password: z2.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        name: z2.string().min(1, "Nome \xE9 obrigat\xF3rio")
      })
    ).mutation(async ({ input, ctx }) => {
      const result = await registerUser(
        input.username,
        input.email,
        input.password,
        input.name
      );
      if (!result.success) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: result.error
        });
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const sessionDuration = 7 * 24 * 60 * 60 * 1e3;
      ctx.res.cookie(COOKIE_NAME, result.sessionToken, {
        ...cookieOptions,
        maxAge: sessionDuration
      });
      return { success: true, user: result.user };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    updateProfile: protectedProcedure.input(
      z2.object({
        name: z2.string().optional(),
        email: z2.string().email().optional(),
        fotoPerfil: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      let updateData = { ...input };
      if (input.fotoPerfil && input.fotoPerfil.startsWith("data:")) {
        try {
          const base64Data = input.fotoPerfil.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");
          const fileKey = `users/${ctx.user.id}/profile-photo-${Date.now()}.jpg`;
          const { url } = await storagePut(fileKey, buffer, "image/jpeg");
          updateData.fotoPerfil = url;
        } catch (error) {
          console.error("[Upload] Failed to upload profile photo:", error);
          throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao fazer upload da foto" });
        }
      }
      const success = await updateUserProfile(ctx.user.id, updateData);
      return { success, fotoPerfil: updateData.fotoPerfil };
    }),
    updatePassword: protectedProcedure.input(
      z2.object({
        currentPassword: z2.string().min(1, "Senha atual eh obrigatoria"),
        newPassword: z2.string().min(6, "Nova senha deve ter pelo menos 6 caracteres")
      })
    ).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError3({ code: "NOT_FOUND", message: "Usuario nao encontrado" });
      if (!user.passwordHash) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Usu\xE1rio n\xE3o tem senha" });
      const isValid = verifyPassword(input.currentPassword, user.passwordHash);
      if (!isValid) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Senha atual incorreta" });
      const newPasswordHash = await hashPassword(input.newPassword);
      const success = await updateUserPassword(ctx.user.id, newPasswordHash);
      return { success };
    })
  }),
  // ============ CLIENTE ROUTES ============
  clientes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        const permissions = await getUserPermissions(ctx.user?.id || 0);
        if (!permissions?.canViewClients) {
          throw new TRPCError3({ code: "FORBIDDEN", message: "Voc\xEA n\xE3o tem permiss\xE3o para visualizar clientes" });
        }
      }
      return await getClientes();
    }),
    listPaginated: protectedProcedure.input(
      z2.object({
        page: z2.number().min(1).default(1),
        limit: z2.number().min(1).max(100).default(10)
      })
    ).query(async ({ input }) => {
      return await getClientesPaginated(input.page, input.limit);
    }),
    create: protectedProcedure.input(
      z2.object({
        nome: z2.string().min(1, "Nome \xE9 obrigat\xF3rio"),
        cpfCnpj: z2.string().min(1, "CPF/CNPJ \xE9 obrigat\xF3rio"),
        contato: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        const permissions = await getUserPermissions(ctx.user?.id || 0);
        if (!permissions?.canCreateClient) {
          throw new TRPCError3({ code: "FORBIDDEN", message: "Voc\xEA n\xE3o tem permiss\xE3o para criar clientes" });
        }
      }
      const clienteId = await createCliente({
        nome: input.nome,
        cpfCnpj: input.cpfCnpj,
        contato: input.contato
      });
      if (!clienteId) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar cliente"
        });
      }
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "clientes",
          registroId: clienteId,
          acao: "criar",
          alteracoes: `Criou cliente: ${input.nome}`
        });
      }
      return await getClienteById(clienteId);
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        nome: z2.string().optional(),
        cpfCnpj: z2.string().optional(),
        contato: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      await updateCliente(input.id, {
        nome: input.nome,
        cpfCnpj: input.cpfCnpj,
        contato: input.contato
      });
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "clientes",
          registroId: input.id,
          acao: "editar",
          alteracoes: `Editou cliente: ${input.nome || "sem nome"}`
        });
      }
      return await getClienteById(input.id);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteCliente(input.id);
      return { success: true };
    })
  }),
  // ============ PROCESSO ROUTES ============
  processos: router({
    list: protectedProcedure.query(async () => {
      const processos2 = await getProcessos();
      const clientes2 = await getClientes();
      const clienteMap = new Map(clientes2.map((c) => [c.id, c]));
      return processos2.map((p) => ({
        ...p,
        cliente: clienteMap.get(p.clienteId)
      }));
    }),
    listPaginated: protectedProcedure.input(
      z2.object({
        page: z2.number().min(1).default(1),
        limit: z2.number().min(1).max(100).default(10)
      })
    ).query(async ({ input }) => {
      return await getProcessosPaginated(input.page, input.limit);
    }),
    create: protectedProcedure.input(
      z2.object({
        titulo: z2.string().min(1, "T\xEDtulo \xE9 obrigat\xF3rio"),
        clienteId: z2.number(),
        status: z2.enum(["Pendente", "Em An\xE1lise", "Protocolado", "Finalizado", "Campo", "An\xE1lise/Escrit\xF3rio", "Pendente documento"]),
        prazoVencimento: z2.date().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const processoId = await createProcesso({
        titulo: input.titulo,
        clienteId: input.clienteId,
        status: input.status,
        prazoVencimento: input.prazoVencimento
      });
      if (!processoId) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar processo"
        });
      }
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          acao: "criar",
          tabela: "processos",
          registroId: processoId,
          alteracoes: JSON.stringify(input)
        });
      }
      return await getProcessoById(processoId);
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        titulo: z2.string().optional(),
        clienteId: z2.number().optional(),
        status: z2.enum(["Pendente", "Em An\xE1lise", "Protocolado", "Finalizado", "Campo", "An\xE1lise/Escrit\xF3rio", "Pendente documento"]).optional(),
        prazoVencimento: z2.date().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        const permissions = await getUserPermissions(ctx.user?.id || 0);
        if (!permissions?.canEditProcess) {
          throw new TRPCError3({ code: "FORBIDDEN", message: "Voc\xEA n\xE3o tem permiss\xE3o para editar processos" });
        }
      }
      await updateProcesso(input.id, {
        titulo: input.titulo,
        status: input.status,
        prazoVencimento: input.prazoVencimento
      });
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          acao: "editar",
          tabela: "processos",
          registroId: input.id,
          alteracoes: JSON.stringify(input)
        });
      }
      return await getProcessoById(input.id);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        const permissions = await getUserPermissions(ctx.user?.id || 0);
        if (!permissions?.canDeleteProcess) {
          throw new TRPCError3({ code: "FORBIDDEN", message: "Voc\xEA n\xE3o tem permiss\xE3o para deletar processos" });
        }
      }
      await deleteProcesso(input.id);
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          acao: "deletar",
          tabela: "processos",
          registroId: input.id,
          alteracoes: null
        });
      }
      return { success: true };
    })
  }),
  // ============ CHECKLIST ROUTES ============
  checklist: router({
    getByProcesso: protectedProcedure.input(z2.object({ processoId: z2.number() })).query(async ({ input }) => {
      return await getChecklistItens(input.processoId);
    }),
    addItem: protectedProcedure.input(
      z2.object({
        processoId: z2.number(),
        item: z2.string().min(1, "Item \xE9 obrigat\xF3rio")
      })
    ).mutation(async ({ input, ctx }) => {
      const itemId = await createChecklistItem({
        processoId: input.processoId,
        item: input.item
      });
      if (!itemId) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao adicionar item"
        });
      }
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "checklist",
          registroId: input.processoId,
          acao: "criar",
          alteracoes: `Adicionou item no checklist: ${input.item}`
        });
      }
      return { success: true, itemId };
    }),
    toggleItem: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        concluido: z2.number()
      })
    ).mutation(async ({ input, ctx }) => {
      await updateChecklistItem(input.id, {
        concluido: input.concluido
      });
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "checklist",
          registroId: input.id,
          acao: "editar",
          alteracoes: `Marcou item como ${input.concluido ? "concluido" : "nao concluido"}`
        });
      }
      return { success: true };
    }),
    deleteItem: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      await deleteChecklistItem(input.id);
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "checklist",
          registroId: input.id,
          acao: "deletar",
          alteracoes: "Deletou item do checklist"
        });
      }
      return { success: true };
    })
  }),
  checklistTemplates: router({
    list: protectedProcedure.query(async () => {
      return await getChecklistTemplates();
    }),
    create: protectedProcedure.input(
      z2.object({
        nome: z2.string().min(1, "Nome \xE9 obrigat\xF3rio"),
        descricao: z2.string().optional(),
        itens: z2.array(z2.string().min(1))
      })
    ).mutation(async ({ input, ctx }) => {
      const templateId = await createChecklistTemplate({
        usuarioId: ctx.user?.id || 0,
        nome: input.nome,
        descricao: input.descricao || "",
        itens: input.itens
      });
      if (!templateId) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao salvar template"
        });
      }
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "checklistTemplates",
          registroId: templateId,
          acao: "criar",
          alteracoes: `Criou template: ${input.nome}`
        });
      }
      return { success: true, templateId };
    })
  }),
  // ============ DASHBOARD ROUTES ============
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await getProcessosDashboard();
    })
  }),
  // ============ SYSTEM ROUTES ============
  system: router({
    notifyOwner: protectedProcedure.input(
      z2.object({
        title: z2.string(),
        content: z2.string()
      })
    ).mutation(async ({ input }) => {
      console.log("[System] Notification:", input.title, input.content);
      return { success: true };
    })
  }),
  // ============ AUDITORIA ROUTES ============
  auditoria: router({
    getByProcesso: protectedProcedure.input(z2.object({ processoId: z2.number() })).query(async ({ input }) => {
      return await getAuditoriaByProcesso(input.processoId);
    }),
    getByUsuario: protectedProcedure.input(z2.object({ usuarioId: z2.number() })).query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin" && ctx.user?.id !== input.usuarioId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return await getAuditoriaByUsuario(input.usuarioId);
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Apenas admin pode acessar" });
      }
      return await getAllAuditoria();
    })
  }),
  // ============ PARCELAS ROUTES ============
  parcelas: router({
    create: protectedProcedure.input(
      z2.object({
        processoId: z2.number(),
        numeroParcela: z2.number(),
        valorParcela: z2.string()
      })
    ).mutation(async ({ input }) => {
      const id = await createParcela({
        processoId: input.processoId,
        numeroParcela: input.numeroParcela,
        valorParcela: input.valorParcela,
        pago: 0
      });
      return { id, success: id !== null };
    }),
    getByProcesso: protectedProcedure.input(z2.object({ processoId: z2.number() })).query(async ({ input }) => {
      return await getParcelasByProcesso(input.processoId);
    }),
    marcarComoPaga: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await marcarParcelaComoPaga(input.id, /* @__PURE__ */ new Date());
      return { success: true };
    }),
    marcarComoNaoPaga: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await marcarParcelaComoNaoPaga(input.id);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteParcela(input.id);
      return { success: true };
    }),
    updateDesconto: protectedProcedure.input(z2.object({ id: z2.number(), desconto: z2.string() })).mutation(async ({ input }) => {
      await updateParcela(input.id, { desconto: input.desconto });
      return { success: true };
    })
  }),
  // ============ CALENDARIO ROUTES ============
  calendario: router({
    create: protectedProcedure.input(
      z2.object({
        titulo: z2.string().min(1, "T\xEDtulo \xE9 obrigat\xF3rio"),
        descricao: z2.string().optional(),
        data: z2.date(),
        informacoesAdicionais: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const id = await createCalendario({
        usuarioId: ctx.user.id,
        titulo: input.titulo,
        descricao: input.descricao,
        data: input.data,
        informacoesAdicionais: input.informacoesAdicionais
      });
      if (id) {
        try {
          const userTokens = await getGoogleCalendarTokens(ctx.user.id);
          if (userTokens?.googleAccessToken) {
            const googleEventId = await createGoogleCalendarEvent(
              userTokens.googleAccessToken,
              {
                title: input.titulo,
                description: input.descricao || "",
                startTime: new Date(input.data),
                endTime: new Date(new Date(input.data).getTime() + 60 * 60 * 1e3)
              }
            );
            if (googleEventId) {
              if (googleEventId && typeof googleEventId === "string") {
                await updateCalendarioWithGoogleEvent(id, googleEventId);
              }
            }
          }
        } catch (error) {
          console.error("[Calendario] Erro ao sincronizar com Google Calendar:", error);
        }
      }
      return { id, success: id !== null };
    }),
    getByUsuario: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await getCalendarioByUsuario(ctx.user.id);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return await getCalendarioById(input.id);
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        titulo: z2.string().optional(),
        descricao: z2.string().optional(),
        data: z2.date().optional(),
        informacoesAdicionais: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const cal = await getCalendarioById(input.id);
      if (cal?.usuarioId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      await updateCalendario(input.id, {
        titulo: input.titulo,
        descricao: input.descricao,
        data: input.data,
        informacoesAdicionais: input.informacoesAdicionais
      });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const cal = await getCalendarioById(input.id);
      if (cal?.usuarioId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      if (cal?.googleEventId) {
        try {
          const userTokens = await getGoogleCalendarTokens(ctx.user.id);
          if (userTokens?.googleAccessToken) {
            await deleteGoogleCalendarEvent(
              userTokens.googleAccessToken,
              cal.googleEventId
            );
          }
        } catch (error) {
          console.error("[Calendario] Erro ao deletar evento do Google Calendar:", error);
        }
      }
      await deleteCalendario(input.id);
      return { success: true };
    })
  }),
  // ============ PERMISSIONS ROUTES ============
  permissions: router({
    updateUserPermissions: protectedProcedure.input(z2.object({
      userId: z2.number(),
      canCreateClient: z2.boolean().optional(),
      canEditProcess: z2.boolean().optional(),
      canDeleteProcess: z2.boolean().optional(),
      canViewCalendar: z2.boolean().optional(),
      canViewProcesses: z2.boolean().optional(),
      canViewClients: z2.boolean().optional(),
      canManageParcelas: z2.boolean().optional(),
      canViewArchivo: z2.boolean().optional()
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Apenas administradores podem alterar permiss\xF5es" });
      }
      await updateUserPermissions(input.userId, {
        canCreateClient: input.canCreateClient,
        canEditProcess: input.canEditProcess,
        canDeleteProcess: input.canDeleteProcess,
        canViewCalendar: input.canViewCalendar,
        canViewProcesses: input.canViewProcesses,
        canViewClients: input.canViewClients,
        canManageParcelas: input.canManageParcelas,
        canViewArchivo: input.canViewArchivo
      });
      return { success: true };
    }),
    getUserPermissions: protectedProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Apenas administradores podem ver permiss\xF5es" });
      }
      return await getUserPermissions(input.userId);
    }),
    getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await getUserPermissions(ctx.user.id);
    }),
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Apenas administradores podem ver todos os usu\xE1rios" });
      }
      return await getAllUsers();
    }),
    deleteUser: protectedProcedure.input(z2.object({ userId: z2.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Apenas administradores podem deletar usu\xE1rios" });
      }
      if (input.userId === ctx.user.id) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Voc\xEA n\xE3o pode deletar sua pr\xF3pria conta" });
      }
      await deleteUser(input.userId);
      return { success: true };
    }),
    promoteToAdmin: protectedProcedure.input(z2.object({ userId: z2.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Apenas administradores podem promover usu\xE1rios" });
      }
      if (input.userId === ctx.user.id) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Voc\xEA j\xE1 \xE9 um administrador" });
      }
      await updateUserRole(input.userId, "admin");
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "users",
          registroId: input.userId,
          acao: "editar",
          alteracoes: "Promovido para administrador"
        });
      }
      return { success: true };
    }),
    demoteFromAdmin: protectedProcedure.input(z2.object({ userId: z2.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Apenas administradores podem rebaixar usu\xE1rios" });
      }
      if (input.userId === ctx.user.id) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Voc\xEA n\xE3o pode rebaixar a si mesmo" });
      }
      await updateUserRole(input.userId, "user");
      if (ctx.user) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "users",
          registroId: input.userId,
          acao: "editar",
          alteracoes: "Rebaixado para usu\xE1rio comum"
        });
      }
      return { success: true };
    })
  }),
  statusProtocolo: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await getStatusProtocoloList();
    }),
    listPaginated: protectedProcedure.input(
      z2.object({
        page: z2.number().min(1).default(1),
        limit: z2.number().min(1).max(100).default(10)
      })
    ).query(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await getStatusProtocoloPaginated(input.page, input.limit);
    }),
    create: protectedProcedure.input(z2.object({
      clienteId: z2.number(),
      numeroProtocolo: z2.string(),
      tipoProcesso: z2.enum(["Georreferenciamento", "Certid\xE3o de Localiza\xE7\xE3o"]),
      dataAbertura: z2.date(),
      status: z2.enum(["Pronto", "Reingressado", "Reingressado p\xF3s pagamento", "Nota de Pagamento", "Exig\xEAncia", "Protocolado", "Vencido"]).default("Pronto"),
      cartorio: z2.string(),
      observacoes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const id = await createStatusProtocolo(input);
      if (id) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "statusProtocolo",
          registroId: id,
          acao: "criar",
          alteracoes: JSON.stringify(input)
        });
      }
      return id;
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      clienteId: z2.number().optional(),
      numeroProtocolo: z2.string().optional(),
      tipoProcesso: z2.enum(["Georreferenciamento", "Certid\xE3o de Localiza\xE7\xE3o"]).optional(),
      dataAbertura: z2.date().optional(),
      status: z2.enum(["Pronto", "Reingressado", "Reingressado p\xF3s pagamento", "Nota de Pagamento", "Exig\xEAncia", "Protocolado", "Vencido"]).optional(),
      cartorio: z2.string().optional(),
      observacoes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, ...updateData } = input;
      const success = await updateStatusProtocolo(id, updateData);
      if (success) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "statusProtocolo",
          registroId: input.id,
          acao: "editar",
          alteracoes: JSON.stringify(input)
        });
      }
      return success;
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const success = await deleteStatusProtocolo(input.id);
      if (success) {
        await createAuditoria({
          usuarioId: ctx.user.id,
          tabela: "statusProtocolo",
          registroId: input.id,
          acao: "deletar",
          alteracoes: null
        });
      }
      return success;
    }),
    search: protectedProcedure.input(z2.object({
      numeroProtocolo: z2.string().optional(),
      clienteId: z2.number().optional()
    })).query(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await searchStatusProtocolo(input.numeroProtocolo, input.clienteId);
    })
  }),
  arquivo: router({
    criar: protectedProcedure.input(z2.object({
      statusProtocoloId: z2.number(),
      processoId: z2.number().optional(),
      observacoes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN" });
      const id = await arquivarProtocolo(input.statusProtocoloId, input.observacoes);
      return { success: id !== null, id };
    }),
    listar: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN" });
      return await getArquivados();
    }),
    deletar: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN" });
      return await deleteArquivo(input.id);
    })
  }),
  despesas: router({
    criar: protectedProcedure.input(z2.object({
      statusProtocoloId: z2.number(),
      processoId: z2.number().optional(),
      descricao: z2.string(),
      valor: z2.string()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const id = await createDespesa(input);
      return { success: id !== null, id };
    }),
    listarPorProtocolo: protectedProcedure.input(z2.object({ statusProtocoloId: z2.number() })).query(async ({ input }) => {
      return await getDespesasByProtocolo(input.statusProtocoloId);
    }),
    atualizar: protectedProcedure.input(z2.object({
      id: z2.number(),
      descricao: z2.string().optional(),
      valor: z2.string().optional(),
      pago: z2.number().optional(),
      dataPagamento: z2.date().optional(),
      observacoes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      return await updateDespesa(id, data);
    }),
    deletar: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await deleteDespesa(input.id);
    })
  }),
  receitas: router({
    criar: protectedProcedure.input(z2.object({
      statusProtocoloId: z2.number(),
      processoId: z2.number().optional(),
      descricao: z2.string(),
      valor: z2.string()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const id = await createReceita(input);
      return { success: id !== null, id };
    }),
    listarPorProtocolo: protectedProcedure.input(z2.object({ statusProtocoloId: z2.number() })).query(async ({ input }) => {
      return await getReceitasByProtocolo(input.statusProtocoloId);
    }),
    atualizar: protectedProcedure.input(z2.object({
      id: z2.number(),
      descricao: z2.string().optional(),
      valor: z2.string().optional(),
      recebido: z2.number().optional(),
      dataRecebimento: z2.date().optional(),
      observacoes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      return await updateReceita(id, data);
    }),
    deletar: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await deleteReceita(input.id);
    })
  }),
  googleCalendar: googleCalendarRouter,
  // ============ TIPOS DE PROCESSO ============
  tiposProcesso: router({
    list: publicProcedure.query(async () => {
      return await getTiposProcesso();
    }),
    create: protectedProcedure.input(
      z2.object({
        nome: z2.string().min(1, "Nome \xE9 obrigat\xF3rio"),
        descricao: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await createTipoProcesso(input);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await deleteTipoProcesso(input.id);
    })
  }),
  // ============ CARTÓRIOS ============
  cartorios: router({
    list: publicProcedure.query(async () => {
      return await getCartorios();
    }),
    create: protectedProcedure.input(
      z2.object({
        nome: z2.string().min(1, "Nome \xE9 obrigat\xF3rio"),
        localizacao: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await createCartorio(input);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      return await deleteCartorio(input.id);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    const cookies = parseCookies(opts.req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    if (sessionCookie) {
      const session = verifySessionToken(sessionCookie);
      if (session) {
        const fetchedUser = await getUserById(session.userId);
        user = fetchedUser || null;
      }
    }
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}
function parseCookies(cookieHeader) {
  const cookies = /* @__PURE__ */ new Map();
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.split("=");
    if (name && value) {
      cookies.set(name.trim(), decodeURIComponent(value.trim()));
    }
  });
  return cookies;
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var PROJECT_ROOT = __dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  envDir: path.resolve(__dirname),
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client", "public"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(__dirname2, "../..", "dist", "public") : path2.resolve(__dirname2, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/migrate.ts
import { drizzle as drizzle2 } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path3 from "path";
async function runMigrations() {
  if (process.env.SKIP_MIGRATIONS === "true") {
    console.log("[Migrations] Skipping migrations (SKIP_MIGRATIONS=true)");
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.warn("[Migrations] DATABASE_URL not set, skipping migrations");
    return;
  }
  try {
    console.log("[Migrations] Starting database migrations...");
    const db = drizzle2(process.env.DATABASE_URL);
    const migrationsFolder = path3.join(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    console.log("[Migrations] Database migrations completed successfully");
  } catch (error) {
    if (error?.cause?.code === "ER_TABLE_EXISTS_ERROR" || error?.code === "ER_TABLE_EXISTS_ERROR") {
      console.log("[Migrations] Database tables already exist, skipping migration");
      return;
    }
    console.error("[Migrations] Failed to run migrations:", error);
  }
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  try {
    await runMigrations();
  } catch (error) {
    console.error("[Server] Failed to run migrations, continuing anyway...", error);
  }
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
