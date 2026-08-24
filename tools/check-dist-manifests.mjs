import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packagesDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'packages');
const failures = [];

for (const name of readdirSync(packagesDir)) {
  const packageDir = join(packagesDir, name);
  const packageFile = join(packageDir, 'package.json');
  if (!existsSync(packageFile)) continue;

  const packageJson = JSON.parse(readFileSync(packageFile, 'utf8'));
  if (packageJson.publishConfig?.directory !== 'dist') continue;

  const distDir = join(packageDir, 'dist');
  const distManifest = join(distDir, 'package.json');
  if (!existsSync(distManifest)) {
    failures.push(`${packageJson.name}: missing dist/package.json`);
    continue;
  }

  const distJson = JSON.parse(readFileSync(distManifest, 'utf8'));
  if (distJson.version !== packageJson.version) {
    failures.push(
      `${packageJson.name}: version ${distJson.version} does not match root ${packageJson.version}`,
    );
  }

  for (const field of ['main', 'types']) {
    const target = distJson[field];
    const resolvedTarget = typeof target === 'string' ? resolve(distDir, target) : '';
    if (
      !resolvedTarget.startsWith(`${distDir}/`) ||
      !existsSync(resolvedTarget)
    ) {
      failures.push(`${packageJson.name}: ${field} target does not exist: ${target}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('All publishable dist manifests are current and complete.');
