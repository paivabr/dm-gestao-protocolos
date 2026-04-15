# DM Gestão de Protocolos - TODO

## Funcionalidades Principais
- [x] Cadastro de clientes (CRUD)
- [x] Gestão de processos (CRUD)
- [x] Parcelas de pagamento com desconto
- [x] Calendário de eventos
- [x] Checklist de itens por processo
- [x] Auditoria de alterações
- [x] Edição de cadastro de clientes
- [x] Sistema de desconto em parcelas

## Recuperação de Senha e Perfil de Usuário
- [x] Adicionar link de recuperação de senha na página de login
- [x] Criar página de recuperação de senha
- [x] Criar aba de perfil de usuário no dashboard
- [x] Implementar edição de nome do usuário
- [x] Implementar edição de email do usuário
- [x] Implementar alteração de senha
- [x] Implementar upload de foto de perfil
- [x] Testar recuperação de senha e perfil

## Melhorias Solicitadas - Logo e Filtros
- [x] Adicionar/melhorar logo da DM no favicon
- [x] Implementar filtro por nome de usuário na página Admin
- [x] Adicionar seção de atividades recentes no Dashboard (clientes, processos recentes)

## Sistema de Controle de Permissões/Roles
- [x] Adicionar campos de permissões na tabela de usuários (canCreateClient, canEditProcess, canDeleteProcess, canViewCalendar, canViewProcesses, canViewClients)
- [x] Criar migração SQL para adicionar coluna de permissões
- [x] Criar procedures tRPC para atualizar permissões de usuário
- [x] Implementar UI na aba Admin para gerenciar permissões por usuário
- [x] Proteger procedures de criação de cliente com verificação de permissão
- [x] Proteger procedures de edição de processo com verificação de permissão
- [x] Proteger procedures de deleção de processo com verificação de permissão
- [x] Proteger rotas do frontend com verificação de permissão
- [x] Testes passando com sucesso
- [x] Build compilado com sucesso

## Aba de Status de Protocolo do Registro de Imóveis
- [x] Adicionar tabela de status de protocolo no banco de dados
- [x] Criar procedures tRPC para CRUD de status de protocolo
- [x] Implementar aba de Status de Protocolo no frontend
- [x] Adicionar filtros por tipo de processo, cartório e status
- [x] Adicionar busca por protocolo e nome do cliente
- [x] Implementar edição de status e data de atualização
- [x] Integrar com auditoria para rastrear mudanças
- [x] Testar aba de status de protocolo

## Correções Solicitadas
- [x] Corrigir auditoria para registrar criação de clientes
- [x] Corrigir auditoria para registrar criação de processos
- [x] Adicionar auditoria para alterações no checklist
- [x] Corrigir exibição de Meu Perfil no menu lateral
- [x] Importar dados da planilha Google Sheets (76 registros importados com sucesso)
- [x] Fazer upload final para GitHub
