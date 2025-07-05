# Publishing Guide

### Method 1: Using Local Lerna (Recommended)

Use the local lerna installation via npx to ensure you're using the correct version:

```bash
# Build all packages first
pnpm run build

# Publish all changed packages
npx lerna publish
```

### Method 2: Using pnpm + Lerna

You can also use pnpm to run lerna:

```bash
# Build all packages first
pnpm run build

# Publish all changed packages
pnpm lerna publish
```

**Note:** Do NOT use global lerna (`lerna publish`) as it may use an older version that doesn't handle `workspace:*` dependencies correctly.

## Publishing Options

### Standard Release

```bash
# Interactive publish - will prompt for version bumps
npx lerna publish

# Skip prompts and use conventional commits for version bumping
npx lerna publish --conventional-commits
```

### Pre-release with Dist-Tag

For beta/alpha releases:

```bash
# Publish with 'next' dist-tag
npx lerna publish --dist-tag next

# Publish with 'beta' dist-tag
npx lerna publish --dist-tag beta

# Publish with 'alpha' dist-tag
npx lerna publish --dist-tag alpha
```

### Publishing from Feature Branch

By default, lerna only allows publishing from the main branch. To publish from a feature branch:

```bash
# Allow publishing from current branch
npx lerna publish --allow-branch feat/my-feature

# Allow publishing from any branch
npx lerna publish --allow-branch '*'
```

### Combined Examples

```bash
# Publish beta version from feature branch
npx lerna publish --dist-tag next --allow-branch feat/v2-react

# Publish with specific version increment
npx lerna publish patch --dist-tag next --allow-branch feat/v2-react
```

## Configuration

The publishing behavior is controlled by `lerna.json`:

```json
{
  "$schema": "node_modules/lerna/schemas/lerna-schema.json",
  "version": "independent",
  "npmClient": "pnpm"
}
```

## Important Notes

### Workspace Dependencies Issue

**⚠️ CRITICAL:** If you see packages published to npm with `workspace:*` dependencies, this indicates a problem with the publishing process. The `workspace:*` syntax should be automatically converted to actual version numbers during publishing.

**Symptoms:**
- Published packages on npm show `"dependency": "workspace:*"` instead of actual versions
- Packages cannot be installed by consumers

**Solution:**
1. Always use `npx lerna publish` (not global lerna)
2. Ensure lerna version is 8.2.3 or higher
3. Make sure pnpm is the configured npm client

### Build Before Publishing

Always build packages before publishing:

```bash
# Build all packages
pnpm run build

# Then publish
npx lerna publish
```

### Version Strategy

This monorepo uses **independent versioning** - each package can have its own version number. Lerna will:

1. Detect which packages have changed since the last release
2. Prompt you to select version bumps for each changed package
3. Update package.json files with new versions
4. Convert `workspace:*` dependencies to actual version numbers
5. Publish to npm
6. Create git tags
7. Push changes to git

## Troubleshooting

### "workspace:*" appears in published packages

This means the publishing process didn't correctly convert workspace dependencies. Solutions:

1. Use `npx lerna publish` instead of global lerna
2. Verify lerna version: `npx lerna --version`
3. Check that pnpm is configured as npm client in lerna.json
