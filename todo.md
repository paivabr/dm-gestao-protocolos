# DM Gestão de Protocolos - TODO

## Banco de Dados
- [x] Definir tabela de usuários com autenticação por usuário/senha
- [x] Definir tabela de clientes (nome, CPF/CNPJ, contato)
- [x] Definir tabela de processos (título, cliente, status, prazo)
- [x] Definir tabela de checklist de documentos
- [x] Gerar e aplicar migrações SQL

## Autenticação
- [x] Implementar sistema de login com usuário e senha (sem OAuth)
- [x] Implementar sistema de registro de novos usuários
- [x] Implementar logout
- [x] Proteger rotas com autenticação

## Backend (API)
- [x] Criar procedures tRPC para autenticação (login, logout, me)
- [x] Criar procedures tRPC para gestão de clientes (create, list, update, delete)
- [x] Criar procedures tRPC para gestão de processos (create, list, update, delete, filter)
- [x] Criar procedures tRPC para gestão de checklists (create, list, update, delete)
- [x] Implementar filtros e busca para processos

## Frontend - Login
- [x] Criar página de login com logo da DM Engenharia
- [x] Implementar formulário de login com validação
- [x] Implementar página de registro de novo usuário
- [x] Aplicar estilo profissional em tons de azul e cinza

## Frontend - Dashboard
- [x] Criar dashboard executivo com contadores por status
- [x] Implementar alertas de processos vencendo hoje
- [x] Exibir últimos processos cadastrados
- [x] Aplicar layout responsivo

## Frontend - Clientes
- [x] Criar página de cadastro de clientes
- [x] Criar página de listagem de clientes
- [x] Implementar formulário de edição de clientes
- [x] Implementar exclusão de clientes
- [x] Aplicar validação de CPF/CNPJ

## Frontend - Processos
- [x] Criar página de gestão de processos
- [x] Implementar formulário de criação de processo
- [x] Implementar listagem de processos com tabela
- [x] Implementar filtros por título, cliente e status
- [x] Implementar busca por texto
- [x] Implementar edição de processo
- [x] Implementar exclusão de processo
- [x] Implementar modal/painel lateral para visualizar checklist

## Frontend - Checklist
- [x] Implementar modal/painel lateral para exibir checklist
- [x] Implementar adição de itens ao checklist
- [x] Implementar marcação de itens como concluídos
- [x] Implementar exclusão de itens
- [x] Implementar filtro de busca no checklist

## Frontend - Layout e Design
- [x] Criar sidebar de navegação com logo
- [x] Implementar DashboardLayout
- [x] Aplicar paleta de cores em tons de azul e cinza
- [x] Implementar responsividade para mobile
- [x] Implementar tema consistente em todas as páginas
- [x] Adicionar ícones apropriados para cada seção

## Testes
- [x] Escrever testes unitários para autenticação
- [x] Escrever testes unitários para procedures de clientes
- [x] Escrever testes unitários para procedures de processos
- [x] Escrever testes unitários para procedures de checklists

## Deploy
- [x] Criar checkpoint final
- [x] Publicar aplicação

## Novas Funcionalidades - Rastreamento e Calendário

### Banco de Dados - Rastreamento
- [x] Criar tabela de auditoria para rastrear edições (usuário, processo, ação, data/hora)
- [x] Adicionar campos de rastreamento nas tabelas existentes (criado_por, editado_por, editado_em)

### Banco de Dados - Calendário
- [x] Criar tabela de serviços do calendário (data, título, descrição, usuário)

### Backend - Rastreamento
- [x] Criar procedure para registrar edições (auditoria)
- [x] Criar procedure para listar histórico de edições por processo
- [x] Criar procedure para listar histórico de edições por usuário
- [ ] Modificar procedures de atualização para registrar quem editou

### Backend - Calendário
- [x] Criar procedure para criar serviço no calendário
- [x] Criar procedure para listar serviços do calendário
- [x] Criar procedure para atualizar serviço do calendário
- [x] Criar procedure para deletar serviço do calendário
- [ ] Criar procedure para listar serviços por mês

### Frontend - Admin (Dmconsultoria)
- [x] Criar página de administração (apenas para admin)
- [x] Implementar gerenciamento de usuários
- [x] Implementar listagem de histórico de edições
- [x] Implementar filtros por usuário e processo
- [x] Implementar visualização de detalhes de edição

### Frontend - Calendário
- [x] Criar página de calendário
- [x] Implementar calendário interativo com React Calendar ou similar
- [x] Implementar marcação de serviços em azul
- [x] Implementar painel de detalhes abaixo do calendário
- [x] Implementar formulário para adicionar serviço
- [x] Implementar opção de excluir serviço
- [x] Implementar visualização de informações adicionais

### Testes
- [ ] Escrever testes para rastreamento de edições
- [ ] Escrever testes para calendário de serviços

## Melhorias na Auditoria e Admin
- [x] Integrar registro de auditoria nas mutations de criação/edição de processos
- [x] Adicionar filtros interativos na aba Admin (por usuário e processo)
- [x] Implementar listagem de usuários na aba Admin

## Sistema de Parcelas de Pagamento
- [x] Criar tabela de parcelas no banco de dados
- [x] Criar procedures tRPC para gerenciar parcelas
- [x] Implementar UI para adicionar parcelas ao editar serviço
- [x] Implementar marcação de parcelas como pagas
- [x] Implementar visualização de status de pagamento
