# Tutorial: Importar DM Gestão de Protocolos para o GitHub

## 📋 Pré-requisitos

- Git instalado no seu computador
- Conta no GitHub (https://github.com)
- Token de acesso pessoal do GitHub (PAT)

---

## 🔑 Passo 1: Criar um Token de Acesso Pessoal no GitHub

### 1.1 Acesse as configurações do GitHub
1. Faça login em https://github.com
2. Clique no seu avatar (canto superior direito)
3. Selecione **Settings** (Configurações)

### 1.2 Gere um novo token
1. No menu lateral, clique em **Developer settings**
2. Selecione **Personal access tokens** > **Tokens (classic)**
3. Clique em **Generate new token** > **Generate new token (classic)**

### 1.3 Configure o token
- **Note**: Digite `dm-gestao-protocolos-import`
- **Expiration**: Selecione `90 days` (ou conforme sua preferência)
- **Scopes**: Marque as seguintes opções:
  - ✅ `repo` (acesso completo aos repositórios)
  - ✅ `workflow` (para GitHub Actions)
  - ✅ `admin:org_hook` (opcional, para webhooks)

### 1.4 Salve o token
- Clique em **Generate token**
- ⚠️ **IMPORTANTE**: Copie o token e guarde em um local seguro
- Você não poderá vê-lo novamente!

---

## 📁 Passo 2: Preparar o Projeto Localmente

### 2.1 Extraia o arquivo ZIP
```bash
# No seu computador, extraia o arquivo
unzip dm-gestao-protocolos.zip
cd dm-gestao-protocolos
```

### 2.2 Inicialize o repositório Git (se necessário)
```bash
# Se o repositório Git já existe, pule este passo
git init
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"
```

### 2.3 Adicione todos os arquivos
```bash
git add -A
git status  # Verifique os arquivos a serem commitados
```

### 2.4 Faça o primeiro commit
```bash
git commit -m "Initial commit: DM Gestão de Protocolos - Sistema de gestão de processos imobiliários"
```

---

## 🚀 Passo 3: Criar Repositório no GitHub

### 3.1 Crie um novo repositório
1. Acesse https://github.com/new
2. Preencha os dados:
   - **Repository name**: `dm-gestao-protocolos`
   - **Description**: `Sistema de gestão de processos de regularização imobiliária com autenticação, controle de clientes, processos e checklists`
   - **Visibility**: Selecione `Private` (privado) ou `Public` (público)
   - ⚠️ **NÃO** marque "Initialize this repository with a README"

### 3.2 Clique em **Create repository**

---

## 🔗 Passo 4: Conectar Repositório Local ao GitHub

### 4.1 Adicione o repositório remoto
```bash
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/dm-gestao-protocolos.git

# Verifique se foi adicionado corretamente
git remote -v
```

### 4.2 Renomeie a branch (se necessário)
```bash
# Se sua branch local é "master", renomeie para "main"
git branch -M main
```

### 4.3 Faça o push inicial
```bash
# Use o token como senha quando solicitado
git push -u origin main

# Quando solicitado o "username", digite seu usuário do GitHub
# Quando solicitado a "password", cole o token que você gerou
```

---

## 🔐 Passo 5: Configurar Credenciais (Opcional)

### 5.1 Armazene as credenciais localmente (Windows)
```bash
# Git irá pedir suas credenciais e armazenar localmente
git config --global credential.helper wincred
```

### 5.2 Armazene as credenciais localmente (macOS)
```bash
git config --global credential.helper osxkeychain
```

### 5.3 Armazene as credenciais localmente (Linux)
```bash
# Instale git-credential-store
sudo apt-get install git-credential-store

# Configure para armazenar credenciais
git config --global credential.helper store

# Na próxima vez que fizer push, suas credenciais serão armazenadas
```

---

## 📤 Passo 6: Fazer Push de Atualizações Futuras

Após fazer alterações no projeto:

```bash
# 1. Adicione os arquivos modificados
git add -A

# 2. Faça um commit com uma mensagem descritiva
git commit -m "Descrição das alterações realizadas"

# 3. Faça o push para o GitHub
git push origin main
```

---

## ✅ Verificação Final

### Verifique se o push foi bem-sucedido
1. Acesse https://github.com/SEU_USUARIO/dm-gestao-protocolos
2. Você deve ver todos os arquivos do projeto
3. Verifique o histórico de commits

### Visualize os commits
```bash
# Localmente
git log --oneline

# Ou acesse https://github.com/SEU_USUARIO/dm-gestao-protocolos/commits/main
```

---

## 🐛 Solução de Problemas

### Problema: "fatal: remote origin already exists"
```bash
# Remova o remote existente
git remote remove origin

# Adicione novamente
git remote add origin https://github.com/SEU_USUARIO/dm-gestao-protocolos.git
```

### Problema: "Permission denied (publickey)"
- Verifique se você está usando HTTPS (não SSH)
- Use o token como senha, não sua senha do GitHub

### Problema: "The requested URL returned error: 403"
- O token pode ter expirado
- Gere um novo token seguindo o Passo 1

### Problema: "Updates were rejected because the tip of your current branch is behind"
```bash
# Puxe as alterações do repositório remoto
git pull origin main

# Resolva os conflitos (se houver)
# Depois faça o push novamente
git push origin main
```

---

## 📚 Estrutura do Projeto

```
dm-gestao-protocolos/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # Contextos React
│   │   ├── hooks/            # Hooks customizados
│   │   └── lib/              # Utilitários e configurações
│   └── public/               # Arquivos estáticos
├── server/                    # Backend Node.js
│   ├── routers.ts            # Procedimentos tRPC
│   ├── db.ts                 # Funções de banco de dados
│   ├── auth.ts               # Autenticação
│   └── _core/                # Configurações internas
├── drizzle/                   # Migrações e schema do banco
│   ├── schema.ts             # Definição das tabelas
│   └── migrations/           # Arquivos de migração SQL
├── shared/                    # Código compartilhado
├── package.json              # Dependências do projeto
├── tsconfig.json             # Configuração TypeScript
└── vite.config.ts            # Configuração Vite

```

---

## 🔄 Fluxo de Trabalho Recomendado

### 1. Crie uma branch para novas features
```bash
git checkout -b feature/nova-funcionalidade
```

### 2. Faça commits regularmente
```bash
git commit -m "feat: descrição da funcionalidade"
```

### 3. Faça push da branch
```bash
git push origin feature/nova-funcionalidade
```

### 4. Crie um Pull Request no GitHub
- Acesse o repositório no GitHub
- Clique em **Compare & pull request**
- Descreva as alterações
- Clique em **Create pull request**

### 5. Revise e merge
- Revise o código
- Clique em **Merge pull request**
- Delete a branch após o merge

---

## 📊 Informações do Projeto

**Nome**: DM Gestão de Protocolos  
**Descrição**: Sistema de gestão de processos de regularização imobiliária  
**Tecnologias**: React, Node.js, TypeScript, tRPC, MySQL, Tailwind CSS  
**Testes**: 13 testes passando  
**Dados**: 122 registros importados do Google Sheets  

---

## 📞 Suporte

Se encontrar problemas durante o processo:

1. Verifique se o Git está instalado: `git --version`
2. Verifique sua conexão com a internet
3. Confirme que o token está válido
4. Leia a documentação oficial do GitHub: https://docs.github.com/pt/get-started

---

## ✨ Conclusão

Parabéns! Seu projeto DM Gestão de Protocolos agora está no GitHub e pronto para:
- ✅ Controle de versão
- ✅ Colaboração em equipe
- ✅ Backup automático
- ✅ CI/CD com GitHub Actions
- ✅ Deploy automático via Railway

Bom trabalho! 🚀
