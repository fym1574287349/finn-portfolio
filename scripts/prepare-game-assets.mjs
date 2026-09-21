import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Pass the directory containing 游戏Demo素材');
const output = path.resolve('public/assets/game');
await mkdir(output, { recursive: true });
if (!process.argv.includes('--ui-only')) {
await mkdir('public/assets/folders', { recursive: true });
await sharp(path.join(source, '游戏背景.png')).webp({ quality: 95 }).toFile(path.join(output, 'background.webp'));
for (const [input, name] of [
  ['卡片背面.png', 'card-back'],
  ...Array.from({ length: 6 }, (_, i) => [`卡片${i + 1}.png`, `card-${i + 1}`]),
]) {
  // Remove identical transparent margins without changing the cards' proportions.
  await sharp(path.join(source, input))
    .extract({ left: 180, top: 135, width: 660, height: 790 })
    .webp({ quality: 94, alphaQuality: 100 })
    .toFile(path.join(output, name + '.webp'));
}
await sharp(path.join(source, '「游戏 Demo 体验」封面.png'))
  .resize({ width: 900, withoutEnlargement: true }).webp({ quality: 94, alphaQuality: 100 })
  .toFile('public/assets/folders/game.webp');
}
await sharp(path.join(source, '新游戏加载页背景.png'))
  .webp({ quality: 95 }).toFile(path.join(output, 'loading-background.webp'));
for (const [input, name] of [['开始按钮.png', 'start-button'], ['再来按钮.png', 'replay-button']]) {
  await sharp(path.join(source, input))
    .webp({ lossless: true }).toFile(path.join(output, name + '.webp'));
}
console.log('Prepared game assets, including loading background and authored buttons. Originals preserved.');
