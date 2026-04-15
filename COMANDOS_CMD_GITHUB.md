# 🖥️ Comandos CMD - Upload ZIP para GitHub

**Repositório**: https://github.com/paivabr/dm-gestao-protocolos

---

## 📋 Pré-requisitos

Antes de começar, você precisa:

1. ✅ Ter o Git instalado (https://git-scm.com/download/win)
2. ✅ Ter o ZIP baixado: `dm-gestao-protocolos-v1.0.0.zip`
3. ✅ Ter o repositório criado no GitHub
4. ✅ Ter um token de acesso pessoal do GitHub

---

## 🔑 Passo 1: Gerar Token de Acesso Pessoal

Se você ainda não tem um token:

1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token (classic)**
3. Preencha:
   - **Note**: `dm-gestao-protocolos-upload`
   - **Expiration**: `90 days`
   - **Scopes**: Marque `repo` e `workflow`
4. Clique em **Generate token**
5. **COPIE E GUARDE O TOKEN** (você não verá novamente!)

---

## 💻 Passo 2: Executar Comandos no CMD

Abra o **Prompt de Comando (CMD)** e execute os comandos abaixo, **UM POR UM**:

### Comando 1: Navegue até a pasta onde você baixou o ZIP

```cmd
cd C:\Users\SEU_USUARIO\Downloads
```

**Substitua `SEU_USUARIO` pelo seu usuário do Windows**

Exemplo:
```cmd
cd C:\Users\paiva\Downloads
```

---

### Comando 2: Extraia o ZIP

```cmd
tar -xf dm-gestao-protocolos-v1.0.0.zip
```

**Ou se usar WinRAR/7-Zip, clique com botão direito > Extrair aqui**

---

### Comando 3: Entre na pasta do projeto

```cmd
cd dm-gestao-protocolos
```

---

### Comando 4: Verifique se o Git está instalado

```cmd
git --version
```

**Resultado esperado**: `git version 2.x.x`

---

### Comando 5: Configure seu nome e email no Git

```cmd
git config --global user.name "Seu Nome Completo"
```

Exemplo:
```cmd
git config --global user.name "Paiva Brasil"
```

---

### Comando 6: Configure seu email

```cmd
git config --global user.email "seu.email@example.com"
```

Exemplo:
```cmd
git config --global user.email "paiva@example.com"
```

---

### Comando 7: Inicialize o repositório Git

```cmd
git init
```

---

### Comando 8: Adicione todos os arquivos

```cmd
git add -A
```

---

### Comando 9: Verifique o status

```cmd
git status
```

**Você deve ver muitos arquivos em verde**

---

### Comando 10: Faça o primeiro commit

```cmd
git commit -m "Initial commit: DM Gestao de Protocolos - Sistema completo de gestao de processos imobiliarios"
```

---

### Comando 11: Adicione o repositório remoto

```cmd
git remote add origin https://github.com/paivabr/dm-gestao-protocolos.git
```

---

### Comando 12: Renomeie a branch para main

```cmd
git branch -M main
```

---

### Comando 13: Faça o push para o GitHub

```cmd
git push -u origin main
```

**Quando solicitado:**
- **Username**: seu usuário do GitHub (ex: `paivabr`)
- **Password**: cole o TOKEN que você gerou (não a senha do GitHub!)

---

## ✅ Verificação

Após executar todos os comandos, acesse:

https://github.com/paivabr/dm-gestao-protocolos

Você deve ver:
- ✅ Todos os arquivos do projeto
- ✅ Histórico de commits
- ✅ Branch `main` ativa

---

## 🆘 Se Algo Deu Errado

### Erro: "git: command not found"

**Solução**: Instale o Git
- Acesse: https://git-scm.com/download/win
- Execute o instalador
- Reinicie o CMD

---

### Erro: "fatal: not a git repository"

**Solução**: Execute o Comando 7 novamente

```cmd
git init
```

---

### Erro: "fatal: remote origin already exists"

**Solução**: Remova o remote e adicione novamente

```cmd
git remote remove origin
git remote add origin https://github.com/paivabr/dm-gestao-protocolos.git
```

---

### Erro: "Permission denied (publickey)"

**Solução**: Use o token, não a senha

- **Username**: seu usuário do GitHub
- **Password**: COLE O TOKEN (não a senha)

---

### Erro: "The requested URL returned error: 403"

**Solução**: O token expirou ou é inválido

1. Gere um novo token: https://github.com/settings/tokens
2. Execute novamente o Comando 13

---

### Erro: "Updates were rejected because the tip of your current branch is behind"

**Solução**: Puxe as alterações primeiro

```cmd
git pull origin main
git push -u origin main
```

---

## 📊 Resumo dos Comandos

| # | Comando | Descrição |
|---|---------|-----------|
| 1 | `cd C:\Users\SEU_USUARIO\Downloads` | Navegue até a pasta |
| 2 | `tar -xf dm-gestao-protocolos-v1.0.0.zip` | Extraia o ZIP |
| 3 | `cd dm-gestao-protocolos` | Entre na pasta |
| 4 | `git --version` | Verifique Git |
| 5 | `git config --global user.name "Seu Nome"` | Configure nome |
| 6 | `git config --global user.email "seu@email.com"` | Configure email |
| 7 | `git init` | Inicialize Git |
| 8 | `git add -A` | Adicione arquivos |
| 9 | `git status` | Verifique status |
| 10 | `git commit -m "Initial commit..."` | Faça commit |
| 11 | `git remote add origin https://...` | Adicione remote |
| 12 | `git branch -M main` | Renomeie branch |
| 13 | `git push -u origin main` | Faça push |

---

## 🎯 Próximo Passo

Após fazer o push com sucesso:

1. Acesse: https://github.com/paivabr/dm-gestao-protocolos
2. Confirme que todos os arquivos estão lá
3. Vá para **DEPLOY_RAILWAY.md** para fazer o deploy

---

## 💡 Dicas

✅ **Copie e Cole os Comandos**
- Não digite manualmente
- Copie de aqui e cole no CMD

✅ **Execute Um Por Um**
- Aguarde cada comando terminar
- Verifique se não há erros

✅ **Guarde o Token**
- Salve em um local seguro
- Você precisará para futuros pushes

✅ **Não Compartilhe o Token**
- Nunca compartilhe seu token
- Se compartilhar, gere um novo

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se o Git está instalado
2. Verifique se o ZIP foi extraído corretamente
3. Verifique se o token é válido
4. Tente novamente

---

**DM Engenharia e Consultoria**  
*Sistema de Gestão de Protocolos Imobiliários*  
*v1.0.0 - 15 de Abril de 2026*

Repositório: https://github.com/paivabr/dm-gestao-protocolos
