## 1. Modify getProfileWorkflows Function

- [x] 1.1 Import `DEFAULT_PROFILES` from `config-prompts.ts` in `profiles.ts`
- [x] 1.2 Add fallback logic: when `configProfiles` is null OR `configProfiles[profile]` is undefined, check if `DEFAULT_PROFILES[profile]` exists
- [x] 1.3 Return `DEFAULT_PROFILES[profile]` if it exists, otherwise return empty array (unknown profile)
- [x] 1.4 Update warning messages to indicate fallback behavior

## 2. Add Tests

- [x] 2.1 Create test file `profiles.test.ts` if not exists
- [x] 2.2 Add test: when config.yaml doesn't exist, `getProfileWorkflows('sdt')` returns `['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify']`
- [x] 2.3 Add test: when config.yaml doesn't exist, `getProfileWorkflows('core')` returns `['propose', 'explore', 'apply', 'archive']`
- [x] 2.4 Add test: unknown profile (e.g., 'custom-xyz') returns empty array even when config.yaml missing
- [x] 2.5 Add test: existing behavior preserved when config.yaml has valid profiles