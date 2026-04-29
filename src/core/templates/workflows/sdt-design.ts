/**
 * SDT Design Workflow Templates
 *
 * Placeholder templates for the sdt-design workflow.
 * Content to be filled manually by the user.
 */
import type { SkillTemplate, CommandTemplate } from "../types.js";

export function getSdtDesignSkillTemplate(): SkillTemplate {
  return {
    name: "testspec-sdt-design",
    description:
      "Design test architecture and strategy. Use when planning test approach, selecting frameworks, or defining test architecture.",
    instructions: `SDT 测试设计阶段 - 按顺序生成所有以 \`design-*\` 开头的artifacts。

本命令生成：
- design-test-points（测试要点文档）
- design-manual-case（手工测试案例 JSON）
- design-*（若有其他以design开头的artifacts，也需生成）

**前置条件**：必须先完成 \`/testspec-sdt-clarify\` 阶段的所有artifacts。

设计完成后，运行 \`/testspec-sdt-build\` 进入测试构建阶段。

---

**输入**：\`/testspec-sdt-design\` 后的参数是 change 名称。

**步骤**

1. **验证 change 是否存在**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   如果 change 不存在，请用户先运行 \`/testspec-sdt-new\`。

2. **检查前置阶段artifacts状态**

   在进入 design 阶段之前，必须验证 clarify 阶段的所有artifacts都已完成：
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`

   解析 JSON 检查 clarify-* artifacts状态：
   - \`clarify-sdt-requirements\`: status 必须为 "done"
   - \`clarify-sdt-spec\`: status 必须为 "done"
   - \`clarify-*\`(其他以clarify开头的artifacts, status 必须为 "done")

   **如果前置artifacts未完成**：
   - 显示哪些artifacts尚未完成
   - 提示："请先完成 \`/testspec-sdt-clarify\` 阶段"
   - 阻止进入 design 阶段

3. **获取 design artifacts构建顺序**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   解析 JSON，识别所有以 \`design-*\` 开头的artifacts及其依赖关系。

4. **按顺序创建设计artifacts**

   使用 **TodoWrite 工具** 跟踪进度：
   \`\`\`
   - design-test-points（待生成）
   - design-manual-case（待生成）
   - design-*
   \`\`\`

   按依赖顺序循环处理artifacts：

   a. **对于每个 \`ready\` 状态的artifacts**：
      - 获取指令：
        \`\`\`bash
        testspec instructions <artifactsID> --change "<名称>" --json
        \`\`\`
      - 指令 JSON 包含：
        - \`context\`：项目背景（约束条件，不包含在输出中）
        - \`rules\`：artifacts特定规则（约束条件，不包含在输出中）
        - \`template\`：输出文件结构
        - \`instruction\`：此artifacts类型的指导说明
        - \`outputPath\`：artifacts输出路径
        - \`dependencies\`：需要先读取的已完成artifacts

      - 如果需要用户确认关键设计决策，使用 **Question 工具** 询问：
        - design-test-points 阶段：
          - "测试要点覆盖是否完整？是否有遗漏的功能点？"
          - "边界条件测试是否足够？"
        - design-manual-case 阶段：
          - "手工案例的优先级划分是否合理？"
          - "是否需要补充异常场景案例？"

      - 读取已完成依赖artifacts获取上下文（clarify-sdt-spec 是设计阶段的必要输入）
      - 使用 \`template\` 作为结构创建artifacts文件
      - 将 \`context\` 和 \`rules\` 作为约束应用，但不复制到文件中
      - 标记 todo 为完成："已创建 <artifactsID>"
      - 显示简要进度："已创建 <artifactsID>"

   b. **创建每个artifacts后，更新状态**
      \`\`\`bash
      testspec status --change "<名称>" --json
      \`\`\`
      确认artifacts状态已变为 \`done\`

5. **标记 todo 项目完成**

6. **显示最终状态**
   \`\`\`bash
   testspec status --change "<名称>"
   \`\`\`

**输出**

完成所有 design artifacts后：
- Change 名称和位置
- 创建的artifacts列表：
  - \`design-test-points.md\` - 测试要点文档
  - \`design-manual-cases.json\` - 手工测试案例
  - \`design-*\`（若有其他以design开头的artifacts）
- 状态："Design 阶段完成！准备进入构建阶段。"
- 提示："运行 \`/testspec-sdt-build\` 进入测试脚本构建。"

**前置条件检查**

进入 design 阶段前必须满足：
| artifacts | 状态要求 |
|------|----------|
| clarify-sdt-requirements | done |
| clarify-sdt-spec | done |

如果任何前置artifacts未完成，显示：
\`\`\`
前置检查未通过：
- clarify-sdt-requirements: <当前状态>
- clarify-sdt-spec: <当前状态>

请先完成 \`/testspec-sdt-clarify\` 阶段后再进入 design 阶段。
\`\`\`

**artifacts创建指南**

- 遵循 \`testspec instructions\` 中每个artifacts类型的 \`instruction\` 字段
- SDT schema 定义了每个artifacts应包含的内容，请遵循
- 创建新artifacts前先读取依赖artifacts获取上下文
- 使用 \`template\` 作为输出文件的结构，填充其内容
- **重要**：\`context\` 和 \`rules\` 是给你的约束，不是文件内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到artifacts中
  - 这些指导你编写，但不应出现在输出中
- **design-manual-case 必须完整覆盖 design-test-points**

**Guardrails**
- 必须验证前置artifacts状态后才能进入 design 阶段
- 如果前置artifacts未完成，拒绝执行并提示用户
- 按 SDT schema 定义创建所有 design-* artifacts，检查是否有遗漏design-*的artifacts未创建
- 创建新artifacts前必须先读取依赖artifacts
- 写入后验证每个artifacts文件确实存在再继续
- **重要**：\`design-manual-case\` 依赖 \`clarify-sdt-spec\` 和 \`design-test-points\`，请按顺序创建
`,
    license: "MIT",
    compatibility: "Requires testspec CLI.",
    metadata: { author: "testspec", version: "1.0" },
  };
}

