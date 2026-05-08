## Context

When `testspec init` runs for the first time, it uses `getProfileWorkflows()` from `src/core/profiles.ts` to determine which workflows (commands/skills) to generate. The current implementation:

1. Reads `profiles` from `config.yaml`
2. If `config.yaml` doesn't exist or profile not found in config, returns **empty array**
3. This causes 0 commands and 0 skills to be generated for known profiles like 'sdt', 'core'

The `DEFAULT_PROFILES` constant in `src/core/config-prompts.ts` already contains the default workflow mappings:
```javascript
DEFAULT_PROFILES = {
  core: ['propose', 'explore', 'apply', 'archive'],
  sdt: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'],
  custom: [/* full workflow list */]
}
```

## Goals / Non-Goals

**Goals:**
- Add fallback to `DEFAULT_PROFILES[profile]` when `config.yaml` is missing or profile not found
- Ensure first-time users get proper workflow generation for known profiles (sdt, core)
- Display a warning message when falling back to built-in defaults

**Non-Goals:**
- Do not modify existing behavior for projects with valid `config.yaml`
- Do not change how custom profiles work
- Unknown profile values should still return empty array (expected behavior)

## Decisions

### Decision 1: Where to add fallback logic?

**Chosen:** Modify `getProfileWorkflows()` in `profiles.ts`

**Rationale:** This is the central function that determines workflows for a given profile. Adding fallback here ensures all callers (init, update, config) benefit automatically.

**Alternative Considered:** Modify `init.ts` to check if workflows is empty and fall back. Rejected because this would only fix init, not other commands.

### Decision 2: How to structure the fallback?

**Chosen:** Check if `configProfiles` is null (config.yaml missing) or if profile not found in config, then use `DEFAULT_PROFILES[profile]` if it exists

**Rationale:** Explicit and clear. The fallback only triggers when config is truly unavailable. If `DEFAULT_PROFILES[profile]` is undefined (unknown profile), we still return empty array - that's expected behavior.

### Decision 3: Warning message strategy

**Chosen:** Log a warning when falling back to built-in defaults

**Rationale:** Users should know that their config.yaml might need to be updated with profile definitions. The warning should be informative but not alarming.

## Risks / Trade-offs

[Risk] User has custom profile name in global config but no matching profile in config.yaml
→ **Mitigation:** Show warning with available profiles in config.yaml

[Risk] User intentionally configured empty profile (edge case)
→ **Mitigation:** Fallback only when profile literally not found, not when it's empty array

[Risk] Adding fallback changes behavior for existing users
→ **Mitigation:** Existing users with valid config.yaml are unaffected - fallback only triggers when config.yaml doesn't exist or profile not found

## Migration Plan

1. Modify `getProfileWorkflows()` to check `DEFAULT_PROFILES` as fallback
2. Add warning log when falling back to built-in defaults
3. Add unit tests to verify fallback behavior
4. No migration needed - this is a transparent fix

## Open Questions

(None - the fix is straightforward)