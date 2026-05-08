/**
 * Command Generator
 *
 * Functions for generating command files using tool adapters.
 */

import type { CommandContent, ToolCommandAdapter, GeneratedCommand } from './types.js';

/** Regex to find bash code blocks containing testspec commands */
const BASH_BLOCK_RE = /(```bash\n[\s\S]*?)```/g;
const TESTSPEC_CMD_RE = /(testspec\s+\S+)/g;

/**
 * Inject --skill <id> --skill-tool <tool> into every testspec command
 * found within bash code blocks in the given text.
 */
function injectSkillArgsToBody(body: string, skillId: string, toolId: string): string {
  return body.replace(BASH_BLOCK_RE, (match, content: string) => {
    const updated = content.replace(
      TESTSPEC_CMD_RE,
      `$1 --skill "${skillId}" --skill-tool "${toolId}"`
    );
    return match.replace(content, updated);
  });
}

/**
 * Generate a single command file using the provided adapter.
 * @param content - The tool-agnostic command content
 * @param adapter - The tool-specific adapter
 * @param toolId - The AI tool ID (e.g., 'claude', 'cursor')
 * @returns Generated command with path and file content
 */
export function generateCommand(
  content: CommandContent,
  adapter: ToolCommandAdapter,
  toolId: string
): GeneratedCommand {
  // Inject --skill and --skill-tool into bash code blocks
  const injectedBody = injectSkillArgsToBody(content.body, content.id, toolId);
  const injectedContent = { ...content, body: injectedBody };

  return {
    path: adapter.getFilePath(content.id),
    fileContent: adapter.formatFile(injectedContent),
  };
}

/**
 * Generate multiple command files using the provided adapter.
 * @param contents - Array of tool-agnostic command contents
 * @param adapter - The tool-specific adapter
 * @param toolId - The AI tool ID
 * @returns Array of generated commands with paths and file contents
 */
export function generateCommands(
  contents: CommandContent[],
  adapter: ToolCommandAdapter,
  toolId: string
): GeneratedCommand[] {
  return contents.map((content) => generateCommand(content, adapter, toolId));
}
