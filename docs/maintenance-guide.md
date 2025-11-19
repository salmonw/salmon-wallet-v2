# Guía de Mantenimiento - Bundle Optimization
## Salmon Wallet V2

**Para futuros desarrolladores**

Esta guía explica cómo mantener y extender la optimización de bundle size implementada en el proyecto.

---

## Tabla de Contenidos

1. [Agregar Nueva Ruta Lazy](#agregar-nueva-ruta-lazy)
2. [Agregar Nueva Blockchain](#agregar-nueva-blockchain)
3. [Agregar Nueva Dependencia](#agregar-nueva-dependencia)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Monitoreo Continuo](#monitoreo-continuo)
6. [Troubleshooting](#troubleshooting)

---

## Agregar Nueva Ruta Lazy

### 1. Crear la página componente

```javascript
// src/pages/NewFeature/NewFeaturePage.js
import React from 'react';

const NewFeaturePage = ({ cfgs }) => {
  return (
    <div>
      <h1>Nueva Funcionalidad</h1>
    </div>
  );
};

export default NewFeaturePage;
```

### 2. Agregar lazy loading en routes

**En `src/routes/app-routes.js`:**

```javascript
import { lazy } from 'react';

// Agregar lazy import
const NewFeaturePage = lazy(() => import('../pages/NewFeature/NewFeaturePage'));

// Agregar a routes array
export const routes = [
  // ... otras rutas
  {
    key: ROUTES_MAP.NEW_FEATURE,
    name: 'NewFeature',
    path: 'new-feature',
    route: '/new-feature',
    Component: NewFeaturePage,
  },
];
```

### 3. Agregar route key en constants

**En `src/routes/routes-map.js` (o donde estén las constantes):**

```javascript
export const ROUTES_MAP = {
  // ... otras rutas
  NEW_FEATURE: 'new-feature',
};
```

### 4. Build y verificar

```bash
yarn build
```

**Verificar en output:**
```
File sizes after gzip:
  ...
  X.XX kB  build/static/js/src_pages_NewFeature_NewFeaturePage_js.chunk.js
```

✅ **Éxito:** Si ves el chunk lazy generado con el nombre de tu página.

---

## Agregar Nueva Blockchain

### 1. Crear adapter factory

**Crear archivo: `src/adapter/factories/new-blockchain-account-factory.js`**

```javascript
'use strict';

const create = async ({ network, mnemonic, index }) => {
  // Importar SDK dinámicamente (opcional pero recomendado)
  const SDK = await import('new-blockchain-sdk');

  // Lógica de creación de cuenta
  const account = SDK.createAccount({
    mnemonic,
    index,
    network: network.environment,
  });

  return {
    index,
    network,
    publicKey: account.publicKey,
    // ... otros métodos del adapter
  };
};

module.exports = { create };
```

### 2. Agregar a network-account-factory.js

**En `src/adapter/factories/network-account-factory.js`:**

```javascript
const {
  BITCOIN,
  SOLANA,
  NEW_BLOCKCHAIN, // Agregar constante
} = require('../constants/blockchains');

const create = async ({ network, mnemonic, index = 0 }) => {
  switch (network.blockchain) {
    case BITCOIN: {
      const { create: createBitcoin } = await import('./bitcoin-account-factory');
      return createBitcoin({ network, mnemonic, index });
    }
    case SOLANA: {
      const { create: createSolana } = await import('./solana-account-factory');
      return createSolana({ network, mnemonic, index });
    }
    case NEW_BLOCKCHAIN: {
      // Agregar case con dynamic import
      const { create: createNew } = await import('./new-blockchain-account-factory');
      return createNew({ network, mnemonic, index });
    }
    default:
      return null;
  }
};
```

### 3. Agregar cacheGroup en webpack config

**En `config-overrides.js`:**

```javascript
module.exports = function override(config, env) {
  if (env === 'production') {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // ... otros cacheGroups

          // Agregar nuevo cacheGroup
          newBlockchainAdapter: {
            test: /[\\/]src[\\/]adapter[\\/](services|factories)[\\/]new-blockchain[\\/]/,
            name: 'new-blockchain-adapter',
            priority: 43, // Mayor que defaultVendors (10)
            reuseExistingChunk: true,
          },
        },
      },
    };
  }
  return config;
};
```

### 4. Build y verificar

```bash
yarn build
```

**Verificar en output:**
```
File sizes after gzip:
  ...
  X.XX kB  build/static/js/new-blockchain-adapter.chunk.js
```

✅ **Éxito:** Si ves el chunk del adapter generado correctamente.

---

## Agregar Nueva Dependencia

### Antes de instalar

**Pregúntate:**
1. ¿Realmente necesito esta librería?
2. ¿Hay una alternativa más liviana?
3. ¿Cuál es el tamaño de la librería?
4. ¿Soporta tree-shaking?

**Verificar tamaño:**
```bash
# Usar bundlephobia
open https://bundlephobia.com/package/nombre-libreria
```

### Guías por tipo de dependencia

#### Utilities (como lodash)
✅ **Preferir:** Versiones tree-shakeable
❌ **Evitar:** Versiones que importan todo

**Ejemplo bueno:**
```javascript
// lodash-es (tree-shakeable)
import get from 'lodash-es/get';
import isNil from 'lodash-es/isNil';
```

**Ejemplo malo:**
```javascript
// lodash completo (no tree-shakeable)
import { get, isNil } from 'lodash';
```

#### Date/Time (como moment)
✅ **Preferir:** date-fns, dayjs
❌ **Evitar:** moment (muy pesada, en maintenance mode)

**Ejemplo bueno:**
```javascript
import { format, fromUnixTime } from 'date-fns';
```

**Ejemplo malo:**
```javascript
import moment from 'moment';
```

#### UI Components
✅ **Preferir:** Imports específicos
❌ **Evitar:** Imports generales

**Ejemplo bueno:**
```javascript
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
```

**Ejemplo malo:**
```javascript
import { Button, TextField } from '@mui/material';
```

### Después de instalar

1. **Build y analizar:**
```bash
yarn build && yarn analyze
```

2. **Verificar aumento:**
- ¿El bundle creció más de 50 KB?
- ¿Se agregó un nuevo vendor chunk?
- ¿Afecta el bundle inicial?

3. **Si el bundle creció mucho:**
- Considerar lazy loading de la feature que usa la librería
- Buscar alternativa más liviana
- Evaluar si realmente es necesaria

---

## Mejores Prácticas

### 1. Siempre Lazy Load Rutas Nuevas

**Excepto** la ruta default (Onboarding), todas las rutas deben ser lazy.

```javascript
// ✅ BUENO
const NewPage = lazy(() => import('../pages/NewPage'));

// ❌ MALO (solo para default route)
import NewPage from '../pages/NewPage';
```

### 2. Lazy Load Features Grandes

**Regla de oro:** Si la feature tiene > 200 líneas, considerar lazy loading.

**Ejemplo:**
```javascript
// En WalletPage.js
const ExpensiveChart = lazy(() => import('./components/ExpensiveChart'));

// Usar con Suspense
<Suspense fallback={<Skeleton />}>
  <ExpensiveChart data={data} />
</Suspense>
```

### 3. Usar lodash-es en Lugar de lodash

**Siempre usar:**
```javascript
import get from 'lodash-es/get';
```

**No usar:**
```javascript
import { get } from 'lodash';
```

### 4. Usar date-fns en Lugar de moment

**Siempre usar:**
```javascript
import { format, fromUnixTime } from 'date-fns';
```

**No usar:**
```javascript
import moment from 'moment';
```

### 5. Verificar Bundle Después de Cambios Grandes

```bash
# Antes del PR
yarn build && yarn analyze
```

**Revisar:**
- ¿Main bundle < 200 KB?
- ¿Nuevos chunks lazy están separados?
- ¿No hay duplicación de código?

### 6. Imports Específicos para UI Libraries

```javascript
// ✅ BUENO
import Button from '@mui/material/Button';

// ❌ MALO
import { Button } from '@mui/material';
```

### 7. Evitar Barrel Imports

```javascript
// ❌ MALO (importa todo el módulo)
import * as utils from './utils';

// ✅ BUENO (importa solo lo necesario)
import { formatDate, parseDate } from './utils';
```

---

## Monitoreo Continuo

### Ejecutar Mensualmente

```bash
yarn analyze
```

### Verificar

**Bundle Size:**
- [ ] Main bundle < 200 KB
- [ ] Total inicial < 1.3 MB
- [ ] No hay chunks individuales > 50 KB (lazy)

**Chunks:**
- [ ] Nuevos chunks lazy están separados
- [ ] Vendors chunks no crecieron significativamente
- [ ] No hay duplicación de código entre chunks

**Dependencias:**
- [ ] No hay librerías obsoletas (usar `yarn outdated`)
- [ ] No hay duplicados (mismo package, versiones diferentes)

### Alertas a Configurar

1. **Main bundle > 200 KB:**
   - Revisar qué se agregó
   - Considerar lazy loading
   - Verificar tree-shaking

2. **Total inicial > 1.4 MB:**
   - Revisar vendors chunks
   - Verificar dependencias nuevas
   - Considerar alternativas más livianas

3. **Nuevo chunk lazy > 100 KB:**
   - Dividir en chunks más pequeños
   - Lazy load sub-componentes
   - Verificar imports

---

## Troubleshooting

### Problema: Build falla después de agregar lazy loading

**Error típico:**
```
Module not found: Can't resolve '../pages/NewPage'
```

**Solución:**
1. Verificar que el path sea correcto
2. Verificar que el archivo exporte default
3. Asegurar que Suspense wrapper exista

### Problema: Chunk no se genera como lazy

**Síntoma:**
```
# No aparece en build output:
# src_pages_NewPage_js.chunk.js
```

**Solución:**
1. Verificar que usas `React.lazy()` o `lazy()`
2. Verificar que el import sea dinámico: `lazy(() => import(...))`
3. No usar `require()` dentro de lazy (usar `import()`)

### Problema: Bundle creció después de cambios

**Pasos:**
1. Ejecutar `yarn analyze`
2. Identificar qué chunk creció
3. Buscar en el treemap qué librería se agregó
4. Decidir:
   - Lazy load la feature que usa la librería
   - Buscar alternativa más liviana
   - Remover si no es esencial

### Problema: Lazy chunk se carga pero no muestra contenido

**Síntomas:**
- Chunk se descarga en Network tab
- Página queda en blanco
- No hay errores en consola

**Solución:**
1. Verificar que Suspense wrapper tenga fallback
2. Verificar que el componente lazy exporte default
3. Revisar que no haya errores de imports dentro del componente

### Problema: Dynamic import no funciona en adapter

**Error típico:**
```
SyntaxError: Cannot use import statement outside a module
```

**Solución:**
Para archivos que usan `module.exports` (CommonJS):
```javascript
// ✅ FUNCIONA
const { create } = await import('./adapter');

// ❌ NO FUNCIONA
import { create } from './adapter';
```

---

## Checklist de PR

Antes de mergear un PR con cambios significativos:

- [ ] `yarn build` compila sin errores
- [ ] `yarn analyze` ejecutado y revisado
- [ ] Main bundle < 200 KB
- [ ] Si agregaste ruta nueva, es lazy
- [ ] Si agregaste dependencia, es tree-shakeable
- [ ] No hay imports de `lodash` (usar `lodash-es`)
- [ ] No hay imports de `moment` (usar `date-fns`)
- [ ] Imports de UI son específicos (no `{ }` de barrels)
- [ ] Bundle no creció > 50 KB sin justificación
- [ ] Lazy chunks nuevos están separados correctamente

---

## Recursos Útiles

### Herramientas
- **Bundle Analyzer:** `yarn analyze`
- **Bundlephobia:** https://bundlephobia.com
- **Webpack Docs:** https://webpack.js.org/guides/code-splitting/
- **React Lazy:** https://react.dev/reference/react/lazy

### Comandos Útiles

```bash
# Build y analizar
yarn build && yarn analyze

# Ver dependencias outdated
yarn outdated

# Ver duplicados de packages
yarn why <package-name>

# Limpiar y rebuild
rm -rf node_modules build && yarn && yarn build
```

---

## Contacto y Soporte

Si tienes dudas sobre:
- Cómo implementar lazy loading en un caso específico
- Cómo optimizar una nueva feature
- Por qué el bundle creció después de un cambio

Revisa:
1. Esta guía de mantenimiento
2. Los reportes de fases (docs/fase1-report.md, etc.)
3. El resumen final (docs/optimization-final-summary.md)

---

**Última actualización:** 2025-11-19
**Versión del proyecto:** Post Fase 5
