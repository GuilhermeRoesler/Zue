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
2. **App Android (preferencial na loja)** — mesmo build web empacotado com **Capacitor**, rodando em tablet em modo vitrine/kiosk (tela cheia, sempre aberta).

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
| Build | Vite 5 |
| Estilo | Tailwind CSS **v4** (`@import "tailwindcss"` em `src/index.css`) |
| Componentes | shadcn/ui — style `radix-nova`, `baseColor: neutral`, CSS variables |
| Ícones | Lucide React |
| Utils | `clsx` + `tailwind-merge` via `cn()` em `src/lib/utils.ts` |
| Backend (opcional) | `@supabase/supabase-js` no package — ainda não é o centro do fluxo |

Scripts: `npm run dev` | `build` | `preview` | `lint`.

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

Layout persistente: `Header` + `main` + `Footer` + `WhatsAppButton` + `NewsletterPopup` (abre após ~3s).

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

Meta: encapsular o `dist` do Vite num WebView Android.

### Requisitos de produto (kiosk)

1. App ocupa **100% da tela** (esconder status/navigation bars)
2. Preferir **manter tela ligada** enquanto a vitrine estiver ativa
3. Orientação controlada (landscape ou portrait conforme o tablet da loja)
4. Mesmo código serve web e app; features só-nativas via plugins Capacitor
5. Links externos (WhatsApp): configurar intents Android / `Browser` ou sistema

### Fluxo esperado (quando integrar)

```text
npm run build  →  npx cap sync android  →  abrir Android Studio / gerar APK-AAB
```

### UX específica do modo loja

- Reduzir ou desligar `NewsletterPopup` no app (não faz sentido em vitrine pública)
- Evitar CTAs que abram apps externos sem necessidade na navegação do catálogo
- Touch targets generosos; testar em resolução de tablet

Detalhes de implementação Capacitor devem seguir a doc oficial e plugins (`StatusBar`, `KeepAwake`, etc.) sem reescrever a UI em React Native.

---

## Convenções de código

1. Componentes funcionais TypeScript; props tipadas com `interface`
2. Estilo via classes Tailwind; tokens do tema em `src/index.css` (`@theme inline` / `:root`)
3. Importar UI de `@/components/ui/...` e `cn` de `@/lib/utils`
4. Textos de UI e mensagens em **português (Brasil)**
5. Não adicionar rotas/router sem necessidade; estender o switch de seções se precisar de novas páginas
6. Ao tocar no design, preservar a linguagem visual já estabelecida (não “modernizar” para outro aesthetic)
7. Não commitar segredos; variáveis de ambiente para chaves (ex. Supabase) se forem usadas

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
- [ ] WhatsApp/mailto intactos e com mensagem contextual
- [ ] `npm run lint` / build sem regressão óbvia
- [ ] Se tocar em Capacitor: sync documentado e fullscreen/kiosk considerados
- [ ] README atualizado se houver mudança de stack ou fluxo de build

## Recursos do repo

- Spec curta (sempre ativa): `.cursor/rules/zue-spec.mdc`
- README do projeto: `README.md`
