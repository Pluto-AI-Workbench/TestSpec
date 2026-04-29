/**
 * SDT New Workflow Templates
 *
 * Placeholder templates for the sdt-new workflow.
 * Content to be filled manually by the user.
 */
import type { SkillTemplate, CommandTemplate } from "../types.js";

export function getSdtNewSkillTemplate(): SkillTemplate {
  return {
    name: "testspec-sdt-new",
    description:
      "Create a new SDT (Spec-Driven Testing) change. Use when starting a new testing specification.",
    instructions: `创建 SDT 规范驱动测试的 change 目录和基础结构。

本命令创建：
- \`testspec/changes/sdt-test-<capability>/\` 目录
- \`.testspec.yaml\` 配置文件（指定 SDT schema）

创建完成后，运行 \`/testspec-sdt-clarify\` 进入需求澄清阶段。

---

**输入**：\`/testspec-sdt-new\` 后的参数是 capability 名称（kebab-case），或 SDT 项目的描述。

**步骤**

1. **解析输入**

   如果没有提供输入，使用 **Question 工具**（开放式问题）询问：
   > "请描述你要测试的系统或功能模块，例如：用户登录、订单管理、支付流程等。"

   从描述中提取 kebab-case 名称，例如：
   - "用户登录" → \`user-login\`
   - "订单管理" → \`order-management\`
   - "支付流程" → \`payment-flow\`

2. **创建 change 目录**
   \`\`\`bash
   testspec new change "sdt-test-<capability>"
   \`\`\`
   或手动创建：
   \`\`\`bash
   mkdir -p testspec/changes/sdt-test-<capability>
   \`\`\`

3. **创建 .testspec.yaml 配置文件**

   创建 \`testspec/changes/sdt-test-<capability>/.testspec.yaml\`，内容：
   \`\`\`yaml
      schema: sdt
      created: 2026-04-22
   \`\`\`

4. **验证结构**
   \`\`\`bash
   ls -la testspec/changes/sdt-test-<capability>/
   cat testspec/changes/sdt-test-<capability>/.testspec.yaml
   \`\`\`

5. **显示创建结果**

**输出**

创建完成后：
- 目录路径：\`testspec/changes/sdt-test-<capability>/\`
- 配置文件：\`.testspec.yaml\`（指定使用 SDT schema）
- 状态："SDT 项目脚手架创建完成！"
- 提示："运行 \`/testspec-sdt-clarify\` 开始需求澄清。"

**Guardrails**
- capability 名称使用 kebab-case（小写 + 连字符）
- 如果目录已存在，询问用户是覆盖还是使用现有目录
- 确保 .testspec.yaml 中正确指定schema是sdt
- 创建完成后验证目录结构完整`,
    license: "MIT",
    compatibility: "Requires testspec CLI.",
    metadata: { author: "testspec", version: "1.0" },
  };
}

export function getOpsxSdtNewCommandTemplate(): CommandTemplate {
  return {
    name: "TESTSPEC: SDT New",
    description: "Create a new SDT (Spec-Driven Testing) change",
    category: "Workflow",
    tags: ["sdt", "testing", "new"],
    content: `创建 SDT 规范驱动测试的 change 目录和基础结构。

本命令创建：
- \`testspec/changes/sdt-test-<capability>/\` 目录
- \`.testspec.yaml\` 配置文件（指定 SDT schema）

创建完成后，运行 \`/testspec-sdt-clarify\` 进入需求澄清阶段。

---

**输入**：\`/testspec-sdt-new\` 后的参数是 capability 名称（kebab-case），或 SDT 项目的描述。

**步骤**

1. **解析输入**

   如果没有提供输入，使用 **Question 工具**（开放式问题）询问：
   > "请描述你要测试的系统或功能模块，例如：用户登录、订单管理、支付流程等。"

   从描述中提取 kebab-case 名称，例如：
   - "用户登录" → \`user-login\`
   - "订单管理" → \`order-management\`
   - "支付流程" → \`payment-flow\`

2. **创建 change 目录**
   \`\`\`bash
   testspec new change "sdt-test-<capability>"
   \`\`\`
   或手动创建：
   \`\`\`bash
   mkdir -p testspec/changes/sdt-test-<capability>
   \`\`\`

3. **创建 .testspec.yaml 配置文件**

   创建 \`testspec/changes/sdt-test-<capability>/.testspec.yaml\`，内容：
   \`\`\`yaml
      schema: sdt
      created: 2026-04-22
   \`\`\`

4. **验证结构**
   \`\`\`bash
   ls -la testspec/changes/sdt-test-<capability>/
   cat testspec/changes/sdt-test-<capability>/.testspec.yaml
   \`\`\`

5. **显示创建结果**

**输出**

创建完成后：
- 目录路径：\`testspec/changes/sdt-test-<capability>/\`
- 配置文件：\`.testspec.yaml\`（指定使用 SDT schema）
- 状态："SDT 项目脚手架创建完成！"
- 提示："运行 \`/testspec-sdt-clarify\` 开始需求澄清。"

**Guardrails**
- capability 名称使用 kebab-case（小写 + 连字符）
- 如果目录已存在，询问用户是覆盖还是使用现有目录
- 确保 .testspec.yaml 中正确指定schema是sdt
- 创建完成后验证目录结构完整`,
  };
}
