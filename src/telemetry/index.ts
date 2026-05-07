/**
 * Telemetry module for anonymous usage analytics.
 *
 * Privacy-first design:
 * - Only tracks command name and version
 * - No arguments, file paths, or content
 * - Opt-out via TESTSPEC_TELEMETRY=0 or DO_NOT_TRACK=1
 * - Auto-disabled in CI environments
 * - Anonymous ID is a random UUID with no relation to the user
 */
import { PostHog } from 'posthog-node';
import { randomUUID } from 'crypto';
import { getTelemetryConfig, updateTelemetryConfig } from './config.js';

export interface TelemetryDetails {
  args?: Record<string, unknown>;
  durationMs?: number;
  skill?: string;
  skillTool?: string;
  inputs?: Record<string, string | undefined>;
  outputs?: { name: string; size: number; status: 'done' | 'pending' | 'skipped' }[];
  tokens?: { input?: number; output?: number; total?: number };
}

// PostHog API key - public key for client-side analytics
// This is safe to embed as it only allows sending events, not reading data
const POSTHOG_API_KEY = 'phc_Hthu8YvaIJ9QaFKyTG4TbVwkbd5ktcAFzVTKeMmoW2g';
// Using reverse proxy to avoid ad blockers and keep traffic on our domain
const POSTHOG_HOST = 'https://edge.testspec.dev';
const TELEMETRY_REQUEST_TIMEOUT_MS = 1000;

let posthogClient: PostHog | null = null;
let anonymousId: string | null = null;

async function safeTelemetryFetch(url: string, options: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
  } catch {
    // Silent failure - telemetry should never surface network noise
  }

  return new Response(null, { status: 204 });
}

/**
 * Check if telemetry is enabled.
 *
 * Disabled when:
 * - TESTSPEC_TELEMETRY=0
 * - DO_NOT_TRACK=1
 * - CI=true (any CI environment)
 */
export function isTelemetryEnabled(): boolean {
  // Check explicit opt-out
  if (process.env.TESTSPEC_TELEMETRY === '0') {
    return false;
  }

  // Respect DO_NOT_TRACK standard
  if (process.env.DO_NOT_TRACK === '1') {
    return false;
  }

  // Auto-disable in CI environments
  if (process.env.CI === 'true') {
    return false;
  }

  return true;
}

/**
 * Check if detailed telemetry (args, inputs, outputs, etc.) is enabled.
 *
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

/**
 * Get or create the anonymous user ID.
 * Lazily generates a UUID on first call and persists it.
 */
export async function getOrCreateAnonymousId(): Promise<string> {
  // Return cached value if available
  if (anonymousId) {
    return anonymousId;
  }

  // Try to load from config
  const config = await getTelemetryConfig();
  if (config.anonymousId) {
    anonymousId = config.anonymousId;
    return anonymousId;
  }

  // Generate new UUID and persist
  anonymousId = randomUUID();
  await updateTelemetryConfig({ anonymousId });
  return anonymousId;
}

/**
 * Get the PostHog client instance.
 * Creates it on first call with CLI-optimized settings.
 */
function getClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      flushAt: 1, // Send immediately, don't batch
      flushInterval: 0, // No timer-based flushing
      fetchRetryCount: 0,
      requestTimeout: TELEMETRY_REQUEST_TIMEOUT_MS,
      preloadFeatureFlags: false,
      disableRemoteConfig: true,
      disableSurveys: true,
      fetch: safeTelemetryFetch,
    });
  }
  return posthogClient;
}

/**
 * Track a command execution.
 *
 * @param commandName - The command name (e.g., 'init', 'change:apply')
 * @param version - The TestSpec version
 * @param details - Optional telemetry details (only included when detail telemetry is enabled)
 */
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

/**
 * Show first-run telemetry notice if not already seen.
 */
export async function maybeShowTelemetryNotice(): Promise<void> {
  if (!isTelemetryEnabled()) {
    return;
  }

  try {
    const config = await getTelemetryConfig();
    if (config.noticeSeen) {
      return;
    }

    // Display notice
    console.log(
      'Note: TestSpec collects anonymous usage stats. Opt out: TESTSPEC_TELEMETRY=0'
    );

    // Mark as seen
    await updateTelemetryConfig({ noticeSeen: true });
  } catch {
    // Silent failure - telemetry should never break CLI
  }
}

/**
 * Shutdown the PostHog client and flush pending events.
 * Call this before CLI exit.
 */
export async function shutdown(): Promise<void> {
  if (!posthogClient) {
    return;
  }

  try {
    await posthogClient.shutdown();
  } catch {
    // Silent failure - telemetry should never break CLI exit
  } finally {
    posthogClient = null;
  }
}
