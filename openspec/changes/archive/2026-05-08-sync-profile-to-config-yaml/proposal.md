## Why

Currently, the profile mode is only stored in the global config file (`~/.config/testspec/config.json`), but not in the project-local `testspec/config.yaml`. This creates inconsistency and makes it harder for users to understand which profile is active in a project.

Users expect that:
1. After running `testspec init`, the `testspec/config.yaml` should reflect the current profile mode
2. After running `testspec config profile <name>` followed by `testspec update`, the project config should be in sync with the global config

This proposal ensures profile consistency between global config and project config.

## What Changes

### 1. Add profile field to ProjectConfig schema

Extend the `ProjectConfigSchema` in `src/core/project-config.ts` to include an optional `profile` field that mirrors the global config's profile setting.

### 2. Update init command to write profile

Modify `src/core/init.ts` to:
- Read the current global config profile
- Write the profile to `testspec/config.yaml` when creating the config file
- Ensure backward compatibility (only write if creating new config, not updating)

### 3. Update sync logic in update command

Modify `src/core/update.ts` to:
- Read the current global config profile after processing
- Sync the profile to `testspec/config.yaml` if different from current value
- This ensures that after `testspec config profile <name>` + `testspec update`, the profile is persisted in both places

### 4. Update config-prompts.ts for serialization

Modify `src/core/config-prompts.ts` to include the profile field in the serialized YAML output when generating config.yaml.

## Capabilities

### New Capabilities

- `project-profile-sync`: Project-level profile synchronization with global config

### Modified Capabilities

- `cli-init`: Write initial profile to project config
- `cli-update`: Sync profile to project config after update
- `project-config`: New profile field in schema

## Impact

- `src/core/project-config.ts` - Add profile field to ProjectConfigSchema
- `src/core/config-prompts.ts` - Include profile in serializeConfig output
- `src/core/init.ts` - Write profile to config.yaml during init
- `src/core/update.ts` - Sync profile to config.yaml after update