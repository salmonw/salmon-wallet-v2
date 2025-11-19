# Plan de Fase 5: Optimización de Dependencias
**Estado:** Pendiente de implementación
**Duración estimada:** 2 días
**Complejidad:** Media

---

## Objetivos

✅ Reemplazar lodash con lodash-es (tree-shakeable)
✅ Reemplazar moment con date-fns (más liviana)
✅ Optimizar imports de @mui/material
✅ Lazy load de traducciones por idioma

---

## Resultados Esperados

**Reducción estimada:**
- Bundle inicial: De ~1.24 MB a ~1.0-1.1 MB gzipped
- Reducción proyectada: **~15-20% adicional**
- Mejora en tree-shaking

**Impacto por cambio:**
- lodash → lodash-es: -30-40 KB gzipped
- moment → date-fns: -60-80 KB gzipped
- Lazy i18n: -20-30 KB gzipped

---

## 1. Reemplazar lodash con lodash-es

### Archivos a modificar (~14 archivos)

Buscar todos los archivos que usan lodash:
```bash
grep -r "from 'lodash'" src/ --include="*.js"
```

### Patrón de cambio:

**ANTES:**
```javascript
import { get, isNil } from 'lodash';
```

**DESPUÉS:**
```javascript
import get from 'lodash-es/get';
import isNil from 'lodash-es/isNil';
```

### Instalación:

```bash
yarn add lodash-es
```

### Archivos identificados que usan lodash:

1. `src/pages/Wallet/WalletOverviewPage.js`
2. `src/AppProvider.js`
3. `src/hooks/useAddressbook.js`
4. `src/hooks/useAccount.js`
5. Y aproximadamente 10 archivos más

### Proceso paso a paso:

1. **Buscar imports de lodash:**
   ```bash
   grep -rn "import.*from 'lodash'" src/ --include="*.js"
   ```

2. **Para cada archivo:**
   - Identificar funciones de lodash usadas
   - Cambiar a import específico de lodash-es
   - Ejemplo:
     ```javascript
     // Antes:
     import { get, isNil, isEmpty } from 'lodash';

     // Después:
     import get from 'lodash-es/get';
     import isNil from 'lodash-es/isNil';
     import isEmpty from 'lodash-es/isEmpty';
     ```

3. **Build y verificar:**
   ```bash
   yarn build
   yarn analyze
   ```

4. **Testing:**
   - Verificar que todas las funciones lodash funcionan correctamente
   - Testing funcional completo
   - Verificar reducción en bundle analyzer

### Funciones lodash más comunes a reemplazar:

- `get` → `import get from 'lodash-es/get'`
- `isNil` → `import isNil from 'lodash-es/isNil'`
- `isEmpty` → `import isEmpty from 'lodash-es/isEmpty'`
- `debounce` → `import debounce from 'lodash-es/debounce'`
- `pick` → `import pick from 'lodash-es/pick'`
- `omit` → `import omit from 'lodash-es/omit'`
- `cloneDeep` → `import cloneDeep from 'lodash-es/cloneDeep'`

---

## 2. Reemplazar moment con date-fns

### Archivos que usan moment (solo 2):

1. `src/pages/Transactions/TransactionsListPage.js`
2. `src/pages/Transactions/TransactionsDetailPage.js`

### Instalación:

```bash
yarn add date-fns
yarn remove moment
```

### Patrón de cambio:

**ANTES (TransactionsListPage.js):**
```javascript
import moment from 'moment';

// En el código:
const formattedDate = moment(transaction.timestamp).format('MMM DD, YYYY');
```

**DESPUÉS:**
```javascript
import { format } from 'date-fns';

// En el código:
const formattedDate = format(new Date(transaction.timestamp), 'MMM dd, yyyy');
```

### Equivalencias moment → date-fns:

| moment | date-fns | Descripción |
|--------|----------|-------------|
| `moment()` | `new Date()` | Fecha actual |
| `moment(timestamp)` | `new Date(timestamp)` | Fecha desde timestamp |
| `moment().format('MMM DD, YYYY')` | `format(new Date(), 'MMM dd, yyyy')` | Formatear fecha |
| `moment().fromNow()` | `formatDistanceToNow(new Date())` | Tiempo relativo |
| `moment().add(1, 'day')` | `addDays(new Date(), 1)` | Agregar días |
| `moment().subtract(1, 'day')` | `subDays(new Date(), 1)` | Restar días |

### Proceso paso a paso:

1. **Analizar uso de moment en TransactionsListPage.js:**
   - Identificar qué funciones de moment se usan
   - Mapear a equivalentes en date-fns

