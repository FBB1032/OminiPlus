/**
 * Post-build step for electron-builder packaging.
 * Next.js `output: "standalone"` does not copy `public/` or `.next/static/`
 * into the standalone folder, so the packaged app would 404 on all assets.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standalone = path.join(root, '.next', 'standalone');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to);
    }
  }
}

if (!fs.existsSync(standalone)) {
  console.error('[copy-standalone-assets] .next/standalone not found. Run `next build` first.');
  process.exit(1);
}

copyDir(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'));
copyDir(path.join(root, 'public'), path.join(standalone, 'public'));

console.log('[copy-standalone-assets] Copied .next/static and public/ into .next/standalone');
