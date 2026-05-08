## ADDED Requirements

### Requirement: config.yaml 支持 profiles 字段 (已实现)
testspec/config.yaml 文件已支持 `profiles` 字段，用于配置用户需要的工作流流程。

#### Scenario: init 生成默认 profiles 配置 (已实现)
- **WHEN** 用户执行 `testspec init` 命令
- **THEN** 系统 SHALL 在 testspec/config.yaml 中生成默认的 profiles 配置，包含完整的 SDT 流程：`[sdt-new, sdt-clarify, sdt-design, sdt-build]`

#### Scenario: 用户修改 profiles 配置
- **WHEN** 用户手动编辑 testspec/config.yaml 中的 `profiles.sdt` 字段
- **THEN** 系统 SHALL 在下次执行 `testspec update` 时读取该配置并生成定制化的 schema.yaml

#### Scenario: 用户移除部分流程
- **WHEN** 用户将 profiles.sdt 修改为 `[sdt-clarify, sdt-design]`
- **THEN** 系统 SHALL 只生成 clarify 和 design 阶段对应的 artifacts

#### Scenario: 用户配置无效的流程名称
- **WHEN** 用户在 profiles.sdt 中配置了不存在的流程名称
- **THEN** 系统 SHALL 在执行 `testspec update` 时提示有效的流程名称列表

### Requirement: ProjectConfig 支持 profiles 解析 (已实现)
项目配置解析模块已能够正确解析 testspec/config.yaml 中的 profiles 字段。

#### Scenario: 读取包含 profiles 的配置文件 (已实现)
- **WHEN** 解析包含 `profiles: { sdt: [...] }` 的 config.yaml
- **THEN** 系统 SHALL 返回包含 profiles 字段的 ProjectConfig 对象

#### Scenario: 配置文件不包含 profiles 字段 (已实现)
- **WHEN** 解析不包含 profiles 字段的 config.yaml（向后兼容）
- **THEN** 系统 SHALL 返回 profiles 为 undefined，不影响现有功能

#### Scenario: profiles 字段格式错误 (已实现)
- **WHEN** profiles 字段格式不正确（如非对象类型）
- **THEN** 系统 SHALL 忽略该字段并继续解析其他有效字段