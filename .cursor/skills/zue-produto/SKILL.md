---
name: zue-produto
description: >-
  Produto Zue — seções da vitrine, hibernação, pasta de mídia, ícones e
  auto-update. Use ao mudar UX de Início/Sobre/Catálogo, idle, Drive/SAF ou copy.
---

# Zue — Produto

## Essência

- Marca de moda premium **Zue**, tagline *Elegância Atemporal*.
- **App default de tablet na loja** (ligado o dia inteiro) + site web — **mesmo código**.
- Identidade Android: `br.com.zue.vitrine` · nome **Zue**.
- Sem checkout, WhatsApp ou CTAs de conversão.

## Seções

Navegação por estado em `App.tsx` (sem React Router):

| Seção | Componente | Comportamento |
|-------|------------|---------------|
| Início | `Hero` | Hero full-bleed + looks da mídia; nav discreta ao catálogo; Header glass |
| Sobre | `About` | Hero full-bleed, essência, pilares, info da loja; copy em `src/data/about.ts` |
| Catálogo | `CatalogPage` + `CatalogPlayer` | Intro + carrosséis (1ª coleção em destaque); fullscreen FLIP; deslize navega |

## Hibernação

- **2 min** sem interação; **DEV: 2 s** (`IDLE_TIMEOUT_MS` em `src/lib/idle-config.ts`).
- **Exceto na Início** — o Hero já é a composição de marca.
- `HibernateOverlay`: wordmark ZUE + tagline; carrosséis visíveis seguem; toque remove sem reiniciar.
- Imagem no player: **5 s** (`IMAGE_SLIDE_MS`); vídeo = duração + poster.

## Pasta de mídia

- Long-press (~1 s) na logo **ZUE** no Header **só no catálogo** → `MediaFolderSheet`.
- **A) Pasta local** (padrão): Drive sync → SAF (Android) / File System Access (web); `SafDirectory` + Capawesome File Picker.
- **B) Google Drive** (opcional): OAuth PKCE + API readonly → cache local (`google-oauth.ts`, `google-drive*.ts`, `DriveFolderPicker.tsx`).
- Subpastas = coleções; raiz = coleção com nome da pasta; ordenação nome/data.
- Env: `VITE_GOOGLE_OAUTH_CLIENT_ID` + `VITE_GOOGLE_OAUTH_CLIENT_SECRET` (`.env.example`).

## Ícone / favicon

- Monograma **Z** em **Playfair Display**.
- Masters: `resources/icon-dark.png` / `icon-light.png` (`icon.png` = dark).
- Favicon web: radius ~22% + `prefers-color-scheme`; PWA/Android: dark quadrado.
- Regenerar: `npm run icons:generate`.

## Auto-update (Android)

- Latest GitHub Release → `app-update.ts` + plugin `ApkUpdater` → `UpdatePrompt.tsx`.
