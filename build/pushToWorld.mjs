import { compilePack } from '@foundryvtt/foundryvtt-cli';
import { promises as fs } from 'fs';

const MODULE_ID = process.cwd();
const yaml = false;

const packs = await fs.readdir('./succ/src/packs');
for (const pack of packs) {
  if (pack === '.gitattributes') continue;
  if (pack === ".gitignore") continue;
  console.log('Packing ' + pack);
  await compilePack(
    `${MODULE_ID}/succ/src/packs/${pack}`,
    `${MODULE_ID}/succ/packs/${pack}`,
    { yaml }
  );
}
