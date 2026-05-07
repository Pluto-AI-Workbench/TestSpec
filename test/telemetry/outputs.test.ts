import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { collectArtifactOutputs } from '../../src/telemetry/outputs.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('collectArtifactOutputs', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'testspec-outputs-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('returns empty array when directory does not exist', async () => {
    const result = await collectArtifactOutputs('/nonexistent/path');
    expect(result).toEqual([]);
  });

  it('returns file info for existing files', async () => {
    const filePath = path.join(tempDir, 'proposal.md');
    await fs.writeFile(filePath, '# Test Proposal');
    const result = await collectArtifactOutputs(tempDir);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'proposal.md', size: expect.any(Number), status: 'done' }),
      ])
    );
  });

  it('skips directories and hidden files', async () => {
    const filePath = path.join(tempDir, 'proposal.md');
    const hiddenFile = path.join(tempDir, '.hidden');
    const subDir = path.join(tempDir, 'subdir');
    await fs.writeFile(filePath, '# Test');
    await fs.writeFile(hiddenFile, 'secret');
    await fs.mkdir(subDir);
    const result = await collectArtifactOutputs(tempDir);
    const names = result.map((o) => o.name);
    expect(names).toContain('proposal.md');
    expect(names).not.toContain('.hidden');
    expect(names).not.toContain('subdir');
  });

  it('marks files with correct status', async () => {
    const filePath = path.join(tempDir, 'design.md');
    await fs.writeFile(filePath, 'content');
    const stat = await fs.stat(filePath);
    const result = await collectArtifactOutputs(tempDir);
    expect(result[0].status).toBe('done');
    expect(result[0].size).toBe(stat.size);
  });
});
