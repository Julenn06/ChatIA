// Build script for production optimization
import { readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const distDir = './dist';
const publicDir = './public';

// Ensure dist directory exists
if (!existsSync(distDir)) {
  await mkdir(distDir, { recursive: true });
  await mkdir(`${distDir}/css`, { recursive: true });
  await mkdir(`${distDir}/js`, { recursive: true });
}

console.log('🚀 Building optimized frontend...');

// Minify CSS
const cssResult = await Bun.build({
  entrypoints: [`${publicDir}/css/styles.css`],
  outdir: `${distDir}/css`,
  minify: {
    whitespace: true,
    syntax: true
  },
  naming: '[dir]/[name].[ext]'
});

if (cssResult.success) {
  console.log('✅ CSS minified successfully');
} else {
  console.error('❌ CSS minification failed:', cssResult.logs);
}

// Bundle and minify JavaScript
const jsFiles = [
  `${publicDir}/js/main.js`,
  `${publicDir}/js/chatManager.js`,
  `${publicDir}/js/fileHandler.js`,
  `${publicDir}/js/markdownRenderer.js`,
  `${publicDir}/js/performanceUtils.js`
];

const jsResult = await Bun.build({
  entrypoints: [`${publicDir}/js/main.js`],
  outdir: `${distDir}/js`,
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true
  },
  splitting: false,
  naming: '[dir]/[name].[ext]',
  target: 'browser'
});

if (jsResult.success) {
  console.log('✅ JavaScript bundled and minified successfully');
  console.log(`📦 Output size: ${jsResult.outputs.map(o => `${o.path} (${(o.size / 1024).toFixed(2)}KB)`).join(', ')}`);
} else {
  console.error('❌ JavaScript bundling failed:', jsResult.logs);
}

// Copy index.html to dist
await Bun.write(`${distDir}/index.html`, await Bun.file(`${publicDir}/index.html`).text());
console.log('✅ HTML copied to dist');

console.log('\n✨ Build complete! Files in ./dist/');
console.log('📝 Update routes/index.ts to serve from ./dist in production');
