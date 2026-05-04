export function gerarCSVProtocolos(protocolos: any[]): string {
  // Headers
  const headers = [
    'Protocolo',
    'Cliente',
    'CPF/CNPJ',
    'Contato',
    'Tipo',
    'Status',
    'Cartório',
    'Data Abertura',
    'Total Despesas',
    'Total Despesas Pagas',
    'Total Despesas Pendentes',
    'Total Receitas',
    'Total Recebido',
    'Total Pendente',
    'Custas',
    'Despesas (Arquivo)',
    'A Pagar',
    'Falta Pagar',
    'Baixa',
    'Recebido',
    'Data Arquivamento',
    'Observações'
  ];

  // Linhas
  const rows = protocolos.map(p => [
    p.numeroProtocolo || '',
    p.clienteNome || '-',
    p.clienteCpfCnpj || '-',
    p.clienteContato || '-',
    p.tipoProcesso || '',
    p.status || '',
    p.cartorio || '',
    p.dataAbertura ? new Date(p.dataAbertura).toLocaleDateString('pt-BR') : '',
    (Number(p.totalDespesas) || 0).toFixed(2),
    (Number(p.totalDespesasPagas) || 0).toFixed(2),
    (Number(p.totalDespesasPendentes) || 0).toFixed(2),
    (Number(p.totalReceitas) || 0).toFixed(2),
    (Number(p.totalRecebido) || 0).toFixed(2),
    (Number(p.totalPendente) || 0).toFixed(2),
    (Number(p.custas) || 0).toFixed(2),
    (Number(p.despesas) || 0).toFixed(2),
    (Number(p.valorAPagar) || 0).toFixed(2),
    (Number(p.valorFaltaPagar) || 0).toFixed(2),
    (Number(p.valorBaixa) || 0).toFixed(2),
    (Number(p.valorRecebido) || 0).toFixed(2),
    p.dataArquivamento ? new Date(p.dataArquivamento).toLocaleDateString('pt-BR') : '',
    p.observacoes || ''
  ]);

  // Escapar aspas e criar CSV
  const csv = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row =>
      row.map(cell => {
        const str = String(cell || '');
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  return csv;
}

export function gerarCSVBuffer(csv: string): Buffer {
  return Buffer.from(csv, 'utf-8');
}
