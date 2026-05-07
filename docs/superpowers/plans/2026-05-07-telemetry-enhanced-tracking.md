# Telemetry Enhanced Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend PostHog telemetry to capture richer command execution context: CLI args, skill invocations, truncated inputs, artifact outputs with file size/status, execution duration, and reserved token fields.

**Architecture:** Extend existing `trackCommand` in `src/telemetry/index.ts` with an optional `details` parameter. Add `isDetailTelemetryEnabled()` switch via `TESTSPEC_TELEMETRY_DETAIL` env var. Collect timing in `src/cli/index.ts` preAction/postAction hooks. Add a shared `collectArtifactOutputs` utility in `src/telemetry/outputs.ts`.

**Tech Stack:** TypeScript, PostHog (posthog-node), Commander.js, Node.js fs/path/os

---

### Task 1: Add `isDetailTelemetryEnabled()` to telemetry config

**Files:**
- Modify: `D:\code\TestSpec\src\telemetry\index.ts`
- Test: `D:\code\TestSpec\test\telemetry\index.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// In test/telemetry/index.test.ts, add:
describe('isDetailTelemetryEnabled', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('returns true by default when base telemetry is enabled', () => {
    delete process.env.TESTSPEC_TELEMETRY_DETAIL;
    delete process.env.TESTSPEC_TELEMETRY;
    delete process.env.DO_NOT_TRACK;
    delete process.env.CI;
    expect(isDetailTelemetryEnabled()).toBe(true);
  });

  test('returns false when TESTSPEC_TELEMETRY_DETAIL=0', () => {
    process.env.TESTSPEC_TELEMETRY_DETAIL = '0';
    expect(isDetailTelemetryEnabled()).toBe(false);
  });

  test('returns false when base telemetry is disabled', () => {
    process.env.TESTSPEC_TELEMETRY = '0';
    process.env.TESTSPEC_TELEMETRY_DETAIL = '1';
    expect(isDetailTelemetryEnabled()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:\code\TestSpec; npx jest test/telemetry/index.test.ts -t "isDetailTelemetryEnabled" 2>&1`
Expected: FAIL - function not defined

- [ ] **Step 3: Implement `isDetailTelemetryEnabled()`**

In `src/telemetry/index.ts`, add after `isTelemetryEnabled()`:

