/**
 * SDT Build Workflow Templates
 *
 * Placeholder templates for the sdt-build workflow.
 * Content to be filled manually by the user.
 */
import type { SkillTemplate, CommandTemplate } from "../types.js";

export function getSdtBuildSkillTemplate(): SkillTemplate {
  return {
    name: "testspec-sdt-build",
    description:
      "Build test cases from SDT specifications. Use when generating test cases based on defined specifications.",
    instructions: `SDT 测试构建阶段 - 生成所有以 \`build-*\` 开头的artifacts。

本命令生成：
- build-scripts（pytest 自动化测试脚本，符合 SDT schema 规范）
- build-*(其他以build开头的artifacts)

**前置条件**：必须先完成 \`/testspec-sdt-design\` 阶段的所有artifacts。


---

**输入**：\`/testspec-sdt-build\` 后的参数是 change 名称。

**步骤**

1. **验证 change 是否存在**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   如果 change 不存在，请用户先运行 \`/testspec-sdt-new\`。

2. **检查前置阶段artifacts状态**

   在进入 build 阶段之前，必须验证 design 阶段的所有artifacts都已完成：
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`

   解析 JSON 检查 design-* artifacts状态：
   - \`design-test-points\`: status 必须为 "done"
   - \`design-manual-case\`: status 必须为 "done"
   - \`design-*\`(其他以design开头的artifacts,status 必须为 "done")

   **如果前置artifacts未完成**：
   - 显示哪些artifacts尚未完成
   - 提示："请先完成 \`/testspec-sdt-design\` 阶段"
   - 阻止进入 build 阶段

3. **获取 build artifacts构建顺序**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   解析 JSON，识别所有以 \`build-*\` 开头的artifacts及其依赖关系。

4. **读取依赖artifacts获取上下文**

   读取以下已完成artifacts：
   - \`clarify-sdt-spec.md\` - 规范契约文档
   - \`design-test-points.md\` - 测试要点文档
   - \`design-manual-cases.json\` - 手工测试案例

5. **创建 build-scripts artifacts**

   使用 **TodoWrite 工具** 跟踪进度：
   \`\`\`
   - build-scripts（待生成）
   \`\`\`

   a. **获取指令**
      \`\`\`bash
      testspec instructions build-scripts --change "<名称>" --json
      \`\`\`
      指令 JSON 包含：
      - \`context\`：项目背景（约束条件，不包含在输出中）
      - \`rules\`：artifacts特定规则（约束条件，不包含在输出中）
      - \`template\`：输出文件结构
      - \`instruction\`：此artifacts类型的指导说明
      - \`outputPath\`：artifacts输出路径
      - \`dependencies\`：需要先读取的已完成artifacts

   b. **创建测试脚本目录结构**
      \`\`\`
      testspec/changes/sdt-test-<capability>/test_scripts/
      ├── conftest.py
      ├── test_suite_*.py
      └── utils/
          └── helpers.py
      \`\`\`

   c. **基于 manual-cases.json 生成测试脚本**
      - 解析手工测试案例 JSON
      - 为每个测试案例创建对应的 pytest 测试方法
      - 使用 \`@pytest.mark.parametrize\` 装饰器参数化测试数据
      - 遵循 SDT schema 中 build-scripts 的 instruction 规范

   d. **创建 conftest.py**
      - 配置 pytest fixtures
      - 实现 API 客户端封装
      - 加载测试数据

   e. **标记 todo 为完成**："已创建 build-scripts"
   f. **显示简要进度**："已创建 build-scripts"

   g. **更新状态**
      \`\`\`bash
      testspec status --change "<名称>" --json
      \`\`\`
      确认artifacts状态已变为 \`done\`

6. **标记 todo 项目完成**

7. **显示最终状态**
   \`\`\`bash
   testspec status --change "<名称>"
   \`\`\`

**输出**

完成 build artifacts后：
- Change 名称和位置
- 创建的artifacts列表：
  - \`test_scripts/conftest.py\` - pytest 配置文件
  - \`test_scripts/test_suite_*.py\` - 测试套件文件
  - \`test_scripts/utils/helpers.py\` - 辅助工具
- 状态："Build 阶段完成！准备运行测试。"
- 提示："运行 \`/testspec-sdt-run\` 执行自动化测试。"

**前置条件检查**

进入 build 阶段前必须满足：
| artifacts | 状态要求 |
|------|----------|
| design-test-points | done |
| design-manual-case | done |

如果任何前置artifacts未完成，显示：
\`\`\`
前置检查未通过：
- design-test-points: <当前状态>
- design-manual-case: <当前状态>

请先完成 \`/testspec-sdt-design\` 阶段后再进入 build 阶段。
\`\`\`

**pytest 脚本生成规范**

遵循 SDT schema 中 build-scripts artifacts的 instruction：
- 测试类命名：\`Test<功能模块名称>\`
- 测试方法命名：\`test_<测试案例名称>\`
- 使用 \`@pytest.mark.parametrize\` 参数化测试数据
- 每个测试方法包含 docstring 说明关联的手工案例
- 遵循 Arrange-Act-Assert 模式
- 使用有意义的断言消息

**Guardrails**
- 必须验证前置artifacts状态后才能进入 build 阶段
- 如果前置artifacts未完成，拒绝执行并提示用户
- 按 SDT schema 定义创建所有 build-* artifacts，检查是否有遗漏build-*的artifacts未创建
- 生成的 pytest 脚本必须可以直接运行
- 创建脚本后验证文件存在且语法正确`,
    license: "MIT",
    compatibility: "Requires testspec CLI.",
    metadata: { author: "testspec", version: "1.0" },
  };
}

