## publishing

```sh
pnpm dlx lerna version patch
pnpm build
pnpm dlx lerna publish from-package
```

Notes:

- **Order matters**: version first, then build. The build writes each
  package's `dist/package.json` (via `tools/write-dist-manifest.mjs`),
  resolving `workspace:^` deps to the sibling packages' real versions —
  so the manifests must be generated *after* the version bump.
- Packages publish from `dist/` (`publishConfig.directory`). pnpm/lerna
  publish that directory verbatim, which is why the manifest rewrite
  happens at build time. Never copy the raw `package.json` into `dist`.
- `lerna publish from-package` publishes whatever versions are missing
  from the registry, so it is safe to re-run after a partial publish.
- npm permanently blocks reusing a version number that was unpublished —
  if a release goes out broken, bump and publish a new patch; do not
  unpublish and retry the same version.
