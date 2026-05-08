## Context

当前 TestSpec 使用固定的 SDT 工作流，所有项目都使用完整流程 (sdt-new → sdt-clarify → sdt-design → sdt-build)。不同项目有不同的测试需求，部分项目可能只需要部分阶段。

用户希望在 `testspec/config.yaml` 中配置需要的工作流阶段，系统根据配置生成定制化的 schema.yaml。

## Goals / Non-Goals

**Goals:**
- 用户可通过修改 `testspec/config.yaml` 的 `profiles.sdt` 字段选择需要的工作流
- `testspec init` 默认生成完整的流程配置
- `testspec update` 根据配置生成定制化的 schema.yaml
- 生成的 schema.yaml 覆盖写入 `testspec/schemas/sdt/schema.yaml`

**Non-Goals:**
- 不修改包内置的 `schemas/sdt/schema.yaml`（完整模板保留）
- 不支持动态运行时切换流程（必须通过 config 文件 + update 命令）
- 不支持除 SDT 以外的其他 schema 流程配置

## Decisions

### 1. 配置文件结构

**决定:** 在 `testspec/config.yaml` 中添加 `profiles` 字段

```yaml
schema: sdt
profiles:
  sdt: [sdt-new, sdt-clarify, sdt-design, sdt-build]
```

**备选方案:**
- 在 `testspec/config.yaml` 顶级添加 `workflows` 字段 → 拒绝，与 global-config 的 workflows 概念冲突
- 创建独立的 `testspec/profiles.yaml` → 拒绝，增加文件复杂度

### 2. 映射文件格式

**决定:** 使用 JSON 格式存储流程-artifact 映射 (`schemas/sdt/sdt-profile.json`)

```json
{
  "sdt-new": { "artifacts": [] },
  "sdt-clarify": { "artifacts": ["clarify-sdt-requirements", "clarify-sdt-spec", "clarify-risk-assessment"] },
  "sdt-design": { "artifacts": ["design-test-points", "design-manual-case"] },
  "sdt-build": { "artifacts": ["build-scripts"] }
}
```

**备选方案:**
- 使用 YAML 格式 → 拒绝，JSON 在 TypeScript 中解析更方便
- 内嵌在 schema.yaml 中作为注释 → 拒绝，不够清晰

### 3. Schema 生成位置

**决定:** 覆盖写入 `testspec/schemas/sdt/schema.yaml`

解析顺序：project > user > package，因此项目内的 schema.yaml 会优先于包内置的完整模板。

### 4. 依赖过滤逻辑

**决定:** 自动过滤不存在的 requires 依赖，不报错

示例：
- 用户选择 `[sdt-clarify, sdt-design]`，不选 `sdt-build`
- `build-scripts` 的 requires 为 `[clarify-sdt-spec, design-manual-case]`
- 由于这些 artifact 都在选择范围内，保留依赖
- apply 配置：如果未选 sdt-build，则 apply 为空配置

### 5. 扩展点选择

**决定:** 在 `update` 命令执行流程中集成 schema 生成逻辑

**备选方案:**
- 创建独立的 `testspec generate-schema` 命令 → 拒绝，增加用户学习成本
- 在 `init` 命令中生成 → 拒绝，init 只初始化一次，不适合动态更新

## Risks / Trade-offs

- [风险] 用户配置了不存在的流程名称 → **缓解**: 添加配置校验，提示有效的流程名称
- [风险] 用户只选部分流程导致依赖不完整 → **缓解**: 自动过滤不存在的依赖，保持 schema 有效性
- [风险] 生成的 schema.yaml 路径与包内置冲突 → **缓解**: 使用 project 路径，优先级高于 package

## Migration Plan

1. ~~扩展 `project-config.ts` 的 Zod schema 支持 profiles 字段~~ (已完成)
2. ~~修改 `init.ts` 的默认 config 生成逻辑~~ (已完成)
3. 新增 `schemas/sdt/sdt-profile.json` 映射文件
4. 在 `update.ts` 中添加 schema 生成逻辑
5. 现有项目执行 `testspec update` 后自动应用新配置

## Open Questions

- [Q1] 是否需要支持用户自定义新流程？ → 暂时不支持，后续版本考虑
- [Q2] 生成的 schema.yaml 是否需要版本控制？ → 不需要，每次 update 覆盖