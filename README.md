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
- Ao abrir, verifica em background se há nova **GitHub Release** e oferece atualizar o APK

```bash
npm run cap:sync      # build web + sync no projeto android/
npm run cap:open      # abre no Android Studio
# ou
npm run cap:android   # sync + abre o Studio
```

No Android Studio: rode no tablet ou **Build → Build Bundle(s) / APK(s)**.

### Atualização automática (tablet)

O app consulta a latest release do repositório (`GuilhermeRoesler/Zue`), compara a tag com a versão instalada e, se houver APK mais novo, exibe um diálogo para baixar e instalar. Na primeira vez o Android pode pedir permissão para “instalar apps desconhecidos”.

Arquivos: `src/lib/app-update.ts`, `src/components/UpdatePrompt.tsx`, `android/.../ApkUpdaterPlugin.java`.

### CI/CD (GitHub Actions)

O workflow [`.github/workflows/android-release.yml`](.github/workflows/android-release.yml) gera um **APK release assinado** e publica em uma **GitHub Release** ao criar uma tag `v*` (ex.: `v1.0.0`).

#### 1. Gerar o keystore (uma vez)

Com JDK instalado:

```bash
keytool -genkeypair -v -keystore zue-release.keystore -alias zue \
  -keyalg RSA -keysize 2048 -validity 10000
```

Guarde o arquivo e as senhas em local seguro (não commitar).

#### 2. Secrets no GitHub

Em **Settings → Secrets and variables → Actions**, crie:

| Secret | Conteúdo |
|--------|----------|
| `ANDROID_KEYSTORE_BASE64` | Keystore em Base64 |
| `ANDROID_KEYSTORE_PASSWORD` | Senha do keystore |
| `ANDROID_KEY_ALIAS` | Alias (ex.: `zue`) |
| `ANDROID_KEY_PASSWORD` | Senha da chave |

Base64 (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("zue-release.keystore")) | Set-Clipboard
```

Base64 (Linux/macOS):

```bash
base64 -i zue-release.keystore | pbcopy   # ou xclip / só imprimir
```

#### 3. Publicar

```bash
git tag v1.0.0
git push origin v1.0.0
```

1. Aguarde a Action da tag concluir
2. Abra **Releases** e baixe `zue-v1.0.0.apk`
3. Instale no tablet (sideload; ainda pode pedir “fonte desconhecida”)

`versionName` vem da tag; `versionCode` é calculado (ex.: `1.2.3` → `10203`). Build local com Android Studio continua opcional (`android/key.properties.example`).

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
│   ├── UpdatePrompt.tsx
│   └── WhatsAppButton.tsx
├── lib/
│   ├── app-update.ts     # Checagem GitHub Releases (Android)
│   ├── apk-updater.ts    # Bridge do plugin ApkUpdater
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
- **Auto-update Android**: checa GitHub Releases e instala o novo APK sob confirmação

## Design em resumo

- Tipografia: Playfair Display (títulos) + Inter light (corpo)
- Paleta: preto, branco e cinzas; cantos retos (`rounded-none`)
- Imagens de produto: URLs Pexels (aspecto ~3/4)

Detalhes em [`.cursor/skills/zue-spec/SKILL.md`](.cursor/skills/zue-spec/SKILL.md).

## Licença

Uso privado da marca Zue.
