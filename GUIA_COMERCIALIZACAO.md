# Guia de Comercialização - DM Gestão de Protocolos

Este guia ensina como preparar, vender e instalar o software para novos clientes.

## 1. Preparação da Versão de Venda (Marca Branca)

O sistema agora é **White-Label**, o que significa que o comprador pode colocar o próprio nome e logo.

1.  **Instalação Limpa**: Use o arquivo `estrutura_banco.sql` para criar o banco de dados do novo cliente.
2.  **Primeiro Acesso**:
    *   Usuário: `admin`
    *   Senha: `admin123`
3.  **Configuração da Marca**:
    *   Vá em **Admin > Empresa**.
    *   Preencha o Nome, CNPJ, Logo e Cor do novo cliente.
    *   Isso mudará o topo do sistema e o cabeçalho/rodapé dos PDFs automaticamente.

## 2. Como Gerar o Executável (.exe)

Para vender o software para rodar em um servidor local (Windows):

1.  Instale o pacote `pkg`: `npm install -g pkg`
2.  No diretório do projeto, execute: `pkg . --targets node18-win-x64`
3.  Isso gerará um arquivo `.exe` que contém todo o backend.
4.  Para o frontend, você pode usar o comando `npm run build` e servir os arquivos estáticos.

## 3. Estratégia de Assinatura (SaaS vs Local)

### Modelo SaaS (Recomendado)
*   Você hospeda no seu Railway (ou outra conta).
*   Cria um banco de dados para cada cliente.
*   Cobra mensalidade (Ex: R$ 250,00/mês).
*   **Vantagem**: Você controla o acesso. Se não pagarem, você desativa o banco.

### Modelo Local (Instalação no Cliente)
*   Você instala o `.exe` no computador/servidor do cliente.
*   Cobra um valor de licença (Ex: R$ 5.000,00) + Manutenção anual.
*   **Vantagem**: O cliente sente que "é dono" do software.

## 4. O que você está entregando (Diferenciais)
*   **Gestão Completa**: Clientes, Processos e Protocolos.
*   **Financeiro Integrado**: Controle de custas, despesas e parcelas.
*   **Relatórios PDF Profissionais**: Com a marca do cliente.
*   **Auditoria**: Histórico de quem alterou cada dado.
*   **Google Calendar**: Sincronização automática de prazos.

---
*DM Gestão de Protocolos - Pronto para o Mercado*
