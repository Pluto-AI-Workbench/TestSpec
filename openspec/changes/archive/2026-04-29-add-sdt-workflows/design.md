## Context

TestSpec 目前的工作流系统通过以下机制注册新工作流：

1. **profiles.ts** - `ALL_WORKFLOWS` 数组定义所有可用工作流 ID，`CORE_WORKFLOWS` 定义默认加载的工作流
2. **init.ts** - `WORKFLOW_TO_SKILL_DIR` 映射工作流 ID → skill 目录名
3. **shared/tool-detection.ts** - `SKILL_NAMES` 和 `COMMAND_IDS` 数组用于检测和清理
4. **shared/skill-generation.ts** - `getSkillTemplates()` 和 `getCommandTemplates()` 返回模板列表
5. **templates/skill-templates.ts** - 导出各工作流的模板函数
6. **templates/workflows/*.ts** - 各工作流的模板实现

新增的 4 个 SDT 工作流遵循完全相同的注册模式。`custom` profile 用户通过 `testspec config profile custom` 启用。

## Goals / Non-Goals

**Goals:**
- 添加 `sdt-new`、`sdt-build`、`sdt-design`、`sdt-clarify` 四个工作流 ID
- 在 `custom` profile 中注册这 4 个工作流
- 创建对应的 skill 目录名：`testspec-sdt-new`、`testspec-sdt-build`、`testspec-sdt-design`、`testspec-sdt-clarify`
- 创建占位符模板文件，SKILL.md 内容后续手动填充
- 确保 `testspec init --tools <tool>` 能正确生成这些新工作流的 skill/command 文件

**Non-Goals:**
- 不修改 `CORE_WORKFLOWS`（不影响默认用户体验）
- 不编写具体的工作流逻辑（SKILL.md 内容留空，后续手动填充）
- 不添加新依赖

## Decisions

### Decision 1: 工作流 ID 命名

**选择**: 使用 `sdt-new`、`sdt-build`、`sdt-design`、`sdt-clarify`

**理由**: 与现有工作流命名一致（如 `new`、`apply`、`archive`），加上 `sdt-` 前缀表明属于 Spec-Driven Testing 类别。

**备选方案**:
- `spec-test-new` 等（过长，与现有风格不一致）
- `st-new` 等（缩写可能不清晰）

### Decision 2: Profile 归属

**选择**: 仅加入 `custom` profile（`ALL_WORKFLOWS`），不加入 `CORE_WORKFLOWS`

**理由**: SDT 是特定领域的工作流，不应影响默认的 `core` 用户体验。`custom` profile 用户明确选择扩展功能。

### Decision 3: 模板内容策略

**选择**: 创建最小占位符模板，包含正确的 YAML frontmatter 和 "TODO: fill in content" 提示

**理由**: 用户明确表示后续手动填充内容，占位符确保 `testspec init` 不会报错，且生成的 SKILL.md 文件结构正确。

**备选方案**:
- 完全空文件（可能导致 init 命令处理异常）
- 复制 testspec-propose 内容后修改（与用户"手动填充"的要求不符）

### Decision 4: Skill 目录命名

**选择**: `testspec-sdt-new`、`testspec-sdt-build`、`testspec-sdt-design`、`testspec-sdt-clarify`

**理由**: 与现有模式一致（`testspec-propose`、`testspec-explore` 等），清晰表明这些是 TestSpec 的 SDT 工作流。

## Risks / Trade-offs

**[Risk] 用户忘记手动填充 SKILL.md 内容**
→ **Mitigation**: 占位符中包含明确提示；在文档或注释中说明

**[Risk] 未来 SDT 工作流内容可能与 testspec-propose 等现有工作流产生命名冲突**
→ **Mitigation**: `sdt-` 前缀提供了命名空间隔离

**[Risk] 仅添加到 custom profile 可能降低可见性**
→ **Mitigation**: 在 `testspec init` 的输出或文档中说明如何启用 custom profile
