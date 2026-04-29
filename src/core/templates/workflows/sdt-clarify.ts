/**
 * SDT Clarify Workflow Templates
 *
 * Placeholder templates for the sdt-clarify workflow.
 * Content to be filled manually by the user.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getSdtClarifySkillTemplate(): SkillTemplate {
  return {
    name: 'testspec-sdt-clarify',
    description: 'Clarify and refine test requirements. Use when test requirements are ambiguous, incomplete, or need refinement.',
    instructions: `TODO: Fill in the instructions for the sdt-clarify workflow.

This skill should guide the AI through clarifying test requirements:
- Identifying ambiguous or incomplete requirements
- Asking clarifying questions
- Refining requirement descriptions
- Adding missing scenarios
- Ensuring testability of requirements
- Updating specification files with clarified requirements

Reference: This workflow improves requirement quality before test generation.`,
    license: 'MIT',
    compatibility: 'Requires testspec CLI.',
    metadata: { author: 'testspec', version: '1.0' },
  };
}

export function getOpsxSdtClarifyCommandTemplate(): CommandTemplate {
  return {
    name: 'TESTSPEC: SDT Clarify',
    description: 'Clarify and refine test requirements',
    category: 'Workflow',
    tags: ['sdt', 'testing', 'clarify'],
    content: `TODO: Fill in the command content for /testspec:sdt-clarify.

This command helps clarify and refine test requirements.

Input: The specification or change name to clarify.

Steps:
1. Identify ambiguous or incomplete requirements
2. Ask clarifying questions
3. Refine requirement descriptions
4. Add missing scenarios
5. Ensure testability of requirements
6. Update specification files

This workflow improves requirement quality before test generation.`,
  };
}
