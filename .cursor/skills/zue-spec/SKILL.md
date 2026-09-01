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

1. **Landing** — início (`Hero`: hero full-bleed + looks da vitrine) e sobre (`About`: hero full-bleed com mídia do catálogo, essência, pilares, info da loja, ponte ao catálogo; copy em `src/data/about.ts`).
2. **Catálogo** — página imersiva com carrosséis empilhados (`CatalogPage` + `CatalogPlayer`); 1ª coleção em destaque; toque expande fullscreen; deslize navega.
3. **Hibernação** — após **2 min** sem interação (DEV: **2 s**), **exceto na Início**: tela ligada, composição tipográfica ZUE + tagline; toque retoma o estado anterior.

Não é e-commerce. **Sem checkout, sem WhatsApp, sem CTAs de conversão** (web = app).

---

## Stack e tooling

| Camada | Tecnologia |
|--------|------------|
| UI | React 18 + TypeScript |
| Build | Vite 5 (`base: './'` — obrigatório para o WebView) |
| Estilo | Tailwind CSS **v4** (`@import "tailwindcss"` em `src/index.css`) |
| Componentes | shadcn/ui — style `radix-nova`; carrossel: `embla-carousel-react` + `embla-carousel-autoplay` (`src/components/ui/carousel.tsx`) |
| Motion (web) | **Lenis** smooth scroll; `CustomCursor`; `Reveal` / `TextReveal`; `src/lib/motion.ts`; **`motion`** (`motion/react`) — FLIP `layout` na transição fullscreen do catálogo |
| Ícones | Lucide React |
| Utils | `clsx` + `tailwind-merge` via `cn()` em `src/lib/utils.ts` |
| App nativo | **Capacitor 8** + `@capacitor/android` |
| Kiosk | `@capacitor/status-bar`, `@capacitor-community/keep-awake` + `MainActivity` imersivo |
| Filesystem / pasta | `@capacitor/preferences`, `@capacitor/filesystem`, `@capacitor/browser`, `@capawesome/capacitor-file-picker`, plugin local `SafDirectory` (`DocumentFile` / SAF) |
| Google Drive (opcional) | OAuth PKCE (`google-oauth.ts`) + Drive API (`google-drive-api.ts`) + cache local (`google-drive-cache.ts`); env `VITE_GOOGLE_OAUTH_CLIENT_ID` |
| App info | `@capacitor/app` (versão nativa para checagem de update) |
| Auto-update | Plugin local `ApkUpdater` + `src/lib/app-update.ts` (GitHub Releases) |
| Testes | **Vitest** — `utils.test.ts`, `app-update.test.ts`, `media-types.test.ts`, `motion.test.ts`, `google-drive-cache.test.ts` |
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
| `npm run icons:generate` | gera masters Playfair Z (dark/light) + favicons com radius + PWA/mipmaps Android |
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
| `catalog` | `CatalogPage` | Header + main + Footer; expand fullscreen cobre a UI |

Detecção nativa: `isNativeApp()` / `initKioskMode()` em `src/lib/kiosk.ts`.

### Hibernação (idle)

- Constantes: `src/lib/idle-config.ts` (`IDLE_TIMEOUT_MS` = 2 min em produção / **2 s em DEV**, `IMAGE_SLIDE_MS` = 5 s)
- Hook: `src/hooks/use-idle.ts` — eventos globais de atividade
- Overlay: `src/components/HibernateOverlay.tsx` — fundo off-white, wordmark tipográfico ZUE, tagline, cantos de galeria e aura suave
- **Não aplica na Início** (`currentSection === 'home'`) — só Catálogo e Sobre
- Ao hibernar: overlay cobre a UI; **carrosséis visíveis continuam rodando** por baixo (ao acordar não reiniciam)

### Componentes de domínio (`src/components/`)

