import type { ProjectConfig } from './project-config.js';

// Project-level default profile (used when config.yaml has no profile)
export const DEFAULT_PROJECT_PROFILE = 'sdt';

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
  lines.push(
    '# Add your tech stack, conventions, style guides, domain knowledge, etc.',
  );
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
  // Profile
  if (config.profile) {
    lines.push(
      '# 选择一个默认的模式，指定后每次执行命令时会默认使用这个模式对应的流程',
    );
    lines.push(`profile: ${config.profile}`);
    lines.push('');
  }

  // custom command
  lines.push(
    '# 支持自定义命令，需要将命令统一放置在testspec/workflows/ 目录下',
  );
  lines.push(
    '# 格式如下，custom-commands 下每个key为最后实际生成的命令，name指向你的文件名， description为命令的描述',
  );
  lines.push(`# 例如：`);
  lines.push(`#  custom-commands:`);
  lines.push(`#      test-point-generator:`);
  lines.push(`#          name: pointGenerator`);
  lines.push(`#          description: 生成测试要点的命令`);
  lines.push('');

  // Profiles section with default profiles
  lines.push('# 模式对应的流程映射关系，支持自定义模式和对应的流程列表');
  lines.push('# 你可以根据团队需求定义不同的模式，指定每个模式包含哪些流程');
  lines.push(
    '# 例如, my-test模式, 包含sdt-new和sdt-build流程, 适合需要快速迭代的项目',
  );
  lines.push('# 示例：');
  lines.push('#   profiles:');
  lines.push('#      my-test: [sdt-new, sdt-build]');
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
  lines.push('');
  lines.push('# 支持在workflow-settings中配置模式需要人工审核的流程');
  lines.push(`workflow-settings:`);
  lines.push(`   human-review: [] # 需要人工审核的流程列表，默认为空`);
  return lines.join('\n') + '\n';
}
