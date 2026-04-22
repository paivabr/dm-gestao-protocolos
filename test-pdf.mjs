import { gerarRelatorioPDF } from './server/pdf-generator.js';
import fs from 'fs';

const testData = [
  {
    id: 1,
    numeroProtocolo: '2026-ABC-123',
    tipoProcesso: 'Georreferenciamento',
    dataAbertura: new Date(),
    status: 'Em Análise',
    cartorio: 'Colatina - ES',
    clienteNome: 'João da Silva',
    clienteCpfCnpj: '123.456.789-00',
    clienteContato: 'joao@email.com',
    totalDespesas: 1500.50,
    totalDespesasPagas: 1000.00,
    totalDespesasPendentes: 500.50,
    despesasList: [
      { dataDespesa: new Date(), descricao: 'Taxa de Cartório', valor: 250.00, pago: 1 },
      { dataDespesa: new Date(), descricao: 'Combustível Campo', valor: 150.50, pago: 0 }
    ],
    observacoes: 'Limpar o filtro e a bandeja do ar condicionado, para melhor funcionamento do equipamento.'
  }
];

async function run() {
  try {
    console.log('Gerando PDF de teste...');
    const buffer = await gerarRelatorioPDF(testData);
    fs.writeFileSync('teste-relatorio.pdf', buffer);
    console.log('PDF gerado com sucesso: teste-relatorio.pdf (' + buffer.length + ' bytes)');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  }
}

run();
