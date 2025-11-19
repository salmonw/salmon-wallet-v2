# 🎯 PLAN DE OPTIMIZACIÓN DE BUNDLE SIZE - SALMON WALLET V2
## Optimización Máxima Progresiva con Testing Manual Completo

**Versión:** Manual (Sin CI/CD automatizado)
**Fecha:** Noviembre 2025

---

## 📊 FASE 0: BASELINE Y SETUP (2-3 días)

### Objetivos
- Establecer métricas actuales
- Configurar herramientas de monitoreo manual
- Crear infraestructura de testing

### Tareas

#### 0.1 Generar Baseline de Métricas Actuales
```bash
# Ejecutar análisis de bundle
yarn analyze

# Ejecutar todos los builds
yarn build
yarn build:local
yarn build:develop
yarn build:main
yarn build:prod

# Lighthouse manual (Chrome DevTools)
# Abrir DevTools → Lighthouse → Run analysis
# Capturar screenshots de resultados
```

**Crear:** `docs/performance-baseline.md`
```markdown
# Performance Baseline - Salmon Wallet V2

## Bundle Size (Fecha: ___)
- Main bundle: ___ KB
- Total bundle: ___ KB
- Number of chunks: ___

## Lighthouse Scores
- Performance: ___
- Accessibility: ___
- Best Practices: ___
- SEO: ___

## Core Web Vitals
- LCP: ___ s
- INP: ___ ms
- CLS: ___

## Observaciones
- [Anotar observaciones del Bundle Analyzer]
- [Anotar bottlenecks principales]
```

#### 0.2 Configurar Lighthouse Manual
**Crear:** `docs/lighthouse-manual-testing.md`
```markdown
# Guía de Testing Manual con Lighthouse

## Setup
1. Abrir Chrome/Edge en modo incógnito
2. Build de producción: `yarn build:prod`
3. Servir: `npx serve -s build -p 3000`
4. Abrir DevTools (F12) → Lighthouse tab

## Tests a Ejecutar
- [ ] Homepage (/)
- [ ] Onboarding (/onboarding)
- [ ] Wallet (/wallet)
- [ ] Adapter (/adapter)

## Configuración Lighthouse
- Mode: Desktop
- Categories: Performance, Accessibility, Best Practices
- Throttling: Simulated throttling

## Capturar Resultados
- Screenshot de scores
- Descargar JSON report
- Guardar en: docs/lighthouse-reports/fase-X/
```

#### 0.3 Mejorar Bundle Analyzer
**Modificar:** `analyze.js`

Agregar modo interactivo:
```javascript
const isInteractive = process.env.INTERACTIVE === 'true';

new BundleAnalyzerPlugin({
  analyzerMode: isInteractive ? 'server' : 'static',
  openAnalyzer: isInteractive,
  // ... resto
})
```

**Agregar scripts a package.json:**
```json
{
  "scripts": {
    "analyze": "node analyze.js",
    "analyze:interactive": "INTERACTIVE=true node analyze.js"
  }
}
```

#### 0.4 Crear Budget Manual
**Crear:** `docs/performance-budget.md`
```markdown
# Performance Budget

## Bundle Size Targets
| Fase | Main Bundle | Total Bundle | Status |
|------|-------------|--------------|--------|
| Baseline | 1290 KB | 1290 KB | ✅ |
| Fase 1 | < 700 KB | < 800 KB | 🎯 |
| Fase 2 | < 600 KB | < 700 KB | 🎯 |
| Final | < 150 KB | < 400 KB | 🎯 |

## Lighthouse Targets
| Fase | Performance | LCP | INP |
|------|-------------|-----|-----|
| Baseline | 50-60 | 4-6s | 400ms |
| Final | > 90 | < 2s | < 150ms |

## Testing Schedule
- [ ] Post-Fase 0: Baseline establecido
- [ ] Post-Fase 1: Primera medición
- [ ] Post-Fase 2: Segunda medición
- [ ] Post-Fase 3: Tercera medición
- [ ] Post-Fase 4: Cuarta medición
- [ ] Post-Fase 5: Quinta medición
- [ ] Post-Fase 6: Medición final
```

### Testing Pre-Fase 1

**Manual:**
1. ✅ `yarn start:web:local` - App funciona
2. ✅ Navegar todas las rutas sin errores
3. ✅ Ejecutar `yarn analyze` - Report generado
4. ✅ Lighthouse manual - Scores capturados

**Builds:**
1. ✅ `yarn build:local` - Sin errores
2. ✅ `yarn build:develop` - Sin errores
3. ✅ `yarn build:main` - Sin errores
4. ✅ `yarn build:prod` - Sin errores

**Documentación:**
1. ✅ `docs/performance-baseline.md` completado
2. ✅ `docs/performance-budget.md` creado
3. ✅ `docs/lighthouse-manual-testing.md` creado

### Criterios de Éxito Fase 0
- ✅ Bundle Analyzer funcionando (interactivo + estático)
- ✅ Baseline documentado en `docs/`
- ✅ Proceso de testing manual definido
- ✅ Budget establecido

---

## 🚀 FASE 1: ROUTE-BASED CODE SPLITTING (3-4 días)

### Objetivos
- Implementar lazy loading de rutas principales
- Reducir bundle inicial 40-50%
- Sin cambios arquitectónicos profundos

### Tareas

#### 1.1 Implementar React.lazy en Rutas
**Archivo:** `src/routes/app-routes.js`

```javascript
import { lazy } from 'react';

// Mantener sincrónico solo Onboarding (ruta de entrada)
import OnboardingSection from '../pages/Onboarding';

// Lazy load rutas pesadas
const WalletPage = lazy(() => import('../pages/Wallet/WalletPage'));
const TokenSection = lazy(() => import('../pages/Token'));
const AdapterPage = lazy(() => import('../pages/Adapter/AdapterPage'));

const routes = [
  {
    key: ROUTES_MAP.WALLET,
    name: 'wallet',
    path: 'wallet/*',
    route: '/wallet',
    Component: WalletPage, // Ahora lazy
  },
  {
    key: ROUTES_MAP.TOKEN,
    name: 'token',
    path: 'token/*',
    route: '/token',
    Component: TokenSection, // Ahora lazy
  },
  {
    key: ROUTES_MAP.ADAPTER,
    name: 'adapter',
    path: 'adapter',
    route: '/adapter',
    Component: AdapterPage, // Ahora lazy
  },
  {
    key: ROUTES_MAP.ONBOARDING,
    name: 'onboarding',
    path: 'onboarding/*',
    route: '/onboarding',
    Component: OnboardingSection, // Sincrónico
    default: true,
  },
];
```

#### 1.2 Agregar Suspense Boundary
**Archivo:** `src/routes/RoutesBuilder.js`

Buscar donde se renderizan las rutas y agregar:
```javascript
import { Suspense } from 'react';
import LoadingScreen from '../components/LoadingScreen';

// Dentro del componente
<Suspense fallback={<LoadingScreen />}>
  {/* Rutas existentes */}
</Suspense>
```

