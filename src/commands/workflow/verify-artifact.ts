/**
 * Verify Artifact Command
 *
 * Runs built-in and custom checks for a specific artifact after it has been generated.
 */

import ora from 'ora';
import {
  loadChangeContext,
  type ArtifactInstructions,
} from '../../core/artifact-graph/index.js';
import {
  validateChangeExists,
  validateSchemaExists,
} from './shared.js';
import { runBuiltinChecks } from '../../core/artifact-graph/built-in-checks.js';
import { runCustomChecks } from '../../core/artifact-graph/custom-check-loader.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface VerifyArtifactOptions {
  change?: string;
  schema?: string;
  json?: boolean;
}

export interface VerifyArtifactResult {
  artifactId: string;
  changeName: string;
  schemaName: string;
  passed: boolean;
  checks: {
    builtin: { passed: boolean; error?: string };
    custom: { passed: boolean; error?: string };
  };
}

// -----------------------------------------------------------------------------
// Command Implementation
// -----------------------------------------------------------------------------

export async function verifyArtifactCommand(
  artifactId: string | undefined,
  options: VerifyArtifactOptions
): Promise<void> {
  const spinner = options.json ? undefined : ora('Verifying artifact...').start();

  try {
    const projectRoot = process.cwd();
    const changeName = await validateChangeExists(options.change, projectRoot);

    // Validate schema if explicitly provided
    if (options.schema) {
      validateSchemaExists(options.schema, projectRoot);
    }

    // loadChangeContext will auto-detect schema from metadata if not provided
    const context = loadChangeContext(projectRoot, changeName, options.schema);

    if (!artifactId) {
      spinner?.stop();
      const validIds = context.graph.getAllArtifacts().map((a) => a.id);
      throw new Error(
        `Missing required argument <artifact>. Valid artifacts:\n  ${validIds.join('\n  ')}`
      );
    }

    const artifact = context.graph.getArtifact(artifactId);

    if (!artifact) {
      spinner?.stop();
      const validIds = context.graph.getAllArtifacts().map((a) => a.id);
      throw new Error(
        `Artifact '${artifactId}' not found in schema '${context.schemaName}'. Valid artifacts:\n  ${validIds.join('\n  ')}`
      );
    }

    // Run checks
    const result: VerifyArtifactResult = {
      artifactId: artifact.id,
      changeName: context.changeName,
      schemaName: context.schemaName,
      passed: true,
      checks: {
        builtin: { passed: true },
        custom: { passed: true },
      },
    };

    // 1. Run built-in checks
    try {
      await runBuiltinChecks(context.changeDir, artifact.id, artifact.generates);
      result.checks.builtin.passed = true;
    } catch (error) {
      result.checks.builtin.passed = false;
      result.checks.builtin.error = (error as Error).message;
      result.passed = false;
    }

    // 2. Run custom checks (if configured)
    if (artifact.checks && artifact.checks.length > 0) {
      try {
        await runCustomChecks(artifact.checks, artifact.id, artifact.generates, projectRoot);
        result.checks.custom.passed = true;
      } catch (error) {
        result.checks.custom.passed = false;
        result.checks.custom.error = (error as Error).message;
        result.passed = false;
      }
    }

    spinner?.stop();

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Print human-readable output
      printVerifyResult(result);
    }

    // Throw error to block execution if checks failed
    if (!result.passed) {
      const errorMessages: string[] = [];
      if (!result.checks.builtin.passed) {
        errorMessages.push(result.checks.builtin.error!);
      }
      if (!result.checks.custom.passed) {
        errorMessages.push(result.checks.custom.error!);
      }
      throw new Error(
        `[阻断] 工件 "${artifactId}" 校验失败:\n${errorMessages.join('\n')}\n` +
        `⛔ 必须停止执行：请先修复上述问题，然后重新运行校验。`
      );
    }
  } catch (error) {
    spinner?.stop();
    throw error;
  }
}

function printVerifyResult(result: VerifyArtifactResult): void {
  console.log(`\nArtifact: ${result.artifactId}`);
  console.log(`Change: ${result.changeName}`);
  console.log(`Schema: ${result.schemaName}`);
  console.log();

  // Built-in checks
  if (result.checks.builtin.passed) {
    console.log('✓ Built-in checks passed');
  } else {
    console.log('✗ Built-in checks failed:');
    console.log(`  ${result.checks.builtin.error}`);
  }

  // Custom checks
  if (result.checks.custom.passed) {
    console.log('✓ Custom checks passed');
  } else {
    console.log('✗ Custom checks failed:');
    console.log(`  ${result.checks.custom.error}`);
  }

  console.log();

  if (result.passed) {
    console.log('All checks passed!');
  } else {
    console.log('Some checks failed. Please fix the issues above.');
  }
}
