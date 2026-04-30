<p align="center">
  <a href="https://github.com/Pluto-AI-Workbench/TestSpec">
    <picture>
      <source srcset="assets/TestSpec_bg.png">
      <img src="assets/TestSpec_bg.png" alt="TestSpec logo">
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://github.com/Pluto-AI-Workbench/TestSpec/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Pluto-AI-Workbench/TestSpec/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@Pluto-AI-Workbench/TestSpec"><img alt="npm version" src="https://img.shields.io/npm/v/@Pluto-AI-Workbench/TestSpec?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
  <a href="https://discord.gg/YctCnvvshC"><img alt="Discord" src="https://img.shields.io/discord/1411657095639601154?style=flat-square&logo=discord&logoColor=white&label=Discord&suffix=%20online" /></a>
</p>

<details>
<summary><strong>The most loved spec framework.</strong></summary>

[![Stars](https://img.shields.io/github/stars/Pluto-AI-Workbench/TestSpec?style=flat-square&label=Stars)](https://github.com/Pluto-AI-Workbench/TestSpec/stargazers)
[![Downloads](https://img.shields.io/npm/dm/@Pluto-AI-Workbench/TestSpec?style=flat-square&label=Downloads/mo)](https://www.npmjs.com/package/@Pluto-AI-Workbench/TestSpec)
[![Contributors](https://img.shields.io/github/contributors/Pluto-AI-Workbench/TestSpec?style=flat-square&label=Contributors)](https://github.com/Pluto-AI-Workbench/TestSpec/graphs/contributors)

</details>
<p></p>
Our philosophy:

```text
→ fluid not rigid
→ ?iterative not waterfall
→ easy not complex
→ built for brownfield not just greenfield
→ scalable from personal projects to enterprises
```

> [!TIP]
> **New workflow now available!** We've rebuilt TestSpec with a new artifact-guided workflow.
>
> Run `/testspec:propose "your idea"` to get started. → [Learn more here](docs/opsx.md)

<p align="center">
  Follow <a href="https://x.com/0xTab">@0xTab on X</a> for updates · Join the <a href="https://discord.gg/YctCnvvshC">TestSpec Discord</a> for help and questions.
</p>

<!-- TODO: Add GIF demo of /testspec:propose → /testspec:archive workflow -->

## See it in action

```text
You: /testspec:propose add-dark-mode
AI:  Created TestSpec/changes/add-dark-mode/
     → proposal.md → why we're doing this, what's changing
     → specs/       → requirements and scenarios
     → design.md    → technical approach
     → tasks.md     → implementation checklist
     Ready for implementation!

You: /testspec:apply
AI:  Implementing tasks...
     → 1.1 Add theme context provider
     → 1.2 Create toggle component
     → 2.1 Add CSS variables
     → 2.2 Wire up localStorage
     All tasks complete!

You: /testspec:archive
AI:  Archived to TestSpec/changes/archive/2025-01-23-add-dark-mode/
     Specs updated. Ready for the next feature.
```

<details>
<summary><strong>TestSpec Dashboard</strong></summary>

<p align="center">
  <img src="assets/TestSpec_dashboard.png" alt="TestSpec dashboard preview" width="90%">
</p>

</details>

## Quick Start

**Requires Node.js 20.19.0 or higher.**

Install TestSpec globally:

```bash
npm install -g @Pluto-AI-Workbench/TestSpec@latest
```

Then navigate to your project directory and initialize:

```bash
cd your-project
TestSpec init
```

Now tell your AI: `/testspec:propose <what-you-want-to-build>`

If you want the expanded workflow (`/testspec:new`, `/testspec:continue`, `/testspec:ff`, `/testspec:verify`, `/testspec:sync`, `/testspec:bulk-archive`, `/testspec:onboard`), select it with `TestSpec config profile` and apply with `TestSpec update`.

> [!NOTE]
> Not sure if your tool is supported? [View the full list](docs/supported-tools.md) → we support 25+ tools and growing.
>
> Also works with pnpm, yarn, bun, and nix. [See installation options](docs/installation.md).

## Docs

→ **[Getting Started](docs/getting-started.md)**: first steps<br>
→ **[Workflows](docs/workflows.md)**: combos and patterns<br>
→ **[Commands](docs/commands.md)**: slash commands & skills<br>
→ **[CLI](docs/cli.md)**: terminal reference<br>
→ **[Supported Tools](docs/supported-tools.md)**: tool integrations & install paths<br>
→ **[Concepts](docs/concepts.md)**: how it all fits<br>
→ **[Multi-Language](docs/multi-language.md)**: multi-language support<br>
→ **[Customization](docs/customization.md)**: make it yours

## Why TestSpec?

AI coding assistants are powerful but unpredictable when requirements live only in chat history. TestSpec adds a lightweight spec layer so you agree on what to build before any code is written.

- **Agree before you build** → human and AI align on specs before code gets written
- **Stay organized** → each change gets its own folder with proposal, specs, design, and tasks
- **Work fluidly** → update any artifact anytime, no rigid phase gates
- **Use your tools** → works with 20+ AI assistants via slash commands

### How we compare

**vs. [Spec Kit](https://github.com/github/spec-kit)** (GitHub) → Thorough but heavyweight. Rigid phase gates, lots of Markdown, Python setup. TestSpec is lighter and lets you iterate freely.

**vs. [Kiro](https://kiro.dev)** (AWS) → Powerful but you're locked into their IDE and limited to Claude models. TestSpec works with the tools you already use.

**vs. nothing** → AI coding without specs means vague prompts and unpredictable results. TestSpec brings predictability without the ceremony.

## Updating TestSpec

**Upgrade the package**

```bash
npm install -g @Pluto-AI-Workbench/TestSpec@latest
```

**Refresh agent instructions**

Run this inside each project to regenerate AI guidance and ensure the latest slash commands are active:

```bash
TestSpec update
```

## Usage Notes

**Model selection**: TestSpec works best with high-reasoning models. We recommend Opus 4.5 and GPT 5.2 for both planning and implementation.

**Context hygiene**: TestSpec benefits from a clean context window. Clear your context before starting implementation and maintain good context hygiene throughout your session.

## Contributing

**Small fixes** → Bug fixes, typo corrections, and minor improvements can be submitted directly as PRs.

**Larger changes** → For new features, significant refactors, or architectural changes, please submit an TestSpec change proposal first so we can align on intent and goals before implementation begins.

When writing proposals, keep the TestSpec philosophy in mind: we serve a wide variety of users across different coding agents, models, and use cases. Changes should work well for everyone.

**AI-generated code is welcome** → as long as it's been tested and verified. PRs containing AI-generated code should mention the coding agent and model used (e.g., "Generated with Claude Code using claude-opus-4-5-20251101").

### Development

- Install dependencies: `pnpm install`
- Build: `pnpm run build`
- Test: `pnpm test`
- Develop CLI locally: `pnpm run dev` or `pnpm run dev:cli`
- Conventional commits (one-line): `type(scope): subject`

## Other

<details>
<summary><strong>Telemetry</strong></summary>

TestSpec collects anonymous usage stats.

We collect only command names and version to understand usage patterns. No arguments, paths, content, or PII. Automatically disabled in CI.

**Opt-out:** `export TestSpec_TELEMETRY=0` or `export DO_NOT_TRACK=1`

</details>

<details>
<summary><strong>Maintainers & Advisors</strong></summary>

See [MAINTAINERS.md](MAINTAINERS.md) for the list of core maintainers and advisors who help guide the project.

</details>

## 2026.4 改动

- 1、品牌名称改为testspec, 项目中所有的命令、描述都为testspec, 包括opsx 也改为了testspec
- 2、workflow 增加4个sdt： sdt-new、sdt-build、sdt-design、sdt-clarify
- 3、profile增加sdt类型：sdt对应上述增加的4个workflow; 原本有旧的core、custom类型依然保留
- 4、默认profile类型改为 sdt（项目代码层面， 全局config.json配置）
- 5、新增内置的sdt schema (init的config.yaml未改，所以若需要使用，需要手动自行修改config.yaml, 示例如下)

```yaml
schema: sdt # 使用 SDT 作为默认 schema
context: |
  项目使用 pytest 作为测试框架
  测试覆盖率要求 >= 80%
```

## 本地验证功能方法

### 1、本地安装

```bash
# 1.下载代码
git clone https://github.com/Pluto-AI-Workbench/TestSpec.git

# 2.安装依赖(推荐使用pnpm)
pnpm install

# 3.项目编译
pnpm build

# 4.全局安装（使用pnpm add -g 也可以，但是安装后的路径不一样）
npm install -g <你的项目下载的绝对路径，到项目根目录就行>
# 例如： npm install -g D:\projects\testspec\TestSpec

# 5. 验证
npm list -g
# 输出看到有：+-- @LT86.01/testspec@1.3.1 -> .\D:\projects\testspec\TestSpec  就表示安装成功了

# 6. 使用init
testspec init
# 这个会默认使用sdt模式，会生成testpec/目录，也会在command/&skills/  下创建4个sdt命令

# 7、验证profile切换
testspect config profile "core"
testspec update
# 然后就可以去command/ skills/ 目录下查看对应的命令是否切换为对应的模式

```

## License

MIT
