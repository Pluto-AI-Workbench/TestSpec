/**
 * SDT Build Workflow Templates
 *
 * Placeholder templates for the sdt-build workflow.
 * Content to be filled manually by the user.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getSdtBuildSkillTemplate(): SkillTemplate {
  return {
    name: 'testspec-sdt-build',
    description: 'Build test cases from SDT specifications. Use when generating test cases based on defined specifications.',
    instructions: `TODO: Fill in the instructions for the sdt-build workflow.

This skill should guide the AI through building test cases:
- Reading existing test specifications
- Generating test case structures
- Validating test coverage
- Outputting test files in the appropriate format

Reference: This workflow generates executable tests from SDT specs.`,
    license: 'MIT',
    compatibility: 'Requires testspec CLI.',
    metadata: { author: 'testspec', version: '1.0' },
  };
}

export function getOpsxSdtBuildCommandTemplate(): CommandTemplate {
  return {
    name: 'TESTSPEC: SDT Build',
    description: 'Build test cases from SDT specifications',
    category: 'Workflow',
    tags: ['sdt', 'testing', 'build'],
    content: `TODO: Fill in the command content for /testspec:sdt-build.

This command generates test cases from SDT specifications.

Input: The change name or specification to build tests from.

Steps:
1. Read SDT specifications
2. Generate test case structures
3. Validate test coverage
4. Output test files

This workflow transforms specs into executable tests.`,
  };
}