#### 1.3 Crear LoadingScreen Component
**Nuevo archivo:** `src/components/LoadingScreen.js`

```javascript
import React from 'react';

const LoadingScreen = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
    }}>
      <div className="loading-spinner" />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingScreen;
```

**Nota:** Ajustar estilos según el diseño actual de Salmon

#### 1.4 Agregar Error Boundary
**Nuevo archivo:** `src/components/ErrorBoundary.js`

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error loading component:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Failed to load component</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={this.handleRetry}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### 1.5 Integrar Error Boundary
**Archivo:** `src/App.js` o `src/AppRoutes.js`

```javascript
import ErrorBoundary from './components/ErrorBoundary';

// Envolver AppRoutes
<ErrorBoundary>
  <AppRoutes />
</ErrorBoundary>
```

### Testing Post-Fase 1

#### Testing Manual Completo

**1. Funcionalidad (30-45 min)**
```bash
# 1. Levantar desarrollo
yarn start:web:local

# 2. Navegar a cada ruta y verificar:
```
- [ ] `/onboarding` - Carga inmediatamente (sincrónico)
- [ ] `/wallet` - Muestra loading screen → carga
- [ ] `/adapter` - Muestra loading screen → carga
- [ ] `/token/*` - Muestra loading screen → carga

**3. Throttling Test**
```bash
# En Chrome DevTools:
# Network tab → Throttling → Fast 3G
```
- [ ] Verificar loading screens visibles
- [ ] Verificar que chunks se descargan
- [ ] UI sigue responsive

**4. Error Handling Test**
```bash
# Simular error:
# - DevTools → Network → Block request pattern: *chunk.js
```
- [ ] Error boundary se muestra
- [ ] Botón "Retry" funciona

#### Bundle Analysis (15 min)

```bash
# 1. Generar build
yarn build:prod

# 2. Analizar bundle
yarn analyze

# 3. Abrir build/bundle-report.html
```

**Verificar:**
- [ ] Main bundle reducido 40-50% vs baseline
- [ ] Aparecen 3-4 chunks nuevos:
  - `wallet.chunk.js`
  - `token.chunk.js`
  - `adapter.chunk.js`
- [ ] Screenshot del analyzer

**Actualizar:** `docs/performance-budget.md` con resultados

#### Lighthouse Manual (20 min)

```bash
# 1. Servir build
npx serve -s build -p 3000

# 2. Abrir Chrome Incognito
# 3. Lighthouse en cada ruta
```

Tests:
- [ ] Homepage - Capturar score
- [ ] /onboarding - Capturar score
- [ ] /wallet - Capturar score
- [ ] /adapter - Capturar score

**Guardar:** Screenshots en `docs/lighthouse-reports/fase-1/`

**Actualizar:** `docs/performance-budget.md` con scores

#### Builds Completos (10 min)

```bash
yarn build
yarn build:local
yarn build:develop
yarn build:main
yarn build:prod
```

- [ ] Todos compilan sin errores
- [ ] Todos generan chunks similares

#### Tests Automatizados (si existen)

```bash
yarn test
```

- [ ] Todos los tests pasan
- [ ] No hay regresiones

### Documentar Resultados Fase 1

**Actualizar:** `docs/performance-budget.md`

```markdown
## Fase 1 Results (Fecha: ___)

### Bundle Size
- Main bundle: ___ KB (baseline: ___ KB) → **-___%**
- Total bundle: ___ KB
- New chunks: 3-4 chunks

### Lighthouse Scores
- Performance: ___ (baseline: ___)
- LCP: ___ s (baseline: ___ s)
- INP: ___ ms (baseline: ___ ms)

### Status
- [x] Route splitting implemented
- [x] Loading screens working
- [x] Error boundaries working
- [x] All builds successful

### Issues Found
- [Lista cualquier issue encontrado]

### Next Steps
- Proceder a Fase 2
```

### Criterios de Éxito Fase 1
- ✅ Bundle inicial < 700 KB (desde ~1290 KB)
- ✅ 3-4 chunks nuevos generados
- ✅ Loading screens funcionan correctamente
- ✅ Error boundaries manejan errores
- ✅ Todos los builds exitosos
- ✅ Lighthouse performance mejorado 10-15 puntos
- ✅ Resultados documentados

---

## 🎨 FASE 2: FEATURE-BASED CODE SPLITTING (3-4 días)

### Objetivos
- Lazy load features opcionales dentro de páginas
- Reducir bundle adicional 10-15%
- Optimizar componentes pesados

### Tareas

#### 2.1 Analizar Features Pesadas

**Ejecutar:**
```bash
yarn analyze:interactive
```

**Buscar en el analyzer:**
- Módulos > 50 KB
- Features opcionales (NFTs, Swap, Exchange)
- Componentes que no siempre se usan

**Documentar en:** `docs/heavy-features.md`
```markdown
# Heavy Features Analysis

## Features Identificadas para Lazy Loading
1. **NFTs/Collectibles Viewer** - ~___ KB
2. **Swap Interface** - ~___ KB
3. **Exchange Section** - ~___ KB
4. **Settings Avanzados** - ~___ KB

## Prioridad
1. [Feature más pesada]
2. [Segunda más pesada]
...
```

#### 2.2 Lazy Load Features en WalletPage
**Archivo:** `src/pages/Wallet/WalletPage.js`

**Cambios:**
```javascript
import { lazy, Suspense } from 'react';

// Lazy load features pesadas
const NftsSection = lazy(() => import('../Nfts'));
const SwapPage = lazy(() => import('./SwapPage'));
const ExchangeSection = lazy(() => import('./ExchangeSection'));

// En el componente
function WalletPage() {
  // ... código existente

  return (
    <div>
      {/* UI crítica sincrónica */}

      {/* Features lazy */}
      {showNfts && (
        <Suspense fallback={<FeatureLoading />}>
          <NftsSection />
        </Suspense>
      )}

      {showSwap && (
        <Suspense fallback={<FeatureLoading />}>
          <SwapPage />
        </Suspense>
      )}

      {showExchange && (
        <Suspense fallback={<FeatureLoading />}>
          <ExchangeSection />
        </Suspense>
      )}
    </div>
  );
}
```

#### 2.3 Crear FeatureLoading Component
**Nuevo archivo:** `src/components/FeatureLoading.js`

```javascript
import React from 'react';

const FeatureLoading = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div className="spinner" />
      <p>Loading feature...</p>
    </div>
  );
};

export default FeatureLoading;
```

#### 2.4 Agregar Prefetch Hints
**En imports dinámicos:**

```javascript
// Prefetch features que usuario probablemente usará
const SwapPage = lazy(() => import(
  /* webpackChunkName: "swap-feature" */
  /* webpackPrefetch: true */
  './SwapPage'
));

const NftsSection = lazy(() => import(
  /* webpackChunkName: "nfts-feature" */
  /* webpackPrefetch: true */
  '../Nfts'
));
```

