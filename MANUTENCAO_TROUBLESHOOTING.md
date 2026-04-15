# 🔧 Guia de Manutenção e Troubleshooting

**Repositório**: https://github.com/paivabr/dm-gestao-protocolos

---

## 📋 Manutenção Rotineira

### Diária
- ✅ Monitorar logs do servidor
- ✅ Verificar status da aplicação
- ✅ Verificar alertas

### Semanal
- ✅ Revisar auditoria
- ✅ Verificar performance
- ✅ Backup do banco de dados

### Mensal
- ✅ Atualizar dependências
- ✅ Revisar segurança
- ✅ Análise de uso

### Trimestral
- ✅ Atualizar Node.js
- ✅ Revisar arquitetura
- ✅ Planejamento de melhorias

---

## 🆘 Problemas Comuns e Soluções

### 1. Aplicação Não Inicia

#### Sintoma
```
Error: Cannot find module 'express'
```

#### Solução
```bash
# Reinstale as dependências
npm install

# Se ainda falhar
rm -rf node_modules package-lock.json
npm install

# Verifique o package.json
cat package.json | grep "express"
```

---

### 2. Banco de Dados Não Conecta

#### Sintoma
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

#### Solução
```bash
# Verifique a DATABASE_URL
echo $DATABASE_URL

# Teste a conexão
mysql -h seu_host -u seu_usuario -p seu_banco

# Se estiver usando Railway
railway variables list | grep DATABASE_URL

# Atualize a variável se necessário
railway variables set DATABASE_URL "nova_url"
```

---

### 3. Testes Falhando

#### Sintoma
```
FAIL  server/clientes.test.ts
Error: Cannot connect to database
```

#### Solução
```bash
# Verifique se o banco está rodando
mysql -u root -p

# Execute as migrações
npm run migrate

# Execute os testes novamente
npm test

# Se ainda falhar, veja os detalhes
npm test -- --reporter=verbose
```

---

### 4. Build Falhando

#### Sintoma
```
Error: Cannot find module
Error: Type error
```

#### Solução
```bash
# Limpe o build anterior
rm -rf dist

# Verifique erros TypeScript
npm run type-check

# Faça o build novamente
npm run build

# Se ainda falhar, veja os erros completos
npm run build -- --debug
```

---

### 5. Performance Lenta

#### Sintoma
- Aplicação demora para responder
- Requisições levam muito tempo

#### Solução
```bash
# Verifique os logs
npm run dev

# Procure por queries lentas
# No banco de dados
SELECT * FROM INFORMATION_SCHEMA.PROCESSLIST;

# Otimize as queries
# Adicione índices se necessário
CREATE INDEX idx_protocolo ON statusProtocolo(numeroProtocolo);

# Aumente os recursos no Railway
# Settings > Memory > Aumentar

# Implemente cache
# Adicione Redis se necessário
```

---

### 6. Erro de Autenticação OAuth

#### Sintoma
```
Error: Invalid redirect URI
Error: Unauthorized
```

#### Solução
```bash
# Verifique as variáveis de ambiente
echo $VITE_APP_ID
echo $OAUTH_SERVER_URL
echo $VITE_OAUTH_PORTAL_URL

# Configure no provedor OAuth
# 1. Acesse o painel do provedor
# 2. Atualize o Redirect URI
# 3. Copie o novo VITE_APP_ID
# 4. Atualize no Railway

railway variables set VITE_APP_ID "novo_id"

# Reinicie a aplicação
railway restart
```

---

### 7. Erro de Permissão

#### Sintoma
```
Error: Permission denied
Error: Forbidden
```

#### Solução
```bash
# Verifique as permissões do usuário
SELECT * FROM users WHERE id = 1;

# Atualize as permissões
UPDATE users SET canCreateClient = 1 WHERE id = 1;

# Verifique a auditoria
SELECT * FROM auditoria WHERE userId = 1;
```

---

### 8. Erro de Importação de Dados

#### Sintoma
```
Error: Column 'clienteId' doesn't have a default value
Error: Data too long for column 'numeroProtocolo'
```

#### Solução
```bash
# Verifique o schema
DESCRIBE statusProtocolo;

# Execute as migrações
npm run migrate

# Importe os dados novamente
DATABASE_URL="sua_url" node import-sheets-robust.mjs

# Se ainda falhar, verifique o CSV
head -20 sheets_data.csv
```

---

## 🔍 Diagnóstico

### Verificar Status da Aplicação

```bash
# Localmente
npm run dev

# Via Railway
railway logs

# Via curl
curl -I https://seu-dominio.railway.app

# Esperado: HTTP/1.1 200 OK
```

### Verificar Banco de Dados

```bash
# Conecte ao banco
mysql -h seu_host -u seu_usuario -p seu_banco

# Verifique as tabelas
SHOW TABLES;

# Verifique os registros
SELECT COUNT(*) FROM statusProtocolo;
SELECT COUNT(*) FROM clientes;
SELECT COUNT(*) FROM users;

# Verifique a auditoria
SELECT * FROM auditoria ORDER BY createdAt DESC LIMIT 10;
```

### Verificar Logs

```bash
# Últimas 50 linhas
railway logs -n 50

# Em tempo real
railway logs -f

# Filtrar por erro
railway logs | grep -i error

# Salvar em arquivo
railway logs > logs.txt
```

