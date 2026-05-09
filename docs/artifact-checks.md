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

在项目根目录的 `checks/` 目录下创建 `.ts`、`.js` 或 `.py` 文件：

```
project-root/
├── checks/
│   ├── must-have-why.ts
│   ├── naming-convention.ts
│   ├── code-style.js
│   └── validate-doc.py
├── src/
└── ...
```

### 脚本接口

#### TypeScript/JavaScript

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

#### Python

Python 脚本通过命令行参数接收 JSON 格式的上下文，输出 JSON 格式的结果：

**输入**（命令行参数）：
```json
{
  "artifactId": "proposal",
  "generatedPath": "proposal.md"
}
```

**输出**（stdout）：
```json
{
  "passed": true,
  "message": "校验通过"
}
```

```python
#!/usr/bin/env python3
import sys
import json

def check(context: dict) -> dict:
    """
    校验函数
    
    Args:
        context: 包含 artifactId 和 generatedPath 的字典
    
    Returns:
        包含 passed (bool) 和 message (str, 可选) 的字典
    """
    artifact_id = context.get('artifactId')
    generated_path = context.get('generatedPath')
    
    # 校验逻辑...
    
    return {
        "passed": True,
        "message": "校验通过"
    }

if __name__ == "__main__":
    # 从命令行参数读取上下文
    if len(sys.argv) < 2:
        print(json.dumps({"passed": False, "message": "缺少参数"}))
        sys.exit(1)
    
    try:
        context = json.loads(sys.argv[1])
        result = check(context)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"passed": False, "message": str(e)}))
        sys.exit(1)
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

### 示例：Python 校验脚本

```python
#!/usr/bin/env python3
# checks/validate-doc.py
import sys
import json
import os

def check(context: dict) -> dict:
    artifact_id = context.get('artifactId')
    generated_path = context.get('generatedPath')
    
    # 只检查 proposal 工件
    if artifact_id != 'proposal':
        return {"passed": True}
    
    # 注意：generatedPath 是相对于 changeDir 的路径
    # Python 脚本的工作目录是 projectRoot
    # 如果需要访问 changeDir 下的文件，需要构建完整路径
    # 例如：os.path.join('.testspec', 'changes', change_name, generated_path)
    
    # 检查文件是否存在（这里假设文件在当前目录）
    if not os.path.exists(generated_path):
        return {
            "passed": False,
            "message": f"文件不存在: {generated_path}"
        }
    
    # 读取文件内容
    with open(generated_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否包含必要章节
    required_sections = ['## Why', '## What Changes', '## Impact']
    for section in required_sections:
        if section not in content:
            return {
                "passed": False,
                "message": f"Proposal 文档缺少必要章节: {section}"
            }
    
    # 检查文档长度
    if len(content) < 100:
        return {
            "passed": False,
            "message": "Proposal 文档内容过短，至少需要 100 字符"
        }
    
    return {"passed": True, "message": "文档校验通过"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"passed": False, "message": "缺少参数"}))
        sys.exit(1)
    
    try:
        context = json.loads(sys.argv[1])
        result = check(context)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"passed": False, "message": str(e)}))
        sys.exit(1)
```

**重要提示**：Python 脚本接收到的 `generatedPath` 是相对于 `changeDir` 的路径，而脚本的工作目录是 `projectRoot`。如果需要访问工件文件，需要根据实际情况构建完整路径。

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

### Python 脚本输出格式错误

```
Error: [自定义校验] Python 脚本 "validate-doc" 输出格式错误，需要 JSON 格式: {"passed": true/false, "message": "..."}
```

**解决方案**：确保 Python 脚本输出有效的 JSON 格式，包含 `passed` (boolean) 和可选的 `message` (string) 字段。

### Python 解释器未找到

```
Error: [自定义校验] 未找到 Python 解释器，请确保 Python 已安装并在 PATH 中
```

**解决方案**：安装 Python 并确保 `python` 命令在系统 PATH 中可用。

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
- `checks/python-check.py` - Python 校验脚本示例
