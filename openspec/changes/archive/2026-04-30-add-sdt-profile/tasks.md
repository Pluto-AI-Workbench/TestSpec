## 1. Type & Default Changes (global-config.ts)

- [x] 1.1 Add `'sdt'` to the `Profile` type union: `type Profile = 'core' | 'custom' | 'sdt'`
- [x] 1.2 Change `DEFAULT_CONFIG.profile` from `'core'` to `'sdt'`

## 2. Profile Workflow Mapping (profiles.ts)

- [x] 2.1 Define `SDT_WORKFLOWS` constant: `['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] as const`
- [x] 2.2 Export `SDT_WORKFLOWS` from the module
- [x] 2.3 Add `sdt` branch in `getProfileWorkflows()`: return `SDT_WORKFLOWS` when `profile === 'sdt'`

## 3. CLI Profile Validation (init.ts)

- [x] 3.1 Update `resolveProfileOverride()` to accept `'sdt'` alongside `'core'` and `'custom'`

## 4. CLI Option Description (cli/index.ts)

- [x] 4.1 Update `--profile <profile>` description to include `sdt` (e.g., "Override global config profile (core, custom, or sdt)")

## 5. Verification

- [x] 5.1 Run `pnpm run build` to verify no TypeScript errors
- [x] 5.2 Run `pnpm test` to verify existing tests still pass
- [x] 5.3 Run `npx openspec config profile` manually (or unit test) to verify `sdt` appears as a valid profile option. [Verified via config-profile.test.ts 18/18 ✅]