- `Header` — nav (Início, Catálogo, Sobre; inline a partir de `min-[900px]`) + sheet abaixo disso; long-press na logo no catálogo abre pasta; na Início e Sobre usa glassmorphism leve sobre o hero full-bleed e solidifica ao rolar; `pt-safe` + `zue-px*`
- `Hero` — porta de entrada: hero full-bleed com mídia do catálogo, wordmark ZUE, looks em grade (navega ao catálogo); sem valores Q/E/S
- `About` — hero full-bleed (mídia da vitrine), essência editorial, pilares tipográficos (sem cards), info prática da loja, ponte discreta ao catálogo; conteúdo em `src/data/about.ts`
- `CatalogPage` — catálogo imersivo: coleções empilhadas (destaque + secundárias), estados loading/erro/vazio, expand fullscreen
- `CatalogPlayer` — Embla embedded ou fullscreen (`fixed inset-0`); transição fluida via `motion` (`layout` FLIP no container e na mídia ativa, mesma curva de easing, sem recálculo de crop `object-cover` durante a animação); lazy; gestos; chrome/hint/overlay só reaparecem após `onLayoutAnimationComplete`; Embla `reInit()` adiado até o layout assentar; índice + progresso
- `HibernateOverlay` — tela de hibernação (wordmark tipográfico + tagline + aura)
- `MediaFolderSheet` — UI discreta do gerente (pasta local, Google Drive, ordenação nome/data, atualizar/sincronizar)
- `DriveFolderPicker` — navegador de pastas remotas do Drive (após OAuth)
- `CustomCursor` — cursor fino (somente web + pointer fine)
- `Reveal` / `TextReveal` — fade/stagger e revelação de texto
- `Footer` — marca e navegação
- `UpdatePrompt` — diálogo de nova versão (somente app Android)

UI primitiva: `src/components/ui/*` (button, card, carousel, sheet, etc.).

### Fonte de mídia (pasta local ou Google Drive)

- Libs: `src/lib/media-folder.ts` (pick/restore/clear + sort + fonte ativa), `src/lib/media-types.ts` (extensões → slides/coleções), `src/lib/media-blob-cache.ts` (blob URLs lazy na web), `src/lib/saf-directory.ts` (bridge Android SAF), `src/lib/google-oauth.ts` / `google-drive-api.ts` / `google-drive-cache.ts` / `google-drive.ts` (Drive opcional)
- Hook: `src/hooks/use-catalog-slides.ts` — demo | pasta local | Drive; expõe `collections` + `slides` + `sort` + sync progress
- **Web**: File System Access API (`showDirectoryPicker`) + IndexedDB para o handle; blobs sob demanda
- **Android**: `@capawesome/capacitor-file-picker` `pickDirectory` + plugin `SafDirectory` (`readdir` via SAF/`DocumentFile`, permissão persistente) + path em Preferences
- **Google Drive (extra)**: OAuth 2.0 PKCE (`drive.readonly`) → escolha de pasta remota → download incremental para cache local (Filesystem no nativo / IndexedDB na web); no boot, sync + fallback offline ao cache; deep link `br.com.zue.vitrine://oauth` + `public/oauth-callback.html`
- Fonte ativa em Preferences (`zue.mediaSource`: `folder` | `drive`); as duas opções coexistem na UI — uma ativa por vez
- **Árvore**: arquivos na raiz → coleção com o nome da pasta; **cada subpasta (1 nível)** → coleção própria
- Ordenação persistida: **nome** (default) ou **data** (`Preferences` `zue.mediaSort`)
- Extensões: jpg/jpeg/png/webp/gif/bmp/heic + mp4/webm/mov/m4v/mkv
- Metadados: `alt`/`title` derivados do nome do arquivo
- Acesso gerente: **pressionar logo ZUE ~1 s** no Header (seção catálogo) → sheet “Mídia da vitrine”
- Sem pasta/Drive: coleções demo em `src/data/catalog-slides.ts` (`CATALOG_COLLECTIONS`)
- Config Drive: `.env` com `VITE_GOOGLE_OAUTH_CLIENT_ID` + `VITE_GOOGLE_OAUTH_CLIENT_SECRET` (ver `.env.example` / README); em CI os mesmos via secrets (Pages + release APK)

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
- Sem scrollbar visível (`scrollbar-width: none` em `src/index.css`); scroll por Lenis/toque permanece
- `user-select: none` global + `-webkit-tap-highlight-color: transparent` (evita highlight azul em miss click / toque); `input` / `textarea` / `[contenteditable]` usam `select-text`
- **Safe-area / toque** (`src/index.css`): utilitários `pt-safe` / `pb-safe` / `px-safe` / `zue-px` (+ md/lg) / `touch-target`; variantes `@custom-variant landscape` e `short-landscape` (landscape + `max-height: 560px`); botões default `h-11` / icon `size-11`; CTAs e nav com `active:` além de `hover:`; Header nav inline a partir de `min-[900px]` (sheet abaixo disso)
- Sem purple gradients, glows ou visual genérico de template

