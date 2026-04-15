# 🚀 Guia Completo: Deploy no Railway

**Repositório**: https://github.com/paivabr/dm-gestao-protocolos

---

## 📋 Pré-requisitos

- ✅ Repositório GitHub criado e com upload realizado
- ✅ Conta no Railway (https://railway.app)
- ✅ Banco de dados MySQL/TiDB configurado
- ✅ Variáveis de ambiente prontas

---

## 🎯 Opção 1: Deploy Automático (Recomendado)

### Passo 1: Acesse Railway

1. Abra: https://railway.app
2. Clique em **Sign in with GitHub**
3. Autorize o Railway a acessar sua conta GitHub
4. Clique em **Authorize**

### Passo 2: Crie um Novo Projeto

1. Clique em **New Project**
2. Selecione **Deploy from GitHub repo**
3. Procure por `dm-gestao-protocolos`
4. Clique em **Deploy**

### Passo 3: Configure as Variáveis de Ambiente

1. No Railway, clique em **Variables**
2. Clique em **New Variable**
3. Adicione cada variável:

```
DATABASE_URL = mysql://usuario:senha@host:porta/banco
JWT_SECRET = sua_chave_secreta_min_32_caracteres
VITE_APP_ID = seu_app_id
OAUTH_SERVER_URL = https://api.manus.im
VITE_OAUTH_PORTAL_URL = https://portal.manus.im
NODE_ENV = production
```

### Passo 4: Configure o Banco de Dados

1. Clique em **+ Add Service**
2. Selecione **MySQL**
3. Configure:
   - **Name**: `mysql`
   - **Username**: `root`
   - **Password**: (gerado automaticamente)
4. Clique em **Create**

### Passo 5: Aguarde o Deploy

1. Railway fará o deploy automaticamente
2. Verifique o status em **Deployments**
3. Quando estiver verde, o deploy foi bem-sucedido

### Passo 6: Acesse a Aplicação

1. Clique em **Domains**
2. Copie o domínio gerado (ex: `dm-gestao-protocolos.railway.app`)
3. Acesse no navegador
4. Faça login com suas credenciais OAuth

---

## 🔧 Opção 2: Deploy Manual via CLI

### Passo 1: Instale o Railway CLI

```bash
# Windows
choco install railway

# macOS
brew install railway

# Linux
npm install -g @railway/cli
```

### Passo 2: Faça Login

```bash
railway login
```

Você será redirecionado para o navegador. Autorize o acesso.

### Passo 3: Inicialize o Projeto

```bash
cd dm-gestao-protocolos
railway init
```

Selecione:
- **Create a new project**: Sim
- **Project name**: `dm-gestao-protocolos`

### Passo 4: Configure as Variáveis

```bash
railway variables set DATABASE_URL "mysql://usuario:senha@host:porta/banco"
railway variables set JWT_SECRET "sua_chave_secreta_min_32_caracteres"
railway variables set VITE_APP_ID "seu_app_id"
railway variables set OAUTH_SERVER_URL "https://api.manus.im"
railway variables set VITE_OAUTH_PORTAL_URL "https://portal.manus.im"
railway variables set NODE_ENV "production"
```

### Passo 5: Faça o Deploy

```bash
railway up
```

O Railway fará o build e deploy automaticamente.

### Passo 6: Obtenha a URL

```bash
railway open
```

Você será levado para o dashboard do Railway. Copie a URL do seu projeto.

---

## 📊 Configurar Banco de Dados no Railway

### Opção A: Usar MySQL do Railway

1. No Railway, clique em **+ Add Service**
2. Selecione **MySQL**
3. Configure as credenciais
4. Railway gerará a `DATABASE_URL` automaticamente

### Opção B: Usar Banco Externo (TiDB Cloud)

1. Obtenha a URL do seu banco TiDB
2. Configure a variável `DATABASE_URL`:

```
DATABASE_URL=mysql://usuario:senha@gateway05.us-east-1.prod.aws.tidbcloud.com:4000/banco
```

---

## 🔄 Atualizações Automáticas

### Configurar Auto-Deploy

1. No Railway, vá para **Settings**
2. Ative **Auto-deploy on push**
3. Selecione a branch: `main`
4. Salve as configurações

Agora, cada push para `main` dispara um deploy automático!

---

## 📈 Monitorar o Deploy

### Logs em Tempo Real

```bash
# Via CLI
railway logs

# Via Dashboard
# Clique em **Logs** no Railway
```

### Métricas

1. No Railway, clique em **Metrics**
2. Veja:
   - **CPU**: Uso de processador
   - **Memory**: Uso de memória
   - **Network**: Tráfego de rede
   - **Requests**: Requisições HTTP

### Status do Deployment

1. Clique em **Deployments**
2. Veja o histórico de deploys
3. Clique em um deploy para ver detalhes

---

## 🆘 Solução de Problemas

### Problema: Deploy falha com erro de build

```
Error: npm ERR! code ERESOLVE
```

**Solução**:
1. Verifique o `package.json`
2. Atualize as dependências: `npm update`
3. Faça push novamente

### Problema: Aplicação não inicia

```
Error: Cannot find module
```

**Solução**:
1. Verifique se todas as dependências estão no `package.json`
2. Execute `npm install` localmente
3. Faça push das alterações

### Problema: Banco de dados não conecta

```
Error: connect ECONNREFUSED
```

**Solução**:
1. Verifique a `DATABASE_URL`
2. Confirme que o banco está acessível
3. Verifique as credenciais
4. Atualize a variável no Railway

### Problema: OAuth não funciona

```
Error: Invalid redirect URI
```

**Solução**:
1. Obtenha a URL do Railway (ex: `dm-gestao-protocolos.railway.app`)
2. Configure no provedor OAuth
3. Atualize `VITE_OAUTH_PORTAL_URL` se necessário

### Problema: Aplicação muito lenta

**Solução**:
1. Verifique os logs: `railway logs`
2. Aumente os recursos: **Settings** > **Memory**
3. Otimize as queries do banco
4. Implemente cache

---

## 🔐 Segurança

### Boas Práticas

✅ **Variáveis de Ambiente**
- Nunca commite `.env`
- Use variáveis no Railway
- Mude as senhas regularmente

✅ **Banco de Dados**
- Use conexão SSL/TLS
- Firewall apenas para Railway
- Backups regulares

✅ **Código**
- Revise commits antes de push
- Use branches para features
- Faça code review

### Verificar Segurança

```bash
# Verifique se há arquivos sensíveis
git ls-files | grep -E "(\.env|secret|password)"

# Se encontrar, remova
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Remove .env"
```

---

## 📊 Monitorar Aplicação

### Verificar Status

```bash
# Via CLI
railway status

# Via Dashboard
# Acesse https://railway.app/project
```

### Ver Logs

```bash
# Últimos 100 linhas
railway logs -n 100

# Em tempo real
railway logs -f
```

### Reiniciar Aplicação

```bash
# Via CLI
railway restart

# Via Dashboard
# Clique em **Restart** no Railway
```

---

## 🔄 Atualizações Futuras

### Fazer Alterações Localmente

```bash
# 1. Crie uma branch
git checkout -b feature/nova-funcionalidade

# 2. Faça suas alterações
# ... edite os arquivos ...

# 3. Teste localmente
npm test
npm run build
npm run dev

# 4. Faça commit
git add -A
git commit -m "feat: descrição da funcionalidade"

# 5. Faça push
git push origin feature/nova-funcionalidade

# 6. Crie Pull Request no GitHub
# - Acesse https://github.com/paivabr/dm-gestao-protocolos
# - Clique em "Compare & pull request"
# - Descreva as alterações
# - Clique em "Create pull request"

# 7. Após aprovação, merge na main
# - Clique em "Merge pull request"
# - Delete a branch

# 8. Railway fará deploy automático!
```

---

## 📈 Escalar a Aplicação

### Aumentar Recursos

1. No Railway, vá para **Settings**
2. Clique em **Memory**
3. Aumente conforme necessário
4. Salve as alterações

### Adicionar Réplicas

1. No Railway, clique em **+ Add Service**
2. Selecione **Node.js**
3. Configure como réplica
4. Configure load balancing

### Usar CDN

1. Configure Cloudflare ou similar
2. Aponte para seu domínio do Railway
3. Ative cache e compressão

---

## ✅ Checklist de Deploy

- [ ] Repositório GitHub atualizado
- [ ] Conta Railway criada
- [ ] Projeto criado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados conectado
- [ ] Deploy bem-sucedido
- [ ] Aplicação acessível
- [ ] Login testado
- [ ] Dados visíveis
- [ ] Auto-deploy ativado
- [ ] Monitoramento configurado

---

## 🎉 Parabéns!

Seu projeto está em produção no Railway!

**Próximos passos**:
1. Monitore os logs regularmente
2. Faça backups do banco de dados
3. Configure alertas
4. Implemente melhorias contínuas

---

## 📞 Suporte

- **Railway Docs**: https://docs.railway.app
- **GitHub Docs**: https://docs.github.com
- **Node.js Docs**: https://nodejs.org/docs
- **MySQL Docs**: https://dev.mysql.com/doc

---

**DM Engenharia e Consultoria**  
*Sistema de Gestão de Protocolos Imobiliários*  
*v1.0.0 - 15 de Abril de 2026*

Repositório: https://github.com/paivabr/dm-gestao-protocolos
