## Why

When running `testspec init`, the system creates a new `config.yaml` file with the project's default profile (`DEFAULT_PROJECT_PROFILE = 'sdt'`). However, `getProfileWorkflows()` now falls back to the global config's profile when `config.yaml` is missing. This means:

1. Init creates `config.yaml` with hardcoded `profile: sdt`
2. But users who configured a different profile in global config (e.g., `profile: core`) will have inconsistent behavior

The fix: When creating `config.yaml`, check if there's a global config profile and use it; otherwise fall back to the project default.

## What Changes

- Modify `init.ts`'s `createConfig()` to read global config's profile
- When generating `config.yaml`, use `globalConfig.profile` if available
- If no global profile, fall back to `DEFAULT_PROJECT_PROFILE`

## Capabilities

### New Capabilities
- `init-config-global-profile`: When `testspec init` creates a new `config.yaml`, it reads the profile from global config first, using that value instead of hardcoded project default.

### Modified Capabilities
- (none - this is a bug fix)

## Impact

- **Affected**: `src/core/init.ts` - `createConfig()` method
- **Behavior**: First-time init with global profile set will create `config.yaml` with that profile
- **No Breaking Changes**: Existing behavior preserved if no global profile configured