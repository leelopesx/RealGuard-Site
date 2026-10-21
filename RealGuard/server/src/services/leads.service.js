import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/leads.json');

// Grava em sequência para duas requisições simultâneas não se sobrescreverem.
let writing = Promise.resolve();

async function appendToFile(lead) {
  let list = [];
  try {
    list = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  list.push(lead);
  await fs.writeFile(file, JSON.stringify(list, null, 2));
}

async function sendToSheets(lead) {
  const url = process.env.SHEETS_URL;
  if (!url) return;
  const res = await fetch(url, { method: 'POST', body: new URLSearchParams(lead) });
  if (!res.ok) throw new Error(`Planilha respondeu ${res.status}`);
}

export async function saveLead(lead) {
  const job = writing.then(() => appendToFile(lead));
  writing = job.catch(() => {});
  await job;
  try {
    await sendToSheets(lead);
  } catch (err) {
    // O cadastro já está salvo no arquivo; a planilha é só uma cópia.
    console.error('[RealGuard] falha ao enviar para a planilha:', err.message);
  }
}