#### 2.5 Optimizar Otros Componentes Pesados

**Identificar en otros archivos:**
- `src/pages/Token/`
- `src/pages/Adapter/`
- Settings modals
- Help widgets

**Aplicar mismo pattern:** lazy + Suspense

### Testing Post-Fase 2

#### Testing Manual (45-60 min)

**1. Wallet Page Features**
```bash
yarn start:web:local
```

- [ ] Navegar a `/wallet`
- [ ] Abrir DevTools → Network tab
- [ ] Click en tab "Collectibles" → verificar chunk descargado
- [ ] Click en tab "Swap" → verificar chunk descargado
- [ ] Click en tab "Exchange" → verificar chunk descargado
- [ ] Verificar loading states aparecen
- [ ] Verificar features funcionan correctamente

**2. Throttling Test**
- [ ] Network → Fast 3G
- [ ] Navegar entre features
- [ ] Verificar UX sigue buena con loading states

**3. Cache Test**
- [ ] Navegar a Swap → esperar carga
- [ ] Navegar a otro tab
- [ ] Volver a Swap → debería cargar instantáneo (cached)

#### Bundle Analysis (15 min)

```bash
yarn build:prod
yarn analyze
```

**Verificar:**
- [ ] Main bundle sin cambios vs Fase 1
- [ ] 3-5 chunks adicionales para features:
  - `swap-feature.chunk.js`
  - `nfts-feature.chunk.js`
  - `exchange-feature.chunk.js`
- [ ] Total size reducido vs Fase 1

**Screenshot y documentar**

#### Lighthouse Manual (20 min)

```bash
npx serve -s build -p 3000
```

- [ ] Lighthouse en `/wallet` - Score
- [ ] Lighthouse en `/wallet` + usar Swap - Score
- [ ] Comparar con Fase 1

#### Builds (10 min)

```bash
yarn build:local
yarn build:develop
yarn build:main
yarn build:prod
```

- [ ] Todos exitosos

### Documentar Resultados Fase 2

**Actualizar:** `docs/performance-budget.md`

```markdown
## Fase 2 Results (Fecha: ___)

### Bundle Size
- Main bundle: ___ KB (no debería cambiar)
- Total initial: ___ KB vs Fase 1: ___ KB
- Feature chunks: 3-5 nuevos

### Features Lazy Loaded
- [x] NFTs/Collectibles
- [x] Swap
- [x] Exchange
- [x] [Otros]

### Lighthouse
- Performance: ___
- LCP: ___ s
- Perceived performance: Mejorado

### Status
✅ Features se cargan on-demand
✅ Loading states funcionan
✅ Cache de chunks funciona
```

### Criterios de Éxito Fase 2
- ✅ Features pesadas lazy loaded
- ✅ 3-5 chunks adicionales generados
- ✅ Main bundle no aumentó
- ✅ Features solo se descargan cuando se usan
- ✅ UX sigue siendo buena
- ✅ Resultados documentados

---

## ⚙️ FASE 3: WEBPACK OPTIMIZATION (4-5 días)

### Objetivos
- Configurar SplitChunks avanzado
- Separar vendors por tipo
- Mejorar caching strategy

### Tareas

#### 3.1 Setup react-app-rewired

```bash
npm install --save-dev react-app-rewired
```

**Modificar:** `package.json`
```json
{
  "scripts": {
    "start:web": "PORT=3006 DISABLE_ESLINT_PLUGIN=true react-app-rewired start",
    "start:web:local": "PORT=3006 REACT_APP_SALMON_ENV=local DISABLE_ESLINT_PLUGIN=true react-app-rewired start",
    "start:web:main": "REACT_APP_SALMON_ENV=main DISABLE_ESLINT_PLUGIN=true react-app-rewired start",
    "start:web:prod": "REACT_APP_SALMON_ENV=production DISABLE_ESLINT_PLUGIN=true react-app-rewired start",
    "build": "DISABLE_ESLINT_PLUGIN=true react-app-rewired build",
    "build:local": "REACT_APP_SALMON_ENV=local npm run build",
    "build:develop": "REACT_APP_SALMON_ENV=development npm run build",
    "build:main": "REACT_APP_SALMON_ENV=main npm run build",
    "build:prod": "REACT_APP_SALMON_ENV=production npm run build"
  }
}
```

#### 3.2 Crear config-overrides.js

**Nuevo archivo:** `config-overrides.js` (raíz del proyecto)

```javascript
module.exports = function override(config, env) {
  if (env === 'production') {
    // Configuración de SplitChunks
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        // Framework core (React, React-DOM, React-Router)
        framework: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-router)[\\/]/,
          name: 'framework',
          priority: 30,
          enforce: true,
        },

        // UI Libraries (@mui, @emotion)
        ui: {
          test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
          name: 'ui-vendor',
          priority: 25,
          enforce: true,
        },

        // Solana (async - solo cuando se usa)
        solana: {
          test: /[\\/]node_modules[\\/](@solana|@coral-xyz|@metaplex-foundation)[\\/]/,
          name: 'solana-vendor',
          priority: 20,
          chunks: 'async',
          enforce: true,
        },

        // Ethereum (async - solo cuando se usa)
        ethereum: {
          test: /[\\/]node_modules[\\/](ethers|@ethersproject)[\\/]/,
          name: 'ethereum-vendor',
          priority: 20,
          chunks: 'async',
          enforce: true,
        },

        // Bitcoin (async - solo cuando se usa)
        bitcoin: {
          test: /[\\/]node_modules[\\/](bitcoinjs-lib|bip32|bip39|bitcore-lib)[\\/]/,
          name: 'bitcoin-vendor',
          priority: 20,
          chunks: 'async',
          enforce: true,
        },

        // NEAR (async - solo cuando se usa)
        near: {
          test: /[\\/]node_modules[\\/](near-api-js)[\\/]/,
          name: 'near-vendor',
          priority: 20,
          chunks: 'async',
          enforce: true,
        },

        // Otros vendors estables
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },

        // Commons (código compartido de la app)
        commons: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'commons',
        },
      },
    };

    // Runtime chunk separado
    config.optimization.runtimeChunk = 'single';

    // Minification mejorada
    config.optimization.minimize = true;
  }

  return config;
};
```

#### 3.3 Testing de Configuración

**Test inicial:**
```bash
# Verificar que no rompe desarrollo
yarn start:web:local

# Verificar que builds funcionan
yarn build:prod
```

Si hay errores, ajustar config-overrides.js

#### 3.4 Ajustar .gitignore (si es necesario)

```bash
# Agregar si config-overrides genera archivos temp
/config-overrides.*.js
```

### Testing Post-Fase 3

#### Testing Manual (30 min)

**1. Desarrollo sigue funcionando**
```bash
yarn start:web:local
```
- [ ] App carga correctamente
- [ ] Hot reload funciona
- [ ] No hay errores en consola

