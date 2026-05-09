/**
 * SDT Clarify Workflow Templates
 *
 * Placeholder templates for the sdt-clarify workflow.
 * Content to be filled manually by the user.
 */
import type { SkillTemplate, CommandTemplate } from "../types.js";

export function getSdtClarifySkillTemplate(): SkillTemplate {
  return {
    name: "testspec-sdt-clarify",
    description:
      "Clarify and refine test requirements. Use when test requirements are ambiguous, incomplete, or need refinement.",
    instructions: `澄清 SDT 测试需求 - 按顺序生成所有以 \`clarify-*\` 开头的artifacts。

本命令生成：
- clarify-sdt-requirements（测试需求文档）
- clarify-sdt-spec（SDT 规范契约文档）
- clarify-*（以 \`clarify-*\` 开头的其他artifacts）

**前置条件**：请先运行 \`/testspec-sdt-new\` 创建 change。

澄清完成后，运行 \`/testspec-sdt-design\` 进入测试设计阶段。

---

**输入**：\`/testspec-sdt-clarify\` 后的参数是 change 名称，或 SDT 项目的描述。

**步骤**

1. **验证 change 是否存在**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   如果 change 不存在，请用户先运行 \`/testspec-sdt-new\`。

2. **获取artifacts构建顺序**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   解析 JSON，识别所有以 \`clarify-*\` 开头的artifacts及其依赖关系。

3. **澄清需求（若需要）**

   如果用户提供的需求描述不清晰或不完整，使用 **Question 工具** 询问用户：

   可询问的关键问题：
   - "请描述待测系统的功能范围是什么？哪些功能需要测试？"
   - "系统的技术栈是什么？（Web/API/移动端/微服务等）"
   - "有没有已有的需求文档、设计文档或接口文档可以参考？"
   - "测试环境的访问地址是什么？"
   - "有没有特殊的测试数据要求或测试账号？"
   - "项目的测试目标是什么？（功能验证/回归测试/性能测试等）"
   - "有没有优先级或重点关注的功能模块？"

   根据用户回答，整理出清晰的需求描述，然后继续。

4. **按顺序创建 clarify artifacts**

   使用 **TodoWrite 工具** 跟踪进度：
   \`\`\`
   - clarify-sdt-requirements（待生成）
   - clarify-sdt-spec（待生成）
   - clarify-*
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

       - 如果 \`instruction\` 或 \`context\` 中有需要用户确认的内容，使用 **Question 工具** 询问：
         - clarify-sdt-requirements 阶段：
           - "测试范围是否包括以下模块？[列出检测到的模块]"
           - "是否有非测试范围内的功能需要排除？"
           - "测试环境地址是否正确？[检测到的地址]"
         - clarify-sdt-spec 阶段：
           - "接口定义中的参数类型和约束是否正确？"
           - "业务规则的描述是否符合你的预期？"
           - "边界条件的覆盖是否完整？"

       - 读取已完成依赖artifacts获取上下文
       - 使用 \`template\` 作为结构创建artifacts文件
       - 将 \`context\` 和 \`rules\` 作为约束应用，但不复制到文件中
       - 验证 artifacts：
         \`\`\`bash
         testspec verify-artifact <artifactsID> --change "<名称>"
         \`\`\`
       - 如果验证失败，停止执行并向用户报告错误
       - 不要尝试自动修复问题
       - 让用户修复问题后重新运行校验
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

完成所有 clarify artifacts后：
- Change 名称和位置
- 创建的artifacts列表：
  - \`clarify-sdt-requirements.md\` - 测试需求文档
  - \`clarify-sdt-spec.md\` - SDT 规范契约文档
  - \`clarify-*\`（以 \`clarify-*\` 开头的其他artifacts）
- 状态："Clarify 阶段完成！准备进入设计阶段。"
- 提示："运行 \`/testspec-sdt-design\` 进入测试设计。"

**artifacts创建指南**

- 遵循 \`testspec instructions\` 中每个artifacts类型的 \`instruction\` 字段
- SDT schema 定义了每个artifacts应包含的内容，请遵循
- 创建新artifacts前先读取依赖artifacts获取上下文
- 使用 \`template\` 作为输出文件的结构，填充其内容
- **重要**：\`context\` 和 \`rules\` 是给你的约束，不是文件内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到artifacts中
  - 这些指导你编写，但不应出现在输出中

**需求澄清时机**

- **初始阶段**：用户输入模糊或缺少关键信息时
- **生成artifacts前**：确保理解正确的模块范围、技术栈、测试目标

**Guardrails**
- 按 SDT schema 定义创建所有 clarify-* artifacts, 检查是否有遗漏clarify-*的artifacts未创建
- 创建新artifacts前必须先读取依赖artifacts
- 如果上下文严重不清晰，必须询问用户获取澄清
- 询问时优先使用选择题让用户确认，而非开放式问题
- 写入后验证每个artifacts文件确实存在再继续
- **重要**：\`clarify-sdt-spec\` 依赖 \`clarify-sdt-requirements\`，请按顺序创建
.`,
    license: "MIT",
    compatibility: "Requires testspec CLI.",
    metadata: { author: "testspec", version: "1.0" },
  };
}

