import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { randomUUID } from 'node:crypto';

// Mock posthog-node before importing the module
vi.mock('posthog-node', () => {
  return {
    PostHog: vi.fn().mockImplementation(() => ({
      capture: vi.fn(),
      shutdown: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

// Import after mocking
import { isTelemetryEnabled, isDetailTelemetryEnabled, maybeShowTelemetryNotice, shutdown, trackCommand, TelemetryDetails } from '../../src/telemetry/index.js';
import { PostHog } from 'posthog-node';

describe('telemetry/index', () => {
  let tempDir: string;
  let originalEnv: NodeJS.ProcessEnv;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let fetchSpy: ReturnType<typeof vi.spyOn<typeof globalThis, 'fetch'>>;

  beforeEach(() => {
    // Create unique temp directory for each test using UUID
    tempDir = path.join(os.tmpdir(), `testspec-telemetry-test-${randomUUID()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Save original env
    originalEnv = { ...process.env };

    // Mock HOME to point to temp dir
    process.env.HOME = tempDir;

    // Clear all mocks
    vi.clearAllMocks();

    // Spy on console.log for notice tests
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(async () => {
    // Restore original env
    process.env = originalEnv;

    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    await shutdown();

    // Restore all mocks
    vi.restoreAllMocks();
  });

  describe('isDetailTelemetryEnabled', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should return true by default when base telemetry is enabled', () => {
      delete process.env.TESTSPEC_TELEMETRY_DETAIL;
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      expect(isDetailTelemetryEnabled()).toBe(true);
    });

    it('should return false when TESTSPEC_TELEMETRY_DETAIL=0', () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      process.env.TESTSPEC_TELEMETRY_DETAIL = '0';
      expect(isDetailTelemetryEnabled()).toBe(false);
    });

    it('should return false when base telemetry is disabled', () => {
      process.env.TESTSPEC_TELEMETRY = '0';
      process.env.TESTSPEC_TELEMETRY_DETAIL = '1';
      expect(isDetailTelemetryEnabled()).toBe(false);
    });
  });

  describe('isTelemetryEnabled', () => {
    it('should return false when TESTSPEC_TELEMETRY=0', () => {
      process.env.TESTSPEC_TELEMETRY = '0';
      expect(isTelemetryEnabled()).toBe(false);
    });

    it('should return false when DO_NOT_TRACK=1', () => {
      process.env.DO_NOT_TRACK = '1';
      expect(isTelemetryEnabled()).toBe(false);
    });

    it('should return false when CI=true', () => {
      process.env.CI = 'true';
      expect(isTelemetryEnabled()).toBe(false);
    });

    it('should return true when no opt-out is set', () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      expect(isTelemetryEnabled()).toBe(true);
    });

    it('should prioritize TESTSPEC_TELEMETRY=0 over other settings', () => {
      process.env.TESTSPEC_TELEMETRY = '0';
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      expect(isTelemetryEnabled()).toBe(false);
    });
  });

  describe('maybeShowTelemetryNotice', () => {
    it('should not show notice when telemetry is disabled', async () => {
      process.env.TESTSPEC_TELEMETRY = '0';

      await maybeShowTelemetryNotice();

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('trackCommand', () => {
    it('should not track when telemetry is disabled', async () => {
      process.env.TESTSPEC_TELEMETRY = '0';

      await trackCommand('test', '1.0.0');

      expect(PostHog).not.toHaveBeenCalled();
    });

    it('should track when telemetry is enabled', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;

      await trackCommand('test', '1.0.0');

      expect(PostHog).toHaveBeenCalled();
    });

    it('should construct PostHog with bounded silent-failure settings', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;

      await trackCommand('test', '1.0.0');

      expect(PostHog).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          host: 'https://edge.testspec.dev',
          flushAt: 1,
          flushInterval: 0,
          fetchRetryCount: 0,
          requestTimeout: 1000,
          preloadFeatureFlags: false,
          disableRemoteConfig: true,
          disableSurveys: true,
          fetch: expect.any(Function),
        })
      );
    });

    it('should return a synthetic success response when fetch throws a network error', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      await trackCommand('test', '1.0.0');

      const fetchFn = (PostHog as any).mock.calls[0][1].fetch as typeof fetch;
      fetchSpy.mockRejectedValueOnce(new Error('network down'));

      const response = await fetchFn('https://edge.testspec.dev/batch/', { method: 'POST' });

      expect(response.status).toBe(204);
    });

    it('should return a synthetic success response when fetch aborts', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      await trackCommand('test', '1.0.0');

      const fetchFn = (PostHog as any).mock.calls[0][1].fetch as typeof fetch;
      fetchSpy.mockRejectedValueOnce(new DOMException('This operation was aborted', 'AbortError'));

      const response = await fetchFn('https://edge.testspec.dev/batch/', { method: 'POST' });

      expect(response.status).toBe(204);
    });

    it('should return a synthetic success response for non-2xx responses', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      await trackCommand('test', '1.0.0');

      const fetchFn = (PostHog as any).mock.calls[0][1].fetch as typeof fetch;
      fetchSpy.mockResolvedValueOnce(new Response('forbidden', { status: 403 }));

      const response = await fetchFn('https://edge.testspec.dev/batch/', { method: 'POST' });

      expect(response.status).toBe(204);
    });

    it('should pass through successful responses from fetch', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      await trackCommand('test', '1.0.0');

      const fetchFn = (PostHog as any).mock.calls[0][1].fetch as typeof fetch;
      const expectedResponse = new Response(null, { status: 200 });
      fetchSpy.mockResolvedValueOnce(expectedResponse);

      const response = await fetchFn('https://edge.testspec.dev/batch/', { method: 'POST' });

      expect(response).toBe(expectedResponse);
    });
  });

  describe('trackCommand with details', () => {
    it('should include detail fields when detail telemetry is enabled', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      delete process.env.TESTSPEC_TELEMETRY_DETAIL;

      const mockCapture = vi.fn();
      (PostHog as any).mockImplementation(() => ({
        capture: mockCapture,
        shutdown: vi.fn().mockResolvedValue(undefined),
      }));

      const details = {
        durationMs: 1234,
        args: { json: true },
        skill: 'testspec:propose',
        skillTool: 'claude',
        inputs: { changeName: 'add-login' },
        outputs: [{ name: 'proposal.md', size: 1024, status: 'done' as const }],
        tokens: { input: 100, output: 200, total: 300 },
      };

      await trackCommand('test:cmd', '1.0.0', details);

      expect(PostHog).toHaveBeenCalled();
      const captureCall = mockCapture.mock.calls[0][0];
      expect(captureCall.properties.durationMs).toBe(1234);
      expect(captureCall.properties.skill).toBe('testspec:propose');
      expect(captureCall.properties.outputs).toEqual([{ name: 'proposal.md', size: 1024, status: 'done' }]);
    });

    it('should omit detail fields when TESTSPEC_TELEMETRY_DETAIL=0', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      process.env.TESTSPEC_TELEMETRY_DETAIL = '0';

      const mockCapture = vi.fn();
      (PostHog as any).mockImplementation(() => ({
        capture: mockCapture,
        shutdown: vi.fn().mockResolvedValue(undefined),
      }));

      const details = {
        durationMs: 1234,
        skill: 'testspec:propose',
      };

      await trackCommand('test:cmd', '1.0.0', details);

      const captureCall = mockCapture.mock.calls[0][0];
      expect(captureCall.properties.durationMs).toBeUndefined();
      expect(captureCall.properties.skill).toBeUndefined();
    });

    it('should truncate input strings to 200 characters', async () => {
      delete process.env.TESTSPEC_TELEMETRY_DETAIL;

      const mockCapture = vi.fn();
      (PostHog as any).mockImplementation(() => ({
        capture: mockCapture,
        shutdown: vi.fn().mockResolvedValue(undefined),
      }));

      const longString = 'a'.repeat(300);
      const details = {
        inputs: { description: longString },
      };

      await trackCommand('test:cmd', '1.0.0', details);

      const captureCall = mockCapture.mock.calls[0][0];
      expect((captureCall.properties.inputs as any).description.length).toBe(200);
    });
  });

  describe('trackCommand integration', () => {
    it('should send all detail fields when detail telemetry is enabled', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      delete process.env.TESTSPEC_TELEMETRY_DETAIL;

      const mockCapture = vi.fn();
      (PostHog as any).mockImplementation(() => ({
        capture: mockCapture,
        shutdown: vi.fn().mockResolvedValue(undefined),
      }));

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

      expect(PostHog).toHaveBeenCalled();
      const captureCall = mockCapture.mock.calls[0][0];
      expect(captureCall.properties.command).toBe('test:command');
      expect(captureCall.properties.durationMs).toBe(1234);
      expect(captureCall.properties.skill).toBe('testspec:propose');
      expect(captureCall.properties.skillTool).toBe('claude');
      expect(captureCall.properties.args).toEqual({ json: true, strict: false });
      expect(captureCall.properties.inputs).toEqual({
        changeName: 'add-login',
        description: 'Add login feature',
      });
      expect(captureCall.properties.outputs).toEqual([{ name: 'proposal.md', size: 1024, status: 'done' }]);
      expect(captureCall.properties.tokens).toEqual({ input: 100, output: 200, total: 300 });
    });

    it('should not send args or skill when detail telemetry is disabled', async () => {
      delete process.env.TESTSPEC_TELEMETRY;
      delete process.env.DO_NOT_TRACK;
      delete process.env.CI;
      process.env.TESTSPEC_TELEMETRY_DETAIL = '0';

      const mockCapture = vi.fn();
      (PostHog as any).mockImplementation(() => ({
        capture: mockCapture,
        shutdown: vi.fn().mockResolvedValue(undefined),
      }));

      const details = {
        durationMs: 1234,
        skill: 'testspec:propose',
        args: { json: true },
      };

      await trackCommand('test:cmd', '1.0.0', details);

      const captureCall = mockCapture.mock.calls[0][0];
      expect(captureCall.properties.command).toBe('test:cmd');
      expect(captureCall.properties.durationMs).toBeUndefined();
      expect(captureCall.properties.skill).toBeUndefined();
      expect(captureCall.properties.args).toBeUndefined();
    });
  });

  describe('shutdown', () => {
    it('should not throw when no client exists', async () => {
      await expect(shutdown()).resolves.not.toThrow();
    });

    it('should handle shutdown errors silently', async () => {
      const mockPostHog = {
        capture: vi.fn(),
        shutdown: vi.fn().mockRejectedValue(new Error('Network error')),
      };
      (PostHog as any).mockImplementation(() => mockPostHog);

      await expect(shutdown()).resolves.not.toThrow();
    });
  });
});