**2. Builds con nueva config**
```bash
yarn build:prod
```
- [ ] Build exitoso
- [ ] Revisar carpeta `build/static/js/`
- [ ] Verificar chunks generados

#### Bundle Analysis (20 min)

```bash
yarn analyze
```

**Verificar estructura de chunks:**
- [ ] `framework.chunk.js` - React, Router (~100-150 KB)
- [ ] `ui-vendor.chunk.js` - Material UI, Emotion (~80-100 KB)
- [ ] `vendors.chunk.js` - Otros vendors (~100-150 KB)
- [ ] `solana-vendor.chunk.js` - Solo en async chunks
- [ ] `ethereum-vendor.chunk.js` - Solo en async chunks
- [ ] `bitcoin-vendor.chunk.js` - Solo en async chunks
- [ ] `near-vendor.chunk.js` - Solo en async chunks
- [ ] `runtime.chunk.js` - Webpack runtime (~5 KB)
- [ ] `commons.chunk.js` - Código compartido
- [ ] Chunks de rutas (de Fase 1)
- [ ] Chunks de features (de Fase 2)

**Total esperado: 15-20 chunks**

**Screenshot y documentar**

#### Test de Caching (15 min)

```bash
# 1. Build
yarn build:prod

# 2. Servir
npx serve -s build -p 3000

# 3. Abrir Chrome DevTools → Network
# 4. Cargar app → ver chunks descargados
# 5. Recargar página (Cmd+R)
# 6. Verificar: framework, vendors, ui-vendor desde cache (disk cache)
```

- [ ] Chunks de vendor desde cache
- [ ] Solo chunks de ruta activa se descargan

#### Lighthouse Manual (20 min)

```bash
npx serve -s build -p 3000
```

- [ ] Lighthouse en homepage
- [ ] Comparar con Fase 2
- [ ] Verificar cache score mejorado

#### Builds Completos (10 min)

```bash
yarn build
yarn build:local
yarn build:develop
yarn build:main
yarn build:prod
```

- [ ] Todos exitosos
- [ ] Estructura de chunks similar en todos

### Documentar Resultados Fase 3

**Actualizar:** `docs/performance-budget.md`

```markdown
## Fase 3 Results (Fecha: ___)

### Chunk Structure
- framework: ___ KB
- ui-vendor: ___ KB
- vendors: ___ KB
- solana-vendor: ___ KB (async)
- ethereum-vendor: ___ KB (async)
- bitcoin-vendor: ___ KB (async)
- near-vendor: ___ KB (async)
- runtime: ___ KB
- commons: ___ KB
- Total chunks: ~15-20

### Benefits
✅ Better caching (vendors rarely change)
✅ Blockchain libs only loaded when needed
✅ Framework cached separately

### Lighthouse
- Performance: ___
- Cache score: Improved

### Issues
- [Anotar cualquier issue]
```

### Criterios de Éxito Fase 3
- ✅ react-app-rewired funcionando
- ✅ SplitChunks configurado correctamente
- ✅ 15-20 chunks generados (organizados)
- ✅ Framework chunk separado
- ✅ Blockchain vendors en chunks async
- ✅ Todos los builds exitosos
- ✅ Caching mejorado
- ✅ Resultados documentados

---

## 🔬 FASE 4: BLOCKCHAIN-SPECIFIC SPLITTING (5-6 días)

### Objetivos
- Cargar solo código de blockchain activa
- Reducir bundle para usuarios single-chain 40-60%
- Arquitectura escalable

### Tareas

#### 4.1 Analizar Estructura Actual del Adapter

**Ejecutar:**
```bash
yarn analyze:interactive
```

**Buscar en analyzer:**
- `src/adapter/services/solana/` - Todos los archivos
- `src/adapter/services/ethereum/` - Todos los archivos
- `src/adapter/services/bitcoin/` - Todos los archivos
- `src/adapter/services/near/` - Todos los archivos
- `src/adapter/services/eclipse/` - Todos los archivos

**Documentar:** `docs/blockchain-adapter-structure.md`
```markdown
# Blockchain Adapter Structure

## Current Imports (All Eager)
- Solana: ~___ KB total
- Ethereum: ~___ KB total
- Bitcoin: ~___ KB total
- NEAR: ~___ KB total
- Eclipse: ~___ KB total

## Total Overhead: ~___ KB

## Target: Load only active blockchain
- Usuario en Solana: Solo ~___ KB de Solana
- Usuario en Ethereum: Solo ~___ KB de Ethereum
```

#### 4.2 Refactorizar Adapter Index

**Archivo:** `src/adapter/index.js`

**Análisis del código actual:**
```bash
cat src/adapter/index.js
```

**Crear función de carga dinámica:**
```javascript
// Agregar al final del archivo

/**
 * Carga dinámicamente el adapter específico de blockchain
 * @param {string} blockchain - 'solana' | 'ethereum' | 'bitcoin' | 'near' | 'eclipse'
 * @returns {Promise<Object>} Módulo del adapter
 */
export const loadBlockchainAdapter = async (blockchain) => {
  const adapters = {
    solana: () => import(
      /* webpackChunkName: "adapter-solana" */
      './services/solana/SolanaAccount'
    ),
    ethereum: () => import(
      /* webpackChunkName: "adapter-ethereum" */
      './services/ethereum/EthereumAccount'
    ),
    bitcoin: () => import(
      /* webpackChunkName: "adapter-bitcoin" */
      './services/bitcoin/BitcoinAccount'
    ),
    near: () => import(
      /* webpackChunkName: "adapter-near" */
      './services/near/NearAccount'
    ),
    eclipse: () => import(
      /* webpackChunkName: "adapter-eclipse" */
      './services/eclipse/EclipseAccount'
    ),
  };

  if (!adapters[blockchain]) {
    throw new Error(`Unknown blockchain: ${blockchain}`);
  }

  return adapters[blockchain]();
};
```

#### 4.3 Refactorizar Account Factory

**Archivo:** `src/adapter/factories/network-account-factory.js`

**Analizar código actual y modificar para usar lazy loading:**

Cambiar de:
```javascript
const SolanaAccount = require('../services/solana/SolanaAccount');
const EthereumAccount = require('../services/ethereum/EthereumAccount');
// etc...
```

A:
```javascript
const { loadBlockchainAdapter } = require('../index');

// En la función que crea accounts
async function createAccount(blockchain, params) {
  const AccountClass = await loadBlockchainAdapter(blockchain);
  return new AccountClass.default(params);
}
```

**Nota:** Ajustar según la estructura actual del código

#### 4.4 Actualizar Componentes que Usan Adapter

**Buscar archivos que importan adapter:**
```bash
grep -r "from.*adapter" src/pages/ src/components/
```

**Para cada archivo encontrado:**
- Verificar si necesita lazy loading
- Si usa adapter directamente, considerar agregar loading state
- Documentar cambios necesarios

