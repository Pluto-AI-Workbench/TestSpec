## Why

When running `testspec init` for the first time, the system reads the `profiles` mapping from `config.yaml` to determine which workflows (commands/skills) to generate. However, on first initialization, `config.yaml` may not exist yet, causing `getProfileWorkflows()` to return an empty array. This results in **0 commands and 0 skills being generated**, which is unexpected for profiles like 'sdt' or 'core' that have built-in workflow mappings.

## What Changes

- Add fallback logic in `getProfileWorkflows()` to look up `DEFAULT_PROFILES[profile]` when `config.yaml` is missing or profile not found in config
- When `config.yaml` doesn't exist, fall back to the built-in default mapping for the current profile (e.g., 'sdt' → SDT workflows)
- Display a clear message when falling back to built-in defaults
- Maintain backward compatibility: existing projects with valid `config.yaml` continue to work as before
- If the profile value itself has no built-in mapping (unknown profile), return empty array as expected

## Capabilities

### New Capabilities
- `builtin-profile-default-mapping`: When init command runs without `config.yaml`, automatically use `DEFAULT_PROFILES[profile]` to generate commands and skills based on the current profile's built-in workflow mapping.

### Modified Capabilities
- (none - this is a bug fix that maintains existing behavior)

## Impact

- **Affected**: `src/core/profiles.ts` - `getProfileWorkflows()` function
- **Behavior**: First-time init users will get workflows generated based on their profile (default: 'sdt')
- **No Breaking Changes**: Existing projects with valid `config.yaml` are unaffected
- **Edge Case**: New projects now get proper workflow generation on first init