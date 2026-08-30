---
name: zue-spec
description: >-
  Spec detalhada do projeto Zue — vitrine de moda web e app Android (Capacitor)
  para tablet na loja. Use ao implementar features, integrar Capacitor/kiosk,
  alterar UI, catálogo, WhatsApp/contato ou arquitetura do site.
---

# Zue — Spec detalhada

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
| Backend (opcional) | `@supabase/supabase-js` no package — ainda não é o centro do fluxo |

### Scripts npm

| Script | Função |
|--------|--------|
| `npm run dev` | servidor web de desenvolvimento |
| `npm run build` | build de produção → `dist/` |
| `npm run preview` | preview do build |
| `npm run lint` | ESLint |
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

```text
npm run cap:sync   →   npm run cap:open   →   Build APK/AAB no Android Studio
```

Pré-requisitos na máquina: **Android Studio**, SDK Android e JDK 17/21.

### Arquivos-chave

- `src/lib/kiosk.ts` — init StatusBar + KeepAwake; `isNativeApp()`
- `src/main.tsx` — chama `initKioskMode()` na subida
- `android/.../MainActivity.java` — imersivo sticky + keep screen on
- `android/.../AndroidManifest.xml` / `res/values/styles.xml` — tema fullscreen

### UX modo loja

- Sem `NewsletterPopup` e sem FAB WhatsApp no nativo
- Touch targets generosos; validar em resolução de tablet
- Não reescrever UI em React Native — evoluir o front web e `cap:sync`

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
- [ ] `npm run lint` / build sem regressão óbvia
- [ ] Se tocar em UI ou Capacitor: `npm run cap:sync` e fullscreen/kiosk preservados
- [ ] README atualizado se houver mudança de stack ou fluxo de build

## Recursos do repo

- Spec curta (sempre ativa): `.cursor/rules/zue-spec.mdc`
- README do projeto: `README.md`
