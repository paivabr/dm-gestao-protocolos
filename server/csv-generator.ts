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

export function gerarCSVProtocolos(protocolos: ProtocoloData[]): string {
  // Cabeçalho
  const headers = [
    'Protocolo',
    'Cliente',
    'Tipo',
    'Status',
    'Data Abertura',
    'Custas',
    'Despesas',
    'A Pagar',
    'Recebido'
  ];

  // Linhas
  const rows = protocolos.map(p => [
    p.numeroProtocolo,
    p.cliente?.nome || '-',
    p.tipoProcesso,
    p.status,
    p.dataAbertura,
    (p.custas || 0).toFixed(2),
    (p.despesas || 0).toFixed(2),
    (p.valorAPagar || 0).toFixed(2),
    (p.valorRecebido || 0).toFixed(2)
  ]);

  // Escapar aspas e criar CSV
  const csv = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csv;
}

export function gerarCSVBuffer(csv: string): Buffer {
  // Adicionar BOM para UTF-8 (para Excel reconhecer acentos)
  return Buffer.from('\ufeff' + csv, 'utf-8');
}
