import sharp from 'sharp';
import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const jobs = [
  ['public/assets/projects/zhouhu.png', 'public/assets/projects/zhouhu'],
  ['public/assets/projects/tongcheng.png', 'public/assets/projects/tongcheng'],
];

for (const [input, output] of jobs) {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const meta = await sharp(input).metadata();
  const sliceHeight = 4096;
  for (let top = 0, i = 0; top < meta.height; top += sliceHeight, i++) {
    const height = Math.min(sliceHeight, meta.height - top);
    await sharp(input)
      .extract({ left: 0, top, width: meta.width, height })
      .webp({ quality: 88, effort: 4 })
      .toFile(path.join(output, `${String(i + 1).padStart(2, '0')}.webp`));
  }
  console.log(output, (await readdir(output)).length, 'slices');
}
