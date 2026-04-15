# 🚀 Tutorial: Após Upload para GitHub

**Repositório**: https://github.com/paivabr/dm-gestao-protocolos

---

## ✅ Verificação Inicial

### 1. Confirme que o Upload foi Bem-Sucedido

Acesse: https://github.com/paivabr/dm-gestao-protocolos

Verifique:
- [ ] Todos os arquivos estão lá
- [ ] Histórico de commits aparece
- [ ] Branches estão sincronizadas
- [ ] README.md está visível

### 2. Verifique os Arquivos Principais

```
dm-gestao-protocolos/
├── client/              ✅ Frontend React
├── server/              ✅ Backend Node.js
├── drizzle/             ✅ Banco de dados
├── package.json         ✅ Dependências
├── TUTORIAL_GITHUB.md   ✅ Documentação
└── import-sheets-robust.mjs  ✅ Script de importação
```

---

## 🔄 Próximos Passos

### Passo 1: Clonar o Repositório Localmente

Se você quer trabalhar no projeto localmente:

```bash
# Clone o repositório
git clone https://github.com/paivabr/dm-gestao-protocolos.git
cd dm-gestao-protocolos

# Instale as dependências
npm install
# ou
pnpm install

# Configure as variáveis de ambiente
# Crie um arquivo .env.local com:
# DATABASE_URL=sua_url_do_banco
# JWT_SECRET=sua_chave_secreta
# VITE_APP_ID=seu_app_id
# OAUTH_SERVER_URL=https://api.manus.im
# VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Inicie o servidor de desenvolvimento
npm run dev
```

---

### Passo 2: Configurar Variáveis de Ambiente

#### No GitHub (para CI/CD)

1. Acesse: https://github.com/paivabr/dm-gestao-protocolos/settings/secrets/actions
2. Clique em **New repository secret**
3. Adicione cada variável:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | URL do seu banco MySQL |
| `JWT_SECRET` | Chave secreta para JWT |
| `VITE_APP_ID` | ID da aplicação OAuth |
| `OAUTH_SERVER_URL` | URL do servidor OAuth |
| `VITE_OAUTH_PORTAL_URL` | URL do portal OAuth |

#### Localmente

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL=mysql://usuario:senha@host:porta/banco
JWT_SECRET=sua_chave_secreta_aqui_min_32_caracteres
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

---

### Passo 3: Executar Testes Localmente

```bash
# Instale as dependências primeiro
npm install

# Execute os testes
npm test

# Resultado esperado:
# ✓ server/clientes.test.ts (4 tests)
# ✓ server/auth.logout.test.ts (1 test)
# ✓ server/auth.test.ts (8 tests)
# Test Files  3 passed (3)
# Tests  13 passed (13)
```

---

### Passo 4: Fazer Build Localmente

```bash
# Build para produção
npm run build

# Resultado esperado:
# ✓ built in 4.53s
# dist/index.js  59.2kb
# ⚡ Done in 11ms
```

---

### Passo 5: Iniciar Servidor de Desenvolvimento

```bash
# Inicie o servidor
npm run dev

# Acesse no navegador
# http://localhost:3000

# Você verá a página de login
# Faça login com suas credenciais OAuth
```

---

## 🚀 Deploy no Railway

### Opção 1: Deploy Automático (Recomendado)

1. **Acesse Railway**: https://railway.app
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha**: `paivabr/dm-gestao-protocolos`
6. **Configure as variáveis de ambiente**:
   - Clique em **Variables**
   - Adicione cada variável de ambiente
7. **Clique em "Deploy"**

### Opção 2: Deploy Manual

```bash
# Instale o CLI do Railway
npm install -g @railway/cli

# Faça login
railway login

# Crie um novo projeto
railway init

# Defina as variáveis de ambiente
railway variables set DATABASE_URL "sua_url"
railway variables set JWT_SECRET "sua_chave"
# ... adicione as outras variáveis

# Faça o deploy
railway up
```

---

## 📊 Verificar Status do Banco de Dados

### Conectar ao Banco MySQL

```bash
# Use um cliente MySQL (MySQL Workbench, DBeaver, etc.)
# Ou via linha de comando:

mysql -h seu_host -u seu_usuario -p seu_banco

# Verifique as tabelas
SHOW TABLES;

# Verifique os registros importados
SELECT COUNT(*) FROM statusProtocolo;
-- Resultado esperado: 122 registros

# Verifique os usuários
SELECT id, username, role FROM users;

# Verifique os clientes
SELECT COUNT(*) FROM clientes;

# Verifique a auditoria
SELECT COUNT(*) FROM auditoria;
```

---

## 🔄 Fluxo de Trabalho Contínuo

### Para Fazer Alterações

