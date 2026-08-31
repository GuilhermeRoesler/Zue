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
| Sem WhatsApp                  | Remover FAB, botões e mensagens `wa.me` do fluxo kiosk; web pode divergir só se o produto decidir explicitamente |
| Conteúdo = mídia da loja      | Fotos e vídeos reais da pasta gerenciada pelo gerente; não stock genérico                                        |

**Web** continua existindo (landing + polish), mas o desenho de produto prioriza o **modo loja**.

---

## Metas (definição de pronto)

### M1 — Modo loja sem conversão

- [ ] No app nativo: **zero** WhatsApp, newsletter popup e CTAs de contato/consulta
- [ ] Navegação clara: **Landing** (marca / atmosfera) × **Catálogo** (carrosséis de mídia)
- [ ] Header sem chrome falso (Search / User / Bag inativos)

### M2 — Hibernação (idle)

- [ ] Timeout sem interação: **2 ou 5 min** (decidir e fixar constante; default sugerido: **3 min** até validar na loja)
- [ ] Ao idle: entrar em **tela 100% branca** com **logo Zue centralizada**
- [ ] Ativar **economia de bateria** / reduzir trabalho (parar carrosséis, vídeos, animações pesadas; dim / keep-awake policy alinhada — ver decisões abertas)
- [ ] Qualquer toque/gesto: sair da hibernação e voltar ao estado útil (landing ou último catálogo — decidir)

### M3 — Catálogo em carrosséis fullscreen

- [ ] Catálogo = lista de carrosséis (coleções / pastas / temas), não só grid de cards
- [ ] Player: **fullscreen**, barra **fina na base** (progresso / posição / título discreto)
- [ ] Auto-avanço: **foto ≈ 5s**; **vídeo = duração do vídeo**
- [ ] Avanço automático para o **próximo item da lista**; fim da lista → loop ou próximo carrossel (decidir)
- [ ] Gestos: swipe / tap zones para anterior/próximo; barra não compete com a mídia

### M4 — Landing refinada

- [ ] Landing = composição de marca (hero, atmosfera), **sem** pressão de CTA WhatsApp no nativo
- [ ] Pode manter narrativa curta; entrada óbvia para o catálogo (toque, não “compre agora”)

### M5 — UX / motion premium (identidade Zue)

- [ ] Popups/dialogs **fluidos, elegantes**, `rounded-none`, preto/branco — sem visual genérico
- [ ] Web: **smooth scroll** estilo Lenis
- [ ] Web: **custom cursor** (somente pointer fino; desligar em touch/tablet)
- [ ] Animações: stagger, fade-in, efeitos de texto, hovers detalhados — **coerentes e impressionantes**, não barulhentos
- [ ] Efeitos sutis: **wave** / **pulse** (respiração da logo na hibernação, por ex.)
- [ ] Respeitar `prefers-reduced-motion`

### M6 — Pasta de mídia (gerente)

- [ ] Ação no app (idealmente protegida / pouco visível ao cliente) para **selecionar pasta de imagens/vídeos**
- [ ] Conteúdo da pasta alimenta os carrosséis
- [ ] Fluxo desejado pelo produto: gerente usa **pasta no Google Drive** sincronizada e envia mídia de qualquer dispositivo pela conta Google
- [ ] Documentar no README o fluxo operacional da loja (como atualizar a pasta)

---

## Arquitetura alvo (alto nível)

```text
App
├── Landing          → marca / atmosfera (sem conversão no nativo)
├── Catálogo         → carrosséis fullscreen (foto + vídeo)
├── HibernateOverlay → branco + logo; idle timeout
└── MediaSource      → pasta local (Drive sync) → manifesto de slides
```

| Superfície    | Landing | Catálogo carrossel     | Hibernate | WhatsApp/CTA | Lenis + cursor |
| ------------- | ------- | ---------------------- | --------- | ------------ | -------------- |
| Android kiosk | sim     | sim                    | sim       | **não**      | não (touch)    |
| Web           | sim     | sim (se fizer sentido) | opcional  | decidir      | **sim**        |

---

## Roadmap sugerido

### Fase 0 — Alinhamento (sem código grande)

1. Fixar timeout idle (2 / 3 / 5 min)
2. Fixar política keep-awake vs economia na hibernação
3. Fixar escopo web: sem WhatsApp também, ou só no nativo?
4. Prototipar 1 carrossel fullscreen + barra inferior (UI estática)

### Fase 1 — Modo loja limpo

1. Remover WhatsApp / newsletter / CTAs no nativo (e limpar header morto)
2. Separar rotas/seções: `landing` | `catalog`
3. Idle → hibernate branco + logo (+ pulse sutil)

### Fase 2 — Player de catálogo

1. Modelo de dados: `Carousel` → `Slide[]` (`image` | `video`, duração)
2. Player fullscreen + barra base + auto-advance
3. Gestos e loop; pausar tudo ao hibernar

### Fase 3 — Fonte de mídia

1. Seletor de pasta (Capacitor Filesystem / SAF no Android)
2. Scan de imagens/vídeos → slides
3. Instruções Drive: pasta offline/sync no tablet
4. (Opcional depois) API Drive — só se pasta local sync for insuficiente

### Fase 4 — Polish web + motion

1. Lenis + custom cursor (web only)
2. Stagger / fade / texto / hovers na landing
3. Popups fluidos no design system
4. Wave/pulse sutis (hibernação + microinterações)

---

## Decisões abertas (não assumir no código sem confirmar)

| Tema                   | Opções                                   | Nota                                                                    |
| ---------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| Timeout idle           | 2 / 3 / 5 min                            | Validar na loja; constante única                                        |
| Hibernação × KeepAwake | Manter tela ligada dim vs permitir sleep | “Economia” vs vitrine sempre acesa — conflito típico de kiosk           |
| Pós-hibernate          | Voltar à landing vs retomar carrossel    | Landing é mais seguro para “atrair”                                     |
| WhatsApp na web        | Remover total vs só nativo               | Produto pediu sem WhatsApp no modo loja; web TBD                        |
| Drive                  | Pasta local sync vs Google Drive API     | Preferir **pasta local + Drive app** no tablet (simples para o gerente) |
| Vídeos                 | Mute sempre? Loop do slide?              | Kiosk: mute on; sem UI de volume chamativa                              |

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
