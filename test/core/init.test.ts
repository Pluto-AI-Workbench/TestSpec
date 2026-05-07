import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { InitCommand } from '../../src/core/init.js';
import { saveGlobalConfig, getGlobalConfig } from '../../src/core/global-config.js';

const { confirmMock, showWelcomeScreenMock, searchableMultiSelectMock } = vi.hoisted(() => ({
  confirmMock: vi.fn(),
  showWelcomeScreenMock: vi.fn().mockResolvedValue(undefined),
  searchableMultiSelectMock: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => ({
  confirm: confirmMock,
}));

vi.mock('../../src/ui/welcome-screen.js', () => ({
  showWelcomeScreen: showWelcomeScreenMock,
}));

vi.mock('../../src/prompts/searchable-multi-select.js', () => ({
  searchableMultiSelect: searchableMultiSelectMock,
}));

describe('InitCommand', () => {
  let testDir: string;
  let configTempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `testspec-init-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    originalEnv = { ...process.env };
    configTempDir = path.join(os.tmpdir(), `testspec-config-init-${Date.now()}`);
    await fs.mkdir(configTempDir, { recursive: true });
    process.env.XDG_CONFIG_HOME = configTempDir;

    vi.spyOn(console, 'log').mockImplementation(() => { });
    confirmMock.mockReset();
    confirmMock.mockResolvedValue(true);
    showWelcomeScreenMock.mockClear();
    searchableMultiSelectMock.mockReset();
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.rm(configTempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('execute with --tools flag (sdt profile default)', () => {
    it('should create TestSpec directory structure', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const testspecPath = path.join(testDir, 'testspec');
      expect(await directoryExists(testspecPath)).toBe(true);
      expect(await directoryExists(path.join(testspecPath, 'specs'))).toBe(true);
      expect(await directoryExists(path.join(testspecPath, 'changes'))).toBe(true);
      expect(await directoryExists(path.join(testspecPath, 'changes', 'archive'))).toBe(true);
    });

    it('should create config.yaml with default schema', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const configPath = path.join(testDir, 'testspec', 'config.yaml');
      expect(await fileExists(configPath)).toBe(true);

      const content = await fs.readFile(configPath, 'utf-8');
      expect(content).toContain('schema: spec-driven');
    });

    it('should create sdt profile skills for Claude Code by default', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);
      const sdtSkillNames = [
        'testspec-sdt-new',
        'testspec-sdt-build',
        'testspec-sdt-design',
        'testspec-sdt-clarify',
      ];

      for (const skillName of sdtSkillNames) {
        const skillFile = path.join(testDir, '.claude', 'skills', skillName, 'SKILL.md');
        expect(await fileExists(skillFile)).toBe(true);
      }

      const nonSdtSkillNames = [
        'testspec-new-change',
        'testspec-continue-change',
        'testspec-ff-change',
        'testspec-sync-specs',
        'testspec-bulk-archive-change',
        'testspec-verify-change',
      ];

      for (const skillName of nonSdtSkillNames) {
        const skillFile = path.join(testDir, '.claude', 'skills', skillName, 'SKILL.md');
        expect(await fileExists(skillFile)).toBe(false);
      }
    });

    it('should create sdt profile commands for Claude Code by default', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);
      const sdtCommandNames = [
        'sdt-new.md',
        'sdt-build.md',
        'sdt-design.md',
        'sdt-clarify.md',
      ];

      for (const cmdName of sdtCommandNames) {
        const cmdFile = path.join(testDir, '.claude', 'commands', 'testspec', cmdName);
        expect(await fileExists(cmdFile)).toBe(true);
      }
      const nonSdtCommandNames = [
        'propose.md',
        'explore.md',
        'apply.md',
        'archive.md',
        'continue.md',
        'ff.md',
        'sync.md',
        'verify.md',
        'bulk-archive.md',
        'onboard.md',
      ];

      for (const cmdName of nonSdtCommandNames) {
        const cmdFile = path.join(testDir, '.claude', 'commands', 'testspec', cmdName);
        expect(await fileExists(cmdFile)).toBe(false);
      }
    });

    it('should create skills in Cursor skills directory', async () => {
      const initCommand = new InitCommand({ tools: 'cursor', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.cursor', 'skills', 'testspec-sdt-new', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);
    });

    it('should create skills in Windsurf skills directory', async () => {
      const initCommand = new InitCommand({ tools: 'windsurf', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.windsurf', 'skills', 'testspec-sdt-new', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);
    });

    it('should support Kimi CLI as an adapterless skills-only tool', async () => {
      saveGlobalConfig({
        featureFlags: {},
        profile: 'core',
        delivery: 'both',
      });

      const initCommand = new InitCommand({ tools: 'kimi', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.kimi', 'skills', 'openspec-explore', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);

      const commandsDir = path.join(testDir, '.kimi', 'commands');
      expect(await directoryExists(commandsDir)).toBe(false);

      const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
      expect(
        logCalls.some(
          (entry) => entry.includes('Commands skipped for: kimi') && entry.includes('(no adapter)'),
        ),
      ).toBe(true);
    });

    it('should create skills for multiple tools at once', async () => {
      const initCommand = new InitCommand({ tools: 'claude,cursor', force: true });
      await initCommand.execute(testDir);

      const claudeSkill = path.join(testDir, '.claude', 'skills', 'testspec-sdt-new', 'SKILL.md');
      const cursorSkill = path.join(testDir, '.cursor', 'skills', 'testspec-sdt-new', 'SKILL.md');

      expect(await fileExists(claudeSkill)).toBe(true);
      expect(await fileExists(cursorSkill)).toBe(true);
    });

    it('should select all tools with --tools all option', async () => {
      const initCommand = new InitCommand({ tools: 'all', force: true });
      await initCommand.execute(testDir);

      const claudeSkill = path.join(testDir, '.claude', 'skills', 'testspec-sdt-new', 'SKILL.md');
      const cursorSkill = path.join(testDir, '.cursor', 'skills', 'testspec-sdt-new', 'SKILL.md');
      const windsurfSkill = path.join(testDir, '.windsurf', 'skills', 'testspec-sdt-new', 'SKILL.md');

      expect(await fileExists(claudeSkill)).toBe(true);
      expect(await fileExists(cursorSkill)).toBe(true);
      expect(await fileExists(windsurfSkill)).toBe(true);
    });

    it('should skip tool configuration with --tools none option', async () => {
      const initCommand = new InitCommand({ tools: 'none', force: true });
      await initCommand.execute(testDir);

      const testspecPath = path.join(testDir, 'testspec');
      expect(await directoryExists(testspecPath)).toBe(true);

      const claudeSkillsDir = path.join(testDir, '.claude', 'skills');
      expect(await directoryExists(claudeSkillsDir)).toBe(false);
    });

    it('should throw error for invalid tool names', async () => {
      const initCommand = new InitCommand({ tools: 'invalid-tool', force: true });
      await expect(initCommand.execute(testDir)).rejects.toThrow(/Invalid tool\(s\): invalid-tool/);
    });

    it('should handle comma-separated tool names with spaces', async () => {
      const initCommand = new InitCommand({ tools: 'claude, cursor', force: true });
      await initCommand.execute(testDir);

      const claudeSkill = path.join(testDir, '.claude', 'skills', 'testspec-sdt-new', 'SKILL.md');
      const cursorSkill = path.join(testDir, '.cursor', 'skills', 'testspec-sdt-new', 'SKILL.md');

      expect(await fileExists(claudeSkill)).toBe(true);
      expect(await fileExists(cursorSkill)).toBe(true);
    });

    it('should reject combining reserved keywords with explicit tool ids', async () => {
      const initCommand = new InitCommand({ tools: 'all,claude', force: true });
      await expect(initCommand.execute(testDir)).rejects.toThrow(
        /Cannot combine reserved values "all" or "none" with specific tool IDs/
      );
    });

    it('should not create config.yaml if it already exists', async () => {
      const testspecDir = path.join(testDir, 'testspec');
      await fs.mkdir(testspecDir, { recursive: true });
      const configPath = path.join(testspecDir, 'config.yaml');
      const existingContent = 'schema: custom-schema\n';
      await fs.writeFile(configPath, existingContent);

      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const content = await fs.readFile(configPath, 'utf-8');
      expect(content).toBe(existingContent);
    });

    it('should handle non-existent target directory', async () => {
      const newDir = path.join(testDir, 'new-project');
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(newDir);

      const testspecPath = path.join(newDir, 'testspec');
      expect(await directoryExists(testspecPath)).toBe(true);
    });

    it('should work in extend mode (re-running init)', async () => {
      const initCommand1 = new InitCommand({ tools: 'claude', force: true });
      await initCommand1.execute(testDir);

      const initCommand2 = new InitCommand({ tools: 'cursor', force: true });
      await initCommand2.execute(testDir);

      const claudeSkill = path.join(testDir, '.claude', 'skills', 'testspec-sdt-new', 'SKILL.md');
      const cursorSkill = path.join(testDir, '.cursor', 'skills', 'testspec-sdt-new', 'SKILL.md');

      expect(await fileExists(claudeSkill)).toBe(true);
      expect(await fileExists(cursorSkill)).toBe(true);
    });

    it('should refresh skills on re-run for the same tool', async () => {
      const initCommand1 = new InitCommand({ tools: 'claude', force: true });
      await initCommand1.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-sdt-new', 'SKILL.md');
      const originalContent = await fs.readFile(skillFile, 'utf-8');

      await fs.writeFile(skillFile, '# Modified content\n');

      const initCommand2 = new InitCommand({ tools: 'claude', force: true });
      await initCommand2.execute(testDir);

      const newContent = await fs.readFile(skillFile, 'utf-8');
      expect(newContent).toBe(originalContent);
    });
  });

  describe('skill content validation', () => {
    it('should generate valid SKILL.md with YAML frontmatter', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-sdt-new', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      expect(content).toMatch(/^---\n/);
      expect(content).toContain('name: testspec-sdt-new');
      expect(content).toContain('description:');
      expect(content).toContain('license:');
      expect(content).toContain('compatibility:');
      expect(content).toContain('metadata:');
      expect(content).toMatch(/---\n\n/);
    });

    it('should include sdt-new skill instructions', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-sdt-new', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      expect(content).toContain('创建 SDT 规范');
      expect(content).toContain('testspec-sdt-new');
    });

    it('should include sdt-build skill instructions', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-sdt-build', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      expect(content).toContain('name: testspec-sdt-build');
    });

    it('should include sdt-design skill instructions', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-sdt-design', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      expect(content).toContain('name: testspec-sdt-design');
    });

    it('should embed generatedBy version in skill files', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-sdt-new', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      expect(content).toMatch(/generatedBy:\s*["']?\d+\.\d+\.\d+["']?/);
    });
  });

  describe('command generation', () => {
    it('should generate Claude Code commands with correct format', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.claude', 'commands', 'testspec', 'sdt-new.md');
      const content = await fs.readFile(cmdFile, 'utf-8');

      expect(content).toMatch(/^---\n/);
      expect(content).toContain('name:');
      expect(content).toContain('description:');
    });

    it('should generate Cursor commands with correct format', async () => {
      const initCommand = new InitCommand({ tools: 'cursor', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.cursor', 'commands', 'testspec-sdt-new.md');
      expect(await fileExists(cmdFile)).toBe(true);

      const content = await fs.readFile(cmdFile, 'utf-8');
      expect(content).toMatch(/^---\n/);
    });
  });

  describe('error handling', () => {
    it('should provide helpful error for insufficient permissions', async () => {
      const readOnlyDir = path.join(testDir, 'readonly');
      await fs.mkdir(readOnlyDir);

      const originalWriteFile = fs.writeFile;
      vi.spyOn(fs, 'writeFile').mockImplementation(
        async (filePath: any, ...args: any[]) => {
          if (
            typeof filePath === 'string' &&
            filePath.includes('.testspec-test-')
          ) {
            throw new Error('EACCES: permission denied');
          }
          return originalWriteFile.call(fs, filePath, ...args);
        }
      );

      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await expect(initCommand.execute(readOnlyDir)).rejects.toThrow(/Insufficient permissions/);
    });

    it('should throw error in non-interactive mode without --tools flag and no detected tools', async () => {
      const initCommand = new InitCommand({ interactive: false });
      await expect(initCommand.execute(testDir)).rejects.toThrow(/No tools detected and no --tools flag/);
    });
  });

  describe('tool-specific adapters', () => {
    it('should generate Gemini CLI commands as TOML files', async () => {
      const initCommand = new InitCommand({ tools: 'gemini', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.gemini', 'commands', 'testspec', 'sdt-new.toml');
      expect(await fileExists(cmdFile)).toBe(true);

      const content = await fs.readFile(cmdFile, 'utf-8');
      expect(content).toContain('description =');
      expect(content).toContain('prompt =');
    });

    it('should generate Windsurf commands', async () => {
      const initCommand = new InitCommand({ tools: 'windsurf', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.windsurf', 'workflows', 'testspec-sdt-new.md');
      expect(await fileExists(cmdFile)).toBe(true);
    });

    it('should generate Continue prompt files', async () => {
      const initCommand = new InitCommand({ tools: 'continue', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.continue', 'prompts', 'testspec-sdt-new.prompt');
      expect(await fileExists(cmdFile)).toBe(true);

      const content = await fs.readFile(cmdFile, 'utf-8');
      expect(content).toContain('name: testspec-sdt-new');
      expect(content).toContain('invokable: true');
    });

    it('should generate Cline workflow files', async () => {
      const initCommand = new InitCommand({ tools: 'cline', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.clinerules', 'workflows', 'testspec-sdt-new.md');
      expect(await fileExists(cmdFile)).toBe(true);
    });

    it('should generate GitHub Copilot prompt files', async () => {
      const initCommand = new InitCommand({ tools: 'github-copilot', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.github', 'prompts', 'testspec-sdt-new.prompt.md');
      expect(await fileExists(cmdFile)).toBe(true);
    });
  });
});

describe('InitCommand - profile and detection features', () => {
  let testDir: string;
  let configTempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `testspec-init-profile-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    originalEnv = { ...process.env };
    configTempDir = path.join(os.tmpdir(), `testspec-config-test-${Date.now()}`);
    await fs.mkdir(configTempDir, { recursive: true });
    process.env.XDG_CONFIG_HOME = configTempDir;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    confirmMock.mockReset();
    confirmMock.mockResolvedValue(true);
    showWelcomeScreenMock.mockClear();
    searchableMultiSelectMock.mockReset();
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.rm(configTempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('should use --profile flag to override global config', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'custom',
      delivery: 'both',
      workflows: ['explore', 'new', 'apply'],
    });

    const initCommand = new InitCommand({ tools: 'claude', force: true, profile: 'core' });
    await initCommand.execute(testDir);

    const proposeSkill = path.join(testDir, '.claude', 'skills', 'testspec-propose', 'SKILL.md');
    expect(await fileExists(proposeSkill)).toBe(true);

    const newChangeSkill = path.join(testDir, '.claude', 'skills', 'testspec-new-change', 'SKILL.md');
    expect(await fileExists(newChangeSkill)).toBe(false);
  });

  it('should reject invalid --profile values', async () => {
    const initCommand = new InitCommand({
      tools: 'claude',
      force: true,
      profile: 'invalid-profile',
    });

    await expect(initCommand.execute(testDir)).rejects.toThrow(
      /Invalid profile "invalid-profile"/
    );
  });

  it('should use detected tools in non-interactive mode when no --tools flag', async () => {
    await fs.mkdir(path.join(testDir, '.claude'), { recursive: true });

    const initCommand = new InitCommand({ interactive: false, force: true });
    await initCommand.execute(testDir);

    const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-sdt-new', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(true);
  });

  it('should respect custom profile from global config', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'custom',
      delivery: 'both',
      workflows: ['explore', 'new'],
    });

    const initCommand = new InitCommand({ tools: 'claude', force: true });
    await initCommand.execute(testDir);

    const exploreSkill = path.join(testDir, '.claude', 'skills', 'testspec-explore', 'SKILL.md');
    const newChangeSkill = path.join(testDir, '.claude', 'skills', 'testspec-new-change', 'SKILL.md');
    expect(await fileExists(exploreSkill)).toBe(true);
    expect(await fileExists(newChangeSkill)).toBe(true);

    const proposeSkill = path.join(testDir, '.claude', 'skills', 'testspec-propose', 'SKILL.md');
    expect(await fileExists(proposeSkill)).toBe(false);
  });

  it('should migrate commands-only extend mode to custom profile without injecting propose', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'custom',
      delivery: 'commands',
      workflows: ['explore'],
    });

    await fs.mkdir(path.join(testDir, 'testspec'), { recursive: true });
    await fs.mkdir(path.join(testDir, '.claude', 'commands', 'testspec'), { recursive: true });
    await fs.writeFile(path.join(testDir, '.claude', 'commands', 'testspec', 'explore.md'), '# explore\n');

    const initCommand = new InitCommand({ tools: 'claude', force: true });
    await initCommand.execute(testDir);

    const config = getGlobalConfig();
    expect(config.profile).toBe('custom');
    expect(config.delivery).toBe('commands');
    expect(config.workflows).toEqual(['explore']);

    const exploreCommand = path.join(testDir, '.claude', 'commands', 'testspec', 'explore.md');
    const proposeCommand = path.join(testDir, '.claude', 'commands', 'testspec', 'propose.md');
    expect(await fileExists(exploreCommand)).toBe(true);
    expect(await fileExists(proposeCommand)).toBe(false);

    const exploreSkill = path.join(testDir, '.claude', 'skills', 'testspec-explore', 'SKILL.md');
    const proposeSkill = path.join(testDir, '.claude', 'skills', 'testspec-propose', 'SKILL.md');
    expect(await fileExists(exploreSkill)).toBe(false);
    expect(await fileExists(proposeSkill)).toBe(false);
  });

  it('should not prompt for confirmation when applying custom profile in interactive init', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'custom',
      delivery: 'both',
      workflows: ['explore', 'new'],
    });

    const initCommand = new InitCommand({ force: true });
    vi.spyOn(initCommand as any, 'canPromptInteractively').mockReturnValue(true);
    vi.spyOn(initCommand as any, 'getSelectedTools').mockResolvedValue(['claude']);

    await initCommand.execute(testDir);

    expect(showWelcomeScreenMock).toHaveBeenCalled();
    expect(confirmMock).not.toHaveBeenCalled();

    const exploreSkill = path.join(testDir, '.claude', 'skills', 'testspec-explore', 'SKILL.md');
    const newChangeSkill = path.join(testDir, '.claude', 'skills', 'testspec-new-change', 'SKILL.md');
    expect(await fileExists(exploreSkill)).toBe(true);
    expect(await fileExists(newChangeSkill)).toBe(true);
  });

  it('should respect delivery=skills setting (no commands)', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'skills',
    });

    const initCommand = new InitCommand({ tools: 'claude', force: true });
    await initCommand.execute(testDir);

    const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-propose', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(true);

    const cmdFile = path.join(testDir, '.claude', 'commands', 'testspec', 'explore.md');
    expect(await fileExists(cmdFile)).toBe(false);
  });

  it('should respect delivery=commands setting (no skills)', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'commands',
    });

    const initCommand = new InitCommand({ tools: 'claude', force: true });
    await initCommand.execute(testDir);

    const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-propose', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(false);

    const cmdFile = path.join(testDir, '.claude', 'commands', 'testspec', 'explore.md');
    expect(await fileExists(cmdFile)).toBe(true);
  });

  it('should remove commands on re-init when delivery changes to skills', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'both',
    });

    const initCommand1 = new InitCommand({ tools: 'claude', force: true });
    await initCommand1.execute(testDir);

    const cmdFile = path.join(testDir, '.claude', 'commands', 'testspec', 'explore.md');
    expect(await fileExists(cmdFile)).toBe(true);

    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'skills',
    });

    const initCommand2 = new InitCommand({ tools: 'claude', force: true });
    await initCommand2.execute(testDir);

    expect(await fileExists(cmdFile)).toBe(false);

    const skillFile = path.join(testDir, '.claude', 'skills', 'testspec-propose', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(true);
  });
});

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
