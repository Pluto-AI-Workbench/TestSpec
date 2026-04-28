import { describe, it, expect } from 'vitest';
import { transformToHyphenCommands } from '../../src/utils/command-references.js';

describe('transformToHyphenCommands', () => {
  describe('basic transformations', () => {
    it('should transform single command reference', () => {
      expect(transformToHyphenCommands('/testspec:new')).toBe('/testspec-new');
    });

    it('should transform multiple command references', () => {
      const input = '/testspec:new and /testspec:apply';
      const expected = '/testspec-new and /testspec-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should transform command reference in context', () => {
      const input = 'Use /testspec:apply to implement tasks';
      const expected = 'Use /testspec-apply to implement tasks';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/testspec:continue` to proceed';
      const expected = 'Run `/testspec-continue` to proceed';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should return unchanged text with no command references', () => {
      const input = 'This is plain text without commands';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should return empty string unchanged', () => {
      expect(transformToHyphenCommands('')).toBe('');
    });

    it('should not transform similar but non-matching patterns', () => {
      const input = '/ops:new opsx: /other:command';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should handle multiple occurrences on same line', () => {
      const input = '/testspec:new /testspec:continue /testspec:apply';
      const expected = '/testspec-new /testspec-continue /testspec-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('multiline content', () => {
    it('should transform references across multiple lines', () => {
      const input = `Use /testspec:new to start
Then /testspec:continue to proceed
Finally /testspec:apply to implement`;
      const expected = `Use /testspec-new to start
Then /testspec-continue to proceed
Finally /testspec-apply to implement`;
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('all known commands', () => {
    const commands = [
      'new',
      'continue',
      'apply',
      'ff',
      'sync',
      'archive',
      'bulk-archive',
      'verify',
      'explore',
      'onboard',
    ];

    for (const cmd of commands) {
      it(`should transform /testspec:${cmd}`, () => {
        expect(transformToHyphenCommands(`/testspec:${cmd}`)).toBe(`/testspec-${cmd}`);
      });
    }
  });
});
