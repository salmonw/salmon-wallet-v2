# Testing Checklist - Optimización Bundle Size
**Salmon Wallet V2**

Este documento contiene la checklist completa de testing a ejecutar después de cada fase de optimización.

---

## Pre-requisitos para Testing

### Configuración del Entorno
- [ ] Backend corriendo en Docker: `http://localhost:3000/local`
- [ ] Frontend corriendo con: `yarn start:web:local`
- [ ] Chrome DevTools abierto (Network tab visible)
- [ ] Bundle analyzer ejecutado: `yarn analyze`

---

## 🔍 Testing de Build (Ejecutar SIEMPRE)

### Build Verification
```bash
# Ejecutar todos los builds para verificar que compilan sin errores
yarn build
yarn build:local
yarn build:develop
yarn build:main
```

**Criterios de éxito:**
- [ ] Todos los builds completan sin errores
- [ ] Warnings de source maps son los esperados (metaplex, solana, superstruct)
- [ ] No hay nuevos errores de TypeScript/JavaScript
- [ ] No hay nuevos warnings de dependencias

---

## 📊 Bundle Analysis (Ejecutar SIEMPRE)

### Análisis con webpack-bundle-analyzer
```bash
yarn analyze
```

**Verificar en `build/bundle-report.html`:**
- [ ] Tamaño del main bundle (debe ser menor que fase anterior)
- [ ] Número de chunks generados
- [ ] Separación de vendors (React, MUI, Solana, etc.)
- [ ] No hay duplicación de dependencias entre chunks

**Capturar métricas:**
```markdown
Main bundle: ___ KB gzipped
Total chunks: ___
Reducción vs baseline: ___%
Reducción vs fase anterior: ___%
```

---

## ⚡ Lighthouse Manual (Ejecutar SIEMPRE)

### Procedimiento
1. Abrir Chrome en **modo incógnito** (Cmd+Shift+N)
2. Navegar a `http://localhost:3006`
3. Esperar que cargue completamente
4. Abrir DevTools (Cmd+Option+I)
5. Tab "Lighthouse"
6. Configuración:
   - Mode: **Navigation**
   - Device: **Desktop**
   - Categories: Marcar todas
7. Click "**Generate report**"
8. Repetir 3 veces y promediar

**Métricas a capturar:**
- [ ] Performance Score: ___ / 100
- [ ] LCP (Largest Contentful Paint): ___ ms
- [ ] INP (Interaction to Next Paint): ___ ms
- [ ] CLS (Cumulative Layout Shift): ___
- [ ] FCP (First Contentful Paint): ___ ms
- [ ] TBT (Total Blocking Time): ___ ms

**Comparar con baseline:**
```markdown
Fase: ___
Performance Score: ___ (+/- ___ vs baseline)
LCP: ___ ms (+/- ___ vs baseline)
INP: ___ ms (+/- ___ vs baseline)
```

---

## 🧪 Smoke Testing Funcional (Ejecutar SIEMPRE)

### 1. Onboarding Flow
- [ ] Navegar a `/onboarding`
- [ ] Ver pantalla de opciones (Create / Recover)
- [ ] Click en "Create New Wallet"
- [ ] Ver seed phrase generada (12 palabras)
- [ ] Click "Continue"
- [ ] Confirmar seed phrase
- [ ] Ver pantalla de "Wallet Created"

**Verificar en Network tab:**
- [ ] Onboarding carga inmediatamente (eager load - esperado)
- [ ] No se cargan chunks innecesarios

### 2. Wallet Overview
- [ ] Login con wallet creada
- [ ] Ver pantalla principal de Wallet
- [ ] Verificar que muestra balance (puede ser $0.00)
- [ ] Ver lista de tokens (vacía o con tokens)
- [ ] Scroll funciona correctamente

**Verificar en Network tab:**
- [ ] Main bundle cargado
- [ ] (Fase 2+) Wallet chunk se carga lazy si fue configurado

### 3. Token Operations
- [ ] Click en "Send" token
- [ ] Ver modal de Send
- [ ] Ingresar dirección (puede ser inválida para testing)
- [ ] Ver validación de dirección
- [ ] Cerrar modal

**Verificar:**
- [ ] TokenSection funciona correctamente
- [ ] Validaciones funcionan

### 4. NFTs Section
- [ ] Click en tab "NFTs"
- [ ] Ver pantalla de NFTs (vacía o con NFTs)
- [ ] Click en un NFT si existe
- [ ] Ver detalle del NFT
- [ ] Volver a lista

**Verificar en Network tab:**
- [ ] (Fase 3+) NFTs chunk se carga lazy cuando se accede al tab
- [ ] @solana/web3.js NO se carga hasta que es necesario (Fase 4+)

### 5. Swap Feature
- [ ] Click en tab "Swap"
- [ ] Ver pantalla de Swap
- [ ] Ver dropdowns de tokens (From / To)
- [ ] Intentar abrir dropdown
- [ ] Verificar que renderiza correctamente

