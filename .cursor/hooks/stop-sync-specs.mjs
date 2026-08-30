#!/usr/bin/env node
import { parseHookInput, readStdin, loadPending, clearPending } from './lib.mjs';
import { checkSpecDrift } from './check-spec-drift.mjs';

const raw = await readStdin();
const input = parseHookInput(raw);
const status = input.status || 'completed';
const loopCount = Number(input.loop_count ?? 0);

if (status !== 'completed') {
  process.stdout.write('{}\n');
  process.exit(0);
}

const pending = loadPending();
const drift = checkSpecDrift();

const needsSync =
  (pending.pending === true && pending.paths?.length > 0) || drift.ok === false;

if (!needsSync) {
  if (pending.pending) clearPending();
  process.stdout.write('{}\n');
  process.exit(0);
}

// Cap auto-followups; loop_limit in hooks.json is the hard ceiling.
if (loopCount >= 2) {
  process.stdout.write('{}\n');
  process.exit(0);
}

const touched = pending.specsTouched || {};
const missingDocs = [];
if (!touched.rule) missingDocs.push('`.cursor/rules/zue-spec.mdc` (rule)');
if (!touched.skill) missingDocs.push('`.cursor/skills/zue-spec/SKILL.md` (skill)');
if (!touched.readme) missingDocs.push('`README.md`');

const pathList = (pending.paths || []).slice(0, 12).map((p) => `- ${p}`).join('\n');
const driftList = (drift.issues || []).slice(0, 12).map((i) => `- ${i}`).join('\n');

const parts = [
  'Specs vivas: o repositório mudou e as specs estão desatualizadas ou com drift.',
  'Atualize AGORA (nesta ordem) a rule curta, a skill detalhada e o README para refletir o estado real do código — sem inventar features.',
];

if (pathList) {
  parts.push(`Arquivos de produto alterados nesta sessão:\n${pathList}`);
}
if (missingDocs.length) {
  parts.push(`Ainda não sincronizados nesta rodada: ${missingDocs.join(', ')}.`);
}
if (driftList) {
  parts.push(`Drift detectado por \`.cursor/hooks/check-spec-drift.mjs\`:\n${driftList}`);
}
parts.push(
  'Depois de alinhar os três arquivos, rode `node .cursor/hooks/check-spec-drift.mjs` e confirme exit 0. Não refatore código nesta follow-up — só docs/specs.'
);

process.stdout.write(
  JSON.stringify({ followup_message: parts.join('\n\n') }) + '\n'
);
