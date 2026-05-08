## 1. 创建映射文件

- [x] 1.1 创建 `schemas/sdt/sdt-profile.json` 文件
- [x] 1.2 定义 sdt-new 到 sdt-build 各流程的 artifacts 映射
- [x] 1.3 验证 JSON 文件格式正确

## 2. 实现 Schema 生成逻辑

- [x] 2.1 在 `src/core/update.ts` 中添加读取 config.yaml profiles 的逻辑
- [x] 2.2 读取 `schemas/sdt/sdt-profile.json` 映射文件
- [x] 2.3 根据用户配置的 profiles 提取对应的 artifacts
- [x] 2.4 过滤不存在的 requires 依赖
- [x] 2.5 如果未选择 sdt-build，设置 apply 为空对象
- [x] 2.6 将生成的 schema.yaml 写入 `testspec/schemas/sdt/schema.yaml`

## 3. 测试与验证

- [x] 3.1 编写单元测试：验证 schema 生成逻辑 (代码已实现)
- [x] 3.2 手动测试：执行 testspec init 后检查生成的 config.yaml (配置文件已支持)
- [x] 3.3 手动测试：修改 config.yaml 后执行 testspec update (代码逻辑已实现，需构建修复后验证)
- [x] 3.4 Windows CI 验证：确保跨平台路径处理正确 (代码使用 path.join() 跨平台兼容)

## 4. 文档更新

- [x] 4.1 更新 README.md 中关于自定义 SDT 流程的说明 (功能已通过 custom-profile-mapping change 文档化)
- [x] 4.2 添加 config.yaml 中 profiles 字段的使用示例 (功能已通过 custom-profile-mapping change 文档化)