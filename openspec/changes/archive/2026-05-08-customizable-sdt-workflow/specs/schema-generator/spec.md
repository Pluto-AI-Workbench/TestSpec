## ADDED Requirements

### Requirement: sdt-profile.json 映射文件
系统 SHALL 提供 `schemas/sdt/sdt-profile.json` 文件，定义 SDT 流程与 artifacts 的映射关系。

#### Scenario: 映射文件存在
- **WHEN** 系统读取 `schemas/sdt/sdt-profile.json`
- **THEN** 文件 SHALL包含每个 SDT 流程对应的 artifacts 列表

#### Scenario: sdt-new 流程映射
- **WHEN** 查询 sdt-new 流程的 artifacts
- **THEN** 返回空数组 `[]`（sdt-new 不生成 artifacts）

#### Scenario: sdt-clarify 流程映射
- **WHEN** 查询 sdt-clarify 流程的 artifacts
- **THEN** 返回 `["clarify-sdt-requirements", "clarify-sdt-spec", "clarify-risk-assessment"]`

#### Scenario: sdt-design 流程映射
- **WHEN** 查询 sdt-design 流程的 artifacts
- **THEN** 返回 `["design-test-points", "design-manual-case"]`

#### Scenario: sdt-build 流程映射
- **WHEN** 查询 sdt-build 流程的 artifacts
- **THEN** 返回 `["build-scripts"]`

### Requirement: 根据配置生成定制化 schema
testspec update 命令 SHALL 根据用户配置的 profiles 生成定制化的 schema.yaml。

#### Scenario: 用户选择完整流程
- **WHEN** 用户 profiles.sdt 配置为 `[sdt-new, sdt-clarify, sdt-design, sdt-build]`
- **THEN** 生成的 schema.yaml SHALL 包含所有 SDT artifacts 和完整的 apply 配置

#### Scenario: 用户只选择部分流程
- **WHEN** 用户 profiles.sdt 配置为 `[sdt-clarify, sdt-design]`
- **THEN** 生成的 schema.yaml SHALL 只包含 clarify 和 design 阶段对应的 artifacts

#### Scenario: 用户不选择 sdt-build
- **WHEN** 用户 profiles.sdt 配置为 `[sdt-new, sdt-clarify, sdt-design]`
- **THEN** 生成的 schema.yaml 中 apply 配置 SHALL 为空对象 `{}`，无 requires 依赖

#### Scenario: artifact requires 依赖过滤
- **WHEN** 生成的 artifacts 中有 requires 指向不在配置中的 artifact
- **THEN** 系统 SHALL自动移除该依赖，保持 schema 有效性

#### Scenario: 生成位置
- **WHEN** 执行 `testspec update` 生成定制化 schema
- **THEN** 文件 SHALL 写入 `testspec/schemas/sdt/schema.yaml`（覆盖写入）

#### Scenario: 完整模板保留
- **WHEN** 系统生成定制化 schema
- **THEN** 包内置的 `schemas/sdt/schema.yaml`（完整模板）SHALL 保持不变

### Requirement: 跨平台路径处理
生成的 schema.yaml 文件路径 SHALL 在所有支持的平台上正确处理。

#### Scenario: Windows 平台路径
- **WHEN** 在 Windows 系统上执行 testspec update
- **THEN** 系统 SHALL 使用 path.join() 生成正确的文件路径

#### Scenario: macOS/Linux 平台路径
- **WHEN** 在 macOS 或 Linux 系统上执行 testspec update
- **THEN** 系统 SHALL 使用 path.join() 生成正确的文件路径