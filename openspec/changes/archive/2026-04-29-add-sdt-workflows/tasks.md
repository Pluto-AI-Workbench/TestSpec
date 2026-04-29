## 1. Update profiles.ts

- [x] 1.1 在 `ALL_WORKFLOWS` 数组中添加 `'sdt-new'`、`'sdt-build'`、`'sdt-design'`、`'sdt-clarify'`
- [x] 1.2 确认 `CORE_WORKFLOWS` 不包含新的 SDT 工作流（保持现状）

## 2. Update init.ts WORKFLOW_TO_SKILL_DIR

- [x] 2.1 在 `WORKFLOW_TO_SKILL_DIR` 对象中添加 4 个映射：
  - `'sdt-new': 'testspec-sdt-new'`
  - `'sdt-build': 'testspec-sdt-build'`
  - `'sdt-design': 'testspec-sdt-design'`
  - `'sdt-clarify': 'testspec-sdt-clarify'`

## 3. Update shared/tool-detection.ts

- [x] 3.1 在 `SKILL_NAMES` 数组中添加 4 个新 skill 名称：`'testspec-sdt-new'`、`'testspec-sdt-build'`、`'testspec-sdt-design'`、`'testspec-sdt-clarify'`
- [x] 3.2 在 `COMMAND_IDS` 数组中添加 4 个新 command ID：`'sdt-new'`、`'sdt-build'`、`'sdt-design'`、`'sdt-clarify'`

## 4. Update shared/skill-generation.ts

- [x] 4.1 在 `getSkillTemplates()` 函数中添加 4 个新条目（使用占位符模板函数，如 `getSdtNewSkillTemplate()`）
- [x] 4.2 在 `getCommandTemplates()` 函数中添加 4 个新条目（使用占位符模板函数，如 `getOpsxSdtNewCommandTemplate()`）

## 5. Update templates/skill-templates.ts

- [x] 5.1 添加 4 个新的 export 语句，引用新的模板模块（如 `export { getSdtNewSkillTemplate, getOpsxSdtNewCommandTemplate } from './workflows/sdt-new.js'`）

## 6. Create template files

- [x] 6.1 创建 `src/core/templates/workflows/sdt-new.ts`，包含 `getSdtNewSkillTemplate()` 和 `getOpsxSdtNewCommandTemplate()` 函数（占位符内容）
- [x] 6.2 创建 `src/core/templates/workflows/sdt-build.ts`，包含 `getSdtBuildSkillTemplate()` 和 `getOpsxSdtBuildCommandTemplate()` 函数（占位符内容）
- [x] 6.3 创建 `src/core/templates/workflows/sdt-design.ts`，包含 `getSdtDesignSkillTemplate()` 和 `getOpsxSdtDesignCommandTemplate()` 函数（占位符内容）
- [x] 6.4 创建 `src/core/templates/workflows/sdt-clarify.ts`，包含 `getSdtClarifySkillTemplate()` 和 `getOpsxSdtClarifyCommandTemplate()` 函数（占位符内容）

## 7. Verification

- [x] 7.1 运行 `pnpm run build` 确认编译无错误
- [x] 7.2 运行 `testspec init --tools opencode --profile custom` 在测试目录验证新工作流被正确生成
- [x] 7.3 确认生成的 skill 目录包含：`.opencode/skills/testspec-sdt-new/`、`.opencode/skills/testspec-sdt-build/`、`.opencode/skills/testspec-sdt-design/`、`.opencode/skills/testspec-sdt-clarify/`
