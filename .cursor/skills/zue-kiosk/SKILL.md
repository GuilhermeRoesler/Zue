---
name: zue-kiosk
description: >-
  Kiosk Capacitor Zue — tablet na loja, StatusBar, KeepAwake, hibernação,
  cap sync e auto-update APK. Use ao mexer em Android, idle ou plugins nativos.
---

# Zue — Kiosk / Capacitor

## Identidade

- App id: `br.com.zue.vitrine` · nome **Zue** · Capacitor 8
- Config: `capacitor.config.ts` · projeto em `android/`

## Comportamento no tablet

- Tela cheia (barras do sistema ocultas)
- Tela permanece ligada
- Hibernação 2 min (DEV 2 s), **exceto na Início**
- Mesmo código web; motion desktop (Lenis/cursor) só na web

## Código nativo / bridge

- Init JS: `src/lib/kiosk.ts` — StatusBar hide + KeepAwake; `isNativeApp()`
- Também `MainActivity` (imersivo)
- Plugins locais: `SafDirectory` (listagem SAF), `ApkUpdater` (install APK)
- Capawesome File Picker + Filesystem + Preferences + Browser + App

## Sync e release

- Após mudanças de UI do app: `npm run cap:sync` antes do APK
- `cap:open` / `cap:android` para Android Studio
- Auto-update: `app-update.ts` consulta GitHub Releases e oferece instalar
- OAuth deep link: `br.com.zue.vitrine://oauth` via `oauth-callback.html`

## Idle

- Fonte: `src/lib/idle-config.ts` (`IDLE_TIMEOUT_MS`, `IMAGE_SLIDE_MS`)
- Hook: `use-idle` · overlay: `HibernateOverlay`
- Em `App.tsx`: `isHibernating = isIdle && currentSection !== 'home'`
