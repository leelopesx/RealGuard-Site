import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data');

export async function readJson(file) {
  const raw = await fs.readFile(path.join(dataDir, file), 'utf8');
  return JSON.parse(raw);
}
