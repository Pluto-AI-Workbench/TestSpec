import * as fs from 'node:fs';
import * as path from 'node:path';

interface CheckContext {
  artifactId: string;
  generatedPath: string;
}

interface CheckResult {
  passed: boolean;
  message?: string;
}

export default async function check(ctx: CheckContext): Promise<CheckResult> {
  const { artifactId, generatedPath } = ctx;

  console.log(`[must-have-why] Checking artifact: ${artifactId}`);
  console.log(`[must-have-why] Generated path: ${generatedPath}`);

  // This is a simple test check that always passes
  // In real usage, you would read the file and check its content

  return {
    passed: true,
    message: `Artifact "${artifactId}" passed must-have-why check`,
  };
}