export function getOpsxSdtDesignCommandTemplate(): CommandTemplate {
  return {
    name: "TESTSPEC: SDT Design",
    description: "Design test architecture and strategy",
    category: "Workflow",
    tags: ["sdt", "testing", "design"],
    content: `SDT 测试设计阶段 - 按顺序生成所有以 \`design-*\` 开头的artifacts。

本命令生成：
- design-test-points（测试要点文档）
- design-manual-case（手工测试案例 JSON）
- design-*（若有其他以design开头的artifacts，也需生成）

**前置条件**：必须先完成 \`/testspec-sdt-clarify\` 阶段的所有artifacts。

设计完成后，运行 \`/testspec-sdt-build\` 进入测试构建阶段。

---

**输入**：\`/testspec-sdt-design\` 后的参数是 change 名称。

**步骤**

1. **验证 change 是否存在**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   如果 change 不存在，请用户先运行 \`/testspec-sdt-new\`。

2. **检查前置阶段artifacts状态**

   在进入 design 阶段之前，必须验证 clarify 阶段的所有artifacts都已完成：
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`

   解析 JSON 检查 clarify-* artifacts状态：
   - \`clarify-sdt-requirements\`: status 必须为 "done"
   - \`clarify-sdt-spec\`: status 必须为 "done"
   - \`clarify-*\`(其他以clarify开头的artifacts, status 必须为 "done")

   **如果前置artifacts未完成**：
   - 显示哪些artifacts尚未完成
   - 提示："请先完成 \`/testspec-sdt-clarify\` 阶段"
   - 阻止进入 design 阶段

3. **获取 design artifacts构建顺序**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   解析 JSON，识别所有以 \`design-*\` 开头的artifacts及其依赖关系。

4. **按顺序创建设计artifacts**

   使用 **TodoWrite 工具** 跟踪进度：
   \`\`\`
   - design-test-points（待生成）
   - design-manual-case（待生成）
   - design-*
   \`\`\`

   按依赖顺序循环处理artifacts：

   a. **对于每个 \`ready\` 状态的artifacts**：
      - 获取指令：
        \`\`\`bash
        testspec instructions <artifactsID> --change "<名称>" --json
        \`\`\`
      - 指令 JSON 包含：
        - \`context\`：项目背景（约束条件，不包含在输出中）
        - \`rules\`：artifacts特定规则（约束条件，不包含在输出中）
        - \`template\`：输出文件结构
        - \`instruction\`：此artifacts类型的指导说明
        - \`outputPath\`：artifacts输出路径
        - \`dependencies\`：需要先读取的已完成artifacts

      - 如果需要用户确认关键设计决策，使用 **Question 工具** 询问：
        - design-test-points 阶段：
          - "测试要点覆盖是否完整？是否有遗漏的功能点？"
          - "边界条件测试是否足够？"
        - design-manual-case 阶段：
          - "手工案例的优先级划分是否合理？"
          - "是否需要补充异常场景案例？"

      - 读取已完成依赖artifacts获取上下文（clarify-sdt-spec 是设计阶段的必要输入）
      - 使用 \`template\` 作为结构创建artifacts文件
      - 将 \`context\` 和 \`rules\` 作为约束应用，但不复制到文件中
      - 标记 todo 为完成："已创建 <artifactsID>"
      - 显示简要进度："已创建 <artifactsID>"

   b. **创建每个artifacts后，更新状态**
      \`\`\`bash
      testspec status --change "<名称>" --json
      \`\`\`
      确认artifacts状态已变为 \`done\`

5. **标记 todo 项目完成**

6. **显示最终状态**
   \`\`\`bash
   testspec status --change "<名称>"
   \`\`\`

**输出**

完成所有 design artifacts后：
- Change 名称和位置
- 创建的artifacts列表：
  - \`design-test-points.md\` - 测试要点文档
  - \`design-manual-cases.json\` - 手工测试案例
  - \`design-*\`（若有其他以design开头的artifacts）
- 状态："Design 阶段完成！准备进入构建阶段。"
- 提示："运行 \`/testspec-sdt-build\` 进入测试脚本构建。"

**前置条件检查**

进入 design 阶段前必须满足：
| artifacts | 状态要求 |
|------|----------|
| clarify-sdt-requirements | done |
| clarify-sdt-spec | done |

如果任何前置artifacts未完成，显示：
\`\`\`
前置检查未通过：
- clarify-sdt-requirements: <当前状态>
- clarify-sdt-spec: <当前状态>

请先完成 \`/testspec-sdt-clarify\` 阶段后再进入 design 阶段。
\`\`\`

**artifacts创建指南**

- 遵循 \`testspec instructions\` 中每个artifacts类型的 \`instruction\` 字段
- SDT schema 定义了每个artifacts应包含的内容，请遵循
- 创建新artifacts前先读取依赖artifacts获取上下文
- 使用 \`template\` 作为输出文件的结构，填充其内容
- **重要**：\`context\` 和 \`rules\` 是给你的约束，不是文件内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到artifacts中
  - 这些指导你编写，但不应出现在输出中
- **design-manual-case 必须完整覆盖 design-test-points**

**Guardrails**
- 必须验证前置artifacts状态后才能进入 design 阶段
- 如果前置artifacts未完成，拒绝执行并提示用户
- 按 SDT schema 定义创建所有 design-* artifacts，检查是否有遗漏design-*的artifacts未创建
- 创建新artifacts前必须先读取依赖artifacts
- 写入后验证每个artifacts文件确实存在再继续
- **重要**：\`design-manual-case\` 依赖 \`clarify-sdt-spec\` 和 \`design-test-points\`，请按顺序创建
`,
  };
}
