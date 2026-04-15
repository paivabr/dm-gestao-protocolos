# 🚀 Guia Rápido: Git para DM Gestão de Protocolos

## ⚡ Comandos Essenciais

### 1️⃣ Primeira Vez - Configurar e Fazer Push

```bash
# Extraia o arquivo ZIP
unzip dm-gestao-protocolos.zip
cd dm-gestao-protocolos

# Configure seu nome e email (primeira vez)
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"

# Verifique o status
git status

# Adicione todos os arquivos
git add -A

# Faça o commit inicial
git commit -m "Initial commit: DM Gestão de Protocolos"

# Adicione o repositório remoto (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/dm-gestao-protocolos.git

# Renomeie a branch para main (se necessário)
git branch -M main

# Faça o push
git push -u origin main
```

### 2️⃣ Atualizações Futuras

```bash
# Adicione os arquivos modificados
git add -A

# Faça um commit
git commit -m "Descrição das alterações"

# Faça o push
git push origin main
```

### 3️⃣ Verificar Status

```bash
# Veja quais arquivos foram modificados
git status

# Veja o histórico de commits
git log --oneline

# Veja as diferenças
git diff
```

---

## 📋 Checklist para Push Inicial

- [ ] Token de acesso pessoal gerado no GitHub
- [ ] Arquivo ZIP extraído
- [ ] Repositório criado no GitHub (https://github.com/new)
- [ ] Git configurado localmente (`git config user.name` e `git config user.email`)
- [ ] Remote adicionado (`git remote add origin ...`)
- [ ] Branch renomeada para `main` (`git branch -M main`)
- [ ] Primeiro push realizado (`git push -u origin main`)
- [ ] Verificado no GitHub (https://github.com/SEU_USUARIO/dm-gestao-protocolos)

---

## 🔑 Gerar Token de Acesso Pessoal

1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token (classic)**
3. Preencha:
   - **Note**: `dm-gestao-protocolos-import`
   - **Expiration**: `90 days`
   - **Scopes**: Marque `repo` e `workflow`
4. Clique em **Generate token**
5. **Copie e guarde o token** (você não verá novamente!)

---

## 🎯 Quando Solicitado Credenciais

```
Username for 'https://github.com': SEU_USUARIO
Password for 'https://SEU_USUARIO@github.com': COLE_O_TOKEN_AQUI
```

---

## 📊 Estrutura de Commits Recomendada

```bash
# Feature (nova funcionalidade)
git commit -m "feat: descrição da nova funcionalidade"

# Fix (correção de bug)
git commit -m "fix: descrição do bug corrigido"

# Docs (documentação)
git commit -m "docs: descrição das alterações na documentação"

# Style (formatação, sem mudanças lógicas)
git commit -m "style: descrição das alterações de estilo"

# Refactor (refatoração de código)
git commit -m "refactor: descrição das alterações"

# Test (testes)
git commit -m "test: descrição dos testes adicionados"

# Chore (tarefas de manutenção)
git commit -m "chore: descrição das tarefas"
```

---

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| `fatal: remote origin already exists` | `git remote remove origin` |
| `Permission denied (publickey)` | Use HTTPS, não SSH. Use token como senha |
| `The requested URL returned error: 403` | Token expirou. Gere um novo |
| `Updates were rejected` | `git pull origin main` depois `git push origin main` |
| `fatal: not a git repository` | Execute `git init` na pasta do projeto |

---

## 📚 Recursos Úteis

- [Documentação Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ✅ Verificação Final

Após fazer o push, verifique:

1. Acesse: https://github.com/SEU_USUARIO/dm-gestao-protocolos
2. Confirme que todos os arquivos estão lá
3. Verifique o histórico de commits
4. Veja a descrição do repositório

**Pronto! Seu projeto está no GitHub! 🎉**
