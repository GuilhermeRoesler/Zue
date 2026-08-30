#!/usr/bin/env node
import {
  parseHookInput,
  readStdin,
  relFromRoot,
  isProductPath,
  isSpecPath,
  markProductEdit,
  markSpecEdit,
  README_REL,
} from './lib.mjs';

const raw = await readStdin();
const input = parseHookInput(raw);
const filePath = input.file_path || input.path || '';

if (!filePath) {
  process.stdout.write('{}\n');
  process.exit(0);
}

const rel = relFromRoot(filePath);

if (isProductPath(rel) || rel === README_REL) {
  // README counts as both product doc and living spec surface.
  if (rel === README_REL) {
    markSpecEdit(rel);
  } else {
    markProductEdit(rel);
  }
} else if (isSpecPath(rel)) {
  markSpecEdit(rel);
}

process.stdout.write('{}\n');
