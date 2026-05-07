## Why

当前 TestSpec 的 profile (core/sdt/custom) 是硬编码的工作流组合，用户无法自定义 profile 名称及其对应的workflow映射。这限制了用户根据团队或项目需求灵活配置的能力。

## What Changes

- 在 `testspec/config.yaml` 中新增 `profiles` 字段，用于定义 profile 名称到工作流数组的映射
- 修改 `testspec init` 行为，自动在生成的 config.yaml 中包含完整的默认 profiles 映射（包含 core/sdt/custom 三个内置 profile 及其对应的 workflow 列表）
- 修改 `config profile` 命令，改为仅从 config.yaml 的 profiles 字段读取映射，config.yaml 是唯一真相来源
- 支持用户自行在 config.yaml 中添加、修改或覆盖任意 profile（包括 core/sdt/custom），无内置 profile 保护
- 对无效的 workflow 名称给出警告，并列出可用的 profile 列表
- 移除重名校验逻辑，不限制用户覆盖内置 profile 名称

## Capabilities

### New Capabilities

- `custom-profile-mapping`: 支持在 config.yaml 中定义自定义 profile 名称及其对应的 workflow 列表，允许用户灵活扩展 profile 组合

### Modified Capabilities

- 无

## Impact

- 配置文件: `testspec/config.yaml` 新增 profiles 字段
- 核心模块: `src/core/profiles.ts` 改为从配置文件读取映射
- 初始化模块: `src/core/init.ts` init 时生成默认 profiles
- 配置命令: `src/commands/config.ts` config profile 从配置文件读取