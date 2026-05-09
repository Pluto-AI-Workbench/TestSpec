import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

interface CheckContext {
  artifactId: string;
  generatedPath: string;
}

interface CheckResult {
  passed: boolean;
  message?: string;
}

type CheckFunction = (ctx: CheckContext) => Promise<CheckResult>;

/**
 * Runs custom checks for an artifact.
 * Looks for check scripts in the checks/ directory:
 * - First tries checks/{name}.ts or checks/{name}.js
 * - If not found, looks for checks/{name}/SKILL.md (TODO: AI execution)
 *
 * @param checksList - List of check names from the artifact's checks field
 * @param artifactId - The artifact ID for error messages and context
 * @param generates - The generates field value from the artifact schema
 * @param projectRoot - The project root directory
 * @throws Error if check file not found or check fails
 */
export async function runCustomChecks(
  checksList: string[],
  artifactId: string,
  generates: string,
  projectRoot: string
): Promise<void> {
  for (const checkName of checksList) {
    await runSingleCheck(checkName, artifactId, generates, projectRoot);
  }
}

async function runSingleCheck(
  checkName: string,
  artifactId: string,
  generates: string,
  projectRoot: string
): Promise<void> {
  const checksDir = path.join(projectRoot, 'checks');

  // Try script files first: checks/{name}.ts, checks/{name}.js, or checks/{name}.py
  const tsPath = path.join(checksDir, `${checkName}.ts`);
  const jsPath = path.join(checksDir, `${checkName}.js`);
  const pyPath = path.join(checksDir, `${checkName}.py`);

  if (fs.existsSync(tsPath)) {
    await runScriptCheck(tsPath, checkName, artifactId, generates);
    return;
  }

  if (fs.existsSync(jsPath)) {
    await runScriptCheck(jsPath, checkName, artifactId, generates);
    return;
  }

  if (fs.existsSync(pyPath)) {
    await runPythonCheck(pyPath, checkName, artifactId, generates, projectRoot);
    return;
  }

  // Try SKILL.md: checks/{name}/SKILL.md
  const skillPath = path.join(checksDir, checkName, 'SKILL.md');
  if (fs.existsSync(skillPath)) {
    // TODO: Implement AI-based skill check execution
    throw new Error(
      `[阻断] SKILL.md 校验暂未实现: ${checkName}\n` +
      `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
    );
  }

  // Neither found - throw error
  throw new Error(
    `[阻断] 未找到校验文件: checks/${checkName}.ts、checks/${checkName}.js、checks/${checkName}.py 或 checks/${checkName}/SKILL.md\n` +
    `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
  );
}

async function runScriptCheck(
  filePath: string,
  checkName: string,
  artifactId: string,
  generates: string
): Promise<void> {
  // Dynamic import with ESM path conversion
  const fileUrl = pathToFileURL(filePath).href;
  const module = await import(fileUrl);

  // Support both default export and named 'check' export
  const checkFn: CheckFunction = module.default || module.check;

  if (typeof checkFn !== 'function') {
    throw new Error(
      `[阻断] 校验文件 "${checkName}" 未导出有效的检查函数（需要 default export 或 check export）\n` +
      `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
    );
  }

  // Execute the check
  const result = await checkFn({
    artifactId,
    generatedPath: generates,
  });

  if (!result.passed) {
    throw new Error(
      `[阻断] 工件 "${artifactId}" 的校验 "${checkName}" 失败: ${result.message || '未知错误'}\n` +
      `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
    );
  }
}

async function runPythonCheck(
  filePath: string,
  checkName: string,
  artifactId: string,
  generates: string,
  projectRoot: string
): Promise<void> {
  // Prepare input context as JSON
  const context: CheckContext = {
    artifactId,
    generatedPath: generates,
  };
  const inputJson = JSON.stringify(context);

  try {
    // Execute Python script with context as argument
    const { stdout, stderr } = await execFileAsync('python', [filePath, inputJson], {
      cwd: projectRoot,
      timeout: 30000, // 30 second timeout
    });

    if (stderr) {
      console.warn(`[自定义校验] Python 警告 (${checkName}): ${stderr}`);
    }

    // Parse JSON output
    let result: CheckResult;
    try {
      result = JSON.parse(stdout.trim());
    } catch {
      throw new Error(
        `[阻断] Python 脚本 "${checkName}" 输出格式错误，需要 JSON 格式: {"passed": true/false, "message": "..."}\n` +
        `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
      );
    }

    // Validate result structure
    if (typeof result.passed !== 'boolean') {
      throw new Error(
        `[阻断] Python 脚本 "${checkName}" 返回的 passed 字段必须是 boolean 类型\n` +
        `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
      );
    }

    if (!result.passed) {
      throw new Error(
        `[阻断] 工件 "${artifactId}" 的校验 "${checkName}" 失败: ${result.message || '未知错误'}\n` +
        `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
      );
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `[阻断] 未找到 Python 解释器，请确保 Python 已安装并在 PATH 中\n` +
        `⛔ 停止执行并向用户报告错误,不要尝试自动修复问题。`
      );
    }
    throw error;
  }
}
