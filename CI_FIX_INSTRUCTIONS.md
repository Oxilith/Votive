# CI Fix Instructions - Rollup Optional Dependencies Issue

## Problem
The CI pipeline is failing in the Test job with the error:
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

- **Failed CI Run**: https://github.com/Oxilith/Votive/actions/runs/20511862731
- **Failed Jobs**: Test (all workspaces: shared, backend, app, prompt-service)
- **PR Number**: 8
- **Branch**: claude-auto-fix-ci-feature/prompt-store-database-20511879241
- **Base Branch**: feature/prompt-store-database

## Root Cause
The `--prefer-offline` flag in the CI workflow's `npm install` command prevents proper installation of platform-specific optional dependencies like `@rollup/rollup-linux-x64-gnu`.

When npm runs with `--prefer-offline`, it tries to use the local cache first and skips installing optional dependencies that aren't cached. This causes Rollup to fail when it tries to load the platform-specific native binary.

**Related Issues**:
- npm/cli#4828
- This is a known npm bug with optional dependencies

## Solution
Replace `npm install --prefer-offline --no-audit` with `npm install --include=optional --no-audit` in the CI workflow.

**⚠️ IMPORTANT**: Due to GitHub App security permissions, workflow file changes cannot be pushed automatically. **You must apply this fix manually.**

## How to Apply the Fix

### Option 1: Apply the Patch File (Quickest)
A patch file `ci-workflow-fix.patch` has been created for you:

```bash
# From the repository root
git checkout feature/prompt-store-database
git apply ci-workflow-fix.patch
git add .github/workflows/ci.yml
git commit -m "fix: use --include=optional for npm install to fix rollup deps"
git push origin feature/prompt-store-database
```

### Option 2: Manual Edit
Edit `.github/workflows/ci.yml` and find all 3 occurrences of:
```yaml
- name: Install dependencies
  run: npm install --prefer-offline --no-audit
```

Replace each with:
```yaml
- name: Install dependencies
  run: npm install --include=optional --no-audit
```

**Locations to update**:
1. **lint** job - around line 27
2. **test** job - around line 52
3. **build** job - around line 85

Then commit and push:
```bash
git add .github/workflows/ci.yml
git commit -m "fix: use --include=optional for npm install to fix rollup deps"
git push origin feature/prompt-store-database
```

## Why This Works
- The `--include=optional` flag explicitly tells npm to install optional dependencies
- This ensures platform-specific rollup binaries (@rollup/rollup-linux-x64-gnu) are installed correctly
- The `.npmrc` file already has `include=optional` configured, but CLI flags take precedence over config files
- Without this flag, npm skips optional dependencies when using `--prefer-offline`

## Previous Attempts
Looking at the git history, several attempts have been made:
- ✗ Commit 297b73c: tried `npm ci --include-optional` - later reverted
- ✗ Commit 77f681b: added `.npmrc` with `include=optional` - not sufficient alone
- ✗ Commit de09e72: tried cleaning node_modules - didn't address root cause
- ✗ Commit ee19126: tried removing npm cache - didn't fix the issue
- ✗ Commit c8b8b0c: restored package-lock.json - still failing
- ✗ Commit 0590591: switched from `npm ci` to `npm install --prefer-offline` - still fails

The key insight: **`--prefer-offline` and optional dependencies don't work well together**. You need to explicitly request optional dependencies with `--include=optional`.

## Verification
After applying the fix:
1. Push the changes to trigger CI
2. Watch the Test job in GitHub Actions
3. Verify that `npm install` completes without errors
4. Confirm that tests run successfully

The CI should now install all required dependencies including the platform-specific rollup binaries.

## Additional Notes
- This fix is required for all environments where rollup is used (shared, backend, app, prompt-service workspaces)
- The issue only manifests in CI because local development environments may have different caching behavior
- Future workaround: Consider pinning rollup version or using a different bundler if this issue persists