export function getOpsxSdtBuildCommandTemplate(): CommandTemplate {
  return {
    name: "TESTSPEC: SDT Build",
    description: "Build test cases from SDT specifications",
    category: "Workflow",
    tags: ["sdt", "testing", "build"],
    content: `SDT 测试构建阶段 - 生成所有以 \`build-*\` 开头的artifacts。

本命令生成：
- build-scripts（pytest 自动化测试脚本，符合 SDT schema 规范）
- build-*(其他以build开头的artifacts)

**前置条件**：必须先完成 \`/testspec-sdt-design\` 阶段的所有artifacts。


---

**输入**：\`/testspec-sdt-build\` 后的参数是 change 名称。

**步骤**

1. **验证 change 是否存在**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   如果 change 不存在，请用户先运行 \`/testspec-sdt-new\`。

2. **检查前置阶段artifacts状态**

   在进入 build 阶段之前，必须验证 design 阶段的所有artifacts都已完成：
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`

   解析 JSON 检查 design-* artifacts状态：
   - \`design-test-points\`: status 必须为 "done"
   - \`design-manual-case\`: status 必须为 "done"
   - \`design-*\`(其他以design开头的artifacts,status 必须为 "done")

   **如果前置artifacts未完成**：
   - 显示哪些artifacts尚未完成
   - 提示："请先完成 \`/testspec-sdt-design\` 阶段"
   - 阻止进入 build 阶段

3. **获取 build artifacts构建顺序**
   \`\`\`bash
   testspec status --change "<名称>" --json
   \`\`\`
   解析 JSON，识别所有以 \`build-*\` 开头的artifacts及其依赖关系。

4. **读取依赖artifacts获取上下文**

   读取以下已完成artifacts：
   - \`clarify-sdt-spec.md\` - 规范契约文档
   - \`design-test-points.md\` - 测试要点文档
   - \`design-manual-cases.json\` - 手工测试案例

5. **创建 build-scripts artifacts**

   使用 **TodoWrite 工具** 跟踪进度：
   \`\`\`
   - build-scripts（待生成）
   \`\`\`

   a. **获取指令**
      \`\`\`bash
      testspec instructions build-scripts --change "<名称>" --json
      \`\`\`
      指令 JSON 包含：
      - \`context\`：项目背景（约束条件，不包含在输出中）
      - \`rules\`：artifacts特定规则（约束条件，不包含在输出中）
      - \`template\`：输出文件结构
      - \`instruction\`：此artifacts类型的指导说明
      - \`outputPath\`：artifacts输出路径
      - \`dependencies\`：需要先读取的已完成artifacts

   b. **创建测试脚本目录结构**
      \`\`\`
      testspec/changes/sdt-test-<capability>/test_scripts/
      ├── conftest.py
      ├── test_suite_*.py
      └── utils/
          └── helpers.py
      \`\`\`

   c. **基于 manual-cases.json 生成测试脚本**
      - 解析手工测试案例 JSON
      - 为每个测试案例创建对应的 pytest 测试方法
      - 使用 \`@pytest.mark.parametrize\` 装饰器参数化测试数据
      - 遵循 SDT schema 中 build-scripts 的 instruction 规范

   d. **创建 conftest.py**
      - 配置 pytest fixtures
      - 实现 API 客户端封装
      - 加载测试数据

   e. **标记 todo 为完成**："已创建 build-scripts"
   f. **显示简要进度**："已创建 build-scripts"

   g. **更新状态**
      \`\`\`bash
      testspec status --change "<名称>" --json
      \`\`\`
      确认artifacts状态已变为 \`done\`

6. **标记 todo 项目完成**

7. **显示最终状态**
   \`\`\`bash
   testspec status --change "<名称>"
   \`\`\`

**输出**

完成 build artifacts后：
- Change 名称和位置
- 创建的artifacts列表：
  - \`test_scripts/conftest.py\` - pytest 配置文件
  - \`test_scripts/test_suite_*.py\` - 测试套件文件
  - \`test_scripts/utils/helpers.py\` - 辅助工具
- 状态："Build 阶段完成！准备运行测试。"
- 提示："运行 \`/testspec-sdt-run\` 执行自动化测试。"

**前置条件检查**

进入 build 阶段前必须满足：
| artifacts | 状态要求 |
|------|----------|
| design-test-points | done |
| design-manual-case | done |

如果任何前置artifacts未完成，显示：
\`\`\`
前置检查未通过：
- design-test-points: <当前状态>
- design-manual-case: <当前状态>

请先完成 \`/testspec-sdt-design\` 阶段后再进入 build 阶段。
\`\`\`

**pytest 脚本生成规范**

遵循 SDT schema 中 build-scripts artifacts的 instruction：
- 测试类命名：\`Test<功能模块名称>\`
- 测试方法命名：\`test_<测试案例名称>\`
- 使用 \`@pytest.mark.parametrize\` 参数化测试数据
- 每个测试方法包含 docstring 说明关联的手工案例
- 遵循 Arrange-Act-Assert 模式
- 使用有意义的断言消息

**Guardrails**
- 必须验证前置artifacts状态后才能进入 build 阶段
- 如果前置artifacts未完成，拒绝执行并提示用户
- 按 SDT schema 定义创建所有 build-* artifacts，检查是否有遗漏build-*的artifacts未创建
- 生成的 pytest 脚本必须可以直接运行
- 创建脚本后验证文件存在且语法正确`,
  };
}