#### 4.5 Agregar Prefetch de Blockchain Seleccionada

**En componente de selección de blockchain:**

```javascript
const handleBlockchainSelect = async (blockchain) => {
  // Prefetch antes de navegar
  const { loadBlockchainAdapter } = await import('../adapter');
  loadBlockchainAdapter(blockchain); // Prefetch

  // Luego navegar o cambiar state
  setActiveBlockchain(blockchain);
};
```

### Testing Post-Fase 4

#### Testing Manual Exhaustivo (60-90 min)

**Para CADA blockchain (Solana, Ethereum, Bitcoin, NEAR, Eclipse):**

```bash
yarn start:web:local
```

**Solana:**
- [ ] Seleccionar red Solana
- [ ] Abrir DevTools → Network
- [ ] Verificar solo `adapter-solana.chunk.js` se descarga
- [ ] Verificar NO se descargan chunks de otras chains
- [ ] Crear/importar wallet Solana
- [ ] Enviar transacción
- [ ] Ver balance
- [ ] Ver NFTs (si aplica)
- [ ] Todas las features funcionan

**Ethereum:**
- [ ] Seleccionar red Ethereum
- [ ] Network tab: solo `adapter-ethereum.chunk.js`
- [ ] NO chunks de otras chains
- [ ] Todas las features funcionan

**Bitcoin:**
- [ ] Seleccionar red Bitcoin
- [ ] Network tab: solo `adapter-bitcoin.chunk.js`
- [ ] NO chunks de otras chains
- [ ] Todas las features funcionan

**NEAR:**
- [ ] Seleccionar red NEAR
- [ ] Network tab: solo `adapter-near.chunk.js`
- [ ] NO chunks de otras chains
- [ ] Todas las features funcionan

**Eclipse:**
- [ ] Seleccionar red Eclipse
- [ ] Network tab: solo `adapter-eclipse.chunk.js`
- [ ] NO chunks de otras chains
- [ ] Todas las features funcionan

**Multi-chain test:**
- [ ] Cambiar de Solana → Ethereum
- [ ] Verificar descarga de `adapter-ethereum.chunk.js`
- [ ] Cambiar de Ethereum → Bitcoin
- [ ] Verificar descarga de `adapter-bitcoin.chunk.js`
- [ ] Todas las transiciones suaves

#### Bundle Analysis (25 min)

```bash
yarn build:prod
yarn analyze
```

**Verificar:**
- [ ] 5 chunks nuevos de adapter:
  - `adapter-solana.chunk.js` (~300 KB)
  - `adapter-ethereum.chunk.js` (~200 KB)
  - `adapter-bitcoin.chunk.js` (~150 KB)
  - `adapter-near.chunk.js` (~180 KB)
  - `adapter-eclipse.chunk.js` (~250 KB)
- [ ] Estos chunks son **async** (no en main bundle)
- [ ] Main bundle NO aumentó

**Screenshot y documentar tamaños exactos**

#### Test de Usuario Single-Chain (20 min)

**Simular usuario que solo usa Solana:**

```bash
# 1. Build
yarn build:prod

# 2. Servir
npx serve -s build -p 3000

# 3. Chrome DevTools → Network → Clear → Disable cache
# 4. Cargar app
# 5. Seleccionar Solana
# 6. Usar features de Solana

# Verificar total descargado:
```

**Calcular:**
- Total JavaScript descargado: ___ KB
- vs Total si todas las chains: ___ KB
- **Ahorro: ___% para usuario single-chain**

Documentar en: `docs/performance-budget.md`

#### Lighthouse Manual (25 min)

```bash
npx serve -s build -p 3000
```

**Test por blockchain:**
- [ ] Lighthouse con Solana activa
- [ ] Lighthouse con Ethereum activa
- [ ] Comparar scores
- [ ] Verificar LCP mejorado

#### Builds (10 min)

```bash
yarn build
yarn build:local
yarn build:develop
yarn build:main
yarn build:prod
```

- [ ] Todos exitosos

### Documentar Resultados Fase 4

**Actualizar:** `docs/performance-budget.md`

```markdown
## Fase 4 Results (Fecha: ___)

### Blockchain Chunks
- adapter-solana: ___ KB
- adapter-ethereum: ___ KB
- adapter-bitcoin: ___ KB
- adapter-near: ___ KB
- adapter-eclipse: ___ KB

### User Impact
**Single-chain user (Solana):**
- Total downloaded: ___ KB
- Savings vs all-chains: ___% 🎉

**Multi-chain user:**
- All adapters available on-demand
- Seamless transitions

### Lighthouse
- Performance: ___
- LCP with single chain: ___ s

### Status
✅ Blockchain-specific loading working
✅ All chains tested individually
✅ Multi-chain switching works
✅ Significant savings for single-chain users
```

### Criterios de Éxito Fase 4
- ✅ 5 chunks de adapter generados
- ✅ Usuario single-chain descarga solo su blockchain
- ✅ Ahorro 40-60% para usuarios single-chain
- ✅ Todas las blockchains funcionan correctamente
- ✅ Multi-chain switching funciona
- ✅ Todos los builds exitosos
- ✅ Resultados documentados

---

## 🎯 FASE 5: ADVANCED OPTIMIZATION (4-5 días)

### Objetivos
- Implementar optimizaciones avanzadas
- Tree shaking mejorado
- Idle-time loading
- React 19 features

### Tareas

#### 5.1 Tree Shaking Audit

**Buscar imports problemáticos:**
```bash
# Buscar imports de lodash
grep -r "import.*lodash" src/

# Buscar imports de @solana/web3.js
grep -r "import.*@solana/web3.js" src/

# Buscar barrel imports
grep -r "from.*components'" src/
```

**Crear:** `docs/tree-shaking-audit.md`
```markdown
# Tree Shaking Audit

## Problematic Imports Found

### Lodash
- File: src/utils/formatters.js
- Import: `import _ from 'lodash'`
- Fix: Use specific imports

### Barrel Imports
- File: src/components/index.js
- Issue: Re-exports 50+ components
- Fix: Import directly

### Fix Checklist
- [ ] Replace lodash imports
- [ ] Fix barrel imports
- [ ] Verify package.json sideEffects
- [ ] Test after changes
```

**Aplicar fixes:**

```javascript
// ANTES - NO tree-shakeable
import _ from 'lodash';
const formatted = _.debounce(fn, 300);

// DESPUÉS - Tree-shakeable
import debounce from 'lodash-es/debounce';
const formatted = debounce(fn, 300);
```

```javascript
// ANTES - Barrel import
import { Button, Input, Modal } from './components';

// DESPUÉS - Direct import
import Button from './components/Button';
import Input from './components/Input';
import Modal from './components/Modal';
```

#### 5.2 Considerar Solana Web3.js v2.0 (Opcional)

**⚠️ ADVERTENCIA:** Cambio mayor, requiere refactoring extenso

