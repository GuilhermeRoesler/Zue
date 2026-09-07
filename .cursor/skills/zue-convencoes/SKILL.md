---
name: zue-convencoes
description: >-
  Convenções Zue — o que fazer e evitar ao mudar código, specs e qualidade.
  Use antes de PRs, refactors ou ao sincronizar rule/skill/README.
---

# Zue — Convenções

## Specs vivas

1. Cada seção tem **rule breve** + **skill detalhada**.
2. Mudança na seção → atualizar rule + skill **e** README na mesma entrega.
3. Validar: `node .cursor/hooks/check-spec-drift.mjs` (exit 0).
4. Índice: `.cursor/rules/zue.mdc`.

## Ao implementar

1. Ler a skill da seção tocada (produto, stack, arquitetura, design, kiosk).
2. Não introduzir checkout, WhatsApp, CTAs de conversão ou React Router.
3. Manter paridade web ↔ app (mesmo UX; motion desktop só na web).
4. Não inventar stack/plugins ausentes do `package.json` / `android/`.
5. Preservar design system; preferir `src/components/ui/`.

## Checklist pós-mudança

- [ ] UI / design system preservados
- [ ] Idle / hibernação / mídia intactos se tocados
- [ ] `npm run lint` · `typecheck` · `test` (ou `ci`)
- [ ] `node .cursor/hooks/check-spec-drift.mjs`
- [ ] Se UI nativa: `npm run cap:sync`

## Escopo de commits / PRs

- Não editar specs “por precaução” sem mudança real de produto/stack.
- Não commitar `.env`, keystore ou secrets.
