import type { ProjectConfig } from './project-config.js';

// Default profile mappings
export const DEFAULT_PROFILES: Record<string, string[]> = {
  core: ['propose', 'explore', 'apply', 'archive'],
  sdt: ['sdt-new', 'sdt-build', 'sdt-design', 'sdt-clarify'],
  custom: [
    'propose',
    'explore',
    'new',
    'continue',
    'apply',
    'ff',
    'sync',
    'archive',
    'bulk-archive',
    'verify',
    'onboard',
    'sdt-new',
    'sdt-build',
    'sdt-design',
    'sdt-clarify',
  ],
};

/**
 * Serialize config to YAML string with helpful comments.
 *
 * @param config - Partial config object (schema required, context/rules optional, profiles optional)
 * @returns YAML string ready to write to file
 */
export function serializeConfig(config: Partial<ProjectConfig>): string {
  const lines: string[] = [];

  // Schema (required)
  lines.push(`schema: ${config.schema}`);
  lines.push('');

  // Context section with comments
  lines.push('# Project context (optional)');
  lines.push('# This is shown to AI when creating artifacts.');
  lines.push('# Add your tech stack, conventions, style guides, domain knowledge, etc.');
  lines.push('# Example:');
  lines.push('#   context: |');
  lines.push('#     Tech stack: TypeScript, React, Node.js');
  lines.push('#     We use conventional commits');
  lines.push('#     Domain: e-commerce platform');
  lines.push('');

  // Rules section with comments
  lines.push('# Per-artifact rules (optional)');
  lines.push('# Add custom rules for specific artifacts.');
  lines.push('# Example:');
  lines.push('#   rules:');
  lines.push('#     proposal:');
  lines.push('#       - Keep proposals under 500 words');
  lines.push('#       - Always include a "Non-goals" section');
  lines.push('#     tasks:');
  lines.push('#       - Break tasks into chunks of max 2 hours');
  lines.push('');

  // Profiles section with default profiles
  lines.push('# Profile to workflow mappings (optional)');
  lines.push('# Add custom profile names and their workflow combinations here.');
  lines.push('# Example:');
  lines.push('#   profiles:');
  lines.push('#     my-team: [propose, sdt-new, sdt-build]');
  lines.push('#     minimal: [propose, apply]');
  lines.push('');

  // Output default profiles
  if (config.profiles) {
    lines.push('profiles:');
    for (const [profileName, workflows] of Object.entries(config.profiles)) {
      if (workflows && workflows.length > 0) {
        lines.push(`  ${profileName}: [${workflows.join(', ')}]`);
      }
    }
  } else {
    // Output default profiles if not provided
    lines.push('profiles:');
    for (const [profileName, workflows] of Object.entries(DEFAULT_PROFILES)) {
      lines.push(`  ${profileName}: [${workflows.join(', ')}]`);
    }
  }

  return lines.join('\n') + '\n';
}
