## 1. 配置 schema 定义

- [x] 1.1 在 `src/core/project-config.ts` 中 profiles 字段已正确实现

## 2. init 生成默认 profiles

- [x] 2.1 init.ts 生成的 config.yaml 已包含默认 profiles（通过 serializeConfig）
- [x] 2.2 init.ts 使用 DEFAULT_PROFILES 生成包含 core、sdt、custom 的配置

## 3. profiles 读取逻辑

- [x] 3.1 profiles.ts 中已实现 readProfilesFromConfig
- [x] 3.2 空 profiles 输出警告提示，无 fallback
- [x] 3.3 实现无效 workflow 检测和警告输出

## 4. 修改 profiles.ts

- [x] 4.1 getProfileWorkflows 从配置文件读取映射，移除 fallback
- [x] 4.2 保留 ALL_WORKFLOWS 作为有效 workflow 列表校验，保留 CORE_WORKFLOWS, SDT_WORKFLOWS 用于兼容性

## 5. 修改 config 命令

- [x] 5.1 config.ts 中的 getProfileWorkflows 已正确工作
- [x] 5.2 实现 profile 名称不存在时的警告输出

## 6. 测试与验证

- [x] 6.1 构建通过，代码逻辑正确
- [x] 6.2 config.yaml 已包含正确的 profiles 结构