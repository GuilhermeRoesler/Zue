---
name: zue-melhorias
description: >-
  Plano de melhorias e metas da vitrine Zue orientada a tablet kiosk na loja
  (hibernação, carrosséis fullscreen foto/vídeo, landing vs catálogo, UX premium
  web, pasta de mídia/Drive). Use ao planejar, priorizar ou implementar essas
  mudanças; ao discutir idle/hibernate, carrossel, Lenis, cursor custom,
  animações, ou sync de imagens; ou quando o usuário pedir o roadmap de melhorias.
---

# Zue — Plano de melhorias e metas

> **Papel desta skill:** visão de **destino** e backlog priorizado.  
> **Não confundir com** `zue-spec` (estado **atual** do repo).  
> Ao entregar um item deste plano no código, atualizar **rule + skill `zue-spec` + README** na mesma entrega.

## Norte do produto (nova premissa)

O app é o **launcher default de um tablet na loja**, ligado o dia inteiro. A experiência principal é **descoberta visual imersiva**, não conversão online.

| Premissa                      | Implicação                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Tablet = superfície principal | UX touch-first, fullscreen, idle/hibernate, pouca ou nenhuma ação “de site”                                      |
| Sem CTA de venda              | Remover (ou ocultar no nativo) CTAs de “consultar”, “falar conosco”, etc.                                        |
| Sem WhatsApp                  | Removido em web e app — vitrine sem conversão online                              |
| Conteúdo = mídia da loja      | Fotos e vídeos reais da pasta gerenciada pelo gerente; não stock genérico                                        |

**Web** continua existindo (landing + polish), mas o desenho de produto prioriza o **modo loja**.

---

## Metas (definição de pronto)

### M1 — Modo loja sem conversão

- [x] Web e app: **zero** WhatsApp, newsletter e CTAs de contato/consulta
- [x] Navegação clara: **Landing** (marca / atmosfera) × **Catálogo** (carrosséis de mídia)
- [x] Header sem chrome falso (Search / User / Bag inativos)

### M2 — Hibernação (idle)

- [x] Timeout sem interação: **2 min** em produção / **2 s** em DEV (`IDLE_TIMEOUT_MS` em `src/lib/idle-config.ts`)
- [x] Ao idle: composição tipográfica **ZUE** + tagline (tela ligada)
- [x] Overlay tipográfico ao idle; **carrosséis seguem em autoplay** por baixo (acordar sem reinício)
- [x] Qualquer toque/gesto: sair da hibernação e **retomar de onde parou**

### M3 — Catálogo em carrosséis fullscreen

- [x] Catálogo = lista de carrosséis (coleções / pastas / temas), não só um player
- [x] Player: **embedded** na página + **fullscreen** sob demanda; barra **fina na base** (progresso do slide ativo)
- [x] Auto-avanço: **foto ≈ 5s** (embla autoplay); **vídeo = duração do vídeo** (embedded e fullscreen)
- [x] Fim da lista → loop (`opts.loop`)
- [ ] Gestos: swipe explícito documentado (embla já suporta drag)

### M4 — Landing refinada

- [x] Landing = composição de marca (hero, atmosfera), **sem** CTAs de conversão
- [x] Entrada para o catálogo via navegação (header), não botão “compre agora”

### M5 — UX / motion premium (identidade Zue)

- [x] Popups/dialogs **fluidos, elegantes**, `rounded-none`, preto/branco
- [x] Web: **smooth scroll** Lenis (`useLenis`)
- [x] Web: **custom cursor** fino (desligado em touch/nativo)
- [x] Animações: stagger (`Reveal`), texto (`TextReveal`), hovers na landing/sobre
- [x] Efeitos sutis: wave no hero + breathe na hibernação
- [x] Respeitar `prefers-reduced-motion`

### M6 — Pasta de mídia (gerente)

- [x] Ação discreta no app (long-press ~1 s na logo ZUE no Header, seção catálogo) para **selecionar pasta**
- [x] Conteúdo da pasta alimenta o carrossel (`useCatalogSlides` + `media-folder.ts`)
- [x] Fluxo operacional: pasta no Google Drive sincronizada no tablet / PC (ver README)
- [x] Documentado no README

---

## Arquitetura alvo (alto nível)

