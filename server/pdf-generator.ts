import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface ProtocoloData {
  id: number;
  numeroProtocolo: string;
  tipoProcesso: string;
  dataAbertura: Date;
  status: string;
  cartorio: string;
  observacoes?: string;
  clienteNome?: string;
  clienteCpfCnpj?: string;
  clienteContato?: string;
  totalDespesas: number;
  totalDespesasPagas: number;
  totalDespesasPendentes: number;
  totalReceitas: number;
  totalRecebido: number;
  totalPendente: number;
  isArchived?: boolean;
  dataArquivamento?: Date;
  custas?: string | number;
  despesas?: string | number;
  valorAPagar?: string | number;
  valorFaltaPagar?: string | number;
  valorBaixa?: string | number;
  valorRecebido?: string | number;
}

interface ProcessoData {
  id: number;
  titulo: string;
  status: string;
  prazoVencimento?: Date;
  isArchived: number;
  dataArquivamento?: Date;
  clienteNome?: string;
  clienteCpfCnpj?: string;
  clienteContato?: string;
}

export function generateProtocolosReport(protocolos: ProtocoloData[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("Relatório de Protocolos", { align: "center" });
    doc.fontSize(10).font("Helvetica").text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, { align: "center" });
    doc.moveDown();

    // Summary
    const totalDespesas = protocolos.reduce((sum, p) => sum + p.totalDespesas, 0);
    const totalReceitas = protocolos.reduce((sum, p) => sum + p.totalReceitas, 0);
    const totalRecebido = protocolos.reduce((sum, p) => sum + p.totalRecebido, 0);

    doc.fontSize(12).font("Helvetica-Bold").text("Resumo Financeiro");
    doc.fontSize(10).font("Helvetica");
    doc.text(`Total de Despesas: R$ ${totalDespesas.toFixed(2)}`);
    doc.text(`Total de Receitas: R$ ${totalReceitas.toFixed(2)}`);
    doc.text(`Total Recebido: R$ ${totalRecebido.toFixed(2)}`);
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 250;
    const col4 = 350;
    const col5 = 450;
    const rowHeight = 20;

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Protocolo", col1, tableTop);
    doc.text("Cliente", col2, tableTop);
    doc.text("Tipo", col3, tableTop);
    doc.text("Status", col4, tableTop);
    doc.text("Despesas", col5, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.moveDown();

    // Table Rows
    doc.fontSize(9).font("Helvetica");
    protocolos.forEach((protocolo) => {
      const y = doc.y;

      // Wrap text if needed
      doc.text(protocolo.numeroProtocolo, col1, y, { width: 90 });
      doc.text(protocolo.clienteNome || "-", col2, y, { width: 90 });
      doc.text(protocolo.tipoProcesso, col3, y, { width: 90 });
      doc.text(protocolo.status, col4, y, { width: 90 });
      doc.text(`R$ ${protocolo.totalDespesas.toFixed(2)}`, col5, y, { width: 90 });

      doc.moveDown();

      // Add financial details
      doc.fontSize(8).font("Helvetica").fillColor("gray");
      doc.text(`Despesas Pagas: R$ ${protocolo.totalDespesasPagas.toFixed(2)} | Pendentes: R$ ${protocolo.totalDespesasPendentes.toFixed(2)}`, col1, doc.y, { width: 500 });
      doc.text(`Receitas: R$ ${protocolo.totalReceitas.toFixed(2)} | Recebido: R$ ${protocolo.totalRecebido.toFixed(2)} | Pendente: R$ ${protocolo.totalPendente.toFixed(2)}`, col1, doc.y, { width: 500 });

      // Add arquivo data if archived
      if (protocolo.isArchived && protocolo.dataArquivamento) {
        doc.text(`[ARQUIVADO em ${new Date(protocolo.dataArquivamento).toLocaleDateString("pt-BR")}]`, col1, doc.y, { width: 500 });
        doc.text(`Custas: R$ ${parseFloat(protocolo.custas as any).toFixed(2)} | Despesas: R$ ${parseFloat(protocolo.despesas as any).toFixed(2)} | A Pagar: R$ ${parseFloat(protocolo.valorAPagar as any).toFixed(2)} | Falta Pagar: R$ ${parseFloat(protocolo.valorFaltaPagar as any).toFixed(2)}`, col1, doc.y, { width: 500 });
      }

      doc.fillColor("black");
      doc.moveDown();

      // Add separator
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    // Footer
    doc.moveDown();
    doc.fontSize(8).font("Helvetica").fillColor("gray");
    doc.text("DM Gestão de Protocolos - Sistema de Gerenciamento", { align: "center" });

    doc.end();
  });
}

export function generateProcessosReport(processos: ProcessoData[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("Relatório de Processos", { align: "center" });
    doc.fontSize(10).font("Helvetica").text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, { align: "center" });
    doc.moveDown();

    // Summary
    const totalProcessos = processos.length;
    const processosAtivos = processos.filter((p) => p.isArchived === 0).length;
    const processosArquivados = processos.filter((p) => p.isArchived === 1).length;

    doc.fontSize(12).font("Helvetica-Bold").text("Resumo");
    doc.fontSize(10).font("Helvetica");
    doc.text(`Total de Processos: ${totalProcessos}`);
    doc.text(`Processos Ativos: ${processosAtivos}`);
    doc.text(`Processos Arquivados: ${processosArquivados}`);
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 180;
    const col3 = 320;
    const col4 = 420;

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Título", col1, tableTop);
    doc.text("Cliente", col2, tableTop);
    doc.text("Status", col3, tableTop);
    doc.text("Vencimento", col4, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.moveDown();

    // Table Rows
    doc.fontSize(9).font("Helvetica");
    processos.forEach((processo) => {
      const y = doc.y;

      doc.text(processo.titulo, col1, y, { width: 120 });
      doc.text(processo.clienteNome || "-", col2, y, { width: 130 });
      doc.text(processo.status, col3, y, { width: 90 });
      doc.text(processo.prazoVencimento ? new Date(processo.prazoVencimento).toLocaleDateString("pt-BR") : "-", col4, y, { width: 90 });

      doc.moveDown();

      // Add status info
      doc.fontSize(8).font("Helvetica").fillColor("gray");
      const statusText = processo.isArchived === 1 ? `Arquivado em ${new Date(processo.dataArquivamento!).toLocaleDateString("pt-BR")}` : "Ativo";
      doc.text(statusText, col1, doc.y, { width: 500 });

      doc.fillColor("black");
      doc.moveDown();

      // Add separator
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    // Footer
    doc.moveDown();
    doc.fontSize(8).font("Helvetica").fillColor("gray");
    doc.text("DM Gestão de Protocolos - Sistema de Gerenciamento", { align: "center" });

    doc.end();
  });
}
