// Builds Grundriss Studio into single self-contained HTML files.
//   node build.mjs
// dist/index.html       – page body for the Claude artifact (no <html>/<head> wrapper, the host adds it)
// dist/standalone.html  – complete HTML document to open in any browser or host on any static server
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(join(root, 'src', f), 'utf8');
const ORDER = ['util', 'model', 'textures', 'catalog', 'plan2d', 'view3d', 'storage', 'sample', 'ui', 'main'];

const externalImports = new Map();
const allExports = new Map();
const blocks = [];

for (const name of ORDER) {
  let code = src(name + '.js');
  code = code.replace(/^import\s+[^;]*?from\s+['"]([^'"]+)['"];?[ \t]*$/gm, (m, from) => {
    if (from.startsWith('.')) return '';
    const norm = m.replace(/\s+/g, ' ').trim();
    externalImports.set(norm, true);
    return '';
  });
  const exports = [];
  code = code.replace(/^export\s+(async\s+function|function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm, (m, kw, id) => {
    exports.push(id);
    return `${kw} ${id}`;
  });
  if (/^export\s/m.test(code)) throw new Error(`${name}.js: unsupported export form`);
  for (const e of exports) {
    if (allExports.has(e)) throw new Error(`duplicate export "${e}" in ${name}.js and ${allExports.get(e)}.js`);
    allExports.set(e, name);
  }
  const ret = exports.length ? `\nreturn { ${exports.join(', ')} };` : '';
  const head = `// ---- ${name}.js ----\n`;
  if (exports.length) blocks.push(`${head}const { ${exports.join(', ')} } = (() => {\n${code.trim()}${ret}\n})();`);
  else blocks.push(`${head}(() => {\n${code.trim()}\n})();`);
}

const app = [...externalImports.keys()].join('\n') + '\n\n' + blocks.join('\n\n');
if (/<\/script/i.test(app)) throw new Error('script code must not contain a closing script tag');

const template = src('index.template.html');
const page = template.replace('/*__APP__*/', () => app);
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'index.html'), page);

const reset = ':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}';
const standalone = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>${reset}</style></head><body>\n${page}\n</body></html>\n`;
writeFileSync(join(root, 'dist', 'standalone.html'), standalone);
console.log(`built dist/index.html (${(page.length / 1024).toFixed(0)} KB), ${allExports.size} exports from ${ORDER.length} modules`);
