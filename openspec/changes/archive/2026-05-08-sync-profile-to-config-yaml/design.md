## Context

Currently, the profile mode (`core`, `custom`, `sdt`) is stored in the global config file at `~/.config/testspec/config.json`, but the project-local `testspec/config.yaml` does not track this. Users running `testspec config profile` followed by `testspec update` expect the project config to reflect the current profile, similar to how global config does.

## Goals / Non-Goals

**Goals:**

- Add profile field to project config schema
- Write profile to config.yaml during init
- Sync profile to config.yaml during update

**Non-Goals:**

- Changing profile/workflow behavior
- Adding project-level config override capability (profile always synced from global)

## Decisions

### 1. Add profile field to ProjectConfigSchema

Extend the `ProjectConfigSchema` in `src/core/project-config.ts`:

```ts
export const ProjectConfigSchema = z.object({
  schema: z.string().min(1),
  profile: z.enum(['core', 'custom', 'sdt']).optional(),
  context: z.string().optional(),
  rules: z.record(z.string(), z.array(z.string())).optional(),
  profiles: z.record(z.string(), z.array(z.string())).optional(),
});
```

The profile field is optional to maintain backward compatibility with existing configs.

### 2. Include profile in config serialization

Modify `serializeConfig` in `src/core/config-prompts.ts` to accept and include the profile field:

```ts
export function serializeConfig(config: Partial<ProjectConfig>): string {
  // ... existing code ...
  
  // Profile (optional, written after schema)
  if (config.profile) {
    lines.splice(1, 0, `profile: ${config.profile}\n`);  // Insert after schema
  }
  
  // ... rest of code ...
}
```

### 3. Init command changes

In `src/core/init.ts`, modify the `createConfig` method:

1. Read global config profile
2. Pass profile to `serializeConfig`
3. Write to config.yaml

The profile is only written during new config creation, not when updating existing config.

### 4. Update command changes

In `src/core/update.ts`, after processing all tools:

1. Read current global config profile
2. Read existing project config (if any)
3. If profile differs from project config, update the config.yaml

This ensures that after `testspec config profile <name>` + `testspec update`, the profile is persisted in both global and project configs.

## Implementation Notes

- Profile is read-only in project config (always synced from global)
- No validation needed - value comes from validated global config
- Profile appears after `schema:` in YAML for readability

## Risks / Trade-offs

**Risk: Config file format changes**
Existing users may have custom config.yaml formats.
→ Mitigation: Profile is optional; only written if not present or during new config creation.

**Risk: Race condition with concurrent updates**
Multiple tools updating config simultaneously.
→ Mitigation: Config is updated after all tool processing; single write operation.

## Rollout Plan

1. Add profile field to ProjectConfigSchema
2. Update serializeConfig to include profile
3. Modify init.ts to pass profile during config creation
4. Modify update.ts to sync profile after processing
5. Test with various profile switches