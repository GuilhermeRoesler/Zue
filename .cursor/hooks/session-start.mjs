#!/usr/bin/env node
import { checkSpecDrift } from './check-spec-drift.mjs';
import { loadPending } from './lib.mjs';

const drift = checkSpecDrift();
const pending = loadPending();

const lines = [
  '## Specs vivas (Zue)',
  '',
  'As specs deste repo são **vivas**: devem acompanhar o estado real do código.',
  '- Rule: `.cursor/rules/zue-spec.mdc`',
  '- Skill: `.cursor/skills/zue-spec/SKILL.md`',
  '- README: `README.md`',
  '- Hooks: `.cursor/hooks.json` + `.cursor/hooks/*` (afterFileEdit marca pendência; stop força sync se houver drift)',
  '- Checker: `node .cursor/hooks/check-spec-drift.mjs`',
  '',
  'Ao mudar stack, arquitetura, Capacitor/kiosk, componentes de domínio, contatos ou scripts npm: atualize rule + skill + README na mesma entrega.',
];

if (pending.pending && pending.paths?.length) {
  lines.push(
    '',
    `Pendência aberta (${pending.paths.length} arquivo(s)): ${pending.paths.slice(0, 8).join(', ')}`
  );
}

if (!drift.ok) {
  lines.push('', 'Drift atual:');
  for (const issue of drift.issues.slice(0, 10)) {
    lines.push(`- ${issue}`);
  }
} else {
  lines.push('', 'Checker: sem drift factual no momento.');
}

process.stdout.write(
  JSON.stringify({ additional_context: lines.join('\n') }) + '\n'
);
