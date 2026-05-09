#!/usr/bin/env python3
"""
示例 Python 校验脚本
检查文档是否包含必要章节
"""
import sys
import json
import os


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
    
    print(f"[python-check] Checking artifact: {artifact_id}", file=sys.stderr)
    print(f"[python-check] Generated path: {generated_path}", file=sys.stderr)
    
    # 只检查 proposal 工件
    if artifact_id != 'proposal':
        return {"passed": True}
    
    # 注意：generatedPath 是相对于 changeDir 的路径
    # Python 脚本的工作目录是 projectRoot，需要结合 changeDir 使用
    # 这里假设 generatedPath 已经是可访问的路径（测试用）
    if not os.path.exists(generated_path):
        # 尝试在 testspec/changes 目录下查找
        alt_paths = [
            os.path.join('testspec', 'changes', 'test-checks-demo', generated_path),
            os.path.join('.testspec', 'changes', 'test-checks-demo', generated_path),
        ]
        found = False
        for alt_path in alt_paths:
            if os.path.exists(alt_path):
                generated_path = alt_path
                found = True
                break
        if not found:
            return {
                "passed": False,
                "message": f"文件不存在: {generated_path}"
            }
    
    # 读取文件内容
    with open(generated_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否包含 Why 章节
    if '## Why' not in content:
        return {
            "passed": False,
            "message": "Proposal 文档必须包含 '## Why' 章节"
        }
    
    return {"passed": True, "message": "Python 校验通过"}


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