### Layout

- Catálogo: intro de marca (ZUE); carrosséis com hierarquia (1ª ~82dvh / landscape mais baixo, demais ~58dvh); transição fullscreen fluida (FLIP via `motion`, ~560ms, easing sem bounce); barra de progresso; títulos acima da barra
- Landing: hero full-bleed (imagem/vídeo da 1ª coleção) + grade de looks `aspect-3/4` (landscape `4/5`) da mídia real; hover/active `scale-105`; nav discreta ao catálogo; em `short-landscape` tipografia e paddings compactos
- Sobre: hero full-bleed com mídia distinta da Início quando possível; essência + imagem (2 colunas também em landscape); pilares tipográficos com hairlines (`rounded-none`, sem cards); info da loja em lista; ponte tipográfica ao catálogo
- Seções com um propósito claro; copy curto e sofisticado (PT-BR)

### Motion

- Transições CSS (`duration-300` / `500` / `700`); `animate-fadeIn`, `animate-zue-breathe`, `animate-zue-wave`, `animate-zue-line`, `animate-zue-hero-drift`, `animate-zue-hibernate-*`
- Catálogo → fullscreen: `motion` (`motion/react`) com `layout` no container e na mídia ativa (mesma `transition`); FLIP mede o DOM real (sem `vw/vh` chutado), anima só `transform` (sem recálculo de crop `object-cover` por frame) e corrige distorção da imagem via projection aninhado; chrome/hint/título/progresso ficam ocultos durante a transição e só reaparecem em `onLayoutAnimationComplete` (nunca mudam antes da animação terminar); `useReducedMotion()` zera a duração
- Web: Lenis (`useLenis`) desligado no expand fullscreen / hibernação / sheet / nativo / reduced-motion
- Web: `CustomCursor` (mix-blend-difference); desligado em touch e nativo
- Landing/Sobre/Catálogo: `Reveal` + stagger; catálogo também usa `useInView` para autoplay
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
| Ícone | monograma **Z** Playfair Display (mesmo do hero); dark = branco em preto, light = preto em branco |

