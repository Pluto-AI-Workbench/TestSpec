# Artifact Checks（工件后置校验）

工件后置校验机制允许在工件生成后自动执行验证规则，确保工件质量和一致性。

## 功能概述

- **内置校验**：自动校验工件输出文件是否存在（支持 glob 模式）
- **自定义校验**：通过 `checks/` 目录下的脚本执行自定义验证规则
- **错误阻断**：校验失败立即抛出异常，阻断后续流程

## 配置方式

在 schema YAML 的 artifact 中添加 `checks` 字段：

```yaml
artifacts:
  - id: proposal
    generates: proposal.md
    description: Proposal document
    template: proposal.md
    instruction: Create a proposal document
    requires: []
    checks: [must-have-why, naming-convention]

  - id: design
    generates: design.md
    description: Design document
    template: design.md
    instruction: Create a design document
    requires: [proposal]
    # 不配置 checks 则不执行自定义校验
```

## 内置校验

每个工件自动执行，无需配置：

1. **目录存在性**：校验 `generates` 字段解析出的产物所在目录是否存在
2. **文件存在性**：校验 `generates` 字段解析出的产物文件是否存在（支持 glob 模式）

示例：
```yaml
# 单个文件
generates: design.md

# glob 模式
generates: "specs/**/*.md"
```

## 自定义校验

### 创建校验脚本

在项目根目录的 `checks/` 目录下创建 `.ts` 或 `.js` 文件：

```
project-root/
├── checks/
│   ├── must-have-why.ts
│   ├── naming-convention.ts
│   └── code-style.js
├── src/
└── ...
```

### 脚本接口

```typescript
interface CheckContext {
  artifactId: string;      // 当前工件的 ID
  generatedPath: string;   // 当前工件 generates 字段的原始值
}

interface CheckResult {
  passed: boolean;         // 校验是否通过
  message?: string;        // 失败时的错误信息
}

// 导出函数（支持 default export 或 check export）
export default async function check(ctx: CheckContext): Promise<CheckResult> {
  // 校验逻辑...
  
  return {
    passed: true,
    message: '校验通过',
  };
}
```

### 示例：检查文档必须包含 "Why" 章节

```typescript
// checks/must-have-why.ts
import * as fs from 'node:fs';
import * as path from 'node:path';

export default async function check(ctx: {
  artifactId: string;
  generatedPath: string;
}): Promise<{ passed: boolean; message?: string }> {
  const { artifactId, generatedPath } = ctx;

  // 只检查 proposal 工件
  if (artifactId !== 'proposal') {
    return { passed: true };
  }

  // 读取生成的文件
  const filePath = path.join(process.cwd(), '.testspec', 'changes', generatedPath);
  
  if (!fs.existsSync(filePath)) {
    return {
      passed: false,
      message: `文件不存在: ${filePath}`,
    };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否包含 "Why" 章节
  if (!content.includes('## Why')) {
    return {
      passed: false,
      message: 'Proposal 文档必须包含 "## Why" 章节',
    };
  }

  return { passed: true };
}
```

### 示例：检查命名规范

```typescript
// checks/naming-convention.ts
export default async function check(ctx: {
  artifactId: string;
  generatedPath: string;
}): Promise<{ passed: boolean; message?: string }> {
  const { artifactId } = ctx;

  // 工件 ID 必须使用 kebab-case
  const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  
  if (!kebabCaseRegex.test(artifactId)) {
    return {
      passed: false,
      message: `工件 ID "${artifactId}" 不符合 kebab-case 命名规范`,
    };
  }

  return { passed: true };
}
```

## 执行流程

```
┌─────────────────────────────────────────────────────────────┐
│                     generateApplyInstructions               │
├─────────────────────────────────────────────────────────────┤
│  1. 加载 schema 和 change 上下文                            │
│  2. 检查缺失的工件                                          │
│  3. 构建 context files                                      │
│  4. 执行工件后置校验 ← 新增功能                             │
│     ├─ 对每个工件执行内置校验（强制）                        │
│     └─ 对配置了 checks 的工件执行自定义校验                 │
│  5. 解析任务进度                                            │
│  6. 返回 apply instructions                                 │
└─────────────────────────────────────────────────────────────┘
```

## 错误处理

### 内置校验失败

```
Error: [内置校验] 工件 "proposal" 的输出文件不存在: proposal.md
```

**解决方案**：确保工件已正确生成，文件路径与 `generates` 字段一致。

### 自定义校验文件不存在

```
Error: [自定义校验] 未找到校验文件: checks/xxx.ts、checks/xxx.js 或 checks/xxx/SKILL.md
```

**解决方案**：在 `checks/` 目录下创建对应的校验文件。

### 自定义校验失败

```
Error: [自定义校验] 工件 "proposal" 的校验 "must-have-why" 失败: Proposal 文档必须包含 "## Why" 章节
```

**解决方案**：根据错误信息修正工件内容，使其符合校验规则。

## 最佳实践

1. **校验粒度**：每个校验文件只检查一个规则，保持单一职责
2. **明确的错误信息**：返回清晰的错误信息，帮助用户快速定位问题
3. **性能考虑**：校验会在每次生成 apply instructions 时执行，避免耗时操作
4. **幂等性**：校验函数应该是幂等的，多次执行结果一致

## 常见问题

### Q: 如何跳过校验？

A: 不配置 `checks` 字段即可跳过自定义校验。内置校验强制执行，无法跳过。

### Q: 校验脚本支持 JavaScript 吗？

A: 支持。可以创建 `.ts` 或 `.js` 文件。

### Q: 校验失败会阻断什么？

A: 校验失败会阻断 `generateApplyInstructions` 函数的执行，导致无法生成 apply instructions。

### Q: 可以在工件生成前执行校验吗？

A: 当前设计是在生成 apply instructions 时校验已存在的工件。如果工件不存在，内置校验会失败。

## 相关文件

- `src/core/artifact-graph/built-in-checks.ts` - 内置校验实现
- `src/core/artifact-graph/custom-check-loader.ts` - 自定义校验加载器
- `src/commands/workflow/instructions.ts` - 主流程集成
- `src/core/artifact-graph/types.ts` - 类型定义（checks 字段）
