export interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string;
  contato?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Processo {
  id: number;
  titulo: string;
  clienteId: number;
  cliente?: Cliente;
  status: "Pendente" | "Em Análise" | "Protocolado" | "Finalizado";
  prazoVencimento?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: number;
  processoId: number;
  item: string;
  concluido: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn?: Date;
}
