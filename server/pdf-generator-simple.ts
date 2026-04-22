import html2pdf from 'html2pdf.js';

export interface ProtocoloData {
  numeroProtocolo: string;
  cliente: { nome: string };
  tipoProcesso: string;
  status: string;
  dataAbertura: string;
  custas?: number;
  despesas?: number;
  valorAPagar?: number;
  valorRecebido?: number;
}

export async function gerarPDFProtocolos(protocolos: ProtocoloData[]): Promise<Buffer> {
  // Criar HTML simples
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>Relatório de Protocolos</h1>
      <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
      
      <table>
        <thead>
          <tr>
            <th>Protocolo</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Data Abertura</th>
            <th>Custas</th>
            <th>Despesas</th>
            <th>A Pagar</th>
            <th>Recebido</th>
          </tr>
        </thead>
        <tbody>
          ${protocolos.map(p => `
            <tr>
              <td>${p.numeroProtocolo}</td>
              <td>${p.cliente?.nome || '-'}</td>
              <td>${p.tipoProcesso}</td>
              <td>${p.status}</td>
              <td>${p.dataAbertura}</td>
              <td>R$ ${(p.custas || 0).toFixed(2)}</td>
              <td>R$ ${(p.despesas || 0).toFixed(2)}</td>
              <td>R$ ${(p.valorAPagar || 0).toFixed(2)}</td>
              <td>R$ ${(p.valorRecebido || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Converter HTML para PDF usando html2pdf
  const options = {
    margin: 10,
    filename: 'relatorio-protocolos.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'landscape' as const, unit: 'mm' as const, format: 'a4' }
  };

  try {
    // html2pdf retorna uma Promise que resolve com o PDF
    const pdf = await (html2pdf() as any).set(options).from(html).outputPdf('arraybuffer');
    return Buffer.from(pdf as ArrayBuffer);
  } catch (error) {
    console.error('[PDF] Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar PDF');
  }
}
