import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table for authentication with username and password.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
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

/**
 * Parcelas table for payment installments.
 */
export const parcelas = mysqlTable("parcelas", {
  id: int("id").autoincrement().primaryKey(),
  processoId: int("processoId").notNull(),
  numeroParcela: int("numeroParcela").notNull(),
  valorParcela: varchar("valorParcela", { length: 20 }).notNull(),
  desconto: varchar("desconto", { length: 20 }).default("0").notNull(),
  dataPagamento: timestamp("dataPagamento"),
  pago: int("pago").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Parcela = typeof parcelas.$inferSelect;
export type InsertParcela = typeof parcelas.$inferInsert;

/**
 * Status de Protocolo table for tracking real estate registration protocols.
 */
export const statusProtocolo = mysqlTable("statusProtocolo", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId"),
  numeroProtocolo: varchar("numeroProtocolo", { length: 50 }).notNull().unique(),
  tipoProcesso: mysqlEnum("tipoProcesso", [
    "Georreferenciamento",
    "Certidão de Localização",
    "Averbação de Qualificação",
  ]).notNull(),
  dataAbertura: timestamp("dataAbertura").notNull(),
  status: mysqlEnum("status", ["Pronto", "Reingressado", "Reingressado pós pagamento", "Nota de Pagamento", "Exigência", "Protocolado", "Vencido", "Campo", "Análise/Escritório", "Pendente documento"]).default("Pronto").notNull(),
  cartorio: varchar("cartorio", { length: 100 }).notNull(),
  ultimaAtualizacao: timestamp("ultimaAtualizacao").defaultNow().onUpdateNow().notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StatusProtocolo = typeof statusProtocolo.$inferSelect;
export type InsertStatusProtocolo = typeof statusProtocolo.$inferInsert;


/**
 * Tabela de templates de checklists para reutilização em múltiplos processos
 */
export const checklistTemplates = mysqlTable("checklistTemplates", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  criadoPor: int("criadoPor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;
export type InsertChecklistTemplate = typeof checklistTemplates.$inferInsert;

/**
 * Tabela de itens de templates de checklists
 */
export const checklistTemplateItems = mysqlTable("checklistTemplateItems", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  ordem: int("ordem").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistTemplateItem = typeof checklistTemplateItems.$inferSelect;
export type InsertChecklistTemplateItem = typeof checklistTemplateItems.$inferInsert;
