import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  checkbox: vi.fn(),
  confirm: vi.fn(),
}));

async function runConfigCommand(args: string[]): Promise<void> {
  const { registerConfigCommand } = await import('../../src/commands/config.js');
  const program = new Command();
  registerConfigCommand(program);
  await program.parseAsync(['node', 'testspec', 'config', ...args]);
}

async function getPromptMocks(): Promise<{
  select: ReturnType<typeof vi.fn>;
  checkbox: ReturnType<typeof vi.fn>;
  confirm: ReturnType<typeof vi.fn>;
}> {
  const prompts = await import('@inquirer/prompts');
  return {
    select: prompts.select as unknown as ReturnType<typeof vi.fn>,
    checkbox: prompts.checkbox as unknown as ReturnType<typeof vi.fn>,
    confirm: prompts.confirm as unknown as ReturnType<typeof vi.fn>,
  };
}

describe('diffProfileState workflow formatting', () => {
  it('uses explicit "removed" wording when workflows are deleted', async () => {
    const { diffProfileState } = await import('../../src/commands/config.js');

    const diff = diffProfileState(
      { profile: 'custom', delivery: 'both', workflows: ['sdt-new', 'sdt-build'] },
      { profile: 'custom', delivery: 'both', workflows: ['sdt-new'] },
    );

    expect(diff.hasChanges).toBe(true);
    expect(diff.lines).toEqual(['workflows: removed sdt-build']);
  });

  it('uses explicit labels when workflows are added and removed', async () => {
    const { diffProfileState } = await import('../../src/commands/config.js');

    const diff = diffProfileState(
      { profile: 'custom', delivery: 'both', workflows: ['sdt-new', 'sdt-build'] },
      { profile: 'custom', delivery: 'both', workflows: ['sdt-new', 'sdt-design'] },
    );

    expect(diff.hasChanges).toBe(true);
    expect(diff.lines).toEqual(['workflows: added sdt-design; removed sdt-build']);
  });
});

describe('deriveProfileFromWorkflowSelection', () => {
  it('returns custom for an empty workflow selection', async () => {
    const { deriveProfileFromWorkflowSelection } = await import('../../src/commands/config.js');
    expect(deriveProfileFromWorkflowSelection([])).toBe('custom');
  });

  it('returns custom when selection is a superset of sdt workflows', async () => {
    const { deriveProfileFromWorkflowSelection } = await import('../../src/commands/config.js');
    expect(deriveProfileFromWorkflowSelection(['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify', 'sdt-new'])).toBe('custom');
  });

  it('returns sdt when selection has exactly sdt workflows in different order', async () => {
    const { deriveProfileFromWorkflowSelection } = await import('../../src/commands/config.js');
    expect(deriveProfileFromWorkflowSelection(['sdt-clarify', 'sdt-build', 'sdt-new', 'sdt-design'])).toBe('sdt');
  });
});

