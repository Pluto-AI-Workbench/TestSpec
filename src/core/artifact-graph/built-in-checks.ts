import * as fs from 'node:fs';
import * as path from 'node:path';
import { artifactOutputExists } from './outputs.js';

/**
 * Runs built-in checks for an artifact's generated output.
 * Validates that the output directory and file(s) exist.
 *
 * @param changeDir - The change directory path
 * @param artifactId - The artifact ID for error messages
 * @param generates - The generates field value from the artifact schema
 * @throws Error if any check fails
 */
export async function runBuiltinChecks(
  changeDir: string,
  artifactId: string,
  generates: string
): Promise<void> {
  // 1. Check if the output directory exists
  const fullPath = path.join(changeDir, generates);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    throw new Error(
      `[阻断] 工件 "${artifactId}" 的输出目录不存在: ${dir}\n` +
      `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
    );
  }

  // 2. Check if the output file(s) exist (supports glob patterns)
  if (!artifactOutputExists(changeDir, generates)) {
    throw new Error(
      `[阻断] 工件 "${artifactId}" 的输出文件不存在: ${generates}\n` +
      `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
    );
  }
}
