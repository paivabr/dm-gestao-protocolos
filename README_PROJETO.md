# DM Gestão de Protocolos

Sistema completo de gestão de processos de regularização imobiliária com autenticação, controle de clientes, processos, checklists e integração com Google Sheets.

## 🎯 Características Principais

✅ **Gestão de Clientes**
- Cadastro completo de clientes (nome, CPF/CNPJ, contato)
- Edição com auditoria de alterações
- Histórico de modificações

✅ **Gestão de Processos**
- Criação e acompanhamento de processos imobiliários
- Tipos de processo: Georreferenciamento, Certidão de Localização, Averbação de Qualificação
- Status: Pronto, Reivindicado, Vencido
- Auditoria completa de alterações

✅ **Checklist de Documentos**
- Itens de checklist por processo
- Marcação de conclusão
- Auditoria de alterações

✅ **Parcelas de Pagamento**
- Divisão automática de valores
- Campo de desconto
- Marcação de pagamento
- Resumo de valores (total, pago, a pagar)

✅ **Calendário de Eventos**
- Marcação de serviços
- Visualização mensal
- Painel de detalhes

✅ **Status de Protocolo**
- 122 registros importados do Google Sheets
- Filtros por tipo, status e cartório
- Busca por protocolo e cliente
- Edição de status e data

✅ **Controle de Permissões**
- Sistema de roles (Admin, User)
- Permissões granulares por funcionalidade
- Controle de acesso por usuário

✅ **Perfil de Usuário**
- Edição de nome, email e senha
- Upload de foto de perfil
- Recuperação de senha

✅ **Auditoria Completa**
- Rastreamento de todas as operações
- Histórico de alterações com usuário e timestamp
- Filtros por usuário e processo

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, tRPC, TypeScript |
| **Banco de Dados** | MySQL/TiDB, Drizzle ORM |
| **Autenticação** | OAuth (Manus), Sessões |
| **Testes** | Vitest |
| **Deployment** | Railway |

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou pnpm
- Git

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/SEU_USUARIO/dm-gestao-protocolos.git
cd dm-gestao-protocolos
```

2. **Instale as dependências**
```bash
npm install
# ou
pnpm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
DATABASE_URL=mysql://usuario:senha@host:porta/banco
JWT_SECRET=sua_chave_secreta_aqui
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

4. **Execute as migrações do banco de dados**
```bash
npm run migrate
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Acesse a aplicação**
Abra http://localhost:3000 no seu navegador

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia o servidor de desenvolvimento

# Build
npm run build            # Compila para produção

# Testes
npm test                 # Executa os testes com Vitest
npm run test:watch      # Executa os testes em modo watch

# Banco de Dados
npm run migrate          # Executa as migrações
npm run db:push         # Sincroniza o schema com o banco

# Importação de Dados
node import-sheets-robust.mjs  # Importa dados do Google Sheets

# Linting
npm run lint            # Verifica o código
npm run format          # Formata o código
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `clientes` | Clientes cadastrados |
| `processos` | Processos imobiliários |
| `checklistItens` | Itens de checklist |
| `parcelas` | Parcelas de pagamento |
| `calendario` | Eventos do calendário |
| `statusProtocolo` | Status de protocolos (importado) |
| `auditoria` | Histórico de alterações |

---

## 🔐 Autenticação

O sistema utiliza OAuth com o provedor Manus. Para fazer login:

1. Clique em "Entrar"
2. Você será redirecionado para o portal de autenticação
3. Após autenticar, será redirecionado de volta para o sistema

### Criar Novo Usuário
- Novos usuários podem se registrar no portal de autenticação
- Após o primeiro login, o usuário é criado no banco de dados com permissões padrão

### Gerenciar Permissões
- Acesse a aba **Admin** (apenas para administradores)
- Selecione o usuário
- Configure as permissões desejadas

---

## 📈 Importação de Dados

### Importar do Google Sheets

1. **Exporte a planilha como CSV**
   - Acesse a planilha no Google Sheets
   - Clique em **Arquivo** > **Fazer download** > **CSV**
   - Salve como `sheets_data.csv` na raiz do projeto

2. **Execute o script de importação**
```bash
DATABASE_URL="sua_url_do_banco" node import-sheets-robust.mjs
```

3. **Verifique os dados importados**
   - Acesse a aba **Status Protocolo**
   - Confirme que os registros aparecem

---

## 🧪 Testes

O projeto inclui 13 testes automatizados:

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm test -- --coverage
```

### Testes Inclusos
- ✅ Autenticação e hash de senha
- ✅ CRUD de clientes
- ✅ Logout de usuários

---

## 📝 Documentação da API

A API utiliza tRPC. Todos os procedimentos estão definidos em `server/routers.ts`.

### Exemplos de Uso

```typescript
// Frontend
import { trpc } from '@/lib/trpc';

// Buscar clientes
const { data: clientes } = trpc.clientes.list.useQuery();

// Criar cliente
const createCliente = trpc.clientes.create.useMutation();
await createCliente.mutateAsync({
  nome: 'João Silva',
  cpfCnpj: '123.456.789-00',
  contato: 'joao@example.com'
});

// Atualizar processo
const updateProcesso = trpc.processos.update.useMutation();
await updateProcesso.mutateAsync({
  id: 1,
  status: 'Pronto'
});
```

---

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
# Reinstale as dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Database connection failed"
- Verifique a `DATABASE_URL` no arquivo `.env.local`
- Confirme que o banco de dados está acessível
- Verifique as credenciais

### Erro: "OAuth callback failed"
- Confirme que `VITE_APP_ID` está correto
- Verifique que `OAUTH_SERVER_URL` está correto
- Limpe os cookies do navegador

---

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique a documentação em `TUTORIAL_GITHUB.md`
2. Consulte o `QUICK_START_GIT.md` para comandos Git
3. Abra uma issue no GitHub
4. Entre em contato com a equipe de desenvolvimento

---

## 📄 Licença

Este projeto é propriedade da DM Engenharia e Consultoria.

---

## ✨ Changelog

### v1.0.0 (15/04/2026)
- ✅ Sistema completo de gestão de protocolos
- ✅ 122 registros importados do Google Sheets
- ✅ Auditoria completa de todas as operações
- ✅ Controle de permissões por usuário
- ✅ 13 testes passando
- ✅ Build compilado sem erros

---

**Desenvolvido com ❤️ para DM Engenharia e Consultoria**
