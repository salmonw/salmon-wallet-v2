# CHANGELOG - PRIMEROS AJUSTES

**Fecha:** 2025-10-31
**Milestone:** Primeros Ajustes
**Repositorio:** salmon-wallet-v2 (Frontend)

## Resumen de Cambios

Este documento detalla TODOS los cambios realizados en el frontend como parte del milestone "Primeros Ajustes" del roadmap. Todos los cambios se han realizado **comentando código** en lugar de eliminarlo, permitiendo un fácil rollback si es necesario.

---

## PUNTO 1: BLOCKCHAINS - Dejar únicamente Solana y BTC

### Archivos Modificados:

#### 1.1 `src/config/explorers.js`
**Cambios realizados:**
- ✅ Comentadas secciones de ETHEREUM en objeto `EXPLORERS` (líneas 29-42)
- ✅ Comentadas secciones de NEAR en objeto `EXPLORERS` (líneas 43-56)
- ✅ Comentadas secciones de ECLIPSE en objeto `EXPLORERS` (líneas 71-102)
- ✅ Comentadas entradas en `DEFAULT_EXPLORERS` para NEAR, ETHEREUM y ECLIPSE (líneas 107-110)
- ✅ Mantenidas activas: SOLANA y BITCOIN

**Estado:** Solo explorers de Solana y Bitcoin disponibles.

---

#### 1.2 `src/pages/Wallet/components/NetworkSelector.js`
**Cambios realizados:**
- ✅ Comentados imports de iconos no usados:
  - `IconNearVector` (línea 11)
  - `IconEthereumVector` (línea 12)
  - `IconEclipseVector` (línea 14)
- ✅ Comentados casos en función `getNetworkIcon()`:
  - Caso `BLOCKCHAINS.ETHEREUM` (líneas 46-47)
  - Caso `BLOCKCHAINS.NEAR` (líneas 50-51)
  - Caso `BLOCKCHAINS.ECLIPSE` (líneas 52-53)
- ✅ Mantenidos activos: `BLOCKCHAINS.BITCOIN` y `BLOCKCHAINS.SOLANA`

**Estado:** NetworkSelector solo muestra Bitcoin y Solana.

---

## PUNTO 2: ONBOARDING - Eliminar 3 páginas de bienvenida

### Archivos Modificados:

#### 2.1 `src/routes/app-routes.js`
**Cambios realizados:**
- ✅ Comentada completamente la ruta de WELCOME (líneas 26-34)
- ✅ Movido `default: true` de WELCOME a ONBOARDING (línea 41)
- ✅ Agregado comentario explicativo del cambio

**Estado:** Los usuarios van directamente a la página de onboarding (Create/Recover wallet) sin pasar por las 3 páginas de bienvenida.

---

#### 2.2 `src/pages/Onboarding/SelectOptionsPage.js`
**Cambios realizados:**
- ✅ Modificada función `onHomeBack()` (líneas 86-94)
- ✅ Eliminada navegación a `ROUTES_MAP_APP.WELCOME` cuando no hay accounts
- ✅ Agregado comentario explicativo

**Comportamiento:**
- Si hay accounts → navega a WALLET
- Si NO hay accounts → se queda en onboarding (no navega a ningún lado)

---

#### 2.3 `src/pages/Welcome/WelcomePage.js`
**Cambios realizados:**
- ✅ Agregado comentario al inicio del archivo indicando que está deshabilitado (líneas 1-5)
- ✅ El código se mantiene intacto para posible restauración

**Estado:** Página deshabilitada pero código preservado.

---

## PUNTO 3: EXCHANGE/SWAPS - Ocultar hasta reparar

### Archivos Modificados:

#### 3.1 `src/pages/Wallet/routes.js`
**Cambios realizados:**
- ✅ Comentada completamente la ruta `WALLET_EXCHANGE` (líneas 69-78)
  - Esta ruta tenía `icon: IconSwap`, por lo que aparecía en el footer
  - Al comentarla, desaparece del footer de navegación
- ✅ Comentada completamente la ruta `WALLET_BRIDGE` (líneas 98-106)
- ✅ La ruta `WALLET_SWAP` se mantiene activa pero sin icon (no aparece en footer)

**Estado:** Exchange y Bridge ocultos del footer. Swap existe pero no es accesible desde footer.

---

#### 3.2 `src/pages/Wallet/ExchangeSection.js`
**Cambios realizados:**
- ✅ Comentado el CardButton de "To a token on other blockchain" (Bridge) (líneas 64-73)
- ✅ Solo queda visible la opción "Same blockchain" (Swap con Jupiter)
- ✅ Agregado comentario explicativo

**Estado:** Si se accede a ExchangeSection, solo se puede hacer swap en la misma blockchain.

---

## PUNTO 4: SETTINGS - Help & Support y Developer Networks

### Archivos Modificados:

#### 4.1 `src/pages/Settings/SettingsOptionsPage.js`
**Cambios realizados:**
- ✅ Comentado el CardButton de "Help & Support" (líneas 151-157)
- ✅ Agregado comentario explicativo

**Estado:** Opción de Help & Support removida de la lista de settings.

**Nota:** El toggle de "Developer Networks" NO fue implementado aún, ya que requiere lógica adicional. Está pendiente para una futura iteración.

---

