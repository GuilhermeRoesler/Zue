---
name: zue-design
description: >-
  Design system Zue — tipografia Playfair/Inter, paleta, motion, toque e
  catálogo visual. Use ao alterar UI, CSS, animações ou layout tablet.
---

# Zue — Design

## Identidade visual

- Tipografia: **Playfair Display** (títulos) + **Inter** light (corpo)
- Paleta: preto / branco / cinzas; `rounded-none` nos elementos de marca
- Tom: minimalista, elegante, tracking amplo — sem visual genérico “AI”

## Layout e interação

- Sem scrollbar visível (Lenis / toque)
- `user-select: none` global (`src/index.css`); inputs/textarea permitem seleção
- Catálogo: intro + carrosséis; expand fullscreen fluido (FLIP, sem salto/stretch); índice; progresso; chrome auto-hide

## Tablet / toque

- Safe-area: `pt-safe`, `zue-px*`, `env(safe-area-inset-*)`
- Alvos ≥44px: `touch-target`, botões `h-11` / `size-11`
- Feedback `:active` além de `hover`
- Variantes: `landscape` / `short-landscape` (vitrine deitada)

## Motion

- Web: Lenis + cursor custom + stagger/reveal (`Reveal`, `TextReveal`)
- Fullscreen catálogo: `motion` FLIP
- Respeitar `prefers-reduced-motion`; gates em `src/lib/motion.ts`
- Lenis/cursor **desligados** no Capacitor nativo

## Componentes

- Preferir primitivos em `src/components/ui/` (shadcn `radix-nova`)
- Mídia: `CatalogMediaFill` — lazy, `fetchPriority`, `srcSet`/`sizes`, thumb vs full
- Tokens e utilitários em `src/index.css`
