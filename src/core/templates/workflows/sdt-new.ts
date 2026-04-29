/**
 * SDT New Workflow Templates
 *
 * Placeholder templates for the sdt-new workflow.
 * Content to be filled manually by the user.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getSdtNewSkillTemplate(): SkillTemplate {
  return {
    name: 'testspec-sdt-new',
    description: 'Create a new SDT (Spec-Driven Testing) change. Use when starting a new testing specification.',
    instructions: `TODO: Fill in the instructions for the sdt-new workflow.

This skill should guide the AI through creating a new SDT change, including:
- Creating the change directory
- Setting up initial test specifications
- Defining test scope and requirements

Reference: Follow the pattern of testspec-propose but tailored for testing workflows.`,
    license: 'MIT',
    compatibility: 'Requires testspec CLI.',
    metadata: { author: 'testspec', version: '1.0' },
  };
}

export function getOpsxSdtNewCommandTemplate(): CommandTemplate {
  return {
    name: 'TESTSPEC: SDT New',
    description: 'Create a new SDT (Spec-Driven Testing) change',
    category: 'Workflow',
    tags: ['sdt', 'testing', 'new'],
    content: `TODO: Fill in the command content for /testspec:sdt-new.

This command should guide the user through creating a new SDT change.

Input: The change name (kebab-case) or description of the testing specification to create.

Steps:
1. Create the change directory
2. Set up test specification structure
3. Define initial test requirements

Follow the pattern of /testspec:propose but adapted for testing workflows.`,
  };
}
