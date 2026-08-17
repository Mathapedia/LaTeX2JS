#!/usr/bin/env node
// Writes dist/package.json for publishing. pnpm/lerna publish the
// `publishConfig.directory` contents verbatim — no workspace-protocol
// rewrite happens for a manifest inside that directory — so copying the
// raw package.json into dist ships unresolvable `workspace:^` specs to
// npm. This script replaces workspace specs with the sibling packages'
// real versions and strips fields that only matter inside the monorepo.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const versions = {};
for (const dir of readdirSync(join(root, 'packages'))) {
  const file = join(root, 'packages', dir, 'package.json');
  if (!existsSync(file)) continue;
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  versions[pkg.name] = pkg.version;
}

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));

const rewrite = (deps) => {
  for (const [name, spec] of Object.entries(deps ?? {})) {
    if (!spec.startsWith('workspace:')) continue;
    const version = versions[name];
    if (!version) {
      throw new Error(`${pkg.name}: no workspace package found for "${name}"`);
    }
    const range = spec.slice('workspace:'.length);
    deps[name] = range === '^' || range === '~' ? range + version : version;
  }
};
rewrite(pkg.dependencies);
rewrite(pkg.optionalDependencies);
rewrite(pkg.peerDependencies);

delete pkg.devDependencies;
delete pkg.scripts;
if (pkg.publishConfig) delete pkg.publishConfig.directory;

writeFileSync(resolve('dist/package.json'), JSON.stringify(pkg, null, 2) + '\n');
console.log(`wrote dist/package.json for ${pkg.name}@${pkg.version}`);
