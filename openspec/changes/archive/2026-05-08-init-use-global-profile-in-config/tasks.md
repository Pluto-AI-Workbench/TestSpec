## 1. Modify createConfig Method

- [x] 1.1 Import `getGlobalConfig` if not already imported in `init.ts` (already imported)
- [x] 1.2 In `createConfig()`, get global config and read its `profile` field
- [x] 1.3 Use `globalConfig.profile ?? DEFAULT_PROJECT_PROFILE` instead of hardcoded `DEFAULT_PROJECT_PROFILE`
- [x] 1.4 Verify `getGlobalConfig` is already available (checked - already imported)

## 2. Add Tests

- [x] 2.1 Add test: when global config has `profile: core`, generated config.yaml contains `profile: core`
- [x] 2.2 Add test: when global config has no profile, generated config.yaml uses `DEFAULT_PROJECT_PROFILE`
- [x] 2.3 Add test: `--profile` CLI option still takes precedence over global config