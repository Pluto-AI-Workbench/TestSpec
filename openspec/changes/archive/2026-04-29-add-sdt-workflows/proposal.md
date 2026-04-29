## Why

TestSpec 目前提供的工作流（propose、explore、apply、archive 等）未覆盖 Spec-Driven Testing (SDT) 场景。需要新增 4 个 SDT 工作流，让用户可以快速创建、构建、设计和澄清测试规格，进一步扩展 TestSpec 在测试驱动开发领域的能力。

## What Changes

- 新增 4 个 SDT 工作流：`sdt-new`、`sdt-build`、`sdt-design`、`sdt-clarify`
- 对应的 skill 目录名：`testspec-sdt-new`、`testspec-sdt-build`、`testspec-sdt-design`、`testspec-sdt-clarify`
- 新增对应的 command 模板（供 OpenCode 等支持 commands 的工具使用）
- 新增对应的模板文件（在 `src/core/templates/workflows/` 下）
- 将这 4 个工作流注册到 `custom` profile（不加入 `core`，避免影响现有用户默认体验）
- SKILL.md 内容暂用占位符，后续由用户手动填充

## Capabilities

### New Capabilities

- `sdt-new`: 创建新的 SDT 测试规格变更
- `sdt-build`: 构建/生成测试用例
- `sdt-design`: 设计测试架构和策略
- `sdt-clarify`: 澄清和细化测试需求

### Modified Capabilities

（无）

## Impact

- **代码修改**：
  - `src/core/profiles.ts`：`ALL_WORKFLOWS` 数组新增 4 个 workflow ID
  - `src/core/init.ts`：`WORKFLOW_TO_SKILL_DIR` 新增 4 个映射
  - `src/core/shared/tool-detection.ts`：`SKILL_NAMES` 和 `COMMAND_IDS` 数组新增条目
  - `src/core/shared/skill-generation.ts`：`getSkillTemplates()` 和 `getCommandTemplates()` 新增条目
  - `src/core/templates/skill-templates.ts`：新增 export 语句
  - `src/core/templates/workflows/`：新增 4 个模板文件（`sdt-new.ts`、`sdt-build.ts`、`sdt-design.ts`、`sdt-clarify.ts`）

- **依赖**：无新依赖
- **兼容性**：仅影响 `custom` profile，现有 `core` 用户不受影响
