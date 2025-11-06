#!/bin/bash

echo "🔄 Removiendo adapter local y restaurando paquete npm..."

# 1. Eliminar carpeta src/adapter
echo "📁 Eliminando carpeta src/adapter..."
rm -rf src/adapter

# 2. Restaurar importaciones en los archivos
echo "📝 Restaurando importaciones..."
find src -name "*.js" -type f ! -path "*/node_modules/*" | while read file; do
  sed -i.bak \
    -e "s|from '../../adapter'|from 'salmon-wallet-adapter'|g" \
    -e "s|from '../../../adapter'|from 'salmon-wallet-adapter'|g" \
    -e "s|from '../adapter'|from 'salmon-wallet-adapter'|g" \
    -e "s|from '../../adapter/|from 'salmon-wallet-adapter/|g" \
    -e "s|from '../../../adapter/|from 'salmon-wallet-adapter/|g" \
    -e "s|from '../adapter/|from 'salmon-wallet-adapter/|g" \
    "$file" 2>/dev/null
  rm -f "$file.bak" 2>/dev/null
done

# 3. Actualizar package.json
echo "📦 Actualizando package.json..."
sed -i.bak 's|"salmon-wallet-adapter": "file:.*|"salmon-wallet-adapter": "0.2.11",|g' package.json
rm -f package.json.bak

# 4. Limpiar scripts del package.json
echo "🧹 Limpiando scripts..."
# Esto se hace manualmente en el siguiente paso

# 5. Restaurar .eslintrc.js
echo "⚙️  Restaurando .eslintrc.js..."
cat > .eslintrc.js << 'EOF'
module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier'],
};
EOF

# 6. Eliminar archivos temporales
echo "🗑️  Limpiando archivos temporales..."
rm -f restore-imports.js remove-adapter.sh

echo "✅ ¡Listo! Ahora ejecuta: yarn install"

