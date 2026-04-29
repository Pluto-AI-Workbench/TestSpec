## Purpose

Register the `sdt-design` workflow in the TestSpec system, enabling users to design test architecture and strategy.

## Requirements

### Requirement: sdt-design workflow registration
系统 SHALL 将 `sdt-design` 工作流 ID 注册到 `ALL_WORKFLOWS` 数组中。

#### Scenario: sdt-design in ALL_WORKFLOWS
- **WHEN** 系统加载 `src/core/profiles.ts`
- **THEN** `ALL_WORKFLOWS` 数组包含 `'sdt-design'`

### Requirement: sdt-design skill directory mapping
系统 SHALL 在 `WORKFLOW_TO_SKILL_DIR` 中建立 `sdt-design` → `testspec-sdt-design` 的映射。

#### Scenario: sdt-design directory mapping
- **WHEN** `testspec init` 执行时
- **THEN** `WORKFLOW_TO_SKILL_DIR['sdt-design']` 等于 `'testspec-sdt-design'`

### Requirement: sdt-design skill template
系统 SHALL 在 `getSkillTemplates()` 中注册 `sdt-design` 的 skill 模板条目。

#### Scenario: sdt-design skill template registration
- **WHEN** 调用 `getSkillTemplates(customProfileWorkflows)` 时
- **THEN** 结果包含 `{ dirName: 'testspec-sdt-design', workflowId: 'sdt-design' }` 条目
