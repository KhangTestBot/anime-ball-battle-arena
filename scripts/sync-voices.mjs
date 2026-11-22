import fs from 'node:fs';
import path from 'node:path';

const voicesDir = path.resolve(process.cwd(), 'public', 'voices');
const manifestPath = path.join(voicesDir, 'manifest.json');
const allowedExt = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.webm']);

if (!fs.existsSync(voicesDir)) {
  fs.mkdirSync(voicesDir, { recursive: true });
}

const files = fs.readdirSync(voicesDir);
const voices = {};

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!allowedExt.has(ext)) continue;
  const base = path.basename(file, ext).toLowerCase();
  voices[base] = file;
}

fs.writeFileSync(manifestPath, `${JSON.stringify({ voices }, null, 2)}\n`, 'utf8');
console.log(`Synced ${Object.keys(voices).length} voice file(s) into public/voices/manifest.json`);
