---
name: zue-spec
description: >-
  Spec detalhada e viva do projeto Zue — vitrine de moda web e app Android
  (Capacitor) para tablet na loja. Use ao implementar features, Capacitor/kiosk,
  UI, catálogo, WhatsApp/contato, arquitetura, ou ao sincronizar specs com o repo.
---

# Zue — Spec detalhada

## Specs vivas

As specs **não são estáticas**. Sempre que o código mudar de forma relevante, atualize na mesma entrega:

1. `.cursor/rules/zue-spec.mdc` (resumo)
2. `.cursor/skills/zue-spec/SKILL.md` (este arquivo)
3. `README.md`

### Automação (Cursor hooks)

| Evento | Script | Função |
|--------|--------|--------|
| `sessionStart` | `.cursor/hooks/session-start.mjs` | Injeta política + status de drift |
| `afterFileEdit` | `.cursor/hooks/after-file-edit.mjs` | Marca pendência em edições de produto |
| `stop` | `.cursor/hooks/stop-sync-specs.mjs` | Follow-up automático se specs/README ficarem para trás |

Config: `.cursor/hooks.json`. Estado local (gitignored): `.cursor/hooks/state/`.

Checker factual:

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

A **Zue** é uma marca de moda premium. Este repositório é a **vitrine digital**:

1. **Web** — catálogo e presença online para clientes.
2. **App Android (preferencial na loja)** — mesmo build web empacotado com **Capacitor 8**, rodando em tablet em modo vitrine/kiosk (tela cheia, sempre aberta).

Não é um e-commerce com carrinho/pagamento. Preços aparecem como “Consulte”; o fluxo de venda/consulta é **WhatsApp** ou **e-mail**.

### Contatos oficiais

| Canal | Valor |
|-------|--------|
| WhatsApp | `https://wa.me/5551989354834` |
| E-mail | `guiroesler2@gmail.com` |

Mensagens WhatsApp devem ser pré-preenchidas e contextualizadas (coleção, produto, contato genérico).

---

## Stack e tooling

| Camada | Tecnologia |
|--------|------------|
| UI | React 18 + TypeScript |
| Build | Vite 5 (`base: './'` — obrigatório para o WebView) |
| Estilo | Tailwind CSS **v4** (`@import "tailwindcss"` em `src/index.css`) |
| Componentes | shadcn/ui — style `radix-nova`, `baseColor: neutral`, CSS variables |
| Ícones | Lucide React |
| Utils | `clsx` + `tailwind-merge` via `cn()` em `src/lib/utils.ts` |
| App nativo | **Capacitor 8** + `@capacitor/android` |
| Kiosk | `@capacitor/status-bar`, `@capacitor-community/keep-awake` + `MainActivity` imersivo |
| App info | `@capacitor/app` (versão nativa para checagem de update) |
| Auto-update | Plugin local `ApkUpdater` + `src/lib/app-update.ts` (GitHub Releases) |
| Testes | **Vitest** (`src/**/*.{test,spec}.{ts,tsx}`); hoje: `utils.test.ts` (`cn`), `app-update.test.ts` (`compareSemver`) |
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
| `npm run cap:sync` | `build` + `npx cap sync android` |
| `npm run cap:open` | abre o projeto no Android Studio |
| `npm run cap:android` | sync + abre Android Studio |

Aliases (tsconfig / Vite): `@/` → `src/`.

---

## Arquitetura da UI

### Navegação

Sem React Router. `App.tsx` controla `currentSection`:

| `currentSection` | Componente |
|------------------|------------|
| `home` | `Hero` |
| `catalog` | `ProductCatalog` |
| `about` | `About` |
| `contact` | `Contact` |

Layout persistente: `Header` + `main` + `Footer`.

| Superfície | `WhatsAppButton` | `NewsletterPopup` |
|------------|------------------|-------------------|
| Web | sim | sim (~3s) |
| App nativo (Capacitor) | **não** | **não** |

Detecção: `isNativeApp()` / `initKioskMode()` em `src/lib/kiosk.ts`.

### Componentes de domínio (`src/components/`)

- `Header` — nav + sheet mobile
- `Hero` — banner, lançamentos, valores Q/E/S
- `ProductCatalog` — filtros por categoria + grid
- `About` — história, valores, políticas
- `Contact` — formulário `mailto` + infos + WhatsApp
- `Footer`, `WhatsAppButton`, `NewsletterPopup`
- `UpdatePrompt` — diálogo de nova versão (somente app Android)

UI primitiva: `src/components/ui/*` (button, card, sheet, input, etc.). Preferir estes em vez de reinventar.

### Dados de produtos

Hoje: arrays estáticos nos componentes (ex.: `products` em `ProductCatalog`). Imagens via URLs **Pexels**. Ao evoluir, centralizar dados (módulo/`data/` ou Supabase) sem quebrar o layout do grid.

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
- CTAs sólidos pretos; outline preto; hover com inversão ou scale suave
- **`rounded-none`** em botões, cards e inputs da marca (exceto FAB WhatsApp verde)
- `--radius: 0` no tema CSS — coerente com a estética angular
- Sem purple gradients, glows ou visual genérico de template

### Layout

- Container: `max-w-7xl` + padding responsivo
- Produtos: grid 1 → 2 → 3 colunas; imagem `aspect-[3/4]`, hover `scale-105`
- Seções com um propósito claro; copy curto e sofisticado (PT-BR)

### Motion

- Transições CSS (`duration-300` / `500`); classe `animate-fadeIn` disponível
- Preferir motion discreto (hover, sheet) — não sobrecarregar a vitrine do tablet

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

- Sem `NewsletterPopup` e sem FAB WhatsApp no nativo
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

### WhatsApp — padrão

```ts
const message = encodeURIComponent('Olá! Gostaria de consultar...');
window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
```

### Contato — padrão

Formulário monta body e abre `mailto:guiroesler2@gmail.com?subject=...&body=...`.

---

## Checklist ao entregar mudanças

- [ ] Visual alinhado (tipografia, preto/branco, `rounded-none`)
- [ ] Responsivo mobile + tablet
- [ ] WhatsApp/mailto intactos e com mensagem contextual (web)
- [ ] No nativo: sem newsletter popup / FAB WhatsApp a menos que o produto mude
- [ ] `npm run ci` (ou lint / typecheck / test / build) sem regressão
- [ ] Se tocar em UI ou Capacitor: `npm run cap:sync` e fullscreen/kiosk preservados
- [ ] **Specs vivas:** rule + skill + README alinhados ao código
- [ ] `node .cursor/hooks/check-spec-drift.mjs` com exit 0

## Recursos do repo

- Spec curta (sempre ativa): `.cursor/rules/zue-spec.mdc`
- README do projeto: `README.md`
- CI validação: `.github/workflows/ci.yml`
- CI release APK: `.github/workflows/android-release.yml`
- Hooks de sync: `.cursor/hooks.json` e `.cursor/hooks/`
