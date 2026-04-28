## 1. Package Metadata Updates

- [x] 1.1 Update `package.json`: name → `@LT86.01/testspec`
- [x] 1.2 Update `package.json`: homepage → `https://github.com/Pluto-AI-Workbench/TestSpec`
- [x] 1.3 Update `package.json`: repository.url → `https://github.com/Pluto-AI-Workbench/TestSpec`
- [x] 1.4 Update `package.json`: bin → `"testspec": "./bin/testspec.js"`
- [x] 1.5 Update `package.json`: scripts.dev:cli → `pnpm build && node bin/testspec.js`
- [x] 1.6 Update `package.json`: author → `TestSpec Contributors`
- [x] 1.7 Update `package.json`: keywords — replace `openspec` with `testspec`
- [x] 1.8 Update `package-lock.json`: name → `@LT86.01/testspec` (all occurrences)
- [x] 1.9 Update `LICENSE`: Copyright → `TestSpec Contributors`
- [x] 1.10 Update `MAINTAINERS.md`: text `OpenSpec` → `TestSpec`

## 2. CLI Binary and Build Updates

- [x] 2.1 Rename `bin/openspec.js` → `bin/testspec.js`
- [x] 2.2 Update `build.js` line 14: `Building OpenSpec...` → `Building TestSpec...`
- [x] 2.3 Update `flake.nix`: pname → `testspec`
- [x] 2.4 Update `flake.nix`: mainProgram → `testspec`
- [x] 2.5 Update `flake.nix`: homepage → `https://github.com/Pluto-AI-Workbench/TestSpec`
- [x] 2.6 Update `flake.nix`: description → `TestSpec - AI-native system for spec-driven development`
- [x] 2.7 Update `ci.yml`: `result/bin/openspec` → `result/bin/testspec`

## 3. Source Code Slash Command Updates

- [x] 3.1 Update `src/` all files: `/opsx:` → `/testspec:` (slash command prefix)
- [x] 3.2 Update `src/` all files: `opsx-` → `testspec-` (hyphenated command names)
- [x] 3.3 Update `src/` all files: tool path patterns `openspec/` → `testspec/` and `openspec-*.md` → `testspec-*.md`
- [x] 3.4 Update `src/` all files: `OpenSpec` text → `TestSpec`
- [x] 3.5 Update `src/` all files: `openspec` (CLI commands, not paths) → `testspec`

## 4. Documentation Updates

- [x] 4.1 Update `README.md`: all `OpenSpec` → `TestSpec`
- [x] 4.2 Update `README.md`: all `openspec` CLI commands → `testspec`
- [x] 4.3 Update `README.md`: all `/opsx:` → `/testspec:`
- [x] 4.4 Update `README.md`: npm package `@fission-ai/openspec` → `@LT86.01/testspec`
- [x] 4.5 Update `README.md`: GitHub URLs `Fission-AI/OpenSpec` → `Pluto-AI-Workbench/TestSpec`
- [x] 4.6 Update `README_OLD.md`: same replacements as README.md
- [x] 4.7 Update `CHANGELOG.md`: all `OpenSpec` → `TestSpec`
- [x] 4.8 Update `CHANGELOG.md`: all `/opsx:` references → `/testspec:`
- [x] 4.9 Update `CHANGELOG.md`: all `Fission-AI/OpenSpec` → `Pluto-AI-Workbench/TestSpec`
- [x] 4.10 Update `docs/` all files: all OpenSpec/openspec references → TestSpec/testspec

## 5. Configuration and CI Updates

- [x] 5.1 Update `eslint.config.js`: GitHub issue URL `Fission-AI/OpenSpec` → `Pluto-AI-Workbench/TestSpec`
- [x] 5.2 Update `.changeset/config.json`: repo → `Pluto-AI-Workbench/TestSpec`
- [x] 5.3 Update `.changeset/README.md`: `@fission-ai/openspec` → `@LT86.01/testspec`
- [x] 5.4 Update `.devcontainer/devcontainer.json`: name → `TestSpec Development`
- [x] 5.5 Update `.devcontainer/README.md`: `OpenSpec` → `TestSpec`

## 6. Verification

- [x] 6.1 Run `pnpm build` to verify the project builds with new name
- [x] 6.2 Run `node bin/testspec.js --version` to verify CLI works
- [x] 6.3 Search entire project (excluding `.opencode/` and `openspec/`) for remaining `openspec` or `OpenSpec` references (fixed `scripts/pack-version-check.mjs`; remaining refs are test fixtures in `test/`, `legacy-cleanup.ts`, and migration scripts - expected)
- [x] 6.4 Run `pnpm test` to verify all tests pass (1393 passed, 9 skipped, 0 failed)
- [x] 6.5 Verify `package.json` can be published with `npm publish --dry-run`
