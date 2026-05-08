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

  console.log(`[always-fail] Checking artifact: ${artifactId}`);

  // This check always fails to verify error handling
  return {
    passed: false,
    message: `Artifact "${artifactId}" failed always-fail check (testing error handling)`,
  };
}
