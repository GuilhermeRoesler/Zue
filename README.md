# Zue - Elegância Atemporal

Website e vitrine digital da marca de moda **Zue**. Desenvolvido com **React**, **TypeScript** e **Vite**, com interface minimalista e responsiva em **Tailwind CSS v4**. O mesmo código-fonte é a base para um **app Android** (tablet na loja) via **Capacitor**.

![](images/demo.png)

## Sobre o Projeto

O site funciona como vitrine da marca:

- Visualizar coleções e lançamentos na página inicial
- Navegar pelo catálogo com filtros por categoria
- Conhecer a história e os valores da marca
- Entrar em contato via WhatsApp ou e-mail
- Inscrever-se na newsletter

Na loja física, a meta é rodar a mesma interface em tablet Android em modo vitrine (tela cheia / kiosk), reaproveitando animações, componentes e o fluxo de manutenção web.

## Specs (Cursor)

A especificação do produto e do design system vive em dois formatos:

| Formato | Caminho | Uso |
|--------|---------|-----|
| **Rule** (resumo) | [`.cursor/rules/zue-spec.mdc`](.cursor/rules/zue-spec.mdc) | Contexto curto, sempre aplicado ao agente |
| **Skill** (detalhada) | [`.cursor/skills/zue-spec/SKILL.md`](.cursor/skills/zue-spec/SKILL.md) | Guia completo: arquitetura, design, Capacitor/kiosk, convenções |

Consulte a skill ao implementar features, mudar UI ou integrar o app Android.

## Tecnologias

- **[React](https://react.dev/)** — interface
- **[TypeScript](https://www.typescriptlang.org/)** — tipagem
- **[Vite](https://vitejs.dev/)** — build e dev server
- **[Tailwind CSS v4](https://tailwindcss.com/)** — estilização
- **[shadcn/ui](https://ui.shadcn.com/)** — componentes (`radix-nova`)
- **[Lucide React](https://lucide.dev/)** — ícones
- **Capacitor** (planejado) — empacote Android a partir do build web
- **ESLint** — qualidade de código

## Pré-requisitos

- [Node.js](https://nodejs.org/en/) 18+
- npm

Para o app Android (quando integrado): Android Studio e JDK conforme a documentação do Capacitor.

## Instalação e execução

```bash
git clone <url-do-seu-repositorio>
cd zue
npm install
npm run dev
```

O terminal mostra a URL local (em geral `http://localhost:5173/`).

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção em `dist/`
- `npm run preview` — preview do build
- `npm run lint` — ESLint

Fluxo previsto com Capacitor: `npm run build` → `npx cap sync android` → gerar APK/AAB.

## Estrutura

```text
src/
├── components/           # Seções e UI da vitrine
│   ├── ui/               # Primitivos shadcn
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── NewsletterPopup.tsx
│   ├── ProductCatalog.tsx
│   └── WhatsAppButton.tsx
├── lib/utils.ts
├── App.tsx               # Navegação por seções (estado)
├── index.css             # Tema Tailwind v4 + tokens
└── main.tsx

.cursor/
├── rules/zue-spec.mdc    # Spec curta (rule)
└── skills/zue-spec/      # Spec detalhada (skill)
```

## Funcionalidades

- **WhatsApp**: CTAs com mensagens pré-definidas (coleção, produto, contato)
- **Formulários**: contato e newsletter via `mailto`
- **Design responsivo**: desktop, tablet e mobile
- **Animações**: transições CSS em hover e menus
- **Vitrine tablet** (roadmap): fullscreen, tela ligada e modo kiosk via Capacitor

## Design em resumo

- Tipografia: Playfair Display (títulos) + Inter light (corpo)
- Paleta: preto, branco e cinzas; cantos retos (`rounded-none`)
- Imagens de produto: URLs Pexels (aspecto ~3/4)

Detalhes em [`.cursor/skills/zue-spec/SKILL.md`](.cursor/skills/zue-spec/SKILL.md).

## Licença

Uso privado da marca Zue.
