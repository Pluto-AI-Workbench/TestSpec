## Why

Complete project rebrand from OpenSpec to TestSpec. This includes updating the npm package identity, GitHub repository references, CLI command names, and all associated slash commands used across 20+ AI coding tools. The new identity reflects the project's focus on test specification management.

## What Changes

- **BREAKING**: NPM package name changed from `@fission-ai/openspec` to `@LT86.01/testspec`
- **BREAKING**: GitHub repository changed from `Fission-AI/OpenSpec` to `Pluto-AI-Workbench/TestSpec`
- **BREAKING**: CLI binary renamed from `openspec` to `testspec`
- **BREAKING**: All slash commands changed from `/opsx:*` to `/testspec:*` (e.g., `/opsx:propose` → `/testspec:propose`)
- All `OpenSpec` text references changed to `TestSpec`
- All `openspec` CLI command references changed to `testspec`
- All tool-specific command paths updated (`.cursor/commands/openspec-*.md` → `.cursor/commands/testspec-*.md`, etc.)
- Package description, keywords, homepage, and repository URLs updated
- Copyright/author references updated from "OpenSpec Contributors" to "TestSpec Contributors"

## Capabilities

### New Capabilities

（无新功能引入，此为纯品牌重命名变更）

### Modified Capabilities

（无功能需求变更，此为文档和标识符重命名）

## Impact

- **`package.json`** and **`package-lock.json`**: name, homepage, repository, bin, keywords, author
- **`src/` directory**: All CLI command definitions, slash command generators, tool integration paths, help text, console output
- **`README.md`** and **`README_OLD.md`**: All example commands, badges, links, descriptions
- **`CHANGELOG.md`**: Historical references to OpenSpec commands and URLs
- **`docs/` directory**: All documentation files referencing commands, package names, or repository URLs
- **`flake.nix`**: Package name, description, homepage, mainProgram
- **`ci.yml`**: GitHub repository references in CI workflow
- **`build.js`**: Build output messages
- **`eslint.config.js`**: GitHub issue links
- **`LICENSE`** and **`MAINTAINERS.md`**: Copyright and author references
- **20+ AI tool integrations**: All slash command path patterns in source code (`.claude/`, `.cursor/`, `.windsurf/`, etc.)
