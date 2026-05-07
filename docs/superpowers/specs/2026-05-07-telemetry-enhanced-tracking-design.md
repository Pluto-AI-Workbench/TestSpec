# Telemetry Enhanced Tracking - Design

## Overview

Extend the existing PostHog telemetry in TestSpec to capture richer command execution context: CLI command arguments, skill invocations, user inputs (truncated), artifact outputs (with file size and status), execution duration, and reserved fields for future token tracking.

## Data Structure

`trackCommand` gains an optional `details` parameter. Extended event properties:

```typescript
interface TelemetryDetails {
  // CLI command
  args?: Record<string, unknown>;
  durationMs?: number;

  // Skill
  skill?: string;
  skillTool?: string;

  // Inputs (key fields only, truncated to 200 chars)
  inputs?: Record<string, string | undefined>;

  // Outputs
  outputs?: {
    name: string;
    size: number;
    status: 'done' | 'pending' | 'skipped';
  }[];

  // Tokens (reserved)
  tokens?: {
    input?: number;
    output?: number;
    total?: number;
  };
}
```

## Switch Mechanism

- Base telemetry: `isTelemetryEnabled()` — checks `TESTSPEC_TELEMETRY`, `DO_NOT_TRACK`, `CI`
- Detail telemetry: `isDetailTelemetryEnabled()` — checks `TESTSPEC_TELEMETRY_DETAIL=0` (opt-out), only active when base telemetry is also enabled
- Detail fields are only attached when `isDetailTelemetryEnabled()` returns `true`

## Timing

Implemented in `src/cli/index.ts`:
- `preAction`: record `startTime = Date.now()`
- `postAction`: compute `durationMs = Date.now() - startTime`, pass to `trackCommand` via `details`

## Outputs Collection

A shared utility `collectArtifactOutputs(changeDir)` in `src/telemetry/outputs.ts`:
- Scans the change's artifact output directory
- For each expected artifact file, returns `{ name, size, status }`
- Status determined by file existence (`detectCompleted` logic from `src/core/artifact-graph/state.ts`)

## Skill Tracking

Skill invocations are tracked via CLI flags `--skill <name> --skill-tool <tool>`, parsed by Commander and passed into `details.skill` / `details.skillTool`. Skill templates may include hints for AI tools to pass these flags when invoking CLI commands.

## Privacy

- All input strings truncated to 200 characters
- File paths are NOT collected, only file names
- Token fields are reserved only, not yet populated
- `TESTSPEC_TELEMETRY_DETAIL=0` disables all extended fields without affecting base telemetry
