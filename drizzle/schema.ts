import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table for authentication with username and password.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clientes table for storing client information.
 */
export const clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }).notNull().unique(),
  contato: varchar("contato", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

/**
 * Processos table for managing real estate processes.
 */
export const processos = mysqlTable("processos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  clienteId: int("clienteId").notNull(),
  status: mysqlEnum("status", ["Pendente", "Em Análise", "Protocolado", "Finalizado"]).default("Pendente").notNull(),
  prazoVencimento: timestamp("prazoVencimento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Processo = typeof processos.$inferSelect;
export type InsertProcesso = typeof processos.$inferInsert;

/**
 * ChecklistItens table for document checklists per process.
 */
export const checklistItens = mysqlTable("checklistItens", {
  id: int("id").autoincrement().primaryKey(),
  processoId: int("processoId").notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  concluido: int("concluido").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistItem = typeof checklistItens.$inferSelect;
export type InsertChecklistItem = typeof checklistItens.$inferInsert;

/**
 * Auditoria table for tracking all edits and changes.
 */
export const auditoria = mysqlTable("auditoria", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  tabela: varchar("tabela", { length: 100 }).notNull(),
  registroId: int("registroId").notNull(),
  acao: mysqlEnum("acao", ["criar", "editar", "deletar"]).notNull(),
  alteracoes: text("alteracoes"),
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
});

export type Auditoria = typeof auditoria.$inferSelect;
export type InsertAuditoria = typeof auditoria.$inferInsert;

/**
 * Calendario table for scheduling services.
 */
export const calendario = mysqlTable("calendario", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  data: timestamp("data").notNull(),
  informacoesAdicionais: text("informacoesAdicionais"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Calendario = typeof calendario.$inferSelect;
export type InsertCalendario = typeof calendario.$inferInsert;