---

## 🚀 Otimização

### Performance

```bash
# Adicione índices ao banco
CREATE INDEX idx_protocolo ON statusProtocolo(numeroProtocolo);
CREATE INDEX idx_cliente ON clientes(nome);
CREATE INDEX idx_processo ON processos(clienteId);
CREATE INDEX idx_auditoria ON auditoria(userId, createdAt);

# Implemente cache
# Adicione Redis ao Railway
# Configure no código

# Comprima respostas
# Já configurado no Express

# Otimize imagens
# Use formatos modernos (WebP)
# Redimensione adequadamente
```

### Segurança

```bash
# Atualize dependências
npm update

# Verifique vulnerabilidades
npm audit

# Corrija vulnerabilidades
npm audit fix

# Revise o código
npm run lint

# Execute testes
npm test
```

---

## 📊 Monitoramento

### Configurar Alertas no Railway

1. Acesse: https://railway.app/project
2. Clique em **Settings**
3. Vá para **Alerts**
4. Configure alertas para:
   - CPU > 80%
   - Memory > 80%
   - Erro de deploy
   - Aplicação down

### Logs Estruturados

```bash
# Verifique os logs
railway logs

# Procure por padrões
railway logs | grep "ERROR"
railway logs | grep "WARN"
railway logs | grep "INFO"

# Salve para análise
railway logs > logs_$(date +%Y%m%d).txt
```

---

## 🔄 Backup e Recuperação

### Backup do Banco de Dados

```bash
# Faça backup
mysqldump -h seu_host -u seu_usuario -p seu_banco > backup.sql

# Comprima
gzip backup.sql

# Envie para armazenamento seguro
# Google Drive, AWS S3, etc.
```

### Restaurar Banco de Dados

```bash
# Descomprima
gunzip backup.sql.gz

# Restaure
mysql -h seu_host -u seu_usuario -p seu_banco < backup.sql
```

### Backup do Código

```bash
# GitHub já faz backup automático
# Mas você pode fazer backup local

# Clone o repositório
git clone https://github.com/paivabr/dm-gestao-protocolos.git backup_$(date +%Y%m%d)

# Comprima
tar -czf backup_$(date +%Y%m%d).tar.gz backup_$(date +%Y%m%d)
```

---

## 🔐 Segurança

### Verificar Vulnerabilidades

```bash
# Verifique dependências
npm audit

# Corrija automaticamente
npm audit fix

# Corrija manualmente
npm update

# Verifique código
npm run lint
```

### Rotação de Senhas

```bash
# Gere uma nova JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Atualize no Railway
railway variables set JWT_SECRET "nova_chave"

# Reinicie a aplicação
railway restart

# Todos os usuários precisarão fazer login novamente
```

### Auditoria de Segurança

```bash
# Verifique quem acessou o sistema
SELECT * FROM auditoria WHERE action = 'LOGIN' ORDER BY createdAt DESC;

# Verifique alterações de dados
SELECT * FROM auditoria WHERE action IN ('CREATE', 'UPDATE', 'DELETE');

# Verifique acessos não autorizados
SELECT * FROM auditoria WHERE status = 'FAILED';
```

---

## 📈 Escalabilidade

### Quando Escalar

- Usuários > 100
- Requisições > 1000/min
- Dados > 1GB
- CPU > 80% consistentemente

### Como Escalar

```bash
# Aumentar memória
railway variables set MEMORY "2GB"

# Adicionar réplicas
railway add-replica

# Usar CDN
# Configure Cloudflare

# Adicionar cache
# Implemente Redis

# Otimizar banco
# Adicione índices
# Particione tabelas grandes
```

---

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Teste específico
npm test -- server/clientes.test.ts

# Com cobertura
npm test -- --coverage

# Em modo watch
npm test -- --watch
```

### Adicionar Novos Testes

```bash
# Crie um arquivo de teste
touch server/nova-feature.test.ts

# Adicione os testes
cat > server/nova-feature.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';

describe('Nova Feature', () => {
  it('deve funcionar', () => {
    expect(true).toBe(true);
  });
});
EOF

# Execute
npm test
```

---

## 📝 Documentação

### Manter Documentação Atualizada

- Atualize `README.md` com novas features
- Documente mudanças de API
- Mantenha `CHANGELOG.md`
- Documente decisões arquiteturais

### Criar CHANGELOG

```markdown
# Changelog

## [1.1.0] - 2026-04-20
### Added
- Nova funcionalidade X
- Integração com Y

### Fixed
- Bug em Z

### Changed
- Melhorias de performance

## [1.0.0] - 2026-04-15
### Initial Release
- Sistema completo de gestão de protocolos
```

---

## 🎯 Checklist de Manutenção

### Diária
- [ ] Verificar logs
- [ ] Verificar status da aplicação
- [ ] Verificar alertas

### Semanal
- [ ] Revisar auditoria
- [ ] Fazer backup
- [ ] Verificar performance

### Mensal
- [ ] Atualizar dependências
- [ ] Revisar segurança
- [ ] Análise de uso

### Trimestral
- [ ] Atualizar Node.js
- [ ] Revisar arquitetura
- [ ] Planejamento

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
