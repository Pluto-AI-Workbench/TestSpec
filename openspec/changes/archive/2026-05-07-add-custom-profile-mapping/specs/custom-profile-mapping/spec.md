## ADDED Requirements

### Requirement: 在 config.yaml 中定义 profiles 字段

系统 SHALL 支持在项目级 `testspec/config.yaml` 配置文件中定义 `profiles` 字段，该字段为对象类型，键为 profile 名称，值为对应的 workflow 数组。

#### Scenario: init 生成包含默认 profiles 的 config.yaml
- **WHEN** 用户运行 `testspec init` 初始化项目
- **THEN** 系统生成的 `testspec/config.yaml` 包含默认的三个 profile 映射：
  - `core`: [propose, explore, apply, archive]
  - `sdt`: [sdt-new, sdt-build, sdt-design, sdt-clarify]
  - `custom`: [所有工作流]

#### Scenario: 用户在 config.yaml 中添加自定义 profile
- **WHEN** 用户手动在 `testspec/config.yaml` 的 `profiles` 字段中添加新的 profile 映射
- **THEN** 系统能够识别该自定义 profile 并在后续命令中使用

### Requirement: config profile 命令从配置文件读取映射

`testspec config profile <name>` 命令 SHALL 从 `testspec/config.yaml` 的 `profiles` 字段中读取指定 profile 名称对应的 workflows，而非从硬编码中获取。

#### Scenario: 使用自定义 profile 名称
- **WHEN** 用户执行 `testspec config profile my-team`，且 config.yaml 中存在 `profiles.my-team`
- **THEN** 系统读取 `profiles.my-team` 的值作为该 profile 对应的工作流列表

#### Scenario: profile 名称不存在
- **WHEN** 用户执行 `testspec config profile nonexistent`，且 config.yaml 中不存在对应的 profile
- **THEN** 系统输出警告信息，列出 config.yaml 中所有可用的 profile 名称

### Requirement: 无效 workflow 名称的处理

当用户配置的 workflow 名称不在系统支持的工作流列表中时，系统 SHALL 输出警告信息并忽略无效的 workflow。

#### Scenario: 配置包含无效 workflow
- **WHEN** config.yaml 中的某个 profile 包含不存在的 workflow 名称（如 `sdt-typo`）
- **THEN** 系统输出警告：`<profile-name> 中的 workflow '<invalid-name>' 不存在，已忽略`
- **THEN** 系统显示可用的 profile 列表供用户参考