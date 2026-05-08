## 1. ProjectConfig Schema Update

- [x] 1.1 Add `profile` field to `ProjectConfigSchema` in `src/core/project-config.ts`
- [x] 1.2 Add profile field to TypeScript type `ProjectConfig`
- [x] 1.3 Add validation for profile field (optional, enum: core/custom/sdt)

## 2. Config Serialization Update

- [x] 2.1 Modify `serializeConfig` in `src/core/config-prompts.ts` to accept profile parameter
- [x] 2.2 Add profile line after schema in YAML output
- [x] 2.3 Test serialization with various profile values ✓

## 3. Init Command Update

- [x] 3.1 Modify `createConfig` method in `src/core/init.ts` to use project default
- [x] 3.2 Pass profile to `serializeConfig` when creating new config
- [x] 3.3 Test init creates config.yaml with profile field ✓

## 4. Update Command Update

- [x] 4.1 Modify `execute` method in `src/core/update.ts` to read config.yaml first
- [x] 4.2 Read existing project config (if exists)
- [x] 4.3 Compare and sync profile to config.yaml if different
- [x] 4.4 Test profile sync after `testspec config profile <name>` + `testspec update` ✓

## 5. Testing

- [x] 5.1 Test init with different profiles (core, custom, sdt) ✓
- [x] 5.2 Test update syncs profile correctly ✓
- [x] 5.3 Test existing config.yaml is not overwritten with wrong profile ✓
- [x] 5.4 Run existing test suite to ensure no regressions ✓