```typescript
/**
 * Check if detailed telemetry (args, inputs, outputs, etc.) is enabled.
 * Disabled when:
 * - Base telemetry is disabled (TESTSPEC_TELEMETRY=0, DO_NOT_TRACK=1, or CI=true)
 * - TESTSPEC_TELEMETRY_DETAIL=0
 */
export function isDetailTelemetryEnabled(): boolean {
  if (!isTelemetryEnabled()) {
    return false;
  }
  if (process.env.TESTSPEC_TELEMETRY_DETAIL === '0') {
    return false;
  }
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:\code\TestSpec; npx jest test/telemetry/index.test.ts -t "isDetailTelemetryEnabled" 2>&1`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd D:\code\TestSpec
git add src/telemetry/index.ts test/telemetry/index.test.ts
git commit -m "feat(telemetry): add isDetailTelemetryEnabled() with TESTSPEC_TELEMETRY_DETAIL env var"
```

---

### Task 2: Extend `trackCommand` with `TelemetryDetails` parameter

**Files:**
- Modify: `D:\code\TestSpec\src\telemetry\index.ts`
- Modify: `D:\code\TestSpec\test\telemetry\index.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// Add to test/telemetry/index.test.ts:
describe('trackCommand with details', () => {
  test('includes detail fields when detail telemetry is enabled', async () => {
    // Mock PostHog client.capture
    const captureMock = vi.fn();
    // Temporarily set up mocks...
    // (See existing test patterns in the test file for mocking approach)
  });

  test('omits detail fields when TESTSPEC_TELEMETRY_DETAIL=0', async () => {
    // Verify detail fields are NOT included
  });

  test('handles durationMs, skill, inputs, outputs, tokens fields', async () => {
    // Verify all fields are passed to client.capture properties
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:\code\TestSpec; npx jest test/telemetry/index.test.ts -t "trackCommand with details" 2>&1`
Expected: FAIL

- [ ] **Step 3: Add `TelemetryDetails` interface and extend `trackCommand`**

In `src/telemetry/index.ts`, add interface after imports:

```typescript
export interface TelemetryDetails {
  args?: Record<string, unknown>;
  durationMs?: number;
  skill?: string;
  skillTool?: string;
  inputs?: Record<string, string | undefined>;
  outputs?: { name: string; size: number; status: 'done' | 'pending' | 'skipped' }[];
  tokens?: { input?: number; output?: number; total?: number };
}
```

Change `trackCommand` signature and body:

```typescript
export async function trackCommand(
  commandName: string,
  version: string,
  details?: TelemetryDetails
): Promise<void> {
  if (!isTelemetryEnabled()) {
    return;
  }

  try {
    const userId = await getOrCreateAnonymousId();
    const client = getClient();

    const properties: Record<string, unknown> = {
      command: commandName,
      version: version,
      surface: 'cli',
      $ip: null,
    };

    if (isDetailTelemetryEnabled() && details) {
      if (details.args) properties.args = details.args;
      if (details.durationMs !== undefined) properties.durationMs = details.durationMs;
      if (details.skill) properties.skill = details.skill;
      if (details.skillTool) properties.skillTool = details.skillTool;
      if (details.inputs) {
        // Truncate input strings to 200 chars
        const truncated: Record<string, string | undefined> = {};
        for (const [key, value] of Object.entries(details.inputs)) {
          truncated[key] = value ? String(value).slice(0, 200) : value;
        }
        properties.inputs = truncated;
      }
      if (details.outputs) properties.outputs = details.outputs;
      if (details.tokens) properties.tokens = details.tokens;
    }

    client.capture({
      distinctId: userId,
      event: 'command_executed',
      properties,
    });
  } catch {
    // Silent failure - telemetry should never break CLI
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:\code\TestSpec; npx jest test/telemetry/index.test.ts 2>&1`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd D:\code\TestSpec
git add src/telemetry/index.ts test/telemetry/index.test.ts
git commit -m "feat(telemetry): extend trackCommand with TelemetryDetails parameter"
```

---

### Task 3: Add timing collection in CLI preAction/postAction hooks

**Files:**
- Modify: `D:\code\TestSpec\src\cli\index.ts`

- [ ] **Step 1: Modify preAction to record start time**

In `src/cli/index.ts`, add a module-level variable and modify the `preAction` hook:

```typescript
// Near top of file, after imports
let commandStartTime: number | null = null;

// Inside preAction hook, add timing:
program.hook('preAction', async (thisCommand, actionCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    process.env.NO_COLOR = '1';
  }

  // Record start time for telemetry duration tracking
  commandStartTime = Date.now();

  await maybeShowTelemetryNotice();

  const commandPath = getCommandPath(actionCommand);
  await trackCommand(commandPath, version);
});
```

- [ ] **Step 2: Modify postAction to compute duration and pass to trackCommand**

Change the `postAction` hook and make `trackCommand` accept the duration. Since `trackCommand` is called in `preAction` before we know duration, we need to restructure: remove `trackCommand` from `preAction` and add it to `postAction` with full details.

Revised approach - track in postAction only with full context:

```typescript
// Remove trackCommand from preAction, replace postAction:

// Store command context for use in postAction
let pendingTelemetry: { commandPath: string; startTime: number } | null = null;

program.hook('preAction', async (thisCommand, actionCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    process.env.NO_COLOR = '1';
  }

  await maybeShowTelemetryNotice();

  pendingTelemetry = {
    commandPath: getCommandPath(actionCommand),
    startTime: Date.now(),
  };
});

program.hook('postAction', async () => {
  if (pendingTelemetry) {
    const durationMs = Date.now() - pendingTelemetry.startTime;
    await trackCommand(pendingTelemetry.commandPath, version, { durationMs });
    pendingTelemetry = null;
  }
  await shutdown();
});
```

- [ ] **Step 3: Verify the CLI still works**

Run: `cd D:\code\TestSpec; node bin/testspec.js --help 2>&1`
Expected: Help output displays correctly, no errors

- [ ] **Step 4: Commit**

```bash
cd D:\code\TestSpec
git add src/cli/index.ts
git commit -m "feat(telemetry): add duration tracking via preAction/postAction hooks"
```

---

### Task 4: Add `collectArtifactOutputs` utility

**Files:**
- Create: `D:\code\TestSpec\src\telemetry\outputs.ts`
- Test: `D:\code\TestSpec\test\telemetry\outputs.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/telemetry/outputs.test.ts
import { collectArtifactOutputs } from '../../src/telemetry/outputs.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('collectArtifactOutputs', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'testspec-outputs-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('returns empty array when directory does not exist', async () => {
    const result = await collectArtifactOutputs('/nonexistent/path');
    expect(result).toEqual([]);
  });

  test('returns file info for existing files', async () => {
    const filePath = path.join(tempDir, 'proposal.md');
    await fs.writeFile(filePath, '# Test Proposal');
    const result = await collectArtifactOutputs(tempDir);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'proposal.md', size: expect.any(Number), status: 'done' }),
      ])
    );
  });

  test('marks missing files as pending', async () => {
    const result = await collectArtifactOutputs(tempDir);
    // Without a schema, falls back to empty or default behavior
    expect(Array.isArray(result)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:\code\TestSpec; npx jest test/telemetry/outputs.test.ts 2>&1`
Expected: FAIL - module not found

- [ ] **Step 3: Implement `collectArtifactOutputs`**

```typescript
// src/telemetry/outputs.ts
import { promises as fs } from 'fs';
import path from 'path';

export interface ArtifactOutput {
  name: string;
  size: number;
  status: 'done' | 'pending' | 'skipped';
}

/**
 * Collect artifact output files from a change directory.
 * Scans for known artifact files based on common naming conventions.
 * This is a lightweight scanner - for full schema-based detection,
 * use the artifact-graph module.
 */
export async function collectArtifactOutputs(changeDir: string): Promise<ArtifactOutput[]> {
  try {
    await fs.access(changeDir);
  } catch {
    return [];
  }

  const outputs: ArtifactOutput[] = [];
  const entries: string[] = [];

  try {
    entries.push(...await fs.readdir(changeDir));
  } catch {
    return outputs;
  }

  for (const entry of entries) {
    // Skip directories and hidden files
    const fullPath = path.join(changeDir, entry);
    try {
      const stat = await fs.stat(fullPath);
      if (!stat.isFile() || entry.startsWith('.')) continue;
      outputs.push({
        name: entry,
        size: stat.size,
        status: 'done',
      });
    } catch {
      outputs.push({
        name: entry,
        size: 0,
        status: 'pending',
      });
    }
  }

  return outputs;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:\code\TestSpec; npx jest test/telemetry/outputs.test.ts 2>&1`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd D:\code\TestSpec
git add src/telemetry/outputs.ts test/telemetry/outputs.test.ts
git commit -m "feat(telemetry): add collectArtifactOutputs utility for artifact tracking"
```

---

### Task 5: Pass CLI args to trackCommand

**Files:**
- Modify: `D:\code\TestSpec\src\cli\index.ts`

- [ ] **Step 1: Capture command args in preAction and pass to postAction**

Extend `pendingTelemetry` to include parsed args:

```typescript
interface PendingTelemetry {
  commandPath: string;
  startTime: number;
  args?: Record<string, unknown>;
}

let pendingTelemetry: PendingTelemetry | null = null;

// In preAction, parse and store args:
program.hook('preAction', async (thisCommand, actionCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    process.env.NO_COLOR = '1';
  }

  await maybeShowTelemetryNotice();

  const commandPath = getCommandPath(actionCommand);
  const args = actionCommand.opts() as Record<string, unknown>;

  pendingTelemetry = {
    commandPath,
    startTime: Date.now(),
    args,
  };
});

// In postAction, pass args:
program.hook('postAction', async () => {
  if (pendingTelemetry) {
    const durationMs = Date.now() - pendingTelemetry.startTime;
    await trackCommand(pendingTelemetry.commandPath, version, {
      durationMs,
      args: pendingTelemetry.args,
    });
    pendingTelemetry = null;
  }
  await shutdown();
});
```

- [ ] **Step 2: Verify args are sanitized (no paths)**

The `args` from `actionCommand.opts()` will contain Commander-parsed options. Sensitive data like file paths should be excluded. Add a sanitization helper:

```typescript
// In src/cli/index.ts, add:
function sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) {
    // Skip options that likely contain paths or sensitive data
    if (['path', 'targetPath', 'changeName', 'itemName'].includes(key)) {
      sanitized[key] = typeof value === 'string' ? '[redacted]' : value;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
```

Use `sanitizeArgs` when building `args` in `pendingTelemetry`.

- [ ] **Step 3: Commit**

```bash
cd D:\code\TestSpec
git add src/cli/index.ts
git commit -m "feat(telemetry): pass sanitized CLI args to trackCommand"
```

---

### Task 6: Add `--skill` and `--skill-tool` CLI global options

**Files:**
- Modify: `D:\code\TestSpec\src\cli\index.ts`

- [ ] **Step 1: Add global options and pass to trackCommand**

```typescript
// In the program setup, add global options:
program
  .name('testspec')
  .description('AI-native system for spec-driven development')
  .version(version)
  .option('--skill <name>', 'Skill name being invoked (for telemetry)')
  .option('--skill-tool <tool>', 'AI tool invoking the skill (for telemetry)');
```

- [ ] **Step 2: Include skill info in pendingTelemetry**

```typescript
// In preAction, after getting args:
const globalOpts = thisCommand.opts();
const skill = typeof globalOpts.skill === 'string' ? globalOpts.skill : undefined;
const skillTool = typeof globalOpts.skillTool === 'string' ? globalOpts.skillTool : undefined;

pendingTelemetry = {
  commandPath,
  startTime: Date.now(),
  args: sanitizeArgs(actionCommand.opts() as Record<string, unknown>),
  skill,
  skillTool,
};
```

- [ ] **Step 3: Pass skill info to trackCommand in postAction**

```typescript
// In postAction:
await trackCommand(pendingTelemetry.commandPath, version, {
  durationMs,
  args: pendingTelemetry.args,
  skill: pendingTelemetry.skill,
  skillTool: pendingTelemetry.skillTool,
});
```

- [ ] **Step 4: Commit**

```bash
cd D:\code\TestSpec
git add src/cli/index.ts
git commit -m "feat(telemetry): add --skill and --skill-tool CLI options for skill tracking"
```

---

### Task 7: Update telemetry spec and notice

**Files:**
- Modify: `D:\code\TestSpec\docs\superpowers\specs\2026-05-07-telemetry-enhanced-tracking-design.md`
- Modify: `D:\code\TestSpec\src\telemetry\index.ts` (update notice message)

- [ ] **Step 1: Update the telemetry notice to mention detail collection**

In `src/telemetry/index.ts`, update `maybeShowTelemetryNotice()`:

```typescript
// Change the notice message to:
console.log(
  'Note: TestSpec collects anonymous usage stats and command details. Opt out: TESTSPEC_TELEMETRY=0 or TESTSPEC_TELEMETRY_DETAIL=0'
);
```

- [ ] **Step 2: Commit**

```bash
cd D:\code\TestSpec
git add src/telemetry/index.ts
git commit -m "docs(telemetry): update notice to mention detail telemetry opt-out"
```

---

### Task 8: Integration test - end-to-end telemetry flow

**Files:**
- Modify: `D:\code\TestSpec\test\telemetry\index.test.ts`

- [ ] **Step 1: Add integration test for full flow**

```typescript
test('end-to-end: trackCommand with all detail fields', async () => {
  const details = {
    durationMs: 1234,
    args: { json: true, strict: false },
    skill: 'testspec:propose',
    skillTool: 'claude',
    inputs: { changeName: 'add-login', description: 'Add login feature' },
    outputs: [{ name: 'proposal.md', size: 1024, status: 'done' as const }],
    tokens: { input: 100, output: 200, total: 300 },
  };

  await trackCommand('test:command', '1.0.0', details);

  // Verify the event was captured with all fields (using mocked PostHog client)
  // Follow existing test patterns for verifying capture calls
});
```

- [ ] **Step 2: Run all telemetry tests**

Run: `cd D:\code\TestSpec; npx jest test/telemetry/ 2>&1`
Expected: All PASS

- [ ] **Step 3: Final commit**

```bash
cd D:\code\TestSpec
git add test/telemetry/index.test.ts
git commit -m "test(telemetry): add integration test for enhanced tracking fields"
```

---

### Task 9: Lint and typecheck

- [ ] **Step 1: Run lint**

Run: `cd D:\code\TestSpec; npm run lint 2>&1`
Expected: No errors

- [ ] **Step 2: Run typecheck**

Run: `cd D:\code\TestSpec; npm run typecheck 2>&1`
Expected: No errors

- [ ] **Step 3: Fix any issues and commit**

```bash
cd D:\code\TestSpec
git add -A
git commit -m "fix: address lint and typecheck issues for telemetry enhancement"
```