export function getOpsxSdtClarifyCommandTemplate(): CommandTemplate {
  return {
    name: "TESTSPEC: SDT Clarify",
    description: "Clarify and refine test requirements",
    category: "Workflow",
    tags: ["sdt", "testing", "clarify"],
    content: `澄清 SDT 测试需求 - 按顺序生成所有以 \`clarify-*\` 开头的artifacts。

本命令生成：
- clarify-sdt-requirements（测试需求文档）
- clarify-sdt-spec（SDT 规范契约文档）
- clarify-*（以 \`clarify-*\` 开头的其他artifacts）

**前置条件**：请先运行 \`/testspec-sdt-new\` 创建 change。

澄清完成后，运行 \`/testspec-sdt-design\` 进入测试设计阶段。

---

**输入**：\`/testspec-sdt-clarify\` 后的参数是 change 名称，或 SDT 项目的描述。

**步骤**

1. **验证 change 是否存在**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   如果 change 不存在，请用户先运行 \`/testspec-sdt-new\`。

2. **获取artifacts构建顺序**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   解析 JSON，识别所有以 \`clarify-*\` 开头的artifacts及其依赖关系。

3. **澄清需求（若需要）**

   如果用户提供的需求描述不清晰或不完整，使用 **Question 工具** 询问用户：

   可询问的关键问题：
   - "请描述待测系统的功能范围是什么？哪些功能需要测试？"
   - "系统的技术栈是什么？（Web/API/移动端/微服务等）"
   - "有没有已有的需求文档、设计文档或接口文档可以参考？"
   - "测试环境的访问地址是什么？"
   - "有没有特殊的测试数据要求或测试账号？"
   - "项目的测试目标是什么？（功能验证/回归测试/性能测试等）"
   - "有没有优先级或重点关注的功能模块？"

   根据用户回答，整理出清晰的需求描述，然后继续。

4. **按顺序创建 clarify artifacts**

   使用 **TodoWrite 工具** 跟踪进度：
   \`\`\`
   - clarify-sdt-requirements（待生成）
   - clarify-sdt-spec（待生成）
   - clarify-*
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

       - 如果 \`instruction\` 或 \`context\` 中有需要用户确认的内容，使用 **Question 工具** 询问：
         - clarify-sdt-requirements 阶段：
           - "测试范围是否包括以下模块？[列出检测到的模块]"
           - "是否有非测试范围内的功能需要排除？"
           - "测试环境地址是否正确？[检测到的地址]"
         - clarify-sdt-spec 阶段：
           - "接口定义中的参数类型和约束是否正确？"
           - "业务规则的描述是否符合你的预期？"
           - "边界条件的覆盖是否完整？"

       - 读取已完成依赖artifacts获取上下文
       - 使用 \`template\` 作为结构创建artifacts文件
       - 将 \`context\` 和 \`rules\` 作为约束应用，但不复制到文件中
       - 验证 artifacts：
         \`\`\`bash
         testspec verify-artifact <artifactsID> --change "<名称>"
         \`\`\`
       - 如果验证失败，停止执行并向用户报告错误
       - 不要尝试自动修复问题
       - 让用户修复问题后重新运行校验
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

完成所有 clarify artifacts后：
- Change 名称和位置
- 创建的artifacts列表：
  - \`clarify-sdt-requirements.md\` - 测试需求文档
  - \`clarify-sdt-spec.md\` - SDT 规范契约文档
  - \`clarify-*\`（以 \`clarify-*\` 开头的其他artifacts）
- 状态："Clarify 阶段完成！准备进入设计阶段。"
- 提示："运行 \`/testspec-sdt-design\` 进入测试设计。"

**artifacts创建指南**

- 遵循 \`testspec instructions\` 中每个artifacts类型的 \`instruction\` 字段
- SDT schema 定义了每个artifacts应包含的内容，请遵循
- 创建新artifacts前先读取依赖artifacts获取上下文
- 使用 \`template\` 作为输出文件的结构，填充其内容
- **重要**：\`context\` 和 \`rules\` 是给你的约束，不是文件内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到artifacts中
  - 这些指导你编写，但不应出现在输出中

**需求澄清时机**

- **初始阶段**：用户输入模糊或缺少关键信息时
- **生成artifacts前**：确保理解正确的模块范围、技术栈、测试目标

**Guardrails**
- 按 SDT schema 定义创建所有 clarify-* artifacts, 检查是否有遗漏clarify-*的artifacts未创建
- 创建新artifacts前必须先读取依赖artifacts
- 如果上下文严重不清晰，必须询问用户获取澄清
- 询问时优先使用选择题让用户确认，而非开放式问题
- 写入后验证每个artifacts文件确实存在再继续
- **重要**：\`clarify-sdt-spec\` 依赖 \`clarify-sdt-requirements\`，请按顺序创建
`,
  };
}
