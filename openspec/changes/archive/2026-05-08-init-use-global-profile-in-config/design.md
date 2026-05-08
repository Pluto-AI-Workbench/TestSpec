## Context

Currently, `createConfig()` in `init.ts` creates `config.yaml` with hardcoded `profile: sdt`:

```typescript
const yamlContent = serializeConfig({
  schema: DEFAULT_SCHEMA,
  profile: DEFAULT_PROJECT_PROFILE,  // This is 'sdt'
  profiles: DEFAULT_PROFILES
});
```

However, users may have configured a different profile in their global config (`~/.config/testspec/config.json`):
```json
{
  "profile": "core"
}
```

When `getProfileWorkflows()` is called later, it will read from global config if `config.yaml` is missing. This inconsistency causes unexpected behavior.

## Goals / Non-Goals

**Goals:**
- When creating `config.yaml`, read `profile` from global config first
- Use global config profile value instead of hardcoded `DEFAULT_PROJECT_PROFILE`
- Fall back to `DEFAULT_PROJECT_PROFILE` if no global profile is set

**Non-Goals:**
- Do not change how global config is read elsewhere
- Do not modify the profile fallback logic in `getProfileWorkflows()`

## Decisions

### Decision 1: Where to get global config profile?

**Chosen:** Use `getGlobalConfig()` from `global-config.ts`

**Rationale:** This is the existing function used elsewhere in init.ts to read global config. It's already imported.

### Decision 2: How to handle --profile override?

**Chosen:** Preserve `--profile` CLI option behavior - it already overrides global config

**Rationale:** The `--profile` flag should take precedence. The fix only changes the default value when no override is provided.

## Risks / Trade-offs

[Risk] User has global config profile but wants fresh project to use default
→ **Mitigation:** User can explicitly use `--profile sdt` to override

[Risk] Changing this behavior might surprise users who rely on hardcoded `sdt`
→ **Mitigation:** This is consistent with how workflow generation already works

## Migration Plan

1. Modify `createConfig()` to call `getGlobalConfig()` and use `profile` from it
2. Add test to verify config.yaml contains correct profile from global config
3. No migration needed - transparent change for new projects