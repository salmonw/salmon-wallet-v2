# Performance Baseline - Salmon Wallet V2
**Fecha:** 2025-11-19
**Branch:** origin/package-update
**Versión:** 0.6.7

---

## Bundle Size (Pre-Optimización)

### Análisis Webpack Bundle Analyzer
**Comando:** `yarn analyze`
**Fecha:** 2025-11-19

#### Main Bundle
- **Archivo:** `build/static/js/main.8d67bb58.js`
- **Tamaño sin gzip:** 3,975,349 bytes (~3.97 MB)
- **Tamaño gzipped estimado:** ~1.29 MB
- **Source map:** 15,226,729 bytes (~15.2 MB)

#### Chunks Generados
**Total de chunks:** 4 (solo 1 chunk principal de código + 3 mini chunks de ~200 bytes)

| Archivo | Tipo | Tamaño Gzipped |
|---------|------|----------------|
| main.8d67bb58.js | JS principal | 1.29 MB |
| main.5b933848.css | CSS principal | 472 B |
| 618.23458401.chunk.js | Chunk auxiliar | 179 B |
| 283.76a43176.chunk.js | Chunk auxiliar | 178 B |
| 488.4a81ea9f.chunk.js | Chunk auxiliar | 162 B |
| 618.854288af.chunk.css | CSS chunk | 108 B |
| 283.d81982eb.chunk.css | CSS chunk | 105 B |

**Problema identificado:** Solo 1 chunk principal, ZERO code splitting funcional.

---

## Builds por Ambiente

### Build Producción (`yarn build`)
```
✅ Compilado exitosamente con warnings
Main bundle: 1.29 MB gzipped (main.8d67bb58.js)
Chunks: 4 total
```

### Build Local (`yarn build:local`)
```
✅ Compilado exitosamente con warnings
Main bundle: 1.29 MB gzipped (main.2f821429.js)
Chunks: 4 total
Diferencia vs prod: -39 bytes
```

### Build Develop (`yarn build:develop`)
```
✅ Compilado exitosamente con warnings
Main bundle: 1.29 MB gzipped (main.7e4e2c7c.js)
Chunks: 4 total
Diferencia vs prod: +4 bytes
```

### Build Main (`yarn build:main`)
```
✅ Compilado exitosamente con warnings
Main bundle: 1.29 MB gzipped (main.58204ebf.js)
Chunks: 4 total
Diferencia vs prod: +42 bytes
```

**Conclusión:** Todos los ambientes tienen bundle sizes prácticamente idénticos (~1.29 MB).

---

## Warnings de Build

### Source Map Warnings
- **Cantidad:** ~30 warnings de source maps faltantes
- **Paquetes afectados:**
  - `@metaplex-foundation/beet-solana` (5 archivos)
  - `@metaplex-foundation/beet` (17 archivos)
  - `@solana/buffer-layout` (1 archivo)
  - `superstruct` (7 archivos)
- **Impacto:** No crítico, solo afecta debugging en node_modules
- **Acción:** Ninguna necesaria

### Bundle Size Warning
```
The bundle size is significantly larger than recommended.
Consider reducing it with code splitting: https://goo.gl/9VhYWB
```
**Impacto:** CRÍTICO - Esto es lo que vamos a resolver

---

## Core Web Vitals (Baseline)

### Lighthouse - Manual Testing Pendiente
**Instrucciones para ejecutar:**
1. Abrir Chrome en modo incógnito
2. Navegar a `http://localhost:3006` (con `yarn start:web:local`)
3. Abrir DevTools → Lighthouse
4. Configuración:
   - Mode: Navigation
   - Device: Desktop
   - Categories: Performance, Accessibility, Best Practices, SEO
5. Click "Generate report"

**Métricas a capturar:**
- [ ] Performance Score
- [ ] LCP (Largest Contentful Paint)
- [ ] INP (Interaction to Next Paint)
- [ ] CLS (Cumulative Layout Shift)
- [ ] FCP (First Contentful Paint)
- [ ] TTI (Time to Interactive)
- [ ] TBT (Total Blocking Time)

**Nota:** Ejecutar 3 veces y promediar resultados.

---

## Dependencias Principales Detectadas

### Blockchain SDKs (Problema Principal)
| Paquete | Versión | Tamaño Estimado node_modules | Estado |
|---------|---------|------------------------------|--------|
| @solana/web3.js | ^1.98.4 | ~23 MB | ✅ Activo |
| @solana/spl-token | ^0.4.14 | ~5 MB | ✅ Activo |
| ethers | ^6.15.0 | ~21 MB | ❌ No usado (código existe) |
| near-api-js | (sin versión explícita) | ~3-5 MB | ❌ No usado (código existe) |
| bitcoinjs-lib | ^7.0.0 | ~2.2 MB | ✅ Activo |

**Total SDKs en node_modules:** ~54 MB
**Total SDKs NO usados:** ~24-26 MB (ethereum + near)

