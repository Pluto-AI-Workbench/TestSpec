## Why

TestSpec currently defaults to the `core` profile which exposes the streamlined workflow (propose, explore, apply, archive). We want to make the SDT (Spec-Driven Testing) workflow the default experience for new users, since it provides a more comprehensive spec-driven testing approach with dedicated commands for test design, building, and clarification.

## What Changes

- Add a new `sdt` profile type that includes only the four SDT workflows: `sdt-new`, `sdt-build`, `sdt-design`, `sdt-clarify`
- Change the default profile from `core` to `sdt` in global config
- Update `resolveProfileOverride()` in `init.ts` to accept `sdt` as a valid profile value
- Update `--profile` CLI option description to mention the new `sdt` profile

## Capabilities

### New Capabilities

_(No new capabilities introduced — this is a configuration/profile change, not a new feature.)_

### Modified Capabilities

_(No spec-level behavior changes — only profile configuration and CLI argument handling.)_

## Impact

- **`src/core/global-config.ts`**: Add `'sdt'` to `Profile` type; change `DEFAULT_CONFIG.profile` from `'core'` to `'sdt'`
- **`src/core/profiles.ts`**: Define `SDT_WORKFLOWS` constant; add `sdt` branch in `getProfileWorkflows()`
- **`src/core/init.ts`**: Accept `'sdt'` in `resolveProfileOverride()` validation
- **`src/cli/index.ts`**: Update `--profile` option description string to include `sdt`
- **Existing `WORKFLOW_TO_SKILL_DIR` mappings** for `sdt-new`, `sdt-build`, `sdt-design`, `sdt-clarify` already exist — no changes needed there
