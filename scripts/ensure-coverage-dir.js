import fs from 'fs';
import path from 'path';

const covDir = path.resolve(process.cwd(), 'coverage');
const tmpDir = path.join(covDir, '.tmp');

try {
  if (!fs.existsSync(covDir)) fs.mkdirSync(covDir, { recursive: true });
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const placeholder = path.join(tmpDir, '.keep');
  if (!fs.existsSync(placeholder)) fs.writeFileSync(placeholder, '');
  console.log('coverage directories ensured');
} catch (err) {
  console.error('Failed to ensure coverage directories', err);
  process.exit(1);
}