**Investigar primero:**
```bash
# Ver breaking changes
npm view @solana/web3.js@2.0.0

# Revisar migration guide
# https://github.com/solana-labs/solana-web3.js
```

**Si decides migrar:**

1. **Backup:**
```bash
git checkout -b feature/solana-web3-v2
```

2. **Instalar:**
```bash
npm install @solana/web3.js@2.0.0
```

3. **Refactorizar:**
- Revisar TODOS los imports de `@solana/web3.js`
- Actualizar según migration guide
- Testing exhaustivo

4. **Testing especial:**
- Todas las features de Solana
- Transacciones
- Balance queries
- NFTs

**Beneficio esperado:** -70% en bundle de Solana

**Nota:** Solo hacer si hay tiempo y recursos

#### 5.3 Implementar useTransition (React 19)

**Para navegación entre blockchains:**

**Archivo:** Componente que maneja cambio de blockchain

```javascript
import { useTransition } from 'react';

function BlockchainSelector() {
  const [isPending, startTransition] = useTransition();
  const [activeChain, setActiveChain] = useState('solana');

  const handleChainChange = (newChain) => {
    startTransition(() => {
      // Non-blocking transition
      setActiveChain(newChain);
    });
  };

  return (
    <div>
      <select
        onChange={(e) => handleChainChange(e.target.value)}
        disabled={isPending}
      >
        <option value="solana">Solana</option>
        <option value="ethereum">Ethereum</option>
        {/* ... */}
      </select>

      {isPending && <span>Switching...</span>}
    </div>
  );
}
```

#### 5.4 Idle-time Loading

**Para features no críticas:**

**Nuevo archivo:** `src/utils/idleLoader.js`

```javascript
/**
 * Carga componentes durante idle time
 */
export const loadOnIdle = (loader) => {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        resolve(loader());
      });
    } else {
      // Fallback para navegadores sin requestIdleCallback
      setTimeout(() => {
        resolve(loader());
      }, 2000);
    }
  });
};
```

**Uso:**
```javascript
import { loadOnIdle } from '../utils/idleLoader';

// En un componente
useEffect(() => {
  loadOnIdle(() => import('./Analytics'))
    .then((module) => {
      // Inicializar analytics
    });

  loadOnIdle(() => import('./HelpWidget'))
    .then((module) => {
      // Mostrar help widget
    });
}, []);
```

**Features candidatas para idle loading:**
- Analytics
- Help/Chat widgets
- Non-critical integrations
- Easter eggs 😄

#### 5.5 Verificar package.json sideEffects

**Revisar:** `package.json`

```json
{
  "sideEffects": false
}
```

**Si no existe, agregarlo**

**Si tienes archivos con side effects (CSS, polyfills):**
```json
{
  "sideEffects": [
    "**/*.css",
    "./src/polyfills.js"
  ]
}
```

### Testing Post-Fase 5

#### Testing Manual (45 min)

**1. Tree shaking changes:**
```bash
yarn start:web:local
```
- [ ] App funciona después de cambios
- [ ] No hay errores de imports
- [ ] Funcionalidad intacta

**2. useTransition:**
- [ ] Cambiar entre blockchains
- [ ] Verificar transiciones suaves
- [ ] UI no se congela
- [ ] Loading indicator se muestra

**3. Idle-time loading:**
```bash
# DevTools → Performance tab
# Record → Stop → Analizar timeline
```
- [ ] Features idle se cargan después de 2-3 segundos
- [ ] No afectan initial load
- [ ] Main thread libre durante idle load

**4. Solana v2.0 (si se hizo):**
- [ ] Testing exhaustivo de TODAS las features Solana
- [ ] Comparación side-by-side con versión anterior
- [ ] Rollback plan listo si hay problemas

#### Bundle Analysis (20 min)

```bash
yarn build:prod
yarn analyze
```

**Verificar:**
- [ ] Bundle total reducido vs Fase 4
- [ ] Tree shaking efectivo (lodash, etc)
- [ ] Si migró Solana v2: `solana-vendor` -70%

#### Lighthouse Manual (20 min)

```bash
npx serve -s build -p 3000
```

- [ ] Lighthouse score final
- [ ] LCP < 2.0s
- [ ] INP < 150ms
- [ ] Performance > 85

#### Builds (10 min)

```bash
yarn build
yarn build:local
yarn build:develop
yarn build:main
yarn build:prod
```

- [ ] Todos exitosos

### Documentar Resultados Fase 5

**Actualizar:** `docs/performance-budget.md`

```markdown
## Fase 5 Results (Fecha: ___)

### Optimizations Applied
- [x] Tree shaking audit completed
- [x] Lodash imports fixed
- [x] Barrel imports removed
- [x] useTransition implemented
- [x] Idle-time loading for non-critical features
- [ ] Solana Web3.js v2.0 (optional)

### Bundle Impact
- Tree shaking savings: ~___ KB
- Solana v2 savings: ~___ KB (if done)
- Total bundle: ___ KB

### Performance
- Lighthouse: ___
- LCP: ___ s
- INP: ___ ms
- Perceived performance: Excellent

### User Experience
✅ Smooth transitions between chains
✅ Non-critical features don't block
✅ Overall faster experience
```

### Criterios de Éxito Fase 5
- ✅ Tree shaking optimizado
- ✅ useTransition implementado
- ✅ Idle-time loading funcionando
- ✅ Bundle reducido adicional 5-10%
- ✅ UX mejorada significativamente
- ✅ Todos los builds exitosos
- ✅ Resultados documentados

---

## 🧪 FASE 6: TESTING FINAL & DOCUMENTATION (3-4 días)

### Objetivos
- Testing comprehensivo de todas las optimizaciones
- Documentación completa
- Comparación final con baseline

### Tareas

#### 6.1 Testing Comprehensivo Manual

**Crear:** `docs/final-testing-checklist.md`

```markdown
# Final Testing Checklist

## Functional Testing

### Blockchains
- [ ] Solana: Create wallet, send tx, view balance, NFTs
- [ ] Ethereum: Create wallet, send tx, view balance
- [ ] Bitcoin: Create wallet, send tx, view balance
- [ ] NEAR: Create wallet, send tx, view balance
- [ ] Eclipse: Create wallet, send tx, view balance

### Features
- [ ] Wallet creation
- [ ] Import wallet
- [ ] Send tokens
- [ ] Receive tokens
- [ ] View transaction history
- [ ] Swap tokens
- [ ] View NFTs/Collectibles
- [ ] Settings

### Navigation
- [ ] All routes load correctly
- [ ] Back/forward navigation works
- [ ] Deep links work
- [ ] Refresh on any page works

### Loading States
- [ ] Route loading screens appear
- [ ] Feature loading screens appear
- [ ] Blockchain adapter loading works
- [ ] Error boundaries catch errors

### Performance
- [ ] App feels fast
- [ ] No jank during navigation
- [ ] Smooth transitions
- [ ] Responsive UI

## Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

## Device Testing (if web)
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Build Testing
- [ ] yarn build
- [ ] yarn build:local
- [ ] yarn build:develop
- [ ] yarn build:main
- [ ] yarn build:prod
- [ ] Extension build (if applicable)

## Performance Testing
- [ ] Lighthouse (all critical routes)
- [ ] Bundle analysis
- [ ] Network throttling (Fast 3G)
- [ ] Memory leaks check

## Edge Cases
- [ ] Offline behavior
- [ ] Slow network
- [ ] Failed chunk loading
- [ ] Blockchain network errors
- [ ] Invalid transactions

## Security
- [ ] No sensitive data in bundles
- [ ] Source maps disabled in prod
- [ ] No console.logs in prod
- [ ] HTTPS only

## Regression Testing
- [ ] All features work as before
- [ ] No new bugs introduced
- [ ] Performance improved, not degraded
```

