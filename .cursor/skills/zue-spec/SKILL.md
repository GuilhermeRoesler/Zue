---
name: zue-spec
description: >-
  Spec detalhada e viva do projeto Zue — vitrine kiosk (tablet na loja) e web,
  carrossel fullscreen, hibernação idle, Capacitor. Use ao implementar features,
  UI, catálogo, kiosk, ou ao sincronizar specs com o repo.
---

# Zue — Spec detalhada

## Specs vivas

As specs **não são estáticas**. Sempre que o código mudar de forma relevante, atualize na mesma entrega:

1. `.cursor/rules/zue-spec.mdc` (resumo)
2. `.cursor/skills/zue-spec/SKILL.md` (este arquivo)
3. `README.md`

### Checker de drift

Validação factual (também no `npm run ci` / GitHub Actions):

```bash
node .cursor/hooks/check-spec-drift.mjs
```

Exit `0` = alinhado; `1` = lista de drifts (scripts, Capacitor, `appId`, componentes, WhatsApp/e-mail, links do README).

### O que dispara atualização obrigatória

- Dependências/scripts em `package.json` (esp. Capacitor)
- `capacitor.config.ts`, pasta `android/`, `src/lib/kiosk.ts`
- Novos/renomeados componentes em `src/components/*.tsx`
- Contatos (WhatsApp / e-mail), seções de navegação, comportamento web vs nativo
- Fluxo de build Android ou identidade do app

Não inventar features nas specs: só documentar o que o repo realmente tem.

---

## Visão do produto

A **Zue** é uma marca de moda premium. Este repositório é a **vitrine digital** — pensada como **app default de um tablet na loja**, ligado o dia inteiro, com o mesmo build na web.

1. **Landing** — início (`Hero`) e sobre (`About`): marca, lançamentos, valores.
2. **Catálogo** — carrossel fullscreen de fotos e vídeos (`CatalogCarousel`).
3. **Hibernação** — após **2 min** sem interação: tela ligada, fundo branco + logo; toque retoma o estado anterior.

Não é e-commerce. **Sem checkout, sem WhatsApp, sem CTAs de conversão** (web = app).

Roadmap de melhorias: `.cursor/skills/zue-melhorias/SKILL.md`.

---

## Stack e tooling

| Camada | Tecnologia |
|--------|------------|
| UI | React 18 + TypeScript |
| Build | Vite 5 (`base: './'` — obrigatório para o WebView) |
| Estilo | Tailwind CSS **v4** (`@import "tailwindcss"` em `src/index.css`) |
| Componentes | shadcn/ui — style `radix-nova`; carrossel: `embla-carousel-react` + `embla-carousel-autoplay` (`src/components/ui/carousel.tsx`) |
| Motion (web) | **Lenis** smooth scroll; `CustomCursor`; `Reveal` / `TextReveal`; `src/lib/motion.ts` |
| Ícones | Lucide React |
| Utils | `clsx` + `tailwind-merge` via `cn()` em `src/lib/utils.ts` |
| App nativo | **Capacitor 8** + `@capacitor/android` |
| Kiosk | `@capacitor/status-bar`, `@capacitor-community/keep-awake` + `MainActivity` imersivo |
| Filesystem / pasta | `@capacitor/filesystem`, `@capacitor/preferences`, `@capawesome/capacitor-file-picker` |
| App info | `@capacitor/app` (versão nativa para checagem de update) |
| Auto-update | Plugin local `ApkUpdater` + `src/lib/app-update.ts` (GitHub Releases) |
| Testes | **Vitest** — `utils.test.ts`, `app-update.test.ts`, `media-types.test.ts`, `motion.test.ts` |
| Backend (opcional) | `@supabase/supabase-js` no package — ainda não é o centro do fluxo |

### Scripts npm

| Script | Função |
|--------|--------|
| `npm run dev` | servidor web de desenvolvimento |
| `npm run build` | build de produção → `dist/` |
| `npm run preview` | preview do build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc -b --noEmit`) |
| `npm run test` | Vitest (uma execução, CI) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run ci` | lint + typecheck + test + build + spec-drift |
| `npm run icons:generate` | regenera favicons/PWA + mipmaps Android a partir de `resources/icon.png` |
| `npm run cap:sync` | `build` + `npx cap sync android` |
| `npm run cap:open` | abre o projeto no Android Studio |
| `npm run cap:android` | sync + abre Android Studio |

