# Development Scripts Guide

This document describes all available npm scripts for the AirPad MVP project.

## Core Scripts

### `npm run dev`
Starts the Next.js development server with hot reloading.

```bash
npm run dev
```

- **Port:** http://localhost:3000
- **Features:** Hot module replacement, fast refresh, error overlay
- **Use:** Daily development work

### `npm run build`
Creates an optimized production build.

```bash
npm run build
```

- **Output:** `.next/` directory
- **Includes:** Type checking, linting, and minification
- **Note:** Runs `prebuild` validation automatically

### `npm start`
Starts the production server (requires build first).

```bash
npm run build
npm start
```

- **Use:** Testing production builds locally
- **Port:** http://localhost:3000

## Development Tools

### `npm run lint`
Runs ESLint to check for code quality issues.

```bash
npm run lint
```

- **Checks:** All TypeScript/JavaScript files
- **Config:** `.eslintrc` + Next.js defaults
- **Exit Code:** Non-zero if issues found

### `npm run lint:fix`
Automatically fixes linting issues where possible.

```bash
npm run lint:fix
```

- **Fixes:** Auto-fixable issues (formatting, import order, etc.)
- **Manual:** Displays issues that require manual attention
- **Recommended:** Run before committing code

### `npm run type-check`
Runs TypeScript compiler in check-only mode (no output).

```bash
npm run type-check
```

- **Validates:** Type safety across all `.ts` and `.tsx` files
- **Fast:** No compilation, just type checking
- **Use:** Before committing, during code review

### `npm run type-check:watch`
Runs TypeScript type checking in watch mode.

```bash
npm run type-check:watch
```

- **Watches:** File changes and re-checks types automatically
- **Use:** Keep running during development for instant type feedback
- **Tip:** Run in a separate terminal

## Cleanup Scripts

### `npm run clean`
Removes build artifacts and cache directories.

```bash
npm run clean
```

- **Removes:** `.next/`, `out/`, `dist/`
- **Use:** When build issues occur or before a fresh build
- **Safe:** Doesn't remove `node_modules`

### `npm run clean:cache`
Cleans only the npm/Next.js cache.

```bash
npm run clean:cache
```

- **Removes:** `node_modules/.cache/`
- **Use:** When experiencing caching issues
- **Faster:** Than full clean

## Advanced Scripts

### `npm run analyze`
Builds the project with bundle analysis enabled.

```bash
npm run analyze
```

- **Purpose:** Analyze bundle size and composition
- **Output:** Bundle size report
- **Use:** Optimize build size and identify large dependencies

### `npm run validate`
Runs both type checking and linting.

```bash
npm run validate
```

- **Combines:** `type-check` + `lint`
- **Use:** Pre-commit validation, CI/CD pipeline
- **Exit Code:** Non-zero if any check fails

### `npm run prebuild`
Automatically runs before `npm run build`.

```bash
# Runs automatically, but can be called manually:
npm run prebuild
```

- **Runs:** `npm run validate`
- **Purpose:** Prevent broken code from being built
- **Configured:** Via npm's pre-hook system

## Workflow Examples

### Daily Development Workflow

```bash
# Start development server
npm run dev

# In another terminal, watch for type errors
npm run type-check:watch
```

### Before Committing

```bash
# Validate code quality
npm run validate

# Auto-fix linting issues
npm run lint:fix

# Check types again
npm run type-check
```

### Troubleshooting Build Issues

```bash
# Clean everything
npm run clean

# Clear cache
npm run clean:cache

# Rebuild
npm run build
```

### Pre-Deployment Checklist

```bash
# 1. Validate code
npm run validate

# 2. Clean build
npm run clean

# 3. Production build
npm run build

# 4. Test production server locally
npm start

# 5. Analyze bundle size
npm run analyze
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Validate
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run validate
      - run: npm run build
```

## Script Combinations

### Quick Quality Check
```bash
npm run lint:fix && npm run type-check
```

### Full Clean Build
```bash
npm run clean && npm run build
```

### Development Reset
```bash
npm run clean && npm run clean:cache && npm install && npm run dev
```

## Troubleshooting

### "Type check failed" errors
- Review TypeScript errors in console
- Ensure all dependencies are installed: `npm install`
- Check `tsconfig.json` configuration

### "Lint failed" errors
- Run `npm run lint:fix` to auto-fix issues
- Review remaining errors manually
- Check ESLint configuration

### Clean script doesn't work
- On Windows: Ensure Node.js is in PATH
- Manually delete `.next` folder if needed
- Run as administrator if permission issues occur

### Build hangs or fails
- Run `npm run clean`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for syntax errors: `npm run type-check`

## Performance Tips

1. **Use watch mode** during development: `npm run type-check:watch`
2. **Clean periodically** to avoid stale cache issues
3. **Run validate** before pushing to catch issues early
4. **Use analyze** to monitor bundle size growth

## Adding New Scripts

To add a new script:

1. Edit `package.json`
2. Add to the `"scripts"` section
3. Document here in this file
4. Test the script works: `npm run <script-name>`

## Environment-Specific Scripts

Scripts automatically use `.env.local` for configuration. See `docs/environment-configuration.md` for details.

- **Development:** Uses `.env.local` with debug flags
- **Production:** Set `NODE_ENV=production` in environment
- **Testing:** Create `.env.test.local` for test-specific config

## Next Steps

- Add testing scripts when test suite is implemented
- Add deployment scripts for production
- Consider adding git hooks with `husky` for automatic validation









