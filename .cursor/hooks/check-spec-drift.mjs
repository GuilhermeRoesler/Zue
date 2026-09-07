/**
 * Valida specs vivas modulares: índice + pares rule/skill por seção + README.
 * Exit 0 = ok; exit 1 = drift / arquivos ausentes.
 *
 * Uso: node .cursor/hooks/check-spec-drift.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const SECTIONS = [
  'produto',
  'stack',
  'arquitetura',
  'design',
  'kiosk',
  'convencoes',
];

const INDEX_RULE = '.cursor/rules/zue.mdc';
const README = 'README.md';
const PKG = 'package.json';

/** Fatos que devem aparecer no README e em pelo menos uma rule+skill. */
const SHARED_FACTS = [
  { id: 'app-id', re: /br\.com\.zue\.vitrine/ },
  { id: 'capacitor-8', re: /Capacitor 8/i },
  { id: 'no-conversion', re: /sem checkout|Sem checkout/i },
  { id: 'hibernate', re: /[Hh]iberna/ },
  { id: 'playfair', re: /Playfair Display/ },
  { id: 'inter', re: /\bInter\b/ },
  { id: 'tailwind-v4', re: /Tailwind CSS v4|Tailwind v4/i },
  { id: 'vite-base', re: /base:\s*['"]\.\/['"]/ },
  { id: 'spec-drift', re: /check-spec-drift/ },
];

/** Cobertura obrigatória por skill. */
const SKILL_MUST = {
  produto: [
    { id: 'idle-timeout', re: /2 min|IDLE_TIMEOUT/i },
    { id: 'image-slide', re: /IMAGE_SLIDE_MS|5 s/ },
    { id: 'google-drive', re: /Google Drive|google-drive/i },
  ],
  stack: [
    { id: 'tests', re: /utils\.test|app-update\.test|media-types\.test|media-thumbs\.test/ },
    { id: 'workflows', re: /ci\.yml|github-pages\.yml|android-release\.yml/ },
  ],
  arquitetura: [
    { id: 'app-tsx', re: /App\.tsx/ },
    { id: 'no-router', re: /sem React Router|Sem React Router/i },
  ],
  design: [
    { id: 'motion-flip', re: /FLIP|motion/ },
    { id: 'safe-area', re: /safe-area|zue-px/ },
  ],
  kiosk: [
    { id: 'kiosk-ts', re: /kiosk\.ts|KeepAwake|Keep Awake/ },
    { id: 'cap-sync', re: /cap:sync/ },
  ],
  convencoes: [
    { id: 'drift', re: /check-spec-drift/ },
    { id: 'checklist', re: /Checklist/ },
  ],
};

const REQUIRED_SCRIPTS = [
  'dev',
  'build',
  'lint',
  'typecheck',
  'test',
  'ci',
  'icons:generate',
  'media:generate',
  'cap:sync',
  'cap:open',
  'cap:android',
];

function read(rel) {
  const abs = join(root, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

function fail(msg) {
  console.error(`✗ ${msg}`);
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

const errors = [];

function mustExist(rel) {
  if (!existsSync(join(root, rel))) {
    errors.push(`arquivo ausente: ${rel}`);
    return false;
  }
  ok(`existe ${rel}`);
  return true;
}

mustExist(INDEX_RULE);
mustExist(README);
mustExist(PKG);

const rules = {};
const skills = {};

for (const section of SECTIONS) {
  const rulePath = `.cursor/rules/zue-${section}.mdc`;
  const skillPath = `.cursor/skills/zue-${section}/SKILL.md`;
  mustExist(rulePath);
  mustExist(skillPath);
  rules[section] = read(rulePath) ?? '';
  skills[section] = read(skillPath) ?? '';

  const skillName = `zue-${section}`;
  if (!new RegExp(`skill\\s+\\*\\*${skillName}\\*\\*|skills/${skillName}`, 'i').test(rules[section])) {
    errors.push(`rule zue-${section} deve apontar para skill ${skillName}`);
  } else {
    ok(`rule→skill: ${skillName}`);
  }
}

const index = read(INDEX_RULE) ?? '';
const readme = read(README) ?? '';
const allSpecs = [index, ...Object.values(rules), ...Object.values(skills)].join('\n');

for (const section of SECTIONS) {
  if (!index.includes(`zue-${section}`)) {
    errors.push(`índice zue.mdc não menciona zue-${section}`);
  } else {
    ok(`índice lista: zue-${section}`);
  }
  if (!readme.includes(`zue-${section}`)) {
    errors.push(`README não menciona zue-${section}`);
  } else {
    ok(`README lista: zue-${section}`);
  }
}

for (const fact of SHARED_FACTS) {
  const missing = [];
  if (!fact.re.test(readme)) missing.push('README');
  if (!fact.re.test(allSpecs)) missing.push('rules/skills');
  if (missing.length) {
    errors.push(`fato "${fact.id}" ausente em: ${missing.join(', ')}`);
  } else {
    ok(`fato: ${fact.id}`);
  }
}

let pkg;
try {
  pkg = JSON.parse(read(PKG) ?? '{}');
} catch {
  errors.push('package.json inválido');
  pkg = { scripts: {} };
}

for (const name of REQUIRED_SCRIPTS) {
  if (!pkg.scripts?.[name]) {
    errors.push(`script npm ausente: ${name}`);
  } else {
    ok(`script npm: ${name}`);
  }
}

if (pkg.scripts?.ci && !String(pkg.scripts.ci).includes('check-spec-drift')) {
  errors.push('npm run ci deve invocar check-spec-drift.mjs');
} else if (pkg.scripts?.ci) {
  ok('ci invoca check-spec-drift');
}

for (const [section, items] of Object.entries(SKILL_MUST)) {
  const body = skills[section] ?? '';
  for (const item of items) {
    if (!item.re.test(body)) {
      errors.push(`skill zue-${section} sem cobertura: ${item.id}`);
    } else {
      ok(`zue-${section} cobre: ${item.id}`);
    }
  }
}

if (existsSync(join(root, '.cursor/rules/zue-spec.mdc'))) {
  errors.push('remova o monolito legado: .cursor/rules/zue-spec.mdc');
}
if (existsSync(join(root, '.cursor/skills/zue-spec/SKILL.md'))) {
  errors.push('remova o monolito legado: .cursor/skills/zue-spec/');
}

console.log('');
if (errors.length) {
  console.error(`Spec drift: ${errors.length} problema(s)\n`);
  for (const e of errors) fail(e);
  process.exit(1);
}

console.log('Spec drift: OK — índice, seções e README alinhados.');
process.exit(0);