2. **Modificar imports:**
   ```javascript
   // Antes:
   import moment from 'moment';

   // Después:
   import { format, formatDistanceToNow } from 'date-fns';
   ```

3. **Reemplazar llamadas:**
   - Buscar todos los `moment(...)` en el archivo
   - Reemplazar con equivalente de date-fns

4. **Repetir para TransactionsDetailPage.js**

5. **Build y verificar:**
   ```bash
   yarn build
   yarn analyze
   ```

6. **Testing específico:**
   - Verificar que fechas se muestran correctamente
   - Formato debe ser idéntico o mejor
   - Verificar reducción en bundle analyzer (~60-80 KB menos)

---

## 3. Optimizar imports de @mui/material

### Análisis actual:

Verificar si se están usando imports específicos o imports generales:

```bash
grep -rn "from '@mui/material'" src/ --include="*.js"
```

### Patrón recomendado (ya debería estar así):

**BUENO:**
```javascript
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
```

**MALO (evitar):**
```javascript
import { Button, TextField } from '@mui/material';
```

### Si se encuentra el patrón malo:

**Cambiar a:**
```javascript
// Antes:
import { Button, TextField, Dialog } from '@mui/material';

// Después:
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
```

### Verificación:

1. Buscar imports no específicos
2. Si se encuentran, reemplazar
3. Build y verificar que el chunk de mui no creció

---

## 4. Lazy load de traducciones por idioma

### Archivos a modificar:

**Archivos clave:**
- `src/i18n/index.js` o similar
- Archivos de configuración de i18next

### Patrón actual (probablemente):

```javascript
import i18n from 'i18next';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

i18n.init({
  resources: {
    en: { translation: enTranslation },
    es: { translation: esTranslation },
  },
});
```

### Cambio a lazy loading:

```javascript
import i18n from 'i18next';

// Función para cargar idioma dinámicamente
const loadLanguageAsync = async (language) => {
  const translation = await import(`./locales/${language}/translation.json`);
  return translation.default;
};

i18n.init({
  // Configuración inicial sin resources
  lng: 'en',
  fallbackLng: 'en',
});

// Cargar idioma actual
const currentLanguage = localStorage.getItem('language') || 'en';
loadLanguageAsync(currentLanguage).then((translation) => {
  i18n.addResourceBundle(currentLanguage, 'translation', translation);
});

// Hook para cambiar idioma
export const changeLanguage = async (language) => {
  const translation = await loadLanguageAsync(language);
  i18n.addResourceBundle(language, 'translation', translation);
  i18n.changeLanguage(language);
};
```

### Beneficios:

- Solo se carga el idioma activo (~20-30 KB ahorrados)
- Al cambiar idioma, se carga dinámicamente
- Mejor para soporte de múltiples idiomas en el futuro

### Testing:

1. Verificar que idioma por defecto carga correctamente
2. Cambiar idioma en Settings y verificar que carga
3. Verificar que textos cambian correctamente
4. No debe haber "translation.key" en ninguna parte

---

## Testing de Fase 5

### Build Verification
```bash
yarn build
yarn build:local
yarn build:develop
yarn build:main
```

### Bundle Analysis
```bash
yarn analyze
```

**Verificar:**
- [ ] lodash ya NO aparece en bundle (solo lodash-es)
- [ ] moment ya NO aparece en bundle (solo date-fns)
- [ ] utils chunk reducido significativamente
- [ ] Bundle inicial < 1.1 MB gzipped

### Functional Testing

**Testing de lodash:**
- [ ] Wallet overview muestra datos correctamente
- [ ] Funciones get(), isNil(), etc. funcionan
- [ ] No hay errores en consola

**Testing de date-fns:**
- [ ] Fechas en Transactions se muestran correctamente
- [ ] Formato de fecha es correcto
- [ ] No hay errores en consola

**Testing de i18n:**
- [ ] Idioma por defecto carga correctamente
- [ ] Cambiar idioma funciona
- [ ] Textos cambian correctamente
- [ ] No hay traducciones faltantes

---

## Criterios de Éxito

- [ ] Bundle inicial < 1.1 MB gzipped
- [ ] lodash reemplazado por lodash-es en todos los archivos
- [ ] moment reemplazado por date-fns en 2 archivos
- [ ] Traducciones lazy loading funcionando
- [ ] Todos los tests funcionales pasan
- [ ] Reducción de ~15-20% vs Fase 4

---

## Documentación

Crear `docs/fase5-report.md` con:
- Métricas antes/después
- Archivos modificados
- Resultados de testing
- Comparación vs Fase 4

---

## Siguientes Pasos

Después de completar Fase 5, proceder a **Fase 6: Testing Final y Documentación**.