**Verificar en Network tab:**
- [ ] (Fase 3+) Swap chunk se carga lazy
- [ ] InputTokenSelector carga correctamente

### 6. Settings Section
- [ ] Click en Settings (ícono de gear)
- [ ] Ver lista de opciones de settings
- [ ] Click en "Language"
- [ ] Cambiar idioma (ej: English → Español)
- [ ] Verificar que UI cambia de idioma
- [ ] Volver a Settings
- [ ] Click en "Network"
- [ ] Ver lista de redes disponibles

**Verificar en Network tab:**
- [ ] (Fase 3+) Settings chunk se carga lazy
- [ ] (Fase 5+) Traducciones se cargan lazy por idioma

### 7. Transactions
- [ ] Click en "Transactions"
- [ ] Ver lista de transacciones (vacía o con txs)
- [ ] Si hay transacciones, click en una
- [ ] Ver detalle de transacción
- [ ] Volver a lista

**Verificar:**
- [ ] Fechas se muestran correctamente (importante en Fase 5 - cambio de moment a date-fns)

### 8. Adapter Page (si aplica)
- [ ] Navegar directamente a `/adapter`
- [ ] Verificar que carga correctamente
- [ ] Ver botón de conexión

**Verificar en Network tab:**
- [ ] Adapter chunk se carga solo cuando se accede a la ruta

---

## 🔗 Testing de Lazy Loading (Fase 2+)

### Verificación en Chrome DevTools - Network Tab

**Configuración:**
1. Abrir DevTools
2. Tab "Network"
3. Filtrar por "JS"
4. Habilitar "Disable cache"
5. Refresh página

**Verificar carga inicial:**
- [ ] Solo se carga main bundle (~400-1000 KB dependiendo de fase)
- [ ] No se cargan chunks de Wallet/Token/Settings si estás en Onboarding
- [ ] React vendors chunk separado (Fase 1+)
- [ ] Solana chunk separado (Fase 1+)

**Verificar lazy loading al navegar:**
- [ ] Click en Wallet → carga wallet chunk
- [ ] Click en NFTs → carga nfts chunk (Fase 3+)
- [ ] Click en Swap → carga swap chunk (Fase 3+)
- [ ] Click en Settings → carga settings chunk (Fase 3+)
- [ ] Chunks se cargan **on-demand**, no en initial load

---

## 🔐 Testing de Blockchain Adapters (Fase 4+)

### Verificación de Lazy Load por Blockchain

**Crear cuenta Solana:**
- [ ] Create new wallet → Solana
- [ ] Verificar en Network tab: `solana-chunk.js` se carga
- [ ] Verificar: `bitcoin-chunk.js` NO se carga
- [ ] Verificar: `ethereum-chunk.js` NO se carga
- [ ] Verificar: `near-chunk.js` NO se carga

**Crear cuenta Bitcoin:**
- [ ] Create new wallet → Bitcoin
- [ ] Verificar en Network tab: `bitcoin-chunk.js` se carga
- [ ] Verificar: Otros blockchain chunks NO se cargan

**Funcionalidad:**
- [ ] Balance de Solana se muestra correctamente
- [ ] Transactions de Solana funcionan
- [ ] Balance de Bitcoin se muestra correctamente
- [ ] Transactions de Bitcoin funcionan

---

## 📦 Testing de Dependencias (Fase 5)

### Después de cambiar lodash → lodash-es
- [ ] Todas las funciones lodash siguen funcionando
- [ ] Buscar en código: NO debe existir `import { ... } from 'lodash'`
- [ ] Solo debe existir: `import fn from 'lodash-es/fn'`
- [ ] Bundle analyzer: verificar que lodash NO aparece como dependencia grande

**Testing específico de funciones lodash:**
- [ ] `get()` funciona (usado en múltiples lugares)
- [ ] `isNil()` funciona
- [ ] Wallet overview muestra datos correctamente

### Después de cambiar moment → date-fns
- [ ] Fechas en Transactions se muestran correctamente
- [ ] Formato de fecha es correcto (ej: "Nov 19, 2025")
- [ ] NO debe existir `import moment from 'moment'` en código
- [ ] Bundle analyzer: moment NO debe aparecer

**Testing específico:**
- [ ] Transaction list muestra fechas
- [ ] Transaction detail muestra timestamp correcto

---

## 🌍 Testing Multi-Idioma (Fase 5+)

### Si se implementa lazy load de traducciones

- [ ] Cambiar a Español → solo `es/translation.json` se carga
- [ ] Cambiar a Inglés → solo `en/translation.json` se carga
- [ ] Textos cambian correctamente en toda la UI
- [ ] No hay traducciones faltantes (no aparece "translation.key")

---

## 🚨 Testing de Regresión

### Funcionalidades Críticas (NUNCA deben romperse)

- [ ] **Crear wallet nueva** funciona
- [ ] **Recuperar wallet con seed phrase** funciona
- [ ] **Ver balance** funciona
- [ ] **Ver historial de transacciones** funciona
- [ ] **Cambiar de red** (Mainnet/Devnet) funciona
- [ ] **Cambiar de idioma** funciona
- [ ] **Copy address** funciona
- [ ] **QR code** se genera correctamente
- [ ] **Logout** funciona
- [ ] **Login** con wallet existente funciona

