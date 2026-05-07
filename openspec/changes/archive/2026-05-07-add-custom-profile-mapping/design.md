## Context

当前 TestSpec 的 profile 系统：
- 硬编码在 `src/core/profiles.ts` 中定义了 `CORE_WORKFLOWS`, `SDT_WORKFLOWS`, `ALL_WORKFLOWS`
- 通过 `getProfileWorkflows(profile, customWorkflows)` 函数根据 profile 名称返回对应的工作流数组
- profile 只能是 `core`, `sdt`, `custom` 三种固定值

config.yaml 是项目的配置文件，目前包含 `schema` 和 `context` 字段。

## Goals / Non-Goals

**Goals:**
- 在 config.yaml 中新增 profiles 字段，实现 profile 名称到 workflow 数组的映射
- init 时自动生成包含默认 core/sdt/custom 映射的 config.yaml
- config profile 命令从 config.yaml 读取 profile 映射，而非硬编码

**Non-Goals:**
- 不改变现有的 global config.json 行为
- 不提供全局级别的 profiles 配置
- 不支持 profile 的动态运行时变更（需要手动修改 config.yaml 后 update）

## Decisions

### 1. 配置文件结构

采用 YAML 数组格式，与 config.yaml 其他部分保持一致：

```yaml
profiles:
  core: [propose, explore, apply, archive]
  sdt: [sdt-new, sdt-build, sdt-design, sdt-clarify]
  custom: [propose, explore, new, continue, apply, ff, sync, archive, bulk-archive, verify, onboard, sdt-new, sdt-build, sdt-design, sdt-clarify]
  my-team: [propose, sdt-new, sdt-build]  # 用户自定义
```

**选择理由：** YAML 原生支持数组格式，与现有的 config.yaml 结构自然融合。

### 2. profiles 字段位置

只在项目级 `testspec/config.yaml` 中定义，不放在全局 `~/.testspec/config.json`。

**选择理由：** profile 映射是项目级配置，每个项目可能有不同的需求。

### 3. profiles 读取逻辑

读取优先级：**仅从项目级 `testspec/config.yaml` 读取 profiles 字段**
- 如果 config.yaml 不存在或 profiles 字段为空，系统不提供任何内置默认值
- 用户必须在 config.yaml 中完整定义需要使用的 profiles

**选择理由：** 简化逻辑，config.yaml 是唯一真相来源，避免代码内置值与用户配置不一致。

### 4. 无效 workflow 处理

当用户配置的 workflow 名称不存在时：
- 输出警告信息
- 显示可用的 profile 列表（从 config.yaml 的 profiles 字段中提取）
- 不阻止命令执行，无效的 workflow 被忽略

**选择理由：** 宽松处理，避免因配置错误导致命令无法执行，提供清晰的错误提示引导用户修正。

## Risks / Trade-offs

- [用户手动编辑错误] → 用户可能输入错误的 workflow 名称 → 警告提示并列出可用选项
- [配置文件格式错误] → YAML 解析失败 → 错误信息提示用户检查格式

## Migration Plan

1. 修改 `src/core/init.ts`：init 时生成的 config.yaml 包含默认 profiles
2. 修改 `src/core/config-schema.ts`：添加 profiles 字段的定义和校验
3. 修改 `src/core/profiles.ts`：改为从 config.yaml 读取 profiles 映射
4. 修改 `src/commands/config.ts`：config profile 命令读取配置文件中的映射

## Open Questions

- 是否需要支持从命令行快速添加/删除自定义 profile？（当前需要手动编辑 config.yaml）
- 是否需要为自定义 profile 添加 label/description 字段用于显示？（当前只支持 workflow 数组）