**Ejecutar TODA la checklist** (2-3 días)

Marcar ✅ cada item completado

#### 6.2 Documentación Final

**Crear/Actualizar archivos:**

**1. docs/optimization-summary.md**
```markdown
# Bundle Optimization Summary

## Overview
This document summarizes the bundle size optimization project for Salmon Wallet V2, completed in [Month Year].

## Results

### Bundle Size
| Metric | Baseline | Final | Improvement |
|--------|----------|-------|-------------|
| Main bundle | 1290 KB | ___ KB | -___% |
| Total initial | 1290 KB | ___ KB | -___% |
| Number of chunks | 4 | ___ | ___ |

### Lighthouse Scores
| Metric | Baseline | Final | Improvement |
|--------|----------|-------|-------------|
| Performance | ~50-60 | ___ | +___ |
| LCP | ~4-6s | ___ s | -___ s |
| INP | ~400ms | ___ ms | -___ ms |
| CLS | ~0.1 | ___ | -___ |

### User Impact
- **Single-chain users:** -___% bundle size
- **Multi-chain users:** Chunks loaded on-demand
- **Perceived performance:** Significantly improved

## Phases Completed

### Phase 1: Route-based Code Splitting
- Lazy loaded main routes (Wallet, Token, Adapter)
- Added Suspense boundaries
- Implemented error handling
- **Result:** -40-50% initial bundle

### Phase 2: Feature-based Code Splitting
- Lazy loaded optional features (NFTs, Swap, Exchange)
- Per-feature loading states
- Prefetch hints added
- **Result:** -10-15% additional

### Phase 3: Webpack Optimization
- react-app-rewired setup
- Advanced SplitChunks configuration
- Vendor separation (framework, UI, blockchain)
- Runtime chunk optimization
- **Result:** Better caching, organized chunks

### Phase 4: Blockchain-specific Splitting
- Dynamic loading of blockchain adapters
- User loads only active blockchain
- Seamless multi-chain switching
- **Result:** -40-60% for single-chain users

### Phase 5: Advanced Optimization
- Tree shaking audit and fixes
- useTransition for smooth navigation
- Idle-time loading for non-critical features
- Package optimization
- **Result:** Additional 5-10% reduction

### Phase 6: Testing & Documentation
- Comprehensive manual testing
- Cross-browser validation
- Performance verification
- Complete documentation

## Architecture Changes

### Before
- All code loaded upfront
- Single 1.29 MB bundle
- All blockchains always loaded
- No code splitting

### After
- Route-based splitting
- Feature-based splitting
- Blockchain-specific splitting
- 15-25 organized chunks
- Smart prefetching
- Optimized vendor splitting

## Maintenance

### Adding New Features
- Use lazy loading for optional features
- Follow patterns in `docs/code-splitting-guide.md`
- Test bundle impact with `yarn analyze`

### Adding New Blockchains
- Add to `src/adapter/index.js` loadBlockchainAdapter
- Create adapter chunk in config-overrides.js
- Test lazy loading works
- Update documentation

### Monitoring
- Run `yarn analyze` before major releases
- Check bundle size in build output
- Run Lighthouse manually on key releases
- Compare against budgets in docs/performance-budget.md

## Tools Used
- webpack-bundle-analyzer
- Lighthouse (Chrome DevTools)
- React.lazy + Suspense
- react-app-rewired
- Manual testing

## Team Notes
- Keep config-overrides.js updated
- Don't add heavy dependencies without review
- Always test bundle impact of new features
- Maintain documentation
```

**2. docs/code-splitting-guide.md**
```markdown
# Code Splitting Guide for Developers

## When to Use Code Splitting

### DO split:
- Routes/Pages (always)
- Optional features (NFTs, Swap, etc)
- Blockchain-specific code
- Admin/Settings panels
- Components > 50 KB

### DON'T split:
- Critical UI (header, navigation)
- Small components (< 10 KB)
- Code used on every page
- Authentication logic

## How to Split

### Route Splitting
```javascript
import { lazy } from 'react';

const MyPage = lazy(() => import('./MyPage'));
```

### Feature Splitting
```javascript
import { lazy, Suspense } from 'react';

const HeavyFeature = lazy(() => import('./HeavyFeature'));

function MyComponent() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyFeature />
    </Suspense>
  );
}
```

### With Prefetch
```javascript
const MyFeature = lazy(() => import(
  /* webpackChunkName: "my-feature" */
  /* webpackPrefetch: true */
  './MyFeature'
));
```

## Testing Your Changes

1. Before changes:
```bash
yarn analyze
# Note bundle size
```

2. After changes:
```bash
yarn analyze
# Compare bundle size
# Verify new chunks created
```

3. Manual testing:
```bash
yarn start:web:local
# Test feature works
# Check Network tab for chunk loading
```

4. Build testing:
```bash
yarn build:prod
# Verify builds successfully
```

## Common Issues

### Issue: Chunk not loading
**Solution:** Check network tab for errors, verify import path

### Issue: Loading state flickers
**Solution:** Add minimum delay to Suspense fallback

### Issue: Bundle size increased
**Solution:** Check for duplicate dependencies in analyzer

## Best Practices
- Always wrap lazy components in Suspense
- Add error boundaries for lazy components
- Use meaningful chunk names
- Test on slow networks (throttling)
- Document your changes
```

**3. docs/performance-best-practices.md**
```markdown
# Performance Best Practices

## Bundle Size
- Keep initial bundle < 200 KB (gzipped)
- Use code splitting for routes and features
- Monitor bundle size with yarn analyze
- Review new dependencies before adding

## Loading Strategy
- Critical resources: Load synchronously
- Optional features: Lazy load
- Future routes: Prefetch
- Blockchain adapters: Load on-demand

## Caching
- Framework chunks change rarely (long cache)
- Feature chunks change occasionally (medium cache)
- Main bundle changes often (short cache)

## Images & Assets
- Optimize images before adding
- Use appropriate formats (WebP, AVIF)
- Lazy load images below fold
- Use responsive images

## Third-party Scripts
- Load analytics in idle time
- Defer non-critical scripts
- Avoid render-blocking scripts

## Monitoring
- Run Lighthouse quarterly
- Check bundle size monthly
- Monitor Core Web Vitals
- Test on slow networks

## Before Production
- [ ] Lighthouse score > 85
- [ ] Bundle size within budget
- [ ] All lazy chunks loading
- [ ] No console errors
- [ ] Tested on multiple browsers
```

#### 6.3 Final Bundle Analysis

```bash
# Generar análisis final
yarn build:prod
yarn analyze

# Capturar screenshot del bundle-report.html
# Guardar en docs/final-bundle-report.png
```

#### 6.4 Final Lighthouse Tests

```bash
npx serve -s build -p 3000

# En Chrome DevTools → Lighthouse
# Ejecutar en TODAS las rutas críticas:
# - Homepage
# - /onboarding
# - /wallet
# - /adapter

# Capturar screenshots de todos
# Guardar en docs/lighthouse-reports/final/
```

#### 6.5 Comparación Final con Baseline

**Crear:** `docs/before-after-comparison.md`

```markdown
# Before & After Comparison

## Bundle Size

### Before (Baseline)
![Baseline Bundle](./lighthouse-reports/baseline/bundle-report.png)
- Main bundle: 1290 KB
- Total: 1290 KB
- Chunks: 4

### After (Final)
![Final Bundle](./final-bundle-report.png)
- Main bundle: ___ KB
- Total initial: ___ KB
- Total chunks: ___
- **Improvement: -___%**

## Lighthouse Scores

### Before
![Baseline Lighthouse](./lighthouse-reports/baseline/lighthouse.png)
- Performance: ~50-60
- LCP: ~4-6s
- INP: ~400ms

### After
![Final Lighthouse](./lighthouse-reports/final/lighthouse.png)
- Performance: ___
- LCP: ___ s
- INP: ___ ms
- **Improvement: +___ points**

## User Experience

### Before
- Slow initial load (6-14s on 3G)
- All blockchains loaded upfront
- Large bundle download
- Poor Lighthouse score

### After
- Fast initial load (___s on 3G)
- Only active blockchain loaded
- Optimized bundle size
- Excellent Lighthouse score
- Smooth navigation
- Better perceived performance

## Technical Improvements
- [x] Route-based code splitting
- [x] Feature-based code splitting
- [x] Blockchain-specific splitting
- [x] Webpack optimization
- [x] Tree shaking
- [x] Idle-time loading
- [x] Advanced caching strategy

## Business Impact
- ⬆️ Faster time-to-interactive
- ⬇️ Bounce rate (expected)
- ⬆️ User satisfaction
- ⬇️ Bandwidth costs
- ⬆️ SEO ranking (better performance)
```

#### 6.6 README Update

**Actualizar:** `README.md`

Agregar sección de Performance:

```markdown
## 🚀 Performance

This app is highly optimized for performance:

- **Code Splitting:** Routes and features load on-demand
- **Blockchain-specific Loading:** Only your active blockchain is loaded
- **Lighthouse Score:** 90+ on Performance
- **Bundle Size:** < 400 KB initial load (gzipped)

### For Developers
- See `docs/code-splitting-guide.md` for adding features
- Run `yarn analyze` to check bundle impact
- Follow `docs/performance-best-practices.md`

### Monitoring
- Bundle analysis: `yarn analyze`
- Interactive mode: `yarn analyze:interactive`
```

### Testing Post-Fase 6

#### Final Validation (60 min)

**1. Checklist completion:**
- [ ] `docs/final-testing-checklist.md` 100% completado

**2. Documentation review:**
- [ ] Todos los docs creados/actualizados
- [ ] Screenshots capturados
- [ ] Comparaciones documentadas
- [ ] README actualizado

**3. Builds finales:**
```bash
yarn build
yarn build:local
yarn build:develop
yarn build:main
yarn build:prod
```
- [ ] Todos exitosos sin warnings

**4. Final smoke test:**
- [ ] Producción build funciona perfectamente
- [ ] Todas las features funcionan
- [ ] Performance excelente

### Documentación Final Checklist

- [ ] docs/performance-baseline.md
- [ ] docs/performance-budget.md
- [ ] docs/lighthouse-manual-testing.md
- [ ] docs/optimization-summary.md
- [ ] docs/code-splitting-guide.md
- [ ] docs/performance-best-practices.md
- [ ] docs/before-after-comparison.md
- [ ] docs/final-testing-checklist.md
- [ ] README.md actualizado
- [ ] Screenshots en docs/

### Criterios de Éxito Fase 6
- ✅ Testing comprehensivo completado
- ✅ Documentación completa
- ✅ Comparación baseline vs final documentada
- ✅ README actualizado
- ✅ Todos los builds exitosos
- ✅ Proyecto completo y mantenible

---

## 📊 MÉTRICAS DE ÉXITO FINALES

### Bundle Size Targets

| Métrica | Baseline | Target | ¿Alcanzado? |
|---------|----------|--------|-------------|
| Main bundle | 1290 KB | < 150 KB | ___ |
| Total initial | 1290 KB | < 400 KB | ___ |
| Solana vendor | ~500 KB | < 200 KB | ___ |
| Ethereum vendor | ~300 KB | < 200 KB | ___ |

### Performance Targets

| Métrica | Baseline | Target | ¿Alcanzado? |
|---------|----------|--------|-------------|
| Lighthouse Perf | 50-60 | > 90 | ___ |
| LCP | 4-6s | < 2.0s | ___ |
| INP | 400ms | < 150ms | ___ |
| CLS | 0.1 | < 0.05 | ___ |

### User Experience

| Métrica | Target | ¿Alcanzado? |
|---------|--------|-------------|
| Time to Interactive | < 3s | ___ |
| Single-chain savings | -40-60% | ___ |
| Smooth navigation | ✅ | ___ |
| Error handling | ✅ | ___ |

---

## ⏱️ TIMELINE

- **Fase 0:** 2-3 días ✅
- **Fase 1:** 3-4 días ⏳
- **Fase 2:** 3-4 días ⏳
- **Fase 3:** 4-5 días ⏳
- **Fase 4:** 5-6 días ⏳
- **Fase 5:** 4-5 días ⏳
- **Fase 6:** 3-4 días ⏳

**TOTAL:** 24-31 días (~5-6 semanas)

---

## 🎉 PROYECTO COMPLETO

Al finalizar la Fase 6:

✅ Bundle size optimizado al máximo
✅ Lighthouse scores excelentes
✅ Testing comprehensivo completado
✅ Documentación completa
✅ Código mantenible
✅ Proceso repetible para futuras optimizaciones

**¡Felicitaciones! 🎊**

---

**Fecha de creación:** Noviembre 2025
**Última actualización:** ___
**Versión:** 1.0 - Manual Testing (Sin CI/CD)
