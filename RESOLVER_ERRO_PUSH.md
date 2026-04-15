# 🔧 Resolver Erro: Push Rejeitado

**Erro**:
```
! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/paivabr/dm-gestao-protocolos.git'
```

**Causa**: O repositório remoto tem arquivos que você não tem localmente.

---

## ✅ Solução Rápida (3 Comandos)

Execute estes 3 comandos **UM POR UM** no CMD:

### Comando 1: Puxe os arquivos do repositório remoto

```cmd
git pull origin main
```

**Quando solicitado:**
- Username: seu usuário do GitHub
- Password: COLE O TOKEN

---

### Comando 2: Faça o merge dos arquivos

Se aparecer um editor de texto, pressione:
- **ESC** (para sair do modo de inserção)
- Digite: `:wq` (para salvar e sair)
- Pressione **ENTER**

---

### Comando 3: Faça o push novamente

```cmd
git push -u origin main
```

**Quando solicitado:**
- Username: seu usuário do GitHub
- Password: COLE O TOKEN

---

## ✨ Pronto!

Se tudo funcionou, você verá:

```
To https://github.com/paivabr/dm-gestao-protocolos.git
   xxxxxxx..yyyyyyy  main -> main
```

---

## 🆘 Se Ainda Não Funcionar

### Opção 1: Forçar o Push (Sobrescrever)

⚠️ **CUIDADO**: Isto vai sobrescrever tudo no repositório remoto!

```cmd
git push -u origin main --force
```

---

### Opção 2: Começar do Zero

Se nada funcionar, comece do zero:

```cmd
git remote remove origin
git remote add origin https://github.com/paivabr/dm-gestao-protocolos.git
git pull origin main
git push -u origin main
```

---

### Opção 3: Limpar Tudo e Recomeçar

Se ainda não funcionar:

```cmd
cd ..
rmdir /s dm-gestao-protocolos
tar -xf dm-gestao-protocolos-v1.0.0.zip
cd dm-gestao-protocolos
git init
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/paivabr/dm-gestao-protocolos.git
git branch -M main
git pull origin main
git push -u origin main --force
```

---

## 📊 Resumo

| Passo | Comando |
|-------|---------|
| 1 | `git pull origin main` |
| 2 | Pressione ESC, digite `:wq`, ENTER |
| 3 | `git push -u origin main` |

---

## ✅ Verificação

Acesse: https://github.com/paivabr/dm-gestao-protocolos

Você deve ver todos os arquivos!

---

## 💡 Dica

Se tiver dúvida, use a **Opção 1** (--force):

```cmd
git push -u origin main --force
```

Isto vai garantir que seus arquivos sejam enviados.

---

**Comece pelo Comando 1!** 🚀
