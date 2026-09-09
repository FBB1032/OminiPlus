/* Syntax/lint check: compiles every backend JS file and exits non-zero on failure. */
const fs = require('fs');
const path = require('path');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.js')) acc.push(full);
  }
  return acc;
}

const files = walk(path.join(__dirname, '..', 'src'));
let failed = 0;
for (const f of files) {
  try {
    const src = fs.readFileSync(f, 'utf8');
    new (require('module').Module)(f).wrap ? null : null;
    // Use built-in check via vm compile (catches syntax errors only)
    const vm = require('vm');
    new vm.Script(src, { filename: f, compileOpts: {} });
    console.log('OK  ', path.relative(path.join(__dirname, '..'), f));
  } catch (e) {
    console.error('FAIL', f, '-', e.message);
    failed++;
  }
}
process.exit(failed ? 1 : 0);
