## Why

当前 SDT (Spec-Driven Testing) 工作流使用完整的固定流程，但不同项目的测试需求不同。部分项目可能只需要需求澄清和设计阶段，不需要自动化构建阶段。现有系统不支持用户自定义流程，导致：
1. 不必要的 artifacts 被生成
2. 工作流与实际需求不匹配

## What Changes

- **已实现** `profiles` 配置字段到 `testspec/config.yaml`（代码已合并）
- **新增** `schemas/sdt/sdt-profile.json` 映射文件，定义流程与 artifacts 的对应关系
- **修改** `testspec update` 命令，增加根据用户配置生成定制化 schema.yaml 的逻辑

## Capabilities

### New Capabilities

- `sdt-profile-config`: SDT 流程配置功能
  - 用户可在 `testspec/config.yaml` 中通过 `profiles.sdt` 字段选择需要的工作流
  - 支持的配置项：`sdt-new`, `sdt-clarify`, `sdt-design`, `sdt-build`
  - 用户可移除不需要的流程，系统会自动过滤相关 artifacts

- `schema-generator`: 定制化 schema 生成器
  - 读取 `config.yaml` 中的 profiles 配置
  - 根据 `sdt-profile.json` 映射关系提取对应的 artifacts
  - 自动过滤不存在的 requires 依赖
  - 如果未选择 `sdt-build`，则 apply 配置为空

### Modified Capabilities

- `project-config`: 扩展配置解析能力
  - 新增 `profiles` 字段的解析支持

## Impact

- **受影响代码**：
  - `src/core/update.ts` - 添加 schema 生成逻辑

- **新增文件**：
  - `schemas/sdt/sdt-profile.json` - 流程-artifact 映射

- **依赖**：无新外部依赖