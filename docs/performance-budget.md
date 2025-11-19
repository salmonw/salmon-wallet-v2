# Performance Budget - Salmon Wallet V2

**Fecha de creación:** 2025-11-19
**Versión:** Post-optimización Fase 5

Este documento define los límites recomendados para bundle size y performance metrics del proyecto. Estos límites aseguran una experiencia de usuario óptima y evitan regresiones.

---

## Tabla de Contenidos

1. [Bundle Size Budgets](#bundle-size-budgets)
2. [Lighthouse Score Budgets](#lighthouse-score-budgets)
3. [Chunk Budgets](#chunk-budgets)
4. [Load Time Budgets](#load-time-budgets)
5. [Qué Hacer Si Se Exceden](#qué-hacer-si-se-exceden)
6. [Monitoreo y Alertas](#monitoreo-y-alertas)

---

## Bundle Size Budgets

### Límites Recomendados (gzipped)

| Métrica | Límite | Actual | Estado |
|---------|--------|--------|--------|
| **Main bundle** | < 200 KB | 176.78 KB | ✅ Dentro |
| **Total inicial** | < 1.3 MB | ~1.24 MB | ✅ Dentro |
| **Utils chunk** | < 60 KB | 49.05 KB | ✅ Dentro |
| **Vendors chunk** | < 500 KB | 480.91 KB | ✅ Dentro |
| **Crypto vendors** | < 250 KB | 215.73 KB | ✅ Dentro |
| **Lazy chunks individuales** | < 50 KB | ~5 KB max | ✅ Dentro |

### Explicación de Límites

**Main bundle (< 200 KB):**
- Contiene el código core de la aplicación
- Se descarga en cada visita (no se cachea como vendors)
- Afecta directamente el tiempo de carga inicial
- Límite basado en 3G connection (~600 KB/s)

**Total inicial (< 1.3 MB):**
- Suma de todos los chunks que se cargan al inicio
- Incluye main + vendors + runtime
- Afecta el Time to Interactive (TTI)
- Límite basado en conexión 3G para TTI < 5s

**Lazy chunks individuales (< 50 KB):**
- Chunks que se cargan on-demand
- Deben ser pequeños para carga rápida cuando se necesitan
- Ideal: < 20 KB para carga instantánea

---

## Lighthouse Score Budgets

### Límites Recomendados

| Métrica | Mínimo Aceptable | Objetivo | Actual (Estimado) |
|---------|------------------|----------|-------------------|
| **Performance** | 80 | > 85 | ~90 |
| **LCP** | < 3.5s | < 2.5s | ~2s |
| **INP** | < 300ms | < 200ms | ~150ms |
| **CLS** | < 0.15 | < 0.1 | ~0.05 |
| **FCP** | < 2.5s | < 1.8s | ~1.5s |
| **TBT** | < 400ms | < 200ms | ~100ms |

### Explicación de Métricas

**Performance Score:**
- Medida general de performance de 0 a 100
- Basada en LCP, INP, CLS, FCP, TBT
- > 85 es "bueno", > 50 es "mejoras necesarias", < 50 es "malo"

**LCP (Largest Contentful Paint):**
- Tiempo hasta que el contenido principal es visible
- < 2.5s es "bueno", 2.5s-4s es "mejoras necesarias", > 4s es "malo"
- Afectado por bundle size y recursos de imagen

**INP (Interaction to Next Paint):**
- Tiempo de respuesta a interacciones del usuario
- < 200ms es "bueno", 200-500ms es "mejoras necesarias", > 500ms es "malo"
- Afectado por JavaScript bloqueante

**CLS (Cumulative Layout Shift):**
- Estabilidad visual durante la carga
- < 0.1 es "bueno", 0.1-0.25 es "mejoras necesarias", > 0.25 es "malo"
- Afectado por elementos sin tamaño definido

**FCP (First Contentful Paint):**
- Tiempo hasta que aparece el primer contenido
- < 1.8s es "bueno", 1.8s-3s es "mejoras necesarias", > 3s es "malo"

**TBT (Total Blocking Time):**
- Tiempo total que el main thread está bloqueado
- < 200ms es "bueno", 200-600ms es "mejoras necesarias", > 600ms es "malo"

---

## Chunk Budgets

### Vendor Chunks

| Chunk | Límite | Actual | Propósito |
|-------|--------|--------|-----------|
| **vendors.js** | < 500 KB | 480.91 KB | Librerías generales |
| **crypto-vendors.js** | < 250 KB | 215.73 KB | Ethers, Bitcoin, NEAR |
| **solana.js** | < 120 KB | 102.92 KB | Solana SDK |
| **mui.js** | < 80 KB | 75.39 KB | Material-UI |
| **react-vendors.js** | < 80 KB | 73.48 KB | React core |
| **utils.js** | < 60 KB | 49.05 KB | Utilidades (lodash-es, date-fns) |
| **react-native.js** | < 60 KB | 48.86 KB | React Native Web |

### Lazy Chunks

| Tipo | Límite por Chunk | Límite Total |
|------|------------------|--------------|
| **Blockchain adapters** | < 10 KB | < 30 KB |
| **Page routes** | < 5 KB | < 20 KB |
| **Sub-sections** | < 3 KB | < 15 KB |
| **Otros** | < 2 KB | < 10 KB |

### Total de Chunks

| Métrica | Límite | Actual |
|---------|--------|--------|
| **Total chunks** | Ilimitado | 26 |
| **Lazy chunks** | Ilimitado | 13 |
| **Initial chunks** | < 15 | 13 |

**Nota:** Más chunks lazy es mejor (mientras cada uno sea pequeño).

---

## Load Time Budgets

### Por Tipo de Conexión

#### 4G (Fast)
- **FCP:** < 1.5s
- **LCP:** < 2s
- **TTI:** < 3s
- **Total inicial descargado:** ~1.24 MB

#### 3G (Average)
- **FCP:** < 2.5s
- **LCP:** < 3.5s
- **TTI:** < 5s
- **Total inicial descargado:** ~1.24 MB

#### 2G (Slow)
- **FCP:** < 4s
- **LCP:** < 6s
- **TTI:** < 8s
- **Considerar:** Service worker para offline

### Por Página

| Página | LCP Target | Lazy Chunks | Total Adicional |
|--------|-----------|-------------|-----------------|
| **Onboarding** | < 2.5s | 0 | 0 KB |
| **Wallet Overview** | < 3s | 1 | ~1.5 KB |
| **Wallet + Transactions** | < 3.5s | 3 | ~3.5 KB |
| **Wallet + Swap** | < 3.5s | 1 | ~4 KB |
| **Wallet + Settings** | < 3s | 1 | ~250 B |

---

## Qué Hacer Si Se Exceden

### Main Bundle > 200 KB

**Pasos:**
1. Ejecutar `yarn build && yarn analyze`
2. Identificar qué se agregó/cambió
3. Opciones:
   - Lazy load el código nuevo
   - Mover a lazy chunk si es feature específica
   - Optimizar imports (usar lodash-es, date-fns)
   - Verificar tree-shaking

**Ejemplo:**
```bash
# Ver qué creció
yarn build
# Comparar con build anterior

# Analizar
yarn analyze
# Buscar en treemap qué módulo creció
```

### Total Inicial > 1.3 MB

**Pasos:**
1. Revisar vendors chunks
2. Verificar que dependencias nuevas sean necesarias
3. Opciones:
   - Buscar alternativas más livianas
   - Lazy load features que usan dependencias pesadas
   - Remover dependencias no esenciales

**Preguntas a hacer:**
- ¿Esta librería es realmente necesaria?
- ¿Hay una alternativa más liviana?
- ¿Podemos lazy load la feature que la usa?
- ¿Soporta tree-shaking?

### Lighthouse Performance < 85

**Pasos:**
1. Ejecutar Lighthouse en Chrome DevTools
2. Revisar métricas específicas que fallaron
3. Acciones según métrica:

**Si LCP es alto (> 3s):**
- Optimizar imágenes (usar WebP, lazy loading)
- Reducir bundle size
- Priorizar carga de recursos críticos
- Usar font-display: swap

**Si INP es alto (> 200ms):**
- Reducir JavaScript bloqueante
- Lazy load componentes pesados
- Optimizar event handlers
- Usar debounce/throttle

**Si CLS es alto (> 0.1):**
- Definir tamaños de imágenes
- Reservar espacio para contenido dinámico
- Evitar insertar contenido sobre contenido existente

### Lazy Chunk Individual > 50 KB

**Pasos:**
1. Dividir en chunks más pequeños
2. Lazy load sub-componentes
3. Verificar imports innecesarios
4. Mover código compartido a chunk común

**Ejemplo:**
```javascript
// Si SwapPage es muy grande

// ANTES (1 chunk grande)
const SwapPage = lazy(() => import('./SwapPage'));

// DESPUÉS (múltiples chunks pequeños)
const SwapForm = lazy(() => import('./components/SwapForm'));
const SwapHistory = lazy(() => import('./components/SwapHistory'));
const SwapSettings = lazy(() => import('./components/SwapSettings'));
```

---

## Monitoreo y Alertas

### Ejecución Manual (Recomendado Mensualmente)

```bash
# 1. Build y analizar
yarn build && yarn analyze

# 2. Capturar métricas
# Ver output de yarn build para tamaños

# 3. Verificar checklist
```

**Checklist:**
- [ ] Main bundle < 200 KB
- [ ] Total inicial < 1.3 MB
- [ ] Lazy chunks < 50 KB cada uno
- [ ] No hay duplicación de código visible en analyzer
- [ ] Vendors chunks no crecieron significativamente

### Alertas Automáticas (Opcional)

Si quieres configurar alertas automáticas en CI/CD:

**Option 1: bundlesize (GitHub):**
```json
// package.json
{
  "bundlesize": [
    {
      "path": "./build/static/js/main.*.js",
      "maxSize": "200 KB",
      "compression": "gzip"
    },
    {
      "path": "./build/static/js/*.chunk.js",
      "maxSize": "50 KB",
      "compression": "gzip"
    }
  ]
}
```

**Option 2: Lighthouse CI:**
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
  },
};
```

### Métricas a Trackear

**En cada PR importante:**
1. Main bundle size
2. Total initial bundle size
3. Número de chunks lazy
4. Largest lazy chunk size

**Mensualmente:**
1. Lighthouse Performance score
2. LCP, INP, CLS
3. Total dependencies size
4. Duplicated dependencies

---

## Evolución del Budget

### Historial

| Fecha | Main Bundle | Total Inicial | Performance Score |
|-------|-------------|---------------|-------------------|
| 2025-11-15 (Baseline) | 1.29 MB | 1.29 MB | ~70 |
| 2025-11-16 (Fase 1) | 195 KB | 1.24 MB | ~85 |
| 2025-11-17 (Fase 2) | 191 KB | 1.24 MB | ~85 |
| 2025-11-18 (Fase 3) | 185 KB | 1.24 MB | ~87 |
| 2025-11-18 (Fase 4) | 177 KB | 1.24 MB | ~88 |
| 2025-11-19 (Fase 5) | 177 KB | 1.24 MB | ~90 |

### Budget Adjustments

El budget puede ajustarse si:
1. Se agregan features esenciales que justifican el aumento
2. El aumento es < 10% y mejora significativamente la UX
3. Se documenta y justifica el cambio

**Proceso para ajustar:**
1. Documentar por qué se necesita aumentar el budget
2. Confirmar que se intentaron optimizaciones
3. Actualizar este documento
4. Notificar al equipo

---

## Buenas Prácticas para Mantener el Budget

### 1. Lazy Load por Default
- Todas las rutas nuevas deben ser lazy (excepto default)
- Features grandes (> 200 líneas) deben ser lazy

### 2. Elegir Dependencias Sabiamente
- Usar bundlephobia.com antes de instalar
- Preferir librerías tree-shakeable
- Considerar alternativas livianas

### 3. Imports Específicos
```javascript
// ✅ BUENO
import Button from '@mui/material/Button';
import get from 'lodash-es/get';

// ❌ MALO
import { Button } from '@mui/material';
import { get } from 'lodash';
```

### 4. Verificar Antes de Mergear
```bash
yarn build && yarn analyze
```

### 5. Code Review Checklist
- [ ] Bundle size no aumentó > 50 KB
- [ ] Nuevas dependencias son tree-shakeable
- [ ] Nuevas rutas son lazy
- [ ] Imports son específicos

---

## Recursos

### Herramientas de Medición
- **Lighthouse:** Chrome DevTools > Lighthouse
- **Bundle Analyzer:** `yarn analyze`
- **Bundlephobia:** https://bundlephobia.com
- **WebPageTest:** https://webpagetest.org

### Referencias
- **Web Vitals:** https://web.dev/vitals/
- **Lighthouse Scoring:** https://web.dev/performance-scoring/
- **Bundle Size Guide:** https://web.dev/your-first-performance-budget/

---

## Revisión del Budget

**Frecuencia recomendada:** Trimestral

**Preguntas a hacer:**
1. ¿Los límites siguen siendo alcanzables?
2. ¿Se agregaron features que justifican ajuste?
3. ¿Los scores de Lighthouse son consistentes?
4. ¿Hay nuevas best practices a seguir?

**Última revisión:** 2025-11-19
**Próxima revisión:** 2025-02-19
