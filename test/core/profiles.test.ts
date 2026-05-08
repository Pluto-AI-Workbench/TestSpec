import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CORE_WORKFLOWS,
  ALL_WORKFLOWS,
  getProfileWorkflows,
} from '../../src/core/profiles.js';
import { DEFAULT_PROFILES } from '../../src/core/config-prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('profiles', () => {
  describe('CORE_WORKFLOWS', () => {
    it('should contain the default core workflows', () => {
      expect(CORE_WORKFLOWS).toEqual(['propose', 'explore', 'apply', 'archive']);
    });

    it('should be a subset of ALL_WORKFLOWS', () => {
      for (const workflow of CORE_WORKFLOWS) {
        expect(ALL_WORKFLOWS).toContain(workflow);
      }
    });
  });

  describe('ALL_WORKFLOWS', () => {
    it('should contain all 15 workflows', () => {
      expect(ALL_WORKFLOWS).toHaveLength(15);
    });

    it('should contain expected workflow IDs', () => {
      const expected = [
        'propose', 'explore', 'new', 'continue', 'apply',
        'ff', 'sync', 'archive', 'bulk-archive', 'verify', 'onboard',
        'sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify',
      ];
      expect([...ALL_WORKFLOWS]).toEqual(expected);
    });
  });

  describe('getProfileWorkflows', () => {
    // Test helpers for isolated config.yaml testing
    const testDir = path.join(__dirname, 'fixtures', 'profile-test-temp');
    const configPath = path.join(testDir, 'testspec', 'config.yaml');

    beforeEach(() => {
      // Create temp directory structure
      fs.mkdirSync(path.join(testDir, 'testspec'), { recursive: true });
    });

    afterEach(() => {
      // Clean up temp directory
      try {
        fs.rmSync(testDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    describe('with config.yaml missing', () => {
      it('should return DEFAULT_PROFILES for sdt profile', () => {
        const result = getProfileWorkflows('sdt', undefined, testDir);
        expect(result).toEqual(DEFAULT_PROFILES['sdt']);
      });

      it('should return DEFAULT_PROFILES for core profile', () => {
        const result = getProfileWorkflows('core', undefined, testDir);
        expect(result).toEqual(DEFAULT_PROFILES['core']);
      });

      it('should return DEFAULT_PROFILES for custom profile without customWorkflows', () => {
        const result = getProfileWorkflows('custom', undefined, testDir);
        expect(result).toEqual(DEFAULT_PROFILES['custom']);
      });

      it('should return customWorkflows for custom profile when provided', () => {
        const customWorkflows = ['explore', 'new', 'apply', 'ff'];
        const result = getProfileWorkflows('custom', customWorkflows, testDir);
        expect(result).toEqual(customWorkflows);
      });

      it('should return empty array for unknown profile', () => {
        const result = getProfileWorkflows('unknown-profile' as any, undefined, testDir);
        expect(result).toEqual([]);
      });
    });

    describe('with config.yaml present', () => {
      it('should return config.yaml profiles when available', () => {
        // Create config.yaml with custom profiles
        const yamlContent = `
profiles:
  custom:
    - propose
    - explore
`;
        fs.writeFileSync(configPath, yamlContent);

        const result = getProfileWorkflows('custom', undefined, testDir);
        expect(result).toEqual(['propose', 'explore']);
      });

      it('should prefer config over DEFAULT_PROFILES', () => {
        const yamlContent = `
profiles:
  sdt:
    - propose
`;
        fs.writeFileSync(configPath, yamlContent);

        const result = getProfileWorkflows('sdt', undefined, testDir);
        expect(result).toEqual(['propose']);
      });
    });
  });
});