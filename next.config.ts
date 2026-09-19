import type { NextConfig } from 'next';

const githubPages = process.env.GITHUB_PAGES === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = githubPages ? {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
} : {};

export default nextConfig;