### UI Libraries
| Paquete | Versión | Impacto Estimado Bundle |
|---------|---------|-------------------------|
| react | ^19.2.0 | ~150 KB |
| react-dom | ^19.2.0 | ~150 KB |
| @mui/material | ^7.3.5 | ~300-500 KB |
| react-router-dom | ^7.9.6 | ~50 KB |
| react-native-web | ^0.21.2 | ~150 KB |

### Utilities (Optimizables)
| Paquete | Versión | Problema | Optimización |
|---------|---------|----------|--------------|
| lodash | (sin versión) | Import completo | → lodash-es |
| moment | ^2.29.4 | Librería pesada | → date-fns |
| i18next | ^25.6.2 | Todas las traducciones cargadas | → Lazy load |
| qrcode.react | ^4.2.0 | Siempre cargado | → Lazy load |
| keen-slider | ^6.8.3 | Siempre cargado | → Lazy load |

---

## Estructura de Rutas (Baseline)

### Estado Actual: ZERO Lazy Loading

**Rutas Principales (todas EAGER):**
```javascript
// src/routes/app-routes.js
- ONBOARDING (OnboardingSection) - default route
- WALLET (WalletPage)
- TOKEN (TokenSection)
- ADAPTER (AdapterPage)
```

**Sub-rutas en Wallet (todas EAGER):**
```javascript
- WalletOverview (default)
- NftsSection (8 sub-rutas)
- SwapPage (546 líneas - CANDIDATO ALTO)
- TransactionsSection (2 sub-rutas)
- SettingsSection (17 sub-rutas)
```

**Método de carga:** `require()` síncrono en todos los archivos de routes

**Problema:** Todas las rutas y sub-secciones se cargan en el bundle inicial, aunque el usuario nunca las visite.

---

## Análisis de Código

### Componentes Grandes
| Archivo | Líneas | Dependencias Pesadas | Prioridad Lazy Load |
|---------|--------|---------------------|---------------------|
| SwapPage.js | 546 | InputTokenSelector, Jupiter | 🔴 CRÍTICO |
| NftsDetailPage.js | 321 | @solana/web3.js | 🟡 ALTO |
| NftsBurnPage.js | 215 | @solana/web3.js | 🟡 ALTO |

### Archivos de Blockchain NO Usados
```
src/adapter/services/ethereum/    (10 archivos) - 🗑️ ELIMINAR código lazy
src/adapter/services/near/         (12 archivos) - 🗑️ ELIMINAR código lazy
src/adapter/services/eclipse/      (9 archivos)  - 🗑️ ELIMINAR código lazy
```

**Total:** 31 archivos de código no usado que PUEDEN estar en el bundle.

---

## Webpack Configuration (Baseline)

### Estado Actual
- **Tool:** `react-scripts` 5.0.1 (Create React App)
- **Config personalizada:** ❌ NO existe `config-overrides.js`
- **react-app-rewired:** Instalado pero NO configurado
- **Code splitting:** ❌ NO configurado (usa defaults de CRA)
- **SplitChunks:** ❌ NO configurado

### Herramientas Disponibles
- ✅ webpack-bundle-analyzer (v5.0.0) - CONFIGURADO en `analyze.js`
- ✅ source-map-explorer (v2.5.3) - DISPONIBLE
- ✅ react-app-rewired (v2.2.1) - INSTALADO pero no usado

### Scripts de Build Disponibles
```json
"build": "DISABLE_ESLINT_PLUGIN=true react-scripts build"
"build:local": "REACT_APP_SALMON_ENV=local npm run build"
"build:develop": "REACT_APP_SALMON_ENV=development npm run build"
"build:main": "REACT_APP_SALMON_ENV=main npm run build"
"build:prod": "REACT_APP_SALMON_ENV=production npm run build"
"analyze": "node analyze.js"
```

---

## Objetivos de Optimización

### Target Bundle Size
| Métrica | Baseline | Target Post-Optimización | Reducción |
|---------|----------|--------------------------|-----------|
| Initial Bundle (gzipped) | 1.29 MB | < 400 KB | ~70% |
| Total Chunks | 4 | 25-30 | +625% chunks |
| Code Splitting | 0% | 100% rutas | - |
| Blockchain Lazy Load | NO | SÍ | - |

### Target Lighthouse Scores
| Métrica | Target |
|---------|--------|
| Performance | > 90 |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

---

## Próximos Pasos

### Fase 1: Code Splitting Básico
- [ ] Crear `config-overrides.js`
- [ ] Configurar `react-app-rewired` en scripts
- [ ] Configurar SplitChunks para vendors
- [ ] Verificar chunks separados en bundle analyzer

### Fase 2: Lazy Loading de Rutas
- [ ] Convertir app-routes.js a usar React.lazy()
- [ ] Agregar Suspense a RoutesBuilder.js
- [ ] Lazy load de WalletPage, TokenSection, AdapterPage
- [ ] Mantener Onboarding eager (ruta default)

### Fase 3-6
Ver `docs/optimization-plan.md` para plan completo.

---

## Notas
- Bundle analyzer report guardado en: `build/bundle-report.html`
- Bundle stats JSON guardado en: `build/bundle-stats.json`
- Warnings de source maps son esperados y no críticos
- Todos los builds (local, develop, main, prod) funcionan correctamente
