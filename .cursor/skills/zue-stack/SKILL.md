---
name: zue-stack
description: >-
  Stack Zue — React, Vite, Tailwind, shadcn, Capacitor, testes e CI/CD.
  Use ao adicionar deps, scripts npm, workflows ou mudar tooling.
---

# Zue — Stack

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| UI | React 18 + TypeScript + Vite (`base: './'`) |
| Estilo | Tailwind CSS v4 + shadcn/ui (`radix-nova`, aliases `@/`) |
| Carrossel | `embla-carousel-react` + `embla-carousel-autoplay` |
| Motion web | Lenis + `CustomCursor`; gates em `src/lib/motion.ts` |
| Fullscreen | `motion` (`motion/react`) — FLIP `layout` no `CatalogPlayer` |
| Native | Capacitor 8 + StatusBar + Keep Awake + Preferences + Filesystem + Browser + App |
| Plugins locais | `SafDirectory`, `ApkUpdater` |
| Drive | OAuth PKCE + Drive API → cache (`google-drive*.ts`) |
| Ícones UI | Lucide React |
| Qualidade | ESLint, `typecheck`, Vitest, `npm run ci` |

## Scripts npm

`dev` · `build` · `preview` · `lint` · `typecheck` · `test` · `test:watch` · `ci` · `icons:generate` · `media:generate` · `cap:sync` · `cap:open` · `cap:android`

## Testes unitários atuais

- `utils.test.ts` (`cn`)
- `app-update.test.ts` (`compareSemver`)
- `media-types.test.ts`
- `media-thumbs.test.ts`
- `motion.test.ts`
- `google-drive-cache.test.ts`

## CI/CD

- `.github/workflows/ci.yml` — lint, typecheck, test, build, spec-drift
- `.github/workflows/github-pages.yml` — deploy `dist/` (GitHub Pages)
- `.github/workflows/android-release.yml` — APK release assinado em tags `v*`

## Regras

- Não adicionar libs sem necessidade clara e sem atualizar esta skill + README.
- Fonte da verdade de deps: `package.json` / `android/`.
