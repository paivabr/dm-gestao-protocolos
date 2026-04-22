# Guia de Comercialização - Gestão de Protocolos GP

Este guia ensina como preparar, vender e instalar o software **Gestão de Protocolos GP** para novos clientes.

## 1. Sobre o Produto
O **Gestão de Protocolos GP** é uma solução completa para escritórios que precisam gerenciar processos imobiliários, cartoriais e administrativos com controle financeiro integrado.

## 2. Preparação da Versão de Venda (Marca Branca)
O sistema é **White-Label**, permitindo que cada comprador personalize com sua própria identidade.

1.  **Instalação Limpa**: Use o arquivo `estrutura_banco.sql` para criar o banco de dados do novo cliente. Ele já vem configurado com o nome padrão **GP**.
2.  **Primeiro Acesso**:
    *   Usuário: `admin`
    *   Senha: `admin123`
3.  **Configuração da Marca do Cliente**:
    *   Vá em **Admin > Empresa**.
    *   Preencha os dados do comprador (Nome, CNPJ, Logo).
    *   Isso mudará o topo do sistema e os relatórios PDF automaticamente.

## 3. Como Gerar o Executável (.exe)
Para vender o software para rodar em um servidor local (Windows):

1.  Instale o pacote `pkg`: `npm install -g pkg`
2.  No diretório do projeto, execute: `pkg . --targets node18-win-x64`
3.  Isso gerará um arquivo `.exe` que contém todo o backend.
4.  Para o frontend, execute `npm run build` e sirva a pasta `dist`.

## 4. Estratégia de Venda
*   **SaaS (Assinatura)**: Você hospeda e cobra mensalmente (Ex: R$ 250/mês).
*   **Licença Local**: Você instala no servidor do cliente e cobra um valor fixo (Ex: R$ 5.000) + taxa de suporte.

---
*Gestão de Protocolos GP - Eficiência e Controle*