Aliases (tsconfig / Vite): `@/` → `src/`.

---

## Arquitetura da UI

### Navegação

Sem React Router. `App.tsx` controla `currentSection`:

| `currentSection` | Componente | Layout |
|------------------|------------|--------|
| `home` | `Hero` | Header + main + Footer |
| `about` | `About` | Header + main + Footer |
| `catalog` | `CatalogCarousel` | Fullscreen (sem Header/Footer) |

Detecção nativa: `isNativeApp()` / `initKioskMode()` em `src/lib/kiosk.ts`.

### Hibernação (idle)

- Constantes: `src/lib/idle-config.ts` (`IDLE_TIMEOUT_MS` = 2 min, `IMAGE_SLIDE_MS` = 5 s)
- Hook: `src/hooks/use-idle.ts` — eventos globais de atividade
- Overlay: `src/components/HibernateOverlay.tsx` — branco + logo (`/favicon.svg`), pulse sutil
- Ao hibernar: pausa carrossel/vídeo (`paused` em `CatalogCarousel`); ao acordar retoma índice e seção

### Componentes de domínio (`src/components/`)

- `Header` — nav (Início, Catálogo, Sobre) + sheet mobile
- `Hero` — landing: hero, lançamentos, valores Q/E/S
- `About` — história, valores, políticas
- `CatalogCarousel` — carrossel fullscreen shadcn + autoplay + barra de progresso; long-press na logo abre pasta
- `HibernateOverlay` — tela de hibernação (logo com breathe + rings)
- `MediaFolderSheet` — UI discreta do gerente (selecionar / atualizar pasta)
- `CustomCursor` — cursor fino (somente web + pointer fine)
- `Reveal` / `TextReveal` — fade/stagger e revelação de texto
- `Footer` — marca e navegação
- `UpdatePrompt` — diálogo de nova versão (somente app Android)

UI primitiva: `src/components/ui/*` (button, card, carousel, sheet, etc.).

### Fonte de mídia (pasta)

- Libs: `src/lib/media-folder.ts` (pick/restore/clear), `src/lib/media-types.ts` (extensões → slides)
- Hook: `src/hooks/use-catalog-slides.ts` — pasta salva ou fallback `CATALOG_SLIDES` demo
- **Web**: File System Access API (`showDirectoryPicker`) + IndexedDB para o handle
- **Android**: `@capawesome/capacitor-file-picker` `pickDirectory` + `Filesystem.readdir` + path em Preferences
- Extensões: jpg/jpeg/png/webp/gif/bmp/heic + mp4/webm/mov/m4v/mkv
- Acesso gerente: **pressionar logo ZUE ~1 s** no catálogo → sheet “Mídia da vitrine”
- Sem pasta vinculada: slides demo em `src/data/catalog-slides.ts` (Pexels)

---

## Design system

### Tipografia

- Títulos / marca: `Playfair Display` (serif; itálico pontual no hero)
- Corpo: `Inter`, `font-light`, `tracking-wide` em labels/nav
- Carregamento: Google Fonts em `index.html`

Usar `font-heading` / `font-sans` do tema quando possível; evitar misturar outras famílias.

### Cor e forma

- Fundo branco / cinza claro (`gray-50` em seções alternadas)
- Texto preto / `gray-600` para secundário
- CTAs de navegação discretos (nav, logo); sem botões de conversão
- **`rounded-none`** em botões, cards e inputs da marca
- `--radius: 0` no tema CSS — coerente com a estética angular
- Sem purple gradients, glows ou visual genérico de template

### Layout

- Catálogo: fullscreen; barra fina de progresso na base do slide ativo
- Landing: grid de lançamentos `aspect-[3/4]`, hover `scale-105`
- Seções com um propósito claro; copy curto e sofisticado (PT-BR)

### Motion

