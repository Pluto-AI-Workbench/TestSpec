## Context

OpenSpec is being fully rebranded to TestSpec. This is a comprehensive rename touching:
- NPM package identity (`@fission-ai/openspec` → `@LT86.01/testspec`)
- GitHub repository (`Fission-AI/OpenSpec` → `Pluto-AI-Workbench/TestSpec`)
- CLI binary name (`openspec` → `testspec`)
- Slash command prefix (`/opsx:*` → `/testspec:*`)
- All tool-specific command path patterns
- All textual references across source, docs, and configs

The project is a TypeScript/Node.js CLI tool using Commander.js, with integrations for 20+ AI coding tools. The codebase runs on macOS, Linux, and Windows.

## Goals / Non-Goals

**Goals:**
- Replace all `@fission-ai/openspec` references with `@LT86.01/testspec` in package metadata and documentation
- Replace all `Fission-AI/OpenSpec` GitHub references with `Pluto-AI-Workbench/TestSpec`
- Replace CLI binary `openspec` with `testspec` in package.json bin, build scripts, and CI
- Replace all `/opsx:*` slash commands with `/testspec:*`
- Replace all `OpenSpec` text with `TestSpec` and `openspec` (lowercase) with `testspec`
- Update all tool-specific command path patterns in source code (`.cursor/commands/openspec-*.md` → `.cursor/commands/testspec-*.md`, etc.)
- Update copyright/author references

**Non-Goals:**
- Changing CLI functionality or behavior
- Changing the schema/artifact system
- Changing the AI tool integration architecture
- Preserving git history (this is a fresh rename, not a fork with history)

## Decisions

### Decision 1: Slash command prefix change (`/opsx:*` → `/testspec:*`)
**Rationale**: The `/opsx` prefix was a shortened form of "OpenSpec". With the rebrand to TestSpec, `/testspec` is the logical replacement that maintains readability while being explicit.
**Alternatives considered**:
- `/ts:*` — too short, could conflict with TypeScript or other tools
- `/tspec:*` — not aligned with "TestSpec" brand
- Keep `/opsx:*` — defeats the purpose of rebranding

### Decision 2: CLI binary name (`openspec` → `testspec`)
**Rationale**: Direct rename keeps it simple and aligned with the new package name `@LT86.01/testspec`.
**Alternatives considered**:
- `ts` — too generic, could conflict
- `tspec` — not aligned with full "TestSpec" branding

### Decision 3: Tool path patterns (e.g., `.cursor/commands/openspec-*.md` → `.cursor/commands/testspec-*.md`)
**Rationale**: Each AI tool has its own path convention. Updating the path patterns in `src/` ensures `openspec init` and `openspec update` generate the correct files for the new brand.
**Note**: The `.opencode/commands/openspec-*.md` paths are excluded per user request, as they represent the skill definitions that are managed separately.

## Risks / Trade-offs

- **[Risk] Breaking existing installations** → **Mitigation**: This is a complete rebrand; existing users will need to reinstall with the new package name. Document this in the README.
- **[Risk] External links to Fission-AI/OpenSpec will break** → **Mitigation**: Update all internal links. Consider setting up GitHub redirects if the old repo remains.
- **[Risk] CI/CD and build scripts reference old paths** → **Mitigation**: Audit `ci.yml`, `flake.nix`, `build.js`, and all GitHub workflow files.
- **[Risk] Incomplete text replacement** → **Mitigation**: Use exhaustive search (PowerShell Select-String) across all file types, not just source code.
