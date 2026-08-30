#!/usr/bin/env node
/**
 * Detects factual drift between the repo and living specs
 * (rule + skill + README).
 *
 * CLI: node .cursor/hooks/check-spec-drift.mjs
 * Exit 0 = ok, 1 = drift.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ROOT,
  RULE_REL,
  SKILL_REL,
  README_REL,
  exists,
  readText,
} from './lib.mjs';

function major(versionRange) {
  const m = String(versionRange || '').match(/(\d+)/);
  return m ? m[1] : null;
}

function listDomainComponents() {
  const dir = path.join(ROOT, 'src/components');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.tsx'))
    .sort();
}

function findWhatsAppNumbers(text) {
  const set = new Set();
  for (const m of text.matchAll(/wa\.me\/(\d+)/g)) set.add(m[1]);
  return [...set];
}

function findEmails(text) {
  const set = new Set();
  for (const m of text.matchAll(
    /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  )) {
    set.add(m[1].toLowerCase());
  }
  return [...set];
}

export function checkSpecDrift() {
  const issues = [];

  if (!exists(RULE_REL)) issues.push(`Missing rule: ${RULE_REL}`);
  if (!exists(SKILL_REL)) issues.push(`Missing skill: ${SKILL_REL}`);
  if (!exists(README_REL)) issues.push(`Missing README: ${README_REL}`);
  if (issues.length) {
    return { ok: false, issues, facts: {} };
  }

  const rule = readText(RULE_REL);
  const skill = readText(SKILL_REL);
  const readme = readText(README_REL);
  const docs = `${rule}\n${skill}\n${readme}`;

  const pkg = JSON.parse(readText('package.json'));
  const facts = {
    packageName: pkg.name,
    scripts: Object.keys(pkg.scripts || {}),
    capacitorCore: pkg.dependencies?.['@capacitor/core'],
    hasAndroidDir: exists('android'),
    hasKiosk: exists('src/lib/kiosk.ts'),
    hasCapacitorConfig: exists('capacitor.config.ts'),
    components: listDomainComponents(),
  };

  let appId = null;
  if (facts.hasCapacitorConfig) {
    const cap = readText('capacitor.config.ts');
    const m = cap.match(/appId:\s*['"]([^'"]+)['"]/);
    appId = m?.[1] || null;
    facts.appId = appId;
  }

  for (const script of ['cap:sync', 'cap:open', 'cap:android']) {
    if (facts.scripts.includes(script) && !docs.includes(script)) {
      issues.push(
        `Script npm \`${script}\` existe no package.json mas não aparece nas specs/README`
      );
    }
  }

  const capMajor = major(facts.capacitorCore);
  if (capMajor) {
    const needle = `Capacitor ${capMajor}`;
    if (!docs.includes(needle)) {
      issues.push(
        `Dependência @capacitor/core ^${capMajor} — docs devem citar "${needle}"`
      );
    }
  }

  if (appId && !docs.includes(appId)) {
    issues.push(
      `appId \`${appId}\` (capacitor.config.ts) ausente das specs/README`
    );
  }

  if (facts.hasKiosk && !docs.includes('kiosk.ts')) {
    issues.push('`src/lib/kiosk.ts` existe mas não é citado nas specs');
  }

  if (facts.hasAndroidDir && !docs.includes('android/')) {
    issues.push(
      'Pasta `android/` existe — specs/README devem refletir Capacitor integrado'
    );
  }

  for (const file of facts.components) {
    const base = file.replace(/\.tsx$/, '');
    if (!skill.includes(file) && !skill.includes(base)) {
      issues.push(`Componente \`src/components/${file}\` não listado na skill`);
    }
  }

  const srcFiles = [];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules') continue;
        walk(p);
      } else if (/\.(tsx?|jsx?)$/.test(ent.name)) {
        srcFiles.push(p);
      }
    }
  };
  walk(path.join(ROOT, 'src'));

  const srcText = srcFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const waSrc = findWhatsAppNumbers(srcText);
  const waDocs = findWhatsAppNumbers(docs);
  for (const n of waSrc) {
    if (!waDocs.includes(n)) {
      issues.push(`WhatsApp \`${n}\` no código não aparece nas specs`);
    }
  }

  const mailSrc = findEmails(srcText);
  const mailDocs = [
    ...docs.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g),
  ].map((m) => m[0].toLowerCase());
  for (const e of mailSrc) {
    if (!mailDocs.includes(e)) {
      issues.push(`E-mail \`${e}\` no código não aparece nas specs`);
    }
  }

  if (!readme.includes('.cursor/rules/zue-spec.mdc')) {
    issues.push('README deve linkar a rule `.cursor/rules/zue-spec.mdc`');
  }
  if (!readme.includes('.cursor/skills/zue-spec')) {
    issues.push('README deve linkar a skill `.cursor/skills/zue-spec`');
  }

  if (
    !/specs vivas/i.test(rule) &&
    !/specs vivas/i.test(skill) &&
    !/living specs/i.test(docs)
  ) {
    issues.push(
      'Specs devem documentar a política de “specs vivas” (rule ou skill)'
    );
  }

  if (!docs.includes('.cursor/hooks')) {
    issues.push(
      'Specs/README devem citar os hooks em `.cursor/hooks` que mantêm as specs vivas'
    );
  }

  return { ok: issues.length === 0, issues, facts };
}

const isMain =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const result = checkSpecDrift();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.ok ? 0 : 1);
}
