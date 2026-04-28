/**
 * Command Reference Utilities
 *
 * Utilities for transforming command references to tool-specific formats.
 */

/**
 * Transforms colon-based command references to hyphen-based format.
 * Converts `/testspec:` patterns to `/testspec-` for tools that use hyphen syntax.
 *
 * @param text - The text containing command references
 * @returns Text with command references transformed to hyphen format
 *
 * @example
 * transformToHyphenCommands('/testspec:new') // returns '/testspec-new'
 * transformToHyphenCommands('Use /testspec:apply to implement') // returns 'Use /testspec-apply to implement'
 */
export function transformToHyphenCommands(text: string): string {
  return text.replace(/\/testspec:/g, '/testspec-');
}
