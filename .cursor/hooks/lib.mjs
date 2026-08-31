import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

export const RULE_REL = '.cursor/rules/zue-spec.mdc';
export const SKILL_REL = '.cursor/skills/zue-spec/SKILL.md';
export const README_REL = 'README.md';

export function readText(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

export function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}