```bash
# 1. Crie uma branch para sua feature
git checkout -b feature/nova-funcionalidade

# 2. Faça suas alterações
# ... edite os arquivos ...

# 3. Execute os testes
npm test

# 4. Faça o build
npm run build

# 5. Faça commit
git add -A
git commit -m "feat: descrição da nova funcionalidade"

# 6. Faça push
git push origin feature/nova-funcionalidade

# 7. Crie um Pull Request no GitHub
# - Acesse https://github.com/paivabr/dm-gestao-protocolos
# - Clique em "Compare & pull request"
# - Descreva as alterações
# - Clique em "Create pull request"

# 8. Após aprovação, merge na main
# - Clique em "Merge pull request"
# - Delete a branch
```

---

## 🐛 Solução de Problemas

### Problema: "npm install" falha

```bash
# Limpe o cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules

# Reinstale
npm install
```

### Problema: "Cannot find module"

```bash
# Reinstale as dependências
npm install

# Se ainda falhar, use pnpm
pnpm install
```

### Problema: Testes falhando

```bash
# Verifique se o banco está configurado
echo $DATABASE_URL

# Execute os testes com mais detalhes
npm test -- --reporter=verbose

# Se necessário, execute migrações
npm run migrate
```

### Problema: Build falhando

```bash
# Limpe o build anterior
rm -rf dist

# Faça o build novamente
npm run build

# Se ainda falhar, verifique os erros TypeScript
npm run type-check
```

### Problema: Servidor não inicia

```bash
# Verifique se a porta 3000 está disponível
lsof -i :3000

# Se estiver em uso, mate o processo
kill -9 <PID>

# Ou use outra porta
PORT=3001 npm run dev
```

---

## 📈 Monitorar o Projeto

### No GitHub

1. **Commits**: https://github.com/paivabr/dm-gestao-protocolos/commits/main
2. **Issues**: https://github.com/paivabr/dm-gestao-protocolos/issues
3. **Pull Requests**: https://github.com/paivabr/dm-gestao-protocolos/pulls
4. **Insights**: https://github.com/paivabr/dm-gestao-protocolos/pulse

### No Railway

1. Acesse: https://railway.app/project
2. Selecione seu projeto
3. Verifique:
   - **Logs**: Mensagens do servidor
   - **Metrics**: CPU, memória, requisições
   - **Deployments**: Histórico de deploys

---

## 🔐 Segurança

### Boas Práticas

- ✅ Nunca commite `.env` ou senhas
- ✅ Use variáveis de ambiente para credenciais
- ✅ Revise os commits antes de fazer push
- ✅ Use branches para novas features
- ✅ Faça code review antes de merge

### Verificar Segurança

```bash
# Verifique se há arquivos sensíveis no git
git ls-files | grep -E "(\.env|\.secret|password)"

# Se encontrar, remova do histórico
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Remove .env from git history"
```

---

## 📚 Documentação Útil

### Dentro do Projeto
- `README_PROJETO.md` - Documentação técnica
- `TUTORIAL_GITHUB.md` - Tutorial completo
- `QUICK_START_GIT.md` - Comandos Git

### Externo
- [Git Docs](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Railway Docs](https://docs.railway.app)
- [React Docs](https://react.dev)
- [Node.js Docs](https://nodejs.org/docs)

---

## ✨ Checklist de Conclusão

- [ ] Repositório clonado localmente
- [ ] Dependências instaladas (`npm install`)
- [ ] Variáveis de ambiente configuradas
- [ ] Testes executados com sucesso (13/13)
- [ ] Build compilado sem erros
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Acesso ao aplicativo em http://localhost:3000
- [ ] Login testado
- [ ] Dados do banco verificados
- [ ] Deploy no Railway configurado (opcional)
- [ ] Primeira alteração feita e pusheada

---

## 🎯 Próximas Funcionalidades Sugeridas

### Curto Prazo
1. Vincular protocolos importados a clientes
2. Criar relatórios de status
3. Adicionar filtros avançados

### Médio Prazo
1. Integração com email para notificações
2. Sincronização automática com Google Sheets
3. Dashboard com gráficos

### Longo Prazo
1. Mobile app (React Native)
2. Integração com APIs de cartórios
3. Automação de workflows

---

## 📞 Suporte

Se encontrar problemas:

1. Consulte a documentação incluída
2. Verifique o histórico de commits
3. Revise os logs do servidor
4. Abra uma issue no GitHub
5. Entre em contato com a equipe

---

## 🎉 Parabéns!

Seu projeto está no GitHub e pronto para:
- ✅ Desenvolvimento contínuo
- ✅ Colaboração em equipe
- ✅ Deploy automático
- ✅ Controle de versão
- ✅ Backup automático

**Bom trabalho!** 🚀

---

**DM Engenharia e Consultoria**  
*Sistema de Gestão de Protocolos Imobiliários*  
*v1.0.0 - 15 de Abril de 2026*

Repositório: https://github.com/paivabr/dm-gestao-protocolos
