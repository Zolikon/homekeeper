const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const envPath = path.join(__dirname, '..', '.env');
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

if (/^VERSION=/m.test(existing)) {
  fs.writeFileSync(envPath, existing.replace(/^VERSION=.*/m, `VERSION=${pkg.version}`));
} else {
  fs.writeFileSync(envPath, existing.trimEnd() + `\nVERSION=${pkg.version}\n`);
}

console.log(`Version set to ${pkg.version} in .env`);
