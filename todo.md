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
- [ ] Escrever testes unitários para procedures de clientes
- [ ] Escrever testes unitários para procedures de processos
- [ ] Escrever testes unitários para procedures de checklists

## Deploy
- [ ] Criar checkpoint final
- [ ] Publicar aplicação
