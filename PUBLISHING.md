## Publishing

```sh
pnpm exec lerna version patch
pnpm exec lerna publish from-package
```

Notes:

- `lerna version` (or `lerna publish`) updates package versions and tags.
  `lerna publish from-package` publishes whatever versions are missing from
  the registry, so it is safe to re-run after a partial publish.
- TypeScript packages publish from `dist/` (`publishConfig.directory`), which
  becomes the published package root. Their `prepack` hook runs the build as
  each package is packed, so the dist manifest is produced at pack time with
  the current package version. No manual build step is needed.
- A plain local build leaves `workspace:` dependency specs in `dist` because
  Lerna resolves those specs in the package-root manifest immediately before
  packing. The packed manifest therefore contains concrete versions.
- npm permanently blocks reusing a version number that was unpublished. If a
  release goes out broken, bump and publish a new patch; do not unpublish and
  retry the same version.
