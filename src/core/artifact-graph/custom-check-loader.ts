import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

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

  // Try script files first: checks/{name}.ts or checks/{name}.js
  const tsPath = path.join(checksDir, `${checkName}.ts`);
  const jsPath = path.join(checksDir, `${checkName}.js`);

  let filePath: string | null = null;
  if (fs.existsSync(tsPath)) {
    filePath = tsPath;
  } else if (fs.existsSync(jsPath)) {
    filePath = jsPath;
  }

  if (filePath) {
    await runScriptCheck(filePath, checkName, artifactId, generates);
    return;
  }

  // Try SKILL.md: checks/{name}/SKILL.md
  const skillPath = path.join(checksDir, checkName, 'SKILL.md');
  if (fs.existsSync(skillPath)) {
    // TODO: Implement AI-based skill check execution
    throw new Error(
      `[自定义校验] SKILL.md 校验暂未实现: ${checkName}`
    );
  }

  // Neither found - throw error
  throw new Error(
    `[自定义校验] 未找到校验文件: checks/${checkName}.ts、checks/${checkName}.js 或 checks/${checkName}/SKILL.md`
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
      `[自定义校验] 校验文件 "${checkName}" 未导出有效的检查函数（需要 default export 或 check export）`
    );
  }

  // Execute the check
  const result = await checkFn({
    artifactId,
    generatedPath: generates,
  });

  if (!result.passed) {
    throw new Error(
      `[自定义校验] 工件 "${artifactId}" 的校验 "${checkName}" 失败: ${result.message || '未知错误'}`
    );
  }
}
