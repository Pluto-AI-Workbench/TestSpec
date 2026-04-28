## ADDED Requirements

### Requirement: Package identity updated
The system SHALL use `@LT86.01/testspec` as the NPM package name in package.json and package-lock.json.

#### Scenario: Correct package name in package.json
- **WHEN** reading package.json
- **THEN** the "name" field equals "@LT86.01/testspec"

#### Scenario: Correct package name in package-lock.json
- **WHEN** reading package-lock.json
- **THEN** the "name" field equals "@LT86.01/testspec"

### Requirement: GitHub repository updated
The system SHALL use `https://github.com/Pluto-AI-Workbench/TestSpec` as the repository URL and homepage in package.json and documentation.

#### Scenario: Correct repository URL
- **WHEN** reading package.json repository.url
- **THEN** the value equals "https://github.com/Pluto-AI-Workbench/TestSpec"

#### Scenario: Correct homepage URL
- **WHEN** reading package.json homepage
- **THEN** the value equals "https://github.com/Pluto-AI-Workbench/TestSpec"

### Requirement: CLI binary renamed
The system SHALL use `testspec` as the CLI binary name in package.json bin, build scripts, and CI configuration.

#### Scenario: Correct CLI binary in package.json
- **WHEN** reading package.json bin
- **THEN** the key is "testspec" and the value is "./bin/testspec.js"

#### Scenario: Correct CLI invocation in dev script
- **WHEN** reading package.json scripts["dev:cli"]
- **THEN** the script invokes "node bin/testspec.js"

### Requirement: Slash commands renamed
The system SHALL use `/testspec:*` as the slash command prefix, replacing all `/opsx:*` commands.

#### Scenario: Correct slash command prefix in source
- **WHEN** reading src/ files containing slash command definitions
- **THEN** all commands use `/testspec:*` format (e.g., `/testspec:propose`, `/testspec:apply`)

#### Scenario: Correct tool path patterns in source
- **WHEN** reading src/ files containing tool command path patterns
- **THEN** all paths use `testspec-*.md` or `testspec/` format (e.g., `.cursor/commands/testspec-*.md`)

### Requirement: Text references updated
The system SHALL replace all `OpenSpec` text with `TestSpec` and all `openspec` (lowercase, excluding .opencode/ and openspec/ directories) with `testspec`.

#### Scenario: Correct brand text in README
- **WHEN** reading README.md
- **THEN** all occurrences of "OpenSpec" are replaced with "TestSpec" and "openspec" (CLI commands) with "testspec"

#### Scenario: Correct brand text in source code
- **WHEN** reading src/ files containing brand text
- **THEN** all "OpenSpec" references are replaced with "TestSpec"