- Transições CSS (`duration-300` / `500` / `700`); `animate-fadeIn`, `animate-zue-breathe`, `animate-zue-wave`, `animate-zue-line`
- Web: Lenis (`useLenis`) desligado no catálogo / hibernação / nativo / reduced-motion
- Web: `CustomCursor` (mix-blend-difference); desligado em touch e nativo
- Landing/Sobre: `Reveal` + `TextReveal` com stagger
- Dialog/Sheet: `rounded-none`, duração ~300ms, fade + slide suave
- Preferir motion discreto — não sobrecarregar a vitrine do tablet
- Sempre respeitar `prefers-reduced-motion`

---

## Capacitor / tablet na loja

**Status: integrado.** O `dist` do Vite é empacotado num WebView Android.

### Identidade do app

| Campo | Valor |
|-------|--------|
| `appId` | `br.com.zue.vitrine` |
| `appName` | `Zue` |
| `webDir` | `dist` |
| Config | `capacitor.config.ts` |
| Projeto nativo | pasta `android/` |
| Ícone | monograma **Z** Didone (branco em fundo preto) |

Master: `resources/icon.png` (1024²). Pipeline: `scripts/generate-icons.mjs` → `public/` (favicon SVG/PNG, apple-touch, PWA, `site.webmanifest`) + `android/.../mipmap-*` (`ic_launcher`, round, foreground) com `ic_launcher_background` `#000000`. Após trocar o master: `npm run icons:generate` e, para o app, `npm run cap:sync`.

### Requisitos de produto (kiosk) — implementados

1. **100% da tela** — `StatusBar.hide()` + modo imersivo sticky em `MainActivity`
2. **Tela sempre ligada** — `KeepAwake.keepAwake()` + `FLAG_KEEP_SCREEN_ON` nativo
3. Orientação livre (`fullUser`) — ajustar no manifest se a loja fixar landscape/portrait
4. Mesmo código web/app; nativo só via plugins / `MainActivity`
5. Viewport com `user-scalable=no` e `viewport-fit=cover` no `index.html`

### Fluxo de build Android

Local (opcional):

```text
npm run cap:sync   →   npm run cap:open   →   Build APK/AAB no Android Studio
```

**CI de validação:** GitHub Actions em `.github/workflows/ci.yml`

- Dispara em `push`/`pull_request` nas branches `main`/`master`
- Jobs: `lint` → `typecheck` → `test` → `build` → `check-spec-drift`
- Equivalente local: `npm run ci`

**CI GitHub Pages (vitrine web):** `.github/workflows/github-pages.yml`

- Dispara em `push` nas branches `main`/`master` (e `workflow_dispatch`)
- Build Vite (`base: './'`) e publica o `dist/` no GitHub Pages
- URL típica do projeto: `https://guilhermeroesler.github.io/Zue/`
- Requer **Settings → Pages → Source: GitHub Actions** (uma vez)
- `public/.nojekyll` evita o processamento Jekyll no Pages

**CI de release (preferencial para tablet da loja):** GitHub Actions em `.github/workflows/android-release.yml`

- Dispara ao dar push em tag `v*` (ex.: `v1.0.0`)
- Roda `npm run cap:sync` + `./gradlew assembleRelease` **assinado**
- Cria **GitHub Release** com o asset `zue-<tag>.apk`
- Secrets obrigatórios: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
- `versionName` = tag sem `v`; `versionCode` derivado do semver
- SDK/JDK no runner; keystore nunca versionado (ver README)

```bash
git tag v1.0.0 && git push origin v1.0.0
```

Pré-requisitos locais só se for abrir o Android Studio: SDK Android, JDK 17/21 e opcionalmente `android/key.properties`.

### Arquivos-chave

