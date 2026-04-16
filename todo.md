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
- [x] Importar dados da planilha Google Sheets (122 registros importados com sucesso)
- [x] Fazer upload final para GitHub


## Exclusão de Usuários na Aba Admin
- [x] Adicionar rota DELETE `/api/trpc/permissions.deleteUser` no backend
- [x] Adicionar função `deleteUser` em db.ts com proteção contra exclusão do usuário DMconsultoria
- [x] Adicionar mutation `deletarUsuarioMutation` no frontend
- [x] Adicionar botão "Excluir" (ícone de lixeira) na aba "Gerenciar Usuários"
- [x] Implementar confirmação antes de deletar usuário
- [x] Impedir exclusão do próprio usuário logado
- [x] Impedir exclusão do usuário DMconsultoria
- [x] Criar testes para a funcionalidade de exclusão de usuários
- [x] Testes passando com sucesso


## Salvamento de Foto de Perfil
- [x] Coluna `fotoPerfil` já existe na tabela `users` para armazenar URL da foto
- [x] Função `updateUserProfile` em db.ts já suporta atualização de foto
- [x] Rota tRPC `auth.updateProfile` no backend modificada para fazer upload para S3
- [x] Implementado upload de foto para S3 no backend (storagePut)
- [x] Adicionado estado `fotoPerfilTemp` para preview antes de salvar
- [x] Implementado botão "Salvar Foto" explícito no Meu Perfil
- [x] Adicionada validação de tamanho de arquivo (máximo 5MB)
- [x] Foto agora é salva em S3 e a URL é persistida no banco de dados
- [x] Testes passando com sucesso


## Bugs Encontrados - Abril 2026
- [x] Botão de cadastrar cliente novo não funciona (não abre diálogo) - CORRIGIDO
- [x] Erro ao fechar diálogo de criar protocolo: "NotFoundError: Failed to execute 'removeChild' on 'Node'" - CORRIGIDO


## Bugs e Features - Abril 2026 (Lote 2)
- [x] Corrigir erro de seleção de status em vermelho (Reingressado pós pagamento, Nota de Pagamento, Exigência) - CORRIGIDO
- [x] Renomear status "Reinvindicado" para "Reingressado" - CORRIGIDO
- [x] Criar novo status "Protocolado" - CRIADO
- [x] Expandir visualização da aba de Pagamentos (aumentar tamanho dos cards de valores) - EXPANDIDO


## Permiss\u00e3o de Gere## Permissão de Gerenciar Parcelas - Abril 2026
- [x] Adicionar coluna `canManageParcelas` na tabela `users` - ADICIONADO
- [x] Criar rota tRPC para atualizar permissão de parcelas - CRIADO
- [x] Adicionar checkbox na aba Admin para gerenciar permissão - ADICIONADO
- [x] Bloquear acesso a parcelas para usuários sem permissão - IMPLEMENTADO
- [x] Testar funcionalidade completa - TESTES PASSANDO


## Foto de Perfil - Abril 2026
- [x] Alterar Perfil.tsx para aceitar URL em vez de upload - CONCLUÍDO
- [x] Salvar URL da foto no banco de dados - FUNCIONA COM BACKEND EXISTENTE
- [x] Exibir foto a partir da URL - CONCLUÍDO
