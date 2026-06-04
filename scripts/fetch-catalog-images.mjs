import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'frontend/public');
const manifestPath = path.join(root, 'catalog-image-manifest.json');

/** Minimal valid 1x1 JPEG (decodable by browsers and image libraries). */
const minimalJpeg = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwAooooA/9k=',
  'base64'
);

const shouldFetch = process.argv.includes('--fetch');

async function main() {
  execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', {
    cwd: root,
    stdio: 'inherit'
  });

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let downloaded = 0;
  let placeholder = 0;
  let skipped = 0;

  for (const entry of manifest.entries) {
    const relative = entry.file.replace(/^\//, '');
    const filePath = path.join(publicDir, relative);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    if (fs.existsSync(filePath)) {
      skipped += 1;
      continue;
    }

    if (shouldFetch && entry.sourceUrl) {
      try {
        const response = await fetch(entry.sourceUrl);
        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          fs.writeFileSync(filePath, buffer);
          downloaded += 1;
          continue;
        }
      } catch {
        // fall through to placeholder
      }
    }

    fs.writeFileSync(filePath, minimalJpeg);
    placeholder += 1;
  }

  console.log(
    `Catalog images: ${downloaded} downloaded, ${placeholder} placeholders created, ${skipped} already present.`
  );
}

await main();
