import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');
export const STATE_DIR = path.join(__dirname, 'state');
export const PENDING_PATH = path.join(STATE_DIR, 'specs-pending.json');

export const RULE_REL = '.cursor/rules/zue-spec.mdc';
export const SKILL_REL = '.cursor/skills/zue-spec/SKILL.md';
export const README_REL = 'README.md';

export function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => chunks.push(c));
    process.stdin.on('end', () => resolve(chunks.join('')));
    process.stdin.on('error', reject);
  });
}

export function parseHookInput(raw) {
  const text = (raw || '').trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function toPosix(p) {
  return p.split(path.sep).join('/');
}

export function relFromRoot(absPath) {
  return toPosix(path.relative(ROOT, absPath));
}

export function isSpecPath(rel) {
  return (
    rel === RULE_REL ||
    rel === SKILL_REL ||
    rel.startsWith('.cursor/skills/zue-spec/') ||
    rel === '.cursor/hooks.json' ||
    rel.startsWith('.cursor/hooks/')
  );
}

/** Product / architecture files whose change can stale the living specs. */
export function isProductPath(rel) {
  if (!rel || rel.startsWith('.cursor/hooks/state/')) return false;
  if (isSpecPath(rel) && rel !== README_REL) return false;

  const prefixes = [
    'src/',
    'android/app/src/',
    'public/',
  ];
  const exact = new Set([
    'package.json',
    'capacitor.config.ts',
    'capacitor.config.json',
    'vite.config.ts',
    'index.html',
    'components.json',
    'tsconfig.json',
    'tsconfig.app.json',
    README_REL,
  ]);

  if (exact.has(rel)) return true;
  return prefixes.some((p) => rel.startsWith(p));
}

export function loadPending() {
  return (
    readJson(PENDING_PATH, null) || {
      pending: false,
      paths: [],
      specsTouched: { rule: false, skill: false, readme: false },
      updatedAt: null,
    }
  );
}

export function markProductEdit(rel) {
  const state = loadPending();
  state.pending = true;
  state.updatedAt = new Date().toISOString();
  if (!state.paths.includes(rel)) state.paths.push(rel);
  // New product edits invalidate prior partial spec sync in this turn.
  state.specsTouched = { rule: false, skill: false, readme: false };
  writeJson(PENDING_PATH, state);
  return state;
}

export function markSpecEdit(rel) {
  const state = loadPending();
  state.updatedAt = new Date().toISOString();
  if (!state.specsTouched) {
    state.specsTouched = { rule: false, skill: false, readme: false };
  }
  if (rel === RULE_REL) state.specsTouched.rule = true;
  if (rel === SKILL_REL || rel.startsWith('.cursor/skills/zue-spec/')) {
    state.specsTouched.skill = true;
  }
  if (rel === README_REL) state.specsTouched.readme = true;

  const { rule, skill, readme } = state.specsTouched;
  if (rule && skill && readme) {
    state.pending = false;
    state.paths = [];
  }
  writeJson(PENDING_PATH, state);
  return state;
}

export function clearPending() {
  writeJson(PENDING_PATH, {
    pending: false,
    paths: [],
    specsTouched: { rule: false, skill: false, readme: false },
    updatedAt: new Date().toISOString(),
  });
}

export function readText(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

export function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}
