#!/bin/bash
set -e

echo "🚀 Iniciando aplicação..."

# Executar migrações
echo "📦 Executando migrações..."
pnpm db:push || true

# Executar seed
echo "🌱 Populando dados iniciais..."
pnpm seed || true

# Iniciar aplicação
echo "✅ Iniciando servidor..."
pnpm start
