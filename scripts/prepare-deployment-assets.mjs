import { rm } from 'node:fs/promises';

// These local, Git-ignored master images are used by slice-projects.mjs.
// Pages use the optimized WebP slices. Keep the originals on disk, but omit
// their duplicate build copies from the hosted assets (25 MiB per-file limit).
for (const project of ['zhouhu', 'tongcheng']) {
  await rm(`dist/client/assets/projects/${project}.png`, { force: true });
}