Masters: `resources/icon-dark.png` / `icon-light.png` (1024²; `icon.png` alias do dark). Fonte: `resources/fonts/PlayfairDisplay.ttf`. Pipeline: `scripts/generate-icons.mjs` → `public/` (favicon SVG/PNG dark+light com **corner radius ~22%**, apple-touch/PWA quadrados, `site.webmanifest`) + `android/.../mipmap-*` (master dark quadrado — o launcher aplica o mask). Após regenerar: `npm run icons:generate` e, para o app, `npm run cap:sync`.

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
- `src/lib/saf-directory.ts` — bridge TS do plugin nativo `SafDirectory` (listagem SAF)
- `src/lib/idle-config.ts` — timeouts idle e slide de imagem
- `src/hooks/use-idle.ts` — detecção de inatividade
- `src/components/HibernateOverlay.tsx` — overlay de hibernação
- `src/components/CatalogPage.tsx` — catálogo imersivo (coleções + expand + estados)
- `src/components/CatalogPlayer.tsx` — player embedded / fullscreen (lazy, in-view autoplay)
- `src/data/catalog-slides.ts` — manifesto de slides e coleções demo
- `src/lib/media-folder.ts` / `media-types.ts` / `media-blob-cache.ts` / `media-types.test.ts` — pasta de mídia
- `src/lib/google-oauth.ts` / `google-drive-api.ts` / `google-drive-cache.ts` / `google-drive.ts` / `google-drive-cache.test.ts` — Google Drive opcional
- `src/lib/motion.ts` / `motion.test.ts` — gates Lenis/cursor/reduced-motion
- `src/hooks/use-catalog-slides.ts` — estado do catálogo (demo | pasta | drive; `collections` + `sort`)
- `src/hooks/use-in-view.ts` — IntersectionObserver para autoplay/lazy
- `src/hooks/use-lenis.ts` — smooth scroll web
- `src/components/MediaFolderSheet.tsx` — UI do gerente (pasta local + Drive)
- `src/components/DriveFolderPicker.tsx` — escolha de pasta remota no Drive
- `src/components/CustomCursor.tsx` / `Reveal.tsx` / `TextReveal.tsx` — polish web
- `src/components/UpdatePrompt.tsx` — UI de atualização (só nativo)
- `src/main.tsx` — chama `initKioskMode()` na subida
- `android/.../MainActivity.java` — imersivo sticky + keep screen on + registra `ApkUpdaterPlugin` e `SafDirectoryPlugin`
- `android/.../ApkUpdaterPlugin.java` — download do APK + intent de instalação
- `android/.../SafDirectoryPlugin.java` — `readdir` / permissão persistente em `content://` (SAF)
- `android/.../AndroidManifest.xml` — `INTERNET` + `REQUEST_INSTALL_PACKAGES` + deep link OAuth `br.com.zue.vitrine://oauth`; tema fullscreen
- `public/oauth-callback.html` — bridge OAuth (postMessage / deep link / retorno à app)

### Auto-update (GitHub Releases)

No app Android, após o start (idle / ~1,5s), o cliente:

1. Consulta `https://api.github.com/repos/GuilhermeRoesler/Zue/releases/latest` (sem travar a UI)
2. Compara a tag (`v*`) com o `versionName` instalado
3. Se houver APK mais novo e o usuário não tiver adiado essa tag, mostra `UpdatePrompt`
4. Ao confirmar: pede permissão de “instalar apps desconhecidos” se preciso, baixa o asset `.apk` e abre o instalador do sistema

Web não participa desse fluxo. “Agora não” grava a tag em `localStorage` para não repetir o prompt até a próxima release.

### UX modo loja

- Sem WhatsApp, newsletter ou CTAs de conversão (web = app)
- Hibernação após 2 min idle (2 s em DEV), exceto na Início; wake retoma estado
- Catálogo: carrosséis com autoplay nos **visíveis** (também sob hibernação); expand fullscreen; foto 5 s; vídeo = duração (mute + poster); deslize/toque
- Pasta: long-press na logo; subpastas → coleções; ordenação nome/data; pasta local **ou** Google Drive (sync → cache); fallback demo
- Touch targets ≥44px no chrome; safe-area nos fixed/sticky (Header, fullscreen, hibernate, Footer); feedback `:active` em CTAs; layout `landscape` / `short-landscape` para tablet deitado
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
- [ ] Hibernação: overlay some ao acordar; carrosséis visíveis não reiniciam
- [ ] `npm run ci` (ou lint / typecheck / test / build) sem regressão
- [ ] Se tocar em UI ou Capacitor: `npm run cap:sync` e fullscreen/kiosk preservados
- [ ] **Specs vivas:** rule + skill + README alinhados ao código
- [ ] `node .cursor/hooks/check-spec-drift.mjs` com exit 0

## Recursos do repo

- Spec curta (sempre ativa): `.cursor/rules/zue-spec.mdc`
- README do projeto: `README.md`
- CI validação: `.github/workflows/ci.yml`
- CI GitHub Pages: `.github/workflows/github-pages.yml`
- CI release APK: `.github/workflows/android-release.yml`
- Checker de drift: `.cursor/hooks/check-spec-drift.mjs`
