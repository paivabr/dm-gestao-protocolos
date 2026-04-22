import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RelatorioData {
  id: number;
  numeroProtocolo?: string;
  titulo?: string;
  tipoProcesso?: string;
  dataAbertura?: Date;
  status: string;
  cartorio?: string;
  observacoes?: string;
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteContato: string;
  // Financial data
  totalDespesas?: number;
  totalDespesasPagas?: number;
  totalDespesasPendentes?: number;
  totalReceitas?: number;
  totalRecebido?: number;
  totalPendente?: number;
  despesasList?: any[];
  receitasList?: any[];
  // Archive data
  isArchived?: boolean;
  dataArquivamento?: Date;
  custas?: string;
  despesas?: string;
  valorAPagar?: string;
  valorFaltaPagar?: string;
  valorBaixa?: string;
  valorRecebido?: string;
}

export async function gerarRelatorioPDF(data: RelatorioData[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Helper for currency formatting
    const formatCurrency = (value: any) => {
      const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    };

    // Helper for date formatting
    const formatDate = (date: any) => {
      if (!date) return 'N/A';
      try {
        return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
      } catch (e) {
        return 'Data Inválida';
      }
    };

    data.forEach((item, index) => {
      if (index > 0) doc.addPage();

      // --- HEADER ---
      doc.fillColor('#1e293b').fontSize(20).text('Relatório de Protocolo', { align: 'center' });
      doc.fontSize(10).fillColor('#64748b').text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, { align: 'center' });
      doc.moveDown(2);

      // --- SECTION: INFORMAÇÕES GERAIS ---
      renderSectionHeader(doc, 'Informações Gerais');
      
      const generalInfo = [
        ['Protocolo/Título:', item.numeroProtocolo || item.titulo || 'N/A'],
        ['Tipo:', item.tipoProcesso || 'Processo Imobiliário'],
        ['Status:', item.status],
        ['Data Abertura:', formatDate(item.dataAbertura)],
        ['Cartório:', item.cartorio || 'N/A']
      ];
      renderInfoTable(doc, generalInfo);

      // --- SECTION: CLIENTE ---
      renderSectionHeader(doc, 'Dados do Cliente');
      const clienteInfo = [
        ['Nome:', item.clienteNome],
        ['CPF/CNPJ:', item.clienteCpfCnpj],
        ['Contato:', item.clienteContato || 'N/A']
      ];
      renderInfoTable(doc, clienteInfo);

      // --- SECTION: CUSTAS E DESPESAS ---
      renderSectionHeader(doc, 'Custas e Despesas (Financeiro)');
      
      const financialSummary = [
        ['Total Despesas:', formatCurrency(item.totalDespesas)],
        ['Total Pago:', formatCurrency(item.totalDespesasPagas)],
        ['Total Pendente:', formatCurrency(item.totalDespesasPendentes)]
      ];
      renderInfoTable(doc, financialSummary);

      // List detailed expenses if available
      if (item.despesasList && item.despesasList.length > 0) {
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#334155').text('Detalhamento de Despesas:', { underline: true });
        doc.moveDown(0.2);
        
        item.despesasList.forEach((d: any) => {
          const status = d.pago ? '[PAGO]' : '[PENDENTE]';
          doc.fontSize(8).fillColor('#475569')
             .text(`${formatDate(d.dataDespesa)} - ${d.descricao}: ${formatCurrency(d.valor)} ${status}`, { indent: 20 });
        });
        doc.moveDown(1);
      }

      // --- SECTION: ARQUIVO (Se houver) ---
      if (item.isArchived) {
        renderSectionHeader(doc, 'Informações de Arquivamento');
        const arquivoInfo = [
          ['Data Arquivamento:', formatDate(item.dataArquivamento)],
          ['Custas:', formatCurrency(item.custas)],
          ['Valor Recebido:', formatCurrency(item.valorRecebido)],
          ['Valor a Pagar:', formatCurrency(item.valorAPagar)],
          ['Valor Falta Pagar:', formatCurrency(item.valorFaltaPagar)]
        ];
        renderInfoTable(doc, arquivoInfo);
      }

      // --- SECTION: OBSERVAÇÕES ---
      if (item.observacoes || (item as any).observacoesArquivo) {
        renderSectionHeader(doc, 'Observações / Diagnóstico');
        doc.fontSize(10).fillColor('#1e293b')
           .text(item.observacoes || (item as any).observacoesArquivo || 'Sem observações registradas.', {
             align: 'justify',
             lineGap: 2
           });
      }

      // --- FOOTER ---
      const pageCount = doc.bufferedPageRange().count;
      doc.fontSize(8).fillColor('#94a3b8')
         .text('DM Engenharia e Consultoria - Gestão de Protocolos', 50, doc.page.height - 50, { align: 'center' });
    });

    doc.end();
  });
}

function renderSectionHeader(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(1);
  const currentY = doc.y;
  doc.rect(50, currentY, 495, 20).fill('#f1f5f9');
  doc.fillColor('#475569').fontSize(11).font('Helvetica-Bold').text(title, 60, currentY + 5);
  doc.moveDown(1);
  doc.font('Helvetica'); // Reset font
}

function renderInfoTable(doc: PDFKit.PDFDocument, rows: string[][]) {
  const startX = 60;
  const col1Width = 150;
  
  rows.forEach(row => {
    const currentY = doc.y;
    doc.fontSize(10).fillColor('#64748b').text(row[0], startX, currentY);
    doc.fillColor('#1e293b').text(row[1], startX + col1Width, currentY);
    doc.moveDown(0.5);
    
    // Draw thin line
    doc.strokeColor('#e2e8f0').lineWidth(0.5)
       .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
  });
}
