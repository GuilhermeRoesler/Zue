# Zue - Elegância Atemporal

Website e vitrine digital da marca de moda **Zue**. Desenvolvido com **React**, **TypeScript** e **Vite**, com interface minimalista e responsiva em **Tailwind CSS v4**. O mesmo código-fonte gera um **app Android** (tablet na loja) via **Capacitor 8**.

![](images/demo.png)

## Sobre o Projeto

O site funciona como vitrine da marca:

- Visualizar coleções e lançamentos na página inicial
- Navegar pelo catálogo com filtros por categoria
- Conhecer a história e os valores da marca
- Entrar em contato via WhatsApp ou e-mail
- Inscrever-se na newsletter (somente na web)

Na loja física, a mesma interface roda em tablet Android em modo vitrine (tela cheia / kiosk), reaproveitando animações, componentes e o fluxo de manutenção web.

## Specs (Cursor) — vivas

A especificação acompanha o estado real do repositório (não é documento congelado):

| Formato | Caminho | Uso |
|--------|---------|-----|
| **Rule** (resumo) | [`.cursor/rules/zue-spec.mdc`](.cursor/rules/zue-spec.mdc) | Contexto curto, sempre aplicado ao agente |
| **Skill** (detalhada) | [`.cursor/skills/zue-spec/SKILL.md`](.cursor/skills/zue-spec/SKILL.md) | Guia completo: arquitetura, design, Capacitor/kiosk, convenções |
| **Hooks** | [`.cursor/hooks.json`](.cursor/hooks.json) + [`.cursor/hooks/`](.cursor/hooks/) | Mantêm as specs sincronizadas com o código |

- `sessionStart` injeta a política de specs vivas
- `afterFileEdit` marca pendência quando o produto muda
- `stop` dispara follow-up se rule/skill/README ficarem defasados ou com drift

Validar alinhamento:

```bash
node .cursor/hooks/check-spec-drift.mjs
```

Consulte a skill ao implementar features, mudar UI ou trabalhar no app Android.

## Tecnologias

- **[React](https://react.dev/)** — interface
- **[TypeScript](https://www.typescriptlang.org/)** — tipagem
- **[Vite](https://vitejs.dev/)** — build e dev server
- **[Tailwind CSS v4](https://tailwindcss.com/)** — estilização
- **[shadcn/ui](https://ui.shadcn.com/)** — componentes (`radix-nova`)
- **[Lucide React](https://lucide.dev/)** — ícones
- **[Capacitor 8](https://capacitorjs.com/)** — app Android a partir do build web
- **ESLint** — qualidade de código

## Pré-requisitos

- [Node.js](https://nodejs.org/en/) 18+
- npm
- Para o app Android: [Android Studio](https://developer.android.com/studio), SDK Android e JDK 17 ou 21

## Instalação e execução (web)

```bash
git clone <url-do-seu-repositorio>
cd zue
npm install
npm run dev
```

O terminal mostra a URL local (em geral `http://localhost:5173/`).

## App Android (vitrine / kiosk)

Identidade: `br.com.zue.vitrine` · nome **Zue**.

Comportamento no tablet:

- Tela cheia (barras do sistema ocultas)
- Tela permanece ligada
- Sem popup de newsletter e sem botão flutuante de WhatsApp

```bash
npm run cap:sync      # build web + sync no projeto android/
npm run cap:open      # abre no Android Studio
# ou
npm run cap:android   # sync + abre o Studio
```

No Android Studio: rode no tablet ou **Build → Build Bundle(s) / APK(s)**.

### CI/CD (GitHub Actions)

O workflow [`.github/workflows/android-release.yml`](.github/workflows/android-release.yml) gera um **APK** e publica em uma **GitHub Release** quando você cria uma tag `v*` (ex.: `v1.0.0`).

```bash
git tag v1.0.0
git push origin v1.0.0
```

1. Aguarde a Action da tag concluir
2. Abra **Releases** no repositório
3. Baixe `zue-v1.0.0.apk` e instale no tablet (sideload)

O SDK Android fica **no runner** — não é preciso ter SDK local só para obter o APK. Build local com Android Studio continua opcional.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção em `dist/`
- `npm run preview` — preview do build
- `npm run lint` — ESLint
- `npm run cap:sync` — build + sync Capacitor Android
- `npm run cap:open` — abre Android Studio
- `npm run cap:android` — sync + abre Android Studio

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
├── lib/
│   ├── kiosk.ts          # StatusBar + KeepAwake + isNativeApp()
│   └── utils.ts
├── App.tsx               # Navegação por seções (estado)
├── index.css             # Tema Tailwind v4 + tokens
└── main.tsx

android/                  # Projeto nativo Capacitor
capacitor.config.ts

.cursor/
├── hooks.json            # Specs vivas (sessionStart / afterFileEdit / stop)
├── hooks/                # Scripts Node + checker de drift
├── rules/zue-spec.mdc    # Spec curta (rule)
└── skills/zue-spec/      # Spec detalhada (skill)
```

## Funcionalidades

- **WhatsApp**: CTAs com mensagens pré-definidas (coleção, produto, contato) — web
- **Formulários**: contato e newsletter via `mailto`
- **Design responsivo**: desktop, tablet e mobile
- **Animações**: transições CSS em hover e menus
- **Vitrine tablet**: fullscreen, tela ligada e modo kiosk via Capacitor

## Design em resumo

- Tipografia: Playfair Display (títulos) + Inter light (corpo)
- Paleta: preto, branco e cinzas; cantos retos (`rounded-none`)
- Imagens de produto: URLs Pexels (aspecto ~3/4)

Detalhes em [`.cursor/skills/zue-spec/SKILL.md`](.cursor/skills/zue-spec/SKILL.md).

## Licença

Uso privado da marca Zue.