#### 4.2 `src/pages/Settings/routes.js`
**Cambios realizados:**
- ✅ Comentado import de `HelpSupportPage` (línea 20)
- ✅ Comentada ruta de `SETTINGS_HELPSUPPORT` (líneas 206-215)
- ✅ Agregado comentario explicativo

**Estado:** Ruta de Help & Support deshabilitada.

---

## PUNTO 5: NFTs → COLLECTIBLES

### Archivos Modificados:

#### 5.1 `src/pages/Wallet/routes.js`
**Cambios realizados:**
- ✅ Cambiado `name: 'NFT'` a `name: 'Collectibles'` (línea 54)
- ✅ Agregado comentario explicativo (líneas 49-50)

**Estado:** El footer ahora muestra "Collectibles" en lugar de "NFT".

---

#### 5.2 `src/pages/Wallet/WalletOverviewPage.js`
**Cambios realizados:**
- ✅ Comentada completamente la sección `<MyNfts />` de la home (líneas 193-200)
- ✅ Agregado comentario explicativo

**Estado:** Los Collectibles ya NO aparecen en la página principal del wallet. Solo son accesibles desde el footer "Collectibles".

---

## Resumen Visual de Cambios

### Footer de Navegación:
```
ANTES:
[Wallet] [NFT] [Exchange] [Transactions] [Settings]

DESPUÉS:
[Wallet] [Collectibles] [Transactions] [Settings]
```

### Home del Wallet:
```
ANTES:
- Balance
- Tokens
- NFTs (MyNfts component)

DESPUÉS:
- Balance
- Tokens
(NFTs removidos de la home)
```

### Settings:
```
ANTES:
- Change Network
- Change Language
- Security
- Trusted Apps
- Help & Support

DESPUÉS:
- Change Network
- Change Language
- Security
- Trusted Apps
(Help & Support removido)
```

---

## Dependencias Actualizadas Necesarias

### 1. Actualizar salmon-wallet-adapter

Después de publicar la nueva versión del wallet-adapter (0.2.11):

```bash
npm install salmon-wallet-adapter@0.2.11
```

O actualizar `package.json`:
```json
{
  "dependencies": {
    "salmon-wallet-adapter": "^0.2.11"
  }
}
```

---

## Testing Recomendado

Antes de deployar, verificar:

### Punto 1: Blockchains
- [ ] Network selector solo muestra Bitcoin y Solana
- [ ] Explorers funcionan solo para Bitcoin y Solana
- [ ] No hay errores de imports relacionados con ETHEREUM/NEAR/ECLIPSE

### Punto 2: Onboarding
- [ ] Al abrir la app sin wallets, va directamente a Create/Recover
- [ ] No se puede acceder a /welcome
- [ ] Botón "back" en onboarding funciona correctamente

### Punto 3: Exchange/Swaps
- [ ] Footer no muestra botón de "Exchange"
- [ ] No se puede acceder a /wallet/bridge
- [ ] ExchangeSection (si se accede directamente) solo muestra opción de swap

### Punto 4: Settings
- [ ] "Help & Support" no aparece en la lista de settings
- [ ] No se puede acceder a /wallet/settings/help

### Punto 5: Collectibles
- [ ] Footer muestra "Collectibles" en lugar de "NFT"
- [ ] Home del wallet NO muestra sección de NFTs
- [ ] Se puede acceder a Collectibles desde el footer

---

## Archivos con Comentarios "PRIMEROS AJUSTES"

Buscar por la cadena `"PRIMEROS AJUSTES"` para encontrar todos los cambios:

```bash
grep -r "PRIMEROS AJUSTES" src/
```

**Lista de archivos modificados:**
1. `src/config/explorers.js`
2. `src/pages/Wallet/components/NetworkSelector.js`
3. `src/routes/app-routes.js`
4. `src/pages/Onboarding/SelectOptionsPage.js`
5. `src/pages/Welcome/WelcomePage.js`
6. `src/pages/Wallet/routes.js`
7. `src/pages/Wallet/ExchangeSection.js`
8. `src/pages/Settings/SettingsOptionsPage.js`
9. `src/pages/Settings/routes.js`
10. `src/pages/Wallet/WalletOverviewPage.js`

---

## Rollback

Para revertir estos cambios:

1. Buscar todos los comentarios `/* PRIMEROS AJUSTES */` o `// PRIMEROS AJUSTES`
2. Descomentar el código que se marcó como comentado
3. Comentar el código nuevo que se agregó
4. Restaurar `default: true` en la ruta WELCOME
5. Restaurar versión anterior de salmon-wallet-adapter

---

## Próximos Pasos

- [ ] Testing completo en ambiente de development
- [ ] Verificar que backend (salmon-api) esté actualizado y deployado
- [ ] Verificar que wallet-adapter (0.2.11) esté publicado
- [ ] Actualizar dependencias del frontend
- [ ] Testing en staging
- [ ] Deploy a production

---

## Notas Adicionales

### Pendiente para futuras iteraciones:
1. **Developer Networks Toggle:** Implementar toggle en Settings para mostrar/ocultar testnet/devnet
2. **Traducciones:** Actualizar archivos de traducción (en/es) para cambiar "NFT" por "Collectibles"/"Coleccionables"
3. **Reparación de Jupiter:** Verificar que el swap de Jupiter funcione correctamente en Solana

---

**Desarrollado por:** Claude Code
**Fecha de implementación:** 2025-10-31
**Branch sugerido:** `origin/cleaning` o `feature/primeros-ajustes`
