import { gerarRelatorioPDF } from './server/pdf-generator';
import fs from 'fs';

const testData = [
  {
    id: 1,
    numeroProtocolo: '2026-ABC-123',
    tipoProcesso: 'Georreferenciamento',
    dataAbertura: new Date(),
    status: 'Em Análise',
    cartorio: 'Colatina - ES',
    clienteNome: 'João da Silva Santos',
    clienteCpfCnpj: '123.456.789-00',
    clienteContato: '(27) 99999-8888 / joao.silva@email.com',
    totalDespesas: 1500.50,
    totalDespesasPagas: 1000.00,
    totalDespesasPendentes: 500.50,
    despesasList: [
      { dataDespesa: new Date(), descricao: 'Taxa de Cartório de Registro de Imóveis', valor: 250.00, pago: 1 },
      { dataDespesa: new Date(), descricao: 'Combustível para Visita de Campo', valor: 150.50, pago: 0 },
      { dataDespesa: new Date(), descricao: 'Honorários Profissionais Técnicos', valor: 1100.00, pago: 1 }
    ],
    observacoes: 'Relatório detalhado de acompanhamento de processo imobiliário. Limpar o filtro e a bandeja do ar condicionado, para melhor funcionamento do equipamento.'
  }
];

async function run() {
  try {
    console.log('Gerando PDF de teste v2...');
    const buffer = await gerarRelatorioPDF(testData as any);
    fs.writeFileSync('teste-relatorio-v2.pdf', buffer);
    console.log('PDF gerado com sucesso: teste-relatorio-v2.pdf (' + buffer.length + ' bytes)');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  }
}

run();
