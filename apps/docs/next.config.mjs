import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const withMDX = createMDX();
const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.join(appDirectory, '../..');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@ooa/components', '@ooa/tokens'],
  turbopack: {
    root: workspaceRoot,
  },
};

export default withMDX(config);