```text
App
├── Landing          → marca / atmosfera (sem conversão no nativo)
├── Catálogo         → página com carrosséis + expand fullscreen (foto + vídeo)
├── HibernateOverlay → branco + logo; idle timeout
└── MediaSource      → pasta local (Drive sync) → manifesto de slides
```

| Superfície    | Landing | Catálogo carrossel | Hibernate | WhatsApp/CTA | Lenis + cursor |
| ------------- | ------- | ------------------ | --------- | ------------ | -------------- |
| Android kiosk | sim     | sim                | sim       | **não**      | não (touch) |
| Web           | sim     | sim                | sim       | **não**      | **sim**     |

---

## Roadmap sugerido

### Fase 0 — Alinhamento ✅

1. Timeout idle: **2 min**
2. Hibernação: tela ligada, branco + logo
3. Web = app: sem WhatsApp / CTA
4. Wake: retoma estado (seção + slide do carrossel)

### Fase 1 — Modo loja limpo ✅

1. Removidos WhatsApp / newsletter / CTAs
2. Seções: `home` | `catalog` | `about`
3. Idle → `HibernateOverlay` com pulse sutil

### Fase 2 — Player de catálogo ✅ (v1)

1. `src/data/catalog-slides.ts` + `CatalogPage.tsx` + `CatalogPlayer.tsx`
2. shadcn carousel + embla autoplay + barra de progresso (embedded + fullscreen)
3. Pausa ao hibernar; vídeo mute + duração nativa; seta voltar com chrome auto-hide

### Fase 3 — Fonte de mídia ✅

1. Seletor de pasta (web: File System Access; Android: Capawesome SAF)
2. Scan de imagens/vídeos → slides (`media-types` + `Filesystem.readdir`)
3. Instruções Drive no README
4. API Drive nativa — adiada (pasta local sync suficiente)

### Fase 4 — Polish web + motion ✅

1. Lenis + custom cursor (web only)
2. Stagger / fade / texto / hovers na landing e sobre
3. Dialogs/sheets fluidos (`rounded-none`, ~300ms)
4. Wave/pulse (hero + hibernação)

---

## Decisões abertas (não assumir no código sem confirmar)

| Tema                   | Decisão                                  |
| ---------------------- | ---------------------------------------- |
| Timeout idle           | **2 min** (`idle-config.ts`)             |
| Hibernação             | Tela ligada; overlay branco + logo       |
| Pós-hibernate          | Overlay some; carrossel **já avançou** (não reinicia) |
| WhatsApp / CTA         | **Removidos** (web = app)                |
| Drive                  | Pasta local sync via seletor (sem API Google) |
| Vídeos                 | Mute; avanço no `ended`                  |

---

## Princípios de implementação

1. **Kiosk first** — features web (cursor, Lenis) nunca quebram o tablet.
2. **Identidade** — Playfair + Inter, B&W, `rounded-none`; motion a serviço da marca.
3. **Performance no idle** — hibernar = parar timers, vídeos, rAF, observers pesados.
4. **Specs vivas** — item entregue ⇒ atualizar `zue-spec` + rule + README; este plano marca o item `[x]`.
5. **Não inventar na spec atual** — `zue-spec` só descreve o que já existe no repo.

## Checklist ao implementar um item deste plano

- [ ] Comportamento nativo vs web explícito
- [ ] Sem regressão de fullscreen / kiosk
- [ ] Motion com `prefers-reduced-motion`
- [ ] `npm run ci` ok
- [ ] Specs vivas + marcar meta aqui
- [ ] `node .cursor/hooks/check-spec-drift.mjs` exit 0

## Relação com outras skills

| Skill                  | Uso                            |
| ---------------------- | ------------------------------ |
| `zue-spec`             | Como o repo **está** hoje      |
| `zue-melhorias` (esta) | Para onde vamos e em que ordem |

## Referência rápida do pedido original (âncora)

- Tablet default, dia inteiro na loja → muita coisa diferente
- Sem CTA, sem WhatsApp
- Hibernação por timeout (2 ou 5 min): economia + tela 100% branca + logo no centro
- Landing (atual) + catálogo em carrosséis
- Carrosséis fullscreen, barra baixa, auto next (5s foto / duração vídeo)
- UX: popups fluidos elegantes; Lenis; custom cursor web; stagger/fade/texto/hovers; wave/pulse sutis
- Botão para pasta de imagens; gerente via Drive/Google de qualquer dispositivo