describe('config profile interactive flow', () => {
  let tempDir: string;
  let originalEnv: NodeJS.ProcessEnv;
  let originalCwd: string;
  let originalTTY: boolean;
  let originalExitCode: number | string | undefined;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  function setupSyncedSdtBothArtifacts(projectDir: string): void {
    fs.mkdirSync(path.join(projectDir, 'testspec'), { recursive: true });
    const sdtSkillDirs = [
      'testspec-sdt-new',
      'testspec-sdt-build',
      'testspec-sdt-design',
      'testspec-sdt-clarify',

    ];
    for (const dirName of sdtSkillDirs) {
      const skillPath = path.join(projectDir, '.claude', 'skills', dirName, 'SKILL.md');
      fs.mkdirSync(path.dirname(skillPath), { recursive: true });
      fs.writeFileSync(skillPath, `name: ${dirName}\n`, 'utf-8');
    }

    const sdtCommands = ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'];
    for (const commandId of sdtCommands) {
      const commandPath = path.join(projectDir, '.claude', 'commands', 'testspec', `${commandId}.md`);
      fs.mkdirSync(path.dirname(commandPath), { recursive: true });
      fs.writeFileSync(commandPath, `# ${commandId}\n`, 'utf-8');
    }
  }

  function setupDriftedProjectArtifacts(projectDir: string): void {
    fs.mkdirSync(path.join(projectDir, 'testspec'), { recursive: true });
    const exploreSkillPath = path.join(projectDir, '.claude', 'skills', 'testspec-explore', 'SKILL.md');
    fs.mkdirSync(path.dirname(exploreSkillPath), { recursive: true });
    fs.writeFileSync(exploreSkillPath, 'name: testspec-explore\n', 'utf-8');
  }

  function addExtraSyncWorkflowArtifacts(projectDir: string): void {
    const syncSkillPath = path.join(projectDir, '.claude', 'skills', 'testspec-sync-specs', 'SKILL.md');
    fs.mkdirSync(path.dirname(syncSkillPath), { recursive: true });
    fs.writeFileSync(syncSkillPath, 'name: testspec-sync-specs\n', 'utf-8');

    const syncCommandPath = path.join(projectDir, '.claude', 'commands', 'testspec', 'sync.md');
    fs.mkdirSync(path.dirname(syncCommandPath), { recursive: true });
    fs.writeFileSync(syncCommandPath, '# sync\n', 'utf-8');
  }

  beforeEach(() => {
    vi.resetModules();

    tempDir = path.join(os.tmpdir(), `testspec-config-profile-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(tempDir, { recursive: true });

    originalEnv = { ...process.env };
    originalCwd = process.cwd();
    originalTTY = (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY ?? false;
    originalExitCode = process.exitCode;

    process.env.XDG_CONFIG_HOME = tempDir;
    process.chdir(tempDir);
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = true;
    process.exitCode = undefined;

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    process.chdir(originalCwd);
    (process.stdout as NodeJS.WriteStream & { isTTY?: boolean }).isTTY = originalTTY;
    process.exitCode = originalExitCode;
    fs.rmSync(tempDir, { recursive: true, force: true });

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('delivery-only action should not invoke workflow checkbox prompt', async () => {
    const { saveGlobalConfig } = await import('../../src/core/global-config.js');
    const { select } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'sdt', delivery: 'both', workflows: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] });
    setupSyncedSdtBothArtifacts(tempDir);
    select.mockResolvedValueOnce('delivery');

    await runConfigCommand(['profile']);

    const { checkbox } = await getPromptMocks();
    expect(checkbox).not.toHaveBeenCalled();
  });

  it('action picker should use configure wording and describe each path', async () => {
    const { select } = await getPromptMocks();

    select.mockResolvedValueOnce('delivery');

    await runConfigCommand(['profile']);

    expect(select).toHaveBeenCalledWith(expect.objectContaining({
      message: 'What do you want to configure?',
      choices: expect.arrayContaining([
        expect.objectContaining({ value: 'both', description: expect.any(String) }),
        expect.objectContaining({ value: 'delivery', description: expect.any(String) }),
        expect.objectContaining({ value: 'workflows', description: expect.any(String) }),
        expect.objectContaining({ value: 'keep', description: expect.any(String) }),
      ]),
    }));
  });

  it('workflows-only action should not invoke delivery prompt', async () => {
    const { saveGlobalConfig } = await import('../../src/core/global-config.js');
    const { select, checkbox } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'sdt', delivery: 'both', workflows: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] });
    setupSyncedSdtBothArtifacts(tempDir);
    select.mockResolvedValueOnce('workflows');
    checkbox.mockResolvedValueOnce(['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify']);

    await runConfigCommand(['profile']);

    expect(checkbox).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Select workflows to make available:',
    }));
  });

  it('delivery picker should mark current option inline', async () => {
    const { saveGlobalConfig } = await import('../../src/core/global-config.js');
    const { select } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'sdt', delivery: 'skills', workflows: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] });
    setupSyncedSdtBothArtifacts(tempDir);
    select.mockResolvedValueOnce('delivery');
    select.mockResolvedValueOnce('skills');

    await runConfigCommand(['profile']);

    expect(select).toHaveBeenNthCalledWith(2, expect.objectContaining({
      choices: expect.arrayContaining([
        expect.objectContaining({ value: 'skills', name: expect.stringContaining('[current]') }),
      ]),
    }));
  });

  it('workflow picker should use friendly names with descriptions', async () => {
    const { saveGlobalConfig } = await import('../../src/core/global-config.js');
    const { select, checkbox } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'sdt', delivery: 'both', workflows: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] });
    setupSyncedSdtBothArtifacts(tempDir);
    select.mockResolvedValueOnce('workflows');
    checkbox.mockResolvedValueOnce(['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify']);

    await runConfigCommand(['profile']);

    expect(checkbox).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Select workflows to make available:',
      choices: expect.arrayContaining([
        expect.objectContaining({ value: 'sdt-new', name: expect.any(String), description: expect.any(String) }),
        expect.objectContaining({ value: 'sdt-build', name: expect.any(String), description: expect.any(String) }),
      ]),
    }));
  });

  it('selecting current values only should be a no-op and should not ask apply', async () => {
    const { saveGlobalConfig } = await import('../../src/core/global-config.js');
    const { select, confirm } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'sdt', delivery: 'both', workflows: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] });
    setupSyncedSdtBothArtifacts(tempDir);
    select.mockResolvedValueOnce('keep');

    await runConfigCommand(['profile']);

    expect(consoleLogSpy).toHaveBeenCalledWith('No config changes.');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('keep action should warn when project files drift from global config', async () => {
    const { saveGlobalConfig } = await import('../../src/core/global-config.js');
    const { select } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'sdt', delivery: 'both', workflows: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] });
    setupDriftedProjectArtifacts(tempDir);
    select.mockResolvedValueOnce('keep');

    await runConfigCommand(['profile']);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: Global config is not applied to this project.'));
  });

  it('keep action should not warn when project files are already synced', async () => {
    const { saveGlobalConfig } = await import('../../src/core/global-config.js');
    const { select } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'sdt', delivery: 'both', workflows: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] });
    setupSyncedSdtBothArtifacts(tempDir);
    select.mockResolvedValueOnce('keep');

    await runConfigCommand(['profile']);

    const allLogs = consoleLogSpy.mock.calls.map((args) => args.map(String).join(' '));
    expect(allLogs.some((line) => line.includes('Warning: Global config is not applied to this project.'))).toBe(false);
  });

  it('effective no-op after prompts should warn when project files drift', async () => {
    const { saveGlobalConfig } = await import('../../src/core/global-config.js');
    const { select, confirm } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'sdt', delivery: 'both', workflows: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] });
    setupDriftedProjectArtifacts(tempDir);
    select.mockResolvedValueOnce('delivery');
    select.mockResolvedValueOnce('both');

    await runConfigCommand(['profile']);

    expect(consoleLogSpy).toHaveBeenCalledWith('No config changes.');
    expect(confirm).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: Global config is not applied to this project.'));
  });

  it('keep action should warn when project has extra workflows beyond global config', async () => {
    const { saveGlobalConfig } = await import('../../src/core/global-config.js');
    const { select } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'sdt', delivery: 'both', workflows: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'] });
    setupSyncedSdtBothArtifacts(tempDir);
    addExtraSyncWorkflowArtifacts(tempDir);
    select.mockResolvedValueOnce('keep');

    await runConfigCommand(['profile']);

    expect(consoleLogSpy).toHaveBeenCalledWith('No config changes.');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: Global config is not applied to this project.'));
  });

  it('changed config should save and ask apply when inside project', async () => {
    const { saveGlobalConfig, getGlobalConfig } = await import('../../src/core/global-config.js');
    const { select, confirm } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'custom', delivery: 'skills', workflows: ['explore'] });
    fs.mkdirSync(path.join(tempDir, 'testspec'), { recursive: true });

    select.mockResolvedValueOnce('delivery');
    select.mockResolvedValueOnce('both');
    confirm.mockResolvedValueOnce(false);

    await runConfigCommand(['profile']);

    expect(getGlobalConfig().delivery).toBe('both');
    expect(confirm).toHaveBeenCalledWith({
      message: 'Apply changes to this project now?',
      default: true,
    });
  });

  it('sdt preset should preserve delivery setting', async () => {
    const { saveGlobalConfig, getGlobalConfig } = await import('../../src/core/global-config.js');
    const { select, checkbox, confirm } = await getPromptMocks();

    saveGlobalConfig({ featureFlags: {}, profile: 'custom', delivery: 'skills', workflows: ['explore'] });

    await runConfigCommand(['profile', 'sdt']);

    const config = getGlobalConfig();
    expect(config.profile).toBe('sdt');
    expect(config.delivery).toBe('skills'); // delivery is preserved, not forced to 'both'
    expect(config.workflows).toEqual(['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify']);
    expect(select).not.toHaveBeenCalled();
    expect(checkbox).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('Ctrl+C should cancel without stack trace and set interrupted exit code', async () => {
    const { select, checkbox, confirm } = await getPromptMocks();
    const cancellationError = new Error('User force closed the prompt with SIGINT');
    cancellationError.name = 'ExitPromptError';

    select.mockRejectedValueOnce(cancellationError);

    await expect(runConfigCommand(['profile'])).resolves.toBeUndefined();

    expect(consoleLogSpy).toHaveBeenCalledWith('Config profile cancelled.');
    expect(process.exitCode).toBe(130);
    expect(checkbox).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });
});
