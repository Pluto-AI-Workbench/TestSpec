/**
 * Profile System
 *
 * Defines workflow profiles that control which workflows are installed.
 * Profiles determine WHICH workflows; delivery (in global config) determines HOW.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parse as parseYaml } from "yaml";
import type { Profile } from "./global-config.js";
import { DEFAULT_PROFILES } from "./config-prompts.js";

/**
 * Core workflows included in the 'core' profile.
 * These provide the streamlined experience for new users.
 * @deprecated Use getProfileWorkflows with config.yaml profiles instead
 */
export const CORE_WORKFLOWS = [
  "propose",
  "explore",
  "apply",
  "archive",
] as const;

// SDT-specific workflows
// @deprecated Use getProfileWorkflows with config.yaml profiles instead
export const SDT_WORKFLOWS = [
  "sdt-new",
  "sdt-build",
  "sdt-design",
  "sdt-clarify",
] as const;

/**
 * All available workflows in the system.
 */
export const ALL_WORKFLOWS = [
  "propose",
  "explore",
  "new",
  "continue",
  "apply",
  "ff",
  "sync",
  "archive",
  "bulk-archive",
  "verify",
  "onboard",
  "sdt-new",
  "sdt-build",
  "sdt-design",
  "sdt-clarify",
] as const;

export type WorkflowId = (typeof ALL_WORKFLOWS)[number];
export type CoreWorkflowId = (typeof CORE_WORKFLOWS)[number];

/**
 * Built-in profile names that cannot be overridden
 */
export const BUILTIN_PROFILES = ["core", "sdt", "custom"] as const;

/**
 * Read profiles from project config.yaml
 * Returns null if file doesn't exist or profiles field is not defined
 */
function readProfilesFromConfig(
  projectRoot?: string,
): Record<string, string[]> | null {
  const root = projectRoot || process.cwd();
  const configPath = path.join(root, "testspec", "config.yaml");

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const parsed = parseYaml(content);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const profiles = parsed.profiles;
    if (!profiles || typeof profiles !== "object") {
      return null;
    }

    // Validate and normalize profiles
    const result: Record<string, string[]> = {};
    for (const [name, workflows] of Object.entries(profiles)) {
      if (Array.isArray(workflows)) {
        result[name] = workflows.filter(
          (w): w is string => typeof w === "string",
        );
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

/**
 * Validate workflows against known workflows
 * Returns invalid workflow names
 */
function validateWorkflows(workflows: string[]): string[] {
  const validSet = new Set<string>(ALL_WORKFLOWS);
  return workflows.filter((w) => !validSet.has(w));
}

/**
 * Get available profile names from config.yaml
 */
export function getConfigProfileNames(projectRoot?: string): string[] {
  const profiles = readProfilesFromConfig(projectRoot);
  return profiles ? Object.keys(profiles) : [];
}

/**
 * Resolves which workflows should be active for a given profile configuration.
 *
 * Reads ONLY from config.yaml profiles field. No fallback to DEFAULT_PROFILES.
 * If config.yaml doesn't exist or profiles field is empty, returns empty array.
 *
 * - 'custom' profile returns customWorkflows if provided (from global config)
 * - Other profile names are looked up in config.yaml profiles
 */
export function getProfileWorkflows(
  profile: Profile,
  customWorkflows?: string[],
  projectRoot?: string,
): readonly string[] {
  // Read profiles from config
  const configProfiles = readProfilesFromConfig(projectRoot);

  // Check for custom profile name (not in BUILTIN_PROFILES)
  if (!(BUILTIN_PROFILES as readonly string[]).includes(profile)) {
    if (configProfiles && configProfiles[profile]) {
      const workflows = configProfiles[profile];
      // Validate workflows
      const invalidWorkflows = validateWorkflows(workflows);
      if (invalidWorkflows.length > 0) {
        console.warn(
          `Warning: Profile '${profile}' contains invalid workflows: ${invalidWorkflows.join(", ")}, ignoring`,
        );
      }
      return workflows;
    }
    // Profile not found in config - return empty, no fallback
    console.warn(`Warning: Profile '${profile}' not found in config.`);
    if (configProfiles) {
      console.warn(`Available profiles: ${Object.keys(configProfiles).join(", ")}`);
    } else {
      console.warn(`No profiles defined in testspec/config.yaml`);
    }
    return [];
  }

  // Built-in profiles read from config only
  // For custom, use customWorkflows from global config if provided
  if (profile === "custom") {
    if (customWorkflows && customWorkflows.length > 0) {
      return customWorkflows;
    }
    // No customWorkflows, try config
    if (configProfiles && configProfiles[profile]) {
      const workflows = configProfiles[profile];
      const invalidWorkflows = validateWorkflows(workflows);
      if (invalidWorkflows.length > 0) {
        console.warn(
          `Warning: Profile '${profile}' contains invalid workflows: ${invalidWorkflows.join(", ")}, ignoring`,
        );
      }
      return workflows;
    }
    // custom profile without config and without customWorkflows
    console.warn(`Warning: Profile 'custom' not defined in config and no custom workflows provided.`);
    return [];
  }

  // For core and sdt, read from config profiles only
  if (configProfiles && configProfiles[profile]) {
    const workflows = configProfiles[profile];
    const invalidWorkflows = validateWorkflows(workflows);
    if (invalidWorkflows.length > 0) {
      console.warn(
        `Warning: Profile '${profile}' contains invalid workflows: ${invalidWorkflows.join(", ")}, ignoring`,
      );
    }
    return workflows;
  }

  // Profile not found in config - NO FALLBACK to DEFAULT_PROFILES
  console.warn(`Warning: Profile '${profile}' not found in testspec/config.yaml.`);
  if (configProfiles && Object.keys(configProfiles).length > 0) {
    console.warn(`Available profiles: ${Object.keys(configProfiles).join(", ")}`);
  } else {
    console.warn(`No profiles defined in testspec/config.yaml. Add profiles mapping to your config.yaml.`);
  }
  return [];
}