- `src/lib/kiosk.ts` — init StatusBar + KeepAwake; `isNativeApp()`
- `src/lib/utils.ts` / `utils.test.ts` — `cn()` (clsx + tailwind-merge) e testes Vitest
- `src/lib/app-update.ts` / `app-update.test.ts` — checa `releases/latest` no GitHub; `compareSemver` + testes
- `src/lib/apk-updater.ts` — bridge TS do plugin nativo `ApkUpdater`
- `src/lib/idle-config.ts` — timeouts idle e slide de imagem
- `src/hooks/use-idle.ts` — detecção de inatividade
- `src/components/HibernateOverlay.tsx` — overlay de hibernação
- `src/components/CatalogCarousel.tsx` — player fullscreen
- `src/data/catalog-slides.ts` — manifesto de slides demo
- `src/lib/media-folder.ts` / `media-types.ts` / `media-types.test.ts` — pasta de mídia
- `src/lib/motion.ts` / `motion.test.ts` — gates Lenis/cursor/reduced-motion
- `src/hooks/use-catalog-slides.ts` — estado do catálogo (demo | pasta)
- `src/hooks/use-lenis.ts` — smooth scroll web
- `src/components/MediaFolderSheet.tsx` — UI do gerente
- `src/components/CustomCursor.tsx` / `Reveal.tsx` / `TextReveal.tsx` — polish web
- `src/components/UpdatePrompt.tsx` — UI de atualização (só nativo)
- `src/main.tsx` — chama `initKioskMode()` na subida
- `android/.../MainActivity.java` — imersivo sticky + keep screen on + registra `ApkUpdaterPlugin`
- `android/.../ApkUpdaterPlugin.java` — download do APK + intent de instalação
- `android/.../AndroidManifest.xml` — `INTERNET` + `REQUEST_INSTALL_PACKAGES`; tema fullscreen

### Auto-update (GitHub Releases)

No app Android, após o start (idle / ~1,5s), o cliente:

1. Consulta `https://api.github.com/repos/GuilhermeRoesler/Zue/releases/latest` (sem travar a UI)
2. Compara a tag (`v*`) com o `versionName` instalado
3. Se houver APK mais novo e o usuário não tiver adiado essa tag, mostra `UpdatePrompt`
4. Ao confirmar: pede permissão de “instalar apps desconhecidos” se preciso, baixa o asset `.apk` e abre o instalador do sistema

Web não participa desse fluxo. “Agora não” grava a tag em `localStorage` para não repetir o prompt até a próxima release.

### UX modo loja

- Sem WhatsApp, newsletter ou CTAs de conversão (web = app)
- Hibernação após 2 min idle; wake retoma estado
- Catálogo: foto 5 s (autoplay embla); vídeo = duração do arquivo (mute)
- Pasta de mídia via long-press na logo; fallback demo se não houver pasta
- Touch targets generosos; validar em resolução de tablet
- Não reescrever UI em React Native — evoluir o front web e `cap:sync`
- Update prompt discreto; download em background thread nativo

---

## Convenções de código

1. Componentes funcionais TypeScript; props tipadas com `interface`
2. Estilo via classes Tailwind; tokens do tema em `src/index.css` (`@theme inline` / `:root`)
3. Importar UI de `@/components/ui/...` e `cn` de `@/lib/utils`
4. Textos de UI e mensagens em **português (Brasil)**
5. Não adicionar rotas/router sem necessidade; estender o switch de seções se precisar de novas páginas
6. Ao tocar no design, preservar a linguagem visual já estabelecida (não “modernizar” para outro aesthetic)
7. Não commitar segredos; variáveis de ambiente para chaves (ex. Supabase) se forem usadas
8. Após mudanças de UI relevantes ao app: rodar `npm run cap:sync` antes de gerar APK

---

## Checklist ao entregar mudanças

- [ ] Visual alinhado (tipografia, preto/branco, `rounded-none`)
- [ ] Responsivo mobile + tablet
- [ ] Sem WhatsApp/CTAs de conversão (web = app)
- [ ] Hibernação e carrossel pausam corretamente no idle
- [ ] `npm run ci` (ou lint / typecheck / test / build) sem regressão
- [ ] Se tocar em UI ou Capacitor: `npm run cap:sync` e fullscreen/kiosk preservados
- [ ] **Specs vivas:** rule + skill + README alinhados ao código
- [ ] `node .cursor/hooks/check-spec-drift.mjs` com exit 0

## Recursos do repo

- Spec curta (sempre ativa): `.cursor/rules/zue-spec.mdc`
- Plano de melhorias: `.cursor/skills/zue-melhorias/SKILL.md`
- README do projeto: `README.md`
- CI validação: `.github/workflows/ci.yml`
- CI GitHub Pages: `.github/workflows/github-pages.yml`
- CI release APK: `.github/workflows/android-release.yml`
- Checker de drift: `.cursor/hooks/check-spec-drift.mjs`
