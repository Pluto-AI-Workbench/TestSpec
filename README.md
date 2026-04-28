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
â†?fluid not rigid
â†?iterative not waterfall
â†?easy not complex
â†?built for brownfield not just greenfield
â†?scalable from personal projects to enterprises
```

> [!TIP]
> **New workflow now available!** We've rebuilt TestSpec with a new artifact-guided workflow.
>
> Run `/testspec:propose "your idea"` to get started. â†?[Learn more here](docs/opsx.md)

<p align="center">
  Follow <a href="https://x.com/0xTab">@0xTab on X</a> for updates Â· Join the <a href="https://discord.gg/YctCnvvshC">TestSpec Discord</a> for help and questions.
</p>

<!-- TODO: Add GIF demo of /testspec:propose â†?/testspec:archive workflow -->

## See it in action

```text
You: /testspec:propose add-dark-mode
AI:  Created TestSpec/changes/add-dark-mode/
     âœ?proposal.md â€?why we're doing this, what's changing
     âœ?specs/       â€?requirements and scenarios
     âœ?design.md    â€?technical approach
     âœ?tasks.md     â€?implementation checklist
     Ready for implementation!

You: /testspec:apply
AI:  Implementing tasks...
     âœ?1.1 Add theme context provider
     âœ?1.2 Create toggle component
     âœ?2.1 Add CSS variables
     âœ?2.2 Wire up localStorage
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
> Not sure if your tool is supported? [View the full list](docs/supported-tools.md) â€?we support 25+ tools and growing.
>
> Also works with pnpm, yarn, bun, and nix. [See installation options](docs/installation.md).

## Docs

â†?**[Getting Started](docs/getting-started.md)**: first steps<br>
â†?**[Workflows](docs/workflows.md)**: combos and patterns<br>
â†?**[Commands](docs/commands.md)**: slash commands & skills<br>
â†?**[CLI](docs/cli.md)**: terminal reference<br>
â†?**[Supported Tools](docs/supported-tools.md)**: tool integrations & install paths<br>
â†?**[Concepts](docs/concepts.md)**: how it all fits<br>
â†?**[Multi-Language](docs/multi-language.md)**: multi-language support<br>
â†?**[Customization](docs/customization.md)**: make it yours


## Why TestSpec?

AI coding assistants are powerful but unpredictable when requirements live only in chat history. TestSpec adds a lightweight spec layer so you agree on what to build before any code is written.

- **Agree before you build** â€?human and AI align on specs before code gets written
- **Stay organized** â€?each change gets its own folder with proposal, specs, design, and tasks
- **Work fluidly** â€?update any artifact anytime, no rigid phase gates
- **Use your tools** â€?works with 20+ AI assistants via slash commands

### How we compare

**vs. [Spec Kit](https://github.com/github/spec-kit)** (GitHub) â€?Thorough but heavyweight. Rigid phase gates, lots of Markdown, Python setup. TestSpec is lighter and lets you iterate freely.

**vs. [Kiro](https://kiro.dev)** (AWS) â€?Powerful but you're locked into their IDE and limited to Claude models. TestSpec works with the tools you already use.

**vs. nothing** â€?AI coding without specs means vague prompts and unpredictable results. TestSpec brings predictability without the ceremony.

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

**Small fixes** â€?Bug fixes, typo corrections, and minor improvements can be submitted directly as PRs.

**Larger changes** â€?For new features, significant refactors, or architectural changes, please submit an TestSpec change proposal first so we can align on intent and goals before implementation begins.

When writing proposals, keep the TestSpec philosophy in mind: we serve a wide variety of users across different coding agents, models, and use cases. Changes should work well for everyone.

**AI-generated code is welcome** â€?as long as it's been tested and verified. PRs containing AI-generated code should mention the coding agent and model used (e.g., "Generated with Claude Code using claude-opus-4-5-20251101").

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



## License

MIT
