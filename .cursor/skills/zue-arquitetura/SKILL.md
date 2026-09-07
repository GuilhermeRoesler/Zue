---
name: zue-arquitetura
description: >-
  Arquitetura Zue — pastas, navegação por estado, fluxo de mídia e catálogo.
  Use ao reorganizar módulos, hooks, data flow ou componentes de domínio.
---

# Zue — Arquitetura

## Navegação

- Estado em `App.tsx`: `currentSection` ∈ `home` | `about` | `catalog`.
- Sem React Router.
- Header/Footer montados; `pointer-events-none` no expand fullscreen do catálogo.

## Fluxo do catálogo

1. `use-catalog-slides` resolve coleções (demo, pasta local ou cache Drive).
2. `CatalogPage` empilha carrosséis (1ª coleção em destaque).
3. Toque → `CatalogPlayer` fullscreen com FLIP (`motion` layout).
4. Deslize navega slides; chrome auto-hide; progresso.

## Fluxo de mídia

```text
pick (SAF / File System / Drive OAuth)
  → media-folder | google-drive-cache
  → media-types (ext → slide)
  → use-catalog-slides
  → Hero / About / CatalogPage
```

## Pastas essenciais

```text
src/
  components/     # Hero, About, Catalog*, Header, Hibernate*, Media*, Update*, ui/
  data/           # about.ts, catalog-slides.ts
  hooks/          # use-idle, use-lenis, use-catalog-slides, use-in-view
  lib/            # kiosk, idle-config, media-*, google-*, app-update, motion, utils
  App.tsx
android/          # Capacitor + plugins locais
resources/        # ícones + PlayfairDisplay.ttf
.cursor/
  rules/zue*.mdc
  skills/zue-*/SKILL.md
  hooks/check-spec-drift.mjs
```

## Limites

- Domínio de mídia/kiosk/update fica em `src/lib/`, não inline em JSX.
- Preferir estender hooks existentes a criar stores globais.
