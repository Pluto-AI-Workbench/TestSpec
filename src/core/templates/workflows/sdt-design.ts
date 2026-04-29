/**
 * SDT Design Workflow Templates
 *
 * Placeholder templates for the sdt-design workflow.
 * Content to be filled manually by the user.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getSdtDesignSkillTemplate(): SkillTemplate {
  return {
    name: 'testspec-sdt-design',
    description: 'Design test architecture and strategy. Use when planning test approach, selecting frameworks, or defining test architecture.',
    instructions: `TODO: Fill in the instructions for the sdt-design workflow.

This skill should guide the AI through designing test architecture:
- Analyzing requirements and system under test
- Selecting appropriate testing frameworks
- Defining test strategy (unit, integration, e2e)
- Creating test architecture documentation
- Identifying test data requirements

Reference: This workflow focuses on the "how" of testing, not implementation.`,
    license: 'MIT',
    compatibility: 'Requires testspec CLI.',
    metadata: { author: 'testspec', version: '1.0' },
  };
}

export function getOpsxSdtDesignCommandTemplate(): CommandTemplate {
  return {
    name: 'TESTSPEC: SDT Design',
    description: 'Design test architecture and strategy',
    category: 'Workflow',
    tags: ['sdt', 'testing', 'design'],
    content: `TODO: Fill in the command content for /testspec:sdt-design.

This command helps design test architecture and strategy.

Input: The system or feature to design tests for.

Steps:
1. Analyze requirements and system under test
2. Select appropriate testing frameworks
3. Define test strategy (unit, integration, e2e)
4. Document test architecture
5. Identify test data requirements

This workflow produces test design documents, not executable tests.`,
  };
}