### Validaciones de Seguridad
- [ ] Seed phrase se genera correctamente (12 palabras válidas)
- [ ] Seed phrase se puede copiar
- [ ] Encrypted storage funciona (wallet persiste después de refresh)
- [ ] Inactivity timeout funciona (si está habilitado)

---

## 📋 Checklist por Fase

### Fase 0: Baseline (✅ Completada)
- [x] Ejecutar yarn analyze
- [x] Ejecutar todos los builds
- [x] Crear performance-baseline.md
- [x] Crear testing-checklist.md

### Fase 1: Code Splitting Básico
- [ ] Build verification ✅
- [ ] Bundle analysis ✅
- [ ] Lighthouse manual ✅
- [ ] Smoke testing funcional ✅
- [ ] Verificar chunks separados de vendors ✅
- [ ] Comparar métricas vs baseline

### Fase 2: Lazy Loading de Rutas
- [ ] Build verification ✅
- [ ] Bundle analysis ✅
- [ ] Lighthouse manual ✅
- [ ] Smoke testing funcional ✅
- [ ] Testing de lazy loading ✅
- [ ] Verificar initial bundle reducido
- [ ] Comparar métricas vs Fase 1

### Fase 3: Lazy Loading de Sub-secciones
- [ ] Build verification ✅
- [ ] Bundle analysis ✅
- [ ] Lighthouse manual ✅
- [ ] Smoke testing funcional ✅
- [ ] Testing de lazy loading ✅
- [ ] Verificar NFTs/Swap/Settings lazy
- [ ] Comparar métricas vs Fase 2

### Fase 4: Lazy Loading de Blockchains
- [ ] Build verification ✅
- [ ] Bundle analysis ✅
- [ ] Lighthouse manual ✅
- [ ] Smoke testing funcional ✅
- [ ] Testing de blockchain adapters ✅
- [ ] Verificar ethereum/near/eclipse NO se cargan
- [ ] Comparar métricas vs Fase 3

### Fase 5: Optimización de Dependencias
- [ ] Build verification ✅
- [ ] Bundle analysis ✅
- [ ] Lighthouse manual ✅
- [ ] Smoke testing funcional ✅
- [ ] Testing de lodash-es ✅
- [ ] Testing de date-fns ✅
- [ ] Testing multi-idioma ✅
- [ ] Comparar métricas vs Fase 4

### Fase 6: Testing Final
- [ ] Build verification de TODOS los ambientes ✅
- [ ] Bundle analysis completo ✅
- [ ] Lighthouse en múltiples páginas ✅
- [ ] Smoke testing exhaustivo ✅
- [ ] Testing de regresión completo ✅
- [ ] Performance Score > 90 ✅
- [ ] Documentación de resultados ✅

---

## 📝 Template de Reporte de Testing

```markdown
## Reporte de Testing - Fase X

**Fecha:** YYYY-MM-DD
**Fase:** X - [Nombre de la fase]

### Build Verification
- ✅/❌ yarn build
- ✅/❌ yarn build:local
- ✅/❌ yarn build:develop
- ✅/❌ yarn build:main

### Bundle Metrics
- Main bundle: ___ KB gzipped
- Total chunks: ___
- Reducción vs baseline: ___%
- Reducción vs fase anterior: ___%

### Lighthouse Scores (promedio de 3 runs)
- Performance: ___ / 100
- LCP: ___ ms
- INP: ___ ms
- CLS: ___

### Smoke Testing
- ✅/❌ Onboarding flow
- ✅/❌ Wallet overview
- ✅/❌ Token operations
- ✅/❌ NFTs section
- ✅/❌ Swap feature
- ✅/❌ Settings section
- ✅/❌ Transactions

### Lazy Loading Verification
- ✅/❌ Chunks cargan on-demand
- ✅/❌ Initial bundle optimizado
- ✅/❌ No hay duplicación de código

### Issues Encontrados
[Lista de bugs o problemas encontrados]

### Conclusión
✅/❌ Fase completada exitosamente
[Comentarios adicionales]
```

---

## 🎯 Criterios de Éxito Final (Fase 6)

- [ ] **Bundle size:** < 400 KB gzipped inicial
- [ ] **Chunks:** 25-30 chunks totales
- [ ] **Performance Score:** > 90
- [ ] **LCP:** < 2.5 segundos
- [ ] **INP:** < 200 ms
- [ ] **Reducción total:** > 65% vs baseline
- [ ] **Funcionalidad:** 100% de smoke tests pasan
- [ ] **Regresión:** ZERO bugs críticos

---

## 📞 Contacto para Issues

Si encuentras algún bug crítico durante el testing:
1. Documentar en reporte de testing
2. Capturar screenshot/video si es posible
3. Incluir pasos para reproducir
4. Indicar fase donde se introdujo el bug
