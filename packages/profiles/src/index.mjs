import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.resolve(__dirname, '../templates');

export async function loadProfile(name) {
  const file = path.join(TEMPLATES, `${name}.json`);
  const raw = await readFile(file, 'utf8');
  return JSON.parse(raw);
}
