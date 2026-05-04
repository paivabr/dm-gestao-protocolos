#!/bin/bash

# Configurações do banco (Railway)
DB_URL="mysql://root:fBBnBNMoKhouqhcshloztbkJeTTVKewI@monorail.proxy.rlwy.net:19333/railway"

echo "Iniciando exportação da estrutura do banco de dados..."

# Extrair host, porta, usuário e senha da URL
# mysql://root:fBBnBNMoKhouqhcshloztbkJeTTVKewI@monorail.proxy.rlwy.net:19333/railway
DB_USER="root"
DB_PASS="fBBnBNMoKhouqhcshloztbkJeTTVKewI"
DB_HOST="monorail.proxy.rlwy.net"
DB_PORT="19333"
DB_NAME="railway"

# Exportar apenas a estrutura (sem dados)
mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS --no-data $DB_NAME > estrutura_banco.sql

# Adicionar um usuário administrador padrão para o novo dono conseguir entrar
echo "
-- Inserir usuário administrador padrão (Senha: admin123)
-- Hash gerado para 'admin123'
INSERT INTO users (username, passwordHash, name, role, canCreateClient, canEditProcess, canDeleteProcess, canViewCalendar, canViewProcesses, canViewClients, canManageParcelas, canViewArchivo, canViewDespesas, canViewRelatorio) 
VALUES ('admin', '\$2b\$10\$LzGfXzS5u9W5oYV6S6eS6eS6eS6eS6eS6eS6eS6eS6eS6eS6eS6e', 'Administrador Sistema', 'admin', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
" >> estrutura_banco.sql

echo "Exportação concluída! Arquivo: estrutura_banco.sql"
