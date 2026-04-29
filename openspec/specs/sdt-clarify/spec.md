## Purpose

Register the `sdt-clarify` workflow in the TestSpec system, enabling users to clarify and refine test requirements.

## Requirements

### Requirement: sdt-clarify workflow registration
系统 SHALL 将 `sdt-clarify` 工作流 ID 注册到 `ALL_WORKFLOWS` 数组中。

#### Scenario: sdt-clarify in ALL_WORKFLOWS
- **WHEN** 系统加载 `src/core/profiles.ts`
- **THEN** `ALL_WORKFLOWS` 数组包含 `'sdt-clarify'`

### Requirement: sdt-clarify skill directory mapping
系统 SHALL 在 `WORKFLOW_TO_SKILL_DIR` 中建立 `sdt-clarify` → `testspec-sdt-clarify` 的映射。

#### Scenario: sdt-clarify directory mapping
- **WHEN** `testspec init` 执行时
- **THEN** `WORKFLOW_TO_SKILL_DIR['sdt-clarify']` 等于 `'testspec-sdt-clarify'`

### Requirement: sdt-clarify skill template
系统 SHALL 在 `getSkillTemplates()` 中注册 `sdt-clarify` 的 skill 模板条目。

#### Scenario: sdt-clarify skill template registration
- **WHEN** 调用 `getSkillTemplates(customProfileWorkflows)` 时
- **THEN** 结果包含 `{ dirName: 'testspec-sdt-clarify', workflowId: 'sdt-clarify' }` 条目
