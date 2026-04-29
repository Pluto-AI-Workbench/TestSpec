## ADDED Requirements

### Requirement: sdt-new workflow registration
系统 SHALL 将 `sdt-new` 工作流 ID 注册到 `ALL_WORKFLOWS` 数组中。

#### Scenario: sdt-new in ALL_WORKFLOWS
- **WHEN** 系统加载 `src/core/profiles.ts`
- **THEN** `ALL_WORKFLOWS` 数组包含 `'sdt-new'`

### Requirement: sdt-new skill directory mapping
系统 SHALL 在 `WORKFLOW_TO_SKILL_DIR` 中建立 `sdt-new` → `testspec-sdt-new` 的映射。

#### Scenario: sdt-new directory mapping
- **WHEN** `testspec init` 执行时
- **THEN** `WORKFLOW_TO_SKILL_DIR['sdt-new']` 等于 `'testspec-sdt-new'`

### Requirement: sdt-new skill template
系统 SHALL 在 `getSkillTemplates()` 中注册 `sdt-new` 的 skill 模板条目。

#### Scenario: sdt-new skill template registration
- **WHEN** 调用 `getSkillTemplates(customProfileWorkflows)` 时
- **THEN** 结果包含 `{ dirName: 'testspec-sdt-new', workflowId: 'sdt-new' }` 条目
