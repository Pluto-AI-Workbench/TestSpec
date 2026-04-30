## Context

TestSpec uses a profile system (`Profile` type in `global-config.ts`) to control which workflows are exposed to users during `init` and `update`. Currently two profiles exist:
- `core` (default): exposes `['propose', 'explore', 'apply', 'archive']`
- `custom`: exposes all workflows (or a user-specified subset)

The four SDT workflows (`sdt-new`, `sdt-build`, `sdt-design`, `sdt-clarify`) and their skill directory mappings (`WORKFLOW_TO_SKILL_DIR`) in `init.ts` already exist in the codebase, but there is no dedicated profile that surfaces only them. Users wanting the SDT experience must currently use `custom` which exposes all workflows.

The goal is to introduce an `sdt` profile that includes only the four SDT workflows, and make it the new default so new users get the SDT experience out of the box.

## Goals / Non-Goals

**Goals:**
- Add `sdt` as a valid `Profile` type alongside `core` and `custom`
- Define `SDT_WORKFLOWS = ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify']` in `profiles.ts`
- Add `sdt` branch in `getProfileWorkflows()` returning `SDT_WORKFLOWS`
- Change `DEFAULT_CONFIG.profile` from `'core'` to `'sdt'` in `global-config.ts`
- Accept `'sdt'` in `resolveProfileOverride()` validation in `init.ts`
- Update `--profile` CLI option description in `cli/index.ts`

**Non-Goals:**
- No changes to `WORKFLOW_TO_SKILL_DIR` (mappings already exist)
- No changes to skill generation logic or templates
- No new CLI commands or skills to create (the four `testspec-sdt-*` skills already exist)
- No migration of existing projects (this only affects new inits and global config defaults)

## Decisions

**Decision 1: Where to define `SDT_WORKFLOWS`**
- **Choice**: Define `SDT_WORKFLOWS` as a `const` export in `profiles.ts`, alongside `CORE_WORKFLOWS` and `ALL_WORKFLOWS`
- **Rationale**: Consistent with existing pattern; all workflow lists live in `profiles.ts`
- **Alternatives considered**: Defining it in `global-config.ts` — rejected because `profiles.ts` is the dedicated module for workflow-profile mapping logic

**Decision 2: Default profile change strategy**
- **Choice**: Change `DEFAULT_CONFIG.profile` to `'sdt'` in `global-config.ts`
- **Rationale**: Simple, single-point change. The `getGlobalConfig()` merge logic already handles backward compatibility — existing configs without a `profile` field will get the new default via the merge with `DEFAULT_CONFIG`
- **Alternatives considered**: Using an env variable override — overkill for a default change

**Decision 3: `resolveProfileOverride()` validation approach**
- **Choice**: Add `'sdt'` to the explicit equality check alongside `'core'` and `'custom'`
- **Rationale**: Consistent with existing validation pattern; `Profile` is a finite union type so exhaustive checks are feasible
- **Note**: The `Profile` type in `global-config.ts` must also be updated to include `'sdt'`

## Risks / Trade-offs

- **[Risk] Existing users with no saved profile get `sdt` after upgrade** → **Mitigation**: The `getGlobalConfig()` merge in `global-config.ts` only applies `DEFAULT_CONFIG` fields when they're missing from the loaded config. Users who have already run `testspec init` or `testspec config profile` will have a `profile` field saved in their global config and will NOT be affected. Only users without a saved global config (first-time users) get the new default, which is the intended behavior.
- **[Risk] Breaking change for users scripting `--profile core`** → **Mitigation**: `core` remains a valid profile value. Only the default changed. Users explicitly passing `--profile core` are unaffected. Document in changelog.
- **[Trade-off] `sdt` profile only has 4 workflows vs `core`'s 4 and `custom`'s all** → Acceptable: the SDT profile is intentionally focused on the spec-driven testing workflow.
