# OPSX Workflow

> Feedback welcome on [Discord](https://discord.gg/YctCnvvshC).

## What Is It?

OPSX is now the standard workflow for TestSpec.

It's a **fluid, iterative workflow** for TestSpec changes. No more rigid phases �?just actions you can take anytime.

## Why This Exists

The legacy TestSpec workflow works, but it's **locked down**:

- **Instructions are hardcoded** �?buried in TypeScript, you can't change them
- **All-or-nothing** �?one big command creates everything, can't test individual pieces
- **Fixed structure** �?same workflow for everyone, no customization
- **Black box** �?when AI output is bad, you can't tweak the prompts

**OPSX opens it up.** Now anyone can:

1. **Experiment with instructions** �?edit a template, see if the AI does better
2. **Test granularly** �?validate each artifact's instructions independently
3. **Customize workflows** �?define your own artifacts and dependencies
4. **Iterate quickly** �?change a template, test immediately, no rebuild

```
Legacy workflow:                      OPSX:
┌────────────────────────�?          ┌────────────────────────�?
�? Hardcoded in package  �?          �? schema.yaml           │◄── You edit this
�? (can't change)        �?          �? templates/*.md        │◄── Or this
�?       �?              �?          �?       �?              �?
�? Wait for new release  �?          �? Instant effect        �?
�?       �?              �?          �?       �?              �?
�? Hope it's better      �?          �? Test it yourself      �?
└────────────────────────�?          └────────────────────────�?
```

**This is for everyone:**
- **Teams** �?create workflows that match how you actually work
- **Power users** �?tweak prompts to get better AI outputs for your codebase
- **TestSpec contributors** �?experiment with new approaches without releases

We're all still learning what works best. OPSX lets us learn together.

## The User Experience

**The problem with linear workflows:**
You're "in planning phase", then "in implementation phase", then "done". But real work doesn't work that way. You implement something, realize your design was wrong, need to update specs, continue implementing. Linear phases fight against how work actually happens.

**OPSX approach:**
- **Actions, not phases** �?create, implement, update, archive �?do any of them anytime
- **Dependencies are enablers** �?they show what's possible, not what's required next

```
  proposal ──�?specs ──�?design ──�?tasks ──�?implement
```

## Setup

```bash
# Make sure you have TestSpec installed �?skills are automatically generated
TestSpec init
```

This creates skills in `.claude/skills/` (or equivalent) that AI coding assistants auto-detect.

By default, TestSpec uses the `core` workflow profile (`propose`, `explore`, `apply`, `archive`). If you want the expanded workflow commands (`new`, `continue`, `ff`, `verify`, `sync`, `bulk-archive`, `onboard`), configure them with `TestSpec config profile` and apply with `TestSpec update`.

During setup, you'll be prompted to create a **project config** (`TestSpec/config.yaml`). This is optional but recommended.

## Project Configuration

Project config lets you set defaults and inject project-specific context into all artifacts.

### Creating Config

Config is created during `TestSpec init`, or manually:

```yaml
# TestSpec/config.yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js
  API conventions: RESTful, JSON responses
  Testing: Vitest for unit tests, Playwright for e2e
  Style: ESLint with Prettier, strict TypeScript

rules:
  proposal:
    - Include rollback plan
    - Identify affected teams
  specs:
    - Use Given/When/Then format for scenarios
  design:
    - Include sequence diagrams for complex flows
```

### Config Fields

| Field | Type | Description |
|-------|------|-------------|
| `schema` | string | Default schema for new changes (e.g., `spec-driven`) |
| `context` | string | Project context injected into all artifact instructions |
| `rules` | object | Per-artifact rules, keyed by artifact ID |

### How It Works

**Schema precedence** (highest to lowest):
1. CLI flag (`--schema <name>`)
2. Change metadata (`.TestSpec.yaml` in change directory)
3. Project config (`TestSpec/config.yaml`)
4. Default (`spec-driven`)

**Context injection:**
- Context is prepended to every artifact's instructions
- Wrapped in `<context>...</context>` tags
- Helps AI understand your project's conventions

**Rules injection:**
- Rules are only injected for matching artifacts
- Wrapped in `<rules>...</rules>` tags
- Appear after context, before the template

### Artifact IDs by Schema

**spec-driven** (default):
- `proposal` �?Change proposal
- `specs` �?Specifications
- `design` �?Technical design
- `tasks` �?Implementation tasks

### Config Validation

- Unknown artifact IDs in `rules` generate warnings
- Schema names are validated against available schemas
- Context has a 50KB size limit
- Invalid YAML is reported with line numbers

### Troubleshooting

**"Unknown artifact ID in rules: X"**
- Check artifact IDs match your schema (see list above)
- Run `TestSpec schemas --json` to see artifact IDs for each schema

**Config not being applied:**
- Ensure file is at `TestSpec/config.yaml` (not `.yml`)
- Check YAML syntax with a validator
- Config changes take effect immediately (no restart needed)

**Context too large:**
- Context is limited to 50KB
- Summarize or link to external docs instead

## Commands

| Command | What it does |
|---------|--------------|
| `/testspec:propose` | Create a change and generate planning artifacts in one step (default quick path) |
| `/testspec:explore` | Think through ideas, investigate problems, clarify requirements |
| `/testspec:new` | Start a new change scaffold (expanded workflow) |
| `/testspec:continue` | Create the next artifact (expanded workflow) |
| `/testspec:ff` | Fast-forward planning artifacts (expanded workflow) |
| `/testspec:apply` | Implement tasks, updating artifacts as needed |
| `/testspec:verify` | Validate implementation against artifacts (expanded workflow) |
| `/testspec:sync` | Sync delta specs to main (expanded workflow, optional) |
| `/testspec:archive` | Archive when done |
| `/testspec:bulk-archive` | Archive multiple completed changes (expanded workflow) |
| `/testspec:onboard` | Guided walkthrough of an end-to-end change (expanded workflow) |

## Usage

### Explore an idea
```
/testspec:explore
```
Think through ideas, investigate problems, compare options. No structure required - just a thinking partner. When insights crystallize, transition to `/testspec:propose` (default) or `/testspec:new`/`/testspec:ff` (expanded).

### Start a new change
```
/testspec:propose
```
Creates the change and generates planning artifacts needed before implementation.

If you've enabled expanded workflows, you can instead use:

```text
/testspec:new        # scaffold only
/testspec:continue   # create one artifact at a time
/testspec:ff         # create all planning artifacts at once
```

### Create artifacts
```
/testspec:continue
```
Shows what's ready to create based on dependencies, then creates one artifact. Use repeatedly to build up your change incrementally.

```
/testspec:ff add-dark-mode
```
Creates all planning artifacts at once. Use when you have a clear picture of what you're building.

### Implement (the fluid part)
```
/testspec:apply
```
Works through tasks, checking them off as you go. If you're juggling multiple changes, you can run `/testspec:apply <name>`; otherwise it should infer from the conversation and prompt you to choose if it can't tell.

### Finish up
```
/testspec:archive   # Move to archive when done (prompts to sync specs if needed)
```

## When to Update vs. Start Fresh

You can always edit your proposal or specs before implementation. But when does refining become "this is different work"?

### What a Proposal Captures

A proposal defines three things:
1. **Intent** �?What problem are you solving?
2. **Scope** �?What's in/out of bounds?
3. **Approach** �?How will you solve it?

The question is: which changed, and by how much?

### Update the Existing Change When:

**Same intent, refined execution**
- You discover edge cases you didn't consider
- The approach needs tweaking but the goal is unchanged
- Implementation reveals the design was slightly off

**Scope narrows**
- You realize full scope is too big, want to ship MVP first
- "Add dark mode" �?"Add dark mode toggle (system preference in v2)"

**Learning-driven corrections**
- Codebase isn't structured how you thought
- A dependency doesn't work as expected
- "Use CSS variables" �?"Use Tailwind's dark: prefix instead"

### Start a New Change When:

**Intent fundamentally changed**
- The problem itself is different now
- "Add dark mode" �?"Add comprehensive theme system with custom colors, fonts, spacing"

**Scope exploded**
- Change grew so much it's essentially different work
- Original proposal would be unrecognizable after updates
- "Fix login bug" �?"Rewrite auth system"

**Original is completable**
- The original change can be marked "done"
- New work stands alone, not a refinement
- Complete "Add dark mode MVP" �?Archive �?New change "Enhance dark mode"

### The Heuristics

```
                        ┌─────────────────────────────────────�?
                        �?    Is this the same work?          �?
                        └──────────────┬──────────────────────�?
                                       �?
                    ┌──────────────────┼──────────────────�?
                    �?                 �?                 �?
                    �?                 �?                 �?
             Same intent?      >50% overlap?      Can original
             Same problem?     Same scope?        be "done" without
                    �?                 �?         these changes?
                    �?                 �?                 �?
          ┌────────┴────────�? ┌──────┴──────�?  ┌───────┴───────�?
          �?                �? �?            �?  �?              �?
         YES               NO YES           NO  NO              YES
          �?                �? �?            �?  �?              �?
          �?                �? �?            �?  �?              �?
       UPDATE            NEW  UPDATE       NEW  UPDATE          NEW
```

| Test | Update | New Change |
|------|--------|------------|
| **Identity** | "Same thing, refined" | "Different work" |
| **Scope overlap** | >50% overlaps | <50% overlaps |
| **Completion** | Can't be "done" without changes | Can finish original, new work stands alone |
| **Story** | Update chain tells coherent story | Patches would confuse more than clarify |

### The Principle

> **Update preserves context. New change provides clarity.**
>
> Choose update when the history of your thinking is valuable.
> Choose new when starting fresh would be clearer than patching.

Think of it like git branches:
- Keep committing while working on the same feature
- Start a new branch when it's genuinely new work
- Sometimes merge a partial feature and start fresh for phase 2

## What's Different?

| | Legacy (`/TestSpec:proposal`) | OPSX (`/testspec:*`) |
|---|---|---|
| **Structure** | One big proposal document | Discrete artifacts with dependencies |
| **Workflow** | Linear phases: plan �?implement �?archive | Fluid actions �?do anything anytime |
| **Iteration** | Awkward to go back | Update artifacts as you learn |
| **Customization** | Fixed structure | Schema-driven (define your own artifacts) |

**The key insight:** work isn't linear. OPSX stops pretending it is.

## Architecture Deep Dive

This section explains how OPSX works under the hood and how it compares to the legacy workflow.
Examples in this section use the expanded command set (`new`, `continue`, etc.); default `core` users can map the same flow to `propose �?apply �?archive`.

### Philosophy: Phases vs Actions

```
┌─────────────────────────────────────────────────────────────────────────────�?
�?                        LEGACY WORKFLOW                                      �?
�?                   (Phase-Locked, All-or-Nothing)                           �?
├─────────────────────────────────────────────────────────────────────────────�?
�?                                                                            �?
�?  ┌──────────────�?     ┌──────────────�?     ┌──────────────�?            �?
�?  �?  PLANNING   �?───�?�?IMPLEMENTING �?───�?�?  ARCHIVING  �?            �?
�?  �?   PHASE     �?     �?   PHASE     �?     �?   PHASE     �?            �?
�?  └──────────────�?     └──────────────�?     └──────────────�?            �?
�?        �?                    �?                    �?                      �?
�?        �?                    �?                    �?                      �?
�?  /TestSpec:proposal   /TestSpec:apply      /TestSpec:archive              �?
�?                                                                            �?
�?  �?Creates ALL artifacts at once                                          �?
�?  �?Can't go back to update specs during implementation                    �?
�?  �?Phase gates enforce linear progression                                  �?
�?                                                                            �?
└─────────────────────────────────────────────────────────────────────────────�?


┌─────────────────────────────────────────────────────────────────────────────�?
�?                           OPSX WORKFLOW                                     �?
�?                     (Fluid Actions, Iterative)                             �?
├─────────────────────────────────────────────────────────────────────────────�?
�?                                                                            �?
�?             ┌────────────────────────────────────────────�?                �?
�?             �?          ACTIONS (not phases)             �?                �?
�?             �?                                           �?                �?
�?             �?  new ◄──�?continue ◄──�?apply ◄──�?archive �?                �?
�?             �?   �?         �?          �?          �?   �?                �?
�?             �?   └──────────┴───────────┴───────────�?   �?                �?
�?             �?             any order                     �?                �?
�?             └────────────────────────────────────────────�?                �?
�?                                                                            �?
�?  �?Create artifacts one at a time OR fast-forward                         �?
�?  �?Update specs/design/tasks during implementation                        �?
�?  �?Dependencies enable progress, phases don't exist                       �?
�?                                                                            �?
└─────────────────────────────────────────────────────────────────────────────�?
```

### Component Architecture

**Legacy workflow** uses hardcoded templates in TypeScript:

```
┌─────────────────────────────────────────────────────────────────────────────�?
�?                     LEGACY WORKFLOW COMPONENTS                              �?
├─────────────────────────────────────────────────────────────────────────────�?
�?                                                                            �?
�?  Hardcoded Templates (TypeScript strings)                                  �?
�?                   �?                                                       �?
�?                   �?                                                       �?
�?  Tool-specific configurators/adapters                                      �?
�?                   �?                                                       �?
�?                   �?                                                       �?
�?  Generated Command Files (.claude/commands/TestSpec/*.md)                  �?
�?                                                                            �?
�?  �?Fixed structure, no artifact awareness                                  �?
�?  �?Change requires code modification + rebuild                             �?
�?                                                                            �?
└─────────────────────────────────────────────────────────────────────────────�?
```

**OPSX** uses external schemas and a dependency graph engine:

```
┌─────────────────────────────────────────────────────────────────────────────�?
�?                        OPSX COMPONENTS                                      �?
├─────────────────────────────────────────────────────────────────────────────�?
�?                                                                            �?
�?  Schema Definitions (YAML)                                                 �?
�?  ┌─────────────────────────────────────────────────────────────────────�?  �?
�?  �? name: spec-driven                                                  �?  �?
�?  �? artifacts:                                                         �?  �?
�?  �?   - id: proposal                                                   �?  �?
�?  �?     generates: proposal.md                                         �?  �?
�?  �?     requires: []              ◄── Dependencies                     �?  �?
�?  �?   - id: specs                                                      �?  �?
�?  �?     generates: specs/**/*.md  ◄── Glob patterns                    �?  �?
�?  �?     requires: [proposal]      ◄── Enables after proposal           �?  �?
�?  └─────────────────────────────────────────────────────────────────────�?  �?
�?                   �?                                                       �?
�?                   �?                                                       �?
�?  Artifact Graph Engine                                                     �?
�?  ┌─────────────────────────────────────────────────────────────────────�?  �?
�?  �? �?Topological sort (dependency ordering)                           �?  �?
�?  �? �?State detection (filesystem existence)                           �?  �?
�?  �? �?Rich instruction generation (templates + context)                �?  �?
�?  └─────────────────────────────────────────────────────────────────────�?  �?
�?                   �?                                                       �?
�?                   �?                                                       �?
�?  Skill Files (.claude/skills/TestSpec-*/SKILL.md)                          �?
�?                                                                            �?
�?  �?Cross-editor compatible (Claude Code, Cursor, Windsurf)                 �?
�?  �?Skills query CLI for structured data                                    �?
�?  �?Fully customizable via schema files                                     �?
�?                                                                            �?
└─────────────────────────────────────────────────────────────────────────────�?
```

### Dependency Graph Model

Artifacts form a directed acyclic graph (DAG). Dependencies are **enablers**, not gates:

```
                              proposal
                             (root node)
                                  �?
                    ┌─────────────┴─────────────�?
                    �?                          �?
                    �?                          �?
                 specs                       design
              (requires:                  (requires:
               proposal)                   proposal)
                    �?                          �?
                    └─────────────┬─────────────�?
                                  �?
                                  �?
                               tasks
                           (requires:
                           specs, design)
                                  �?
                                  �?
                          ┌──────────────�?
                          �?APPLY PHASE  �?
                          �?(requires:   �?
                          �? tasks)      �?
                          └──────────────�?
```

**State transitions:**

```
   BLOCKED ────────────────�?READY ────────────────�?DONE
      �?                       �?                      �?
   Missing                  All deps               File exists
   dependencies             are DONE               on filesystem
```

### Information Flow

**Legacy workflow** �?agent receives static instructions:

```
  User: "/TestSpec:proposal"
           �?
           �?
  ┌─────────────────────────────────────────�?
  �? Static instructions:                   �?
  �? �?Create proposal.md                   �?
  �? �?Create tasks.md                      �?
  �? �?Create design.md                     �?
  �? �?Create specs/<capability>/spec.md    �?
  �?                                        �?
  �? No awareness of what exists or         �?
  �? dependencies between artifacts         �?
  └─────────────────────────────────────────�?
           �?
           �?
  Agent creates ALL artifacts in one go
```

**OPSX** �?agent queries for rich context:

```
  User: "/testspec:continue"
           �?
           �?
  ┌──────────────────────────────────────────────────────────────────────────�?
  �? Step 1: Query current state                                             �?
  �? ┌────────────────────────────────────────────────────────────────────�? �?
  �? �? $ TestSpec status --change "add-auth" --json                      �? �?
  �? �?                                                                   �? �?
  �? �? {                                                                 �? �?
  �? �?   "artifacts": [                                                  �? �?
  �? �?     {"id": "proposal", "status": "done"},                         �? �?
  �? �?     {"id": "specs", "status": "ready"},      ◄── First ready      �? �?
  �? �?     {"id": "design", "status": "ready"},                          �? �?
  �? �?     {"id": "tasks", "status": "blocked", "missingDeps": ["specs"]}�? �?
  �? �?   ]                                                               �? �?
  �? �? }                                                                 �? �?
  �? └────────────────────────────────────────────────────────────────────�? �?
  �?                                                                         �?
  �? Step 2: Get rich instructions for ready artifact                        �?
  �? ┌────────────────────────────────────────────────────────────────────�? �?
  �? �? $ TestSpec instructions specs --change "add-auth" --json          �? �?
  �? �?                                                                   �? �?
  �? �? {                                                                 �? �?
  �? �?   "template": "# Specification\n\n## ADDED Requirements...",      �? �?
  �? �?   "dependencies": [{"id": "proposal", "path": "...", "done": true}�? �?
  �? �?   "unlocks": ["tasks"]                                            �? �?
  �? �? }                                                                 �? �?
  �? └────────────────────────────────────────────────────────────────────�? �?
  �?                                                                         �?
  �? Step 3: Read dependencies �?Create ONE artifact �?Show what's unlocked  �?
  └──────────────────────────────────────────────────────────────────────────�?
```

### Iteration Model

**Legacy workflow** �?awkward to iterate:

```
  ┌─────────�?    ┌─────────�?    ┌─────────�?
  �?proposal�?──�?�?/apply  �?──�?�?archive �?
  └─────────�?    └─────────�?    └─────────�?
       �?              �?
       �?              ├── "Wait, the design is wrong"
       �?              �?
       �?              ├── Options:
       �?              �?  �?Edit files manually (breaks context)
       �?              �?  �?Abandon and start over
       �?              �?  �?Push through and fix later
       �?              �?
       �?              └── No official "go back" mechanism
       �?
       └── Creates ALL artifacts at once
```

**OPSX** �?natural iteration:

```
  /testspec:new ───�?/testspec:continue ───�?/testspec:apply ───�?/testspec:archive
      �?               �?                 �?
      �?               �?                 ├── "The design is wrong"
      �?               �?                 �?
      �?               �?                 �?
      �?               �?           Just edit design.md
      �?               �?           and continue!
      �?               �?                 �?
      �?               �?                 �?
      �?               �?        /testspec:apply picks up
      �?               �?        where you left off
      �?               �?
      �?               └── Creates ONE artifact, shows what's unlocked
      �?
      └── Scaffolds change, waits for direction
```

### Custom Schemas

Create custom workflows using the schema management commands:

```bash
# Create a new schema from scratch (interactive)
TestSpec schema init my-workflow

# Or fork an existing schema as a starting point
TestSpec schema fork spec-driven my-workflow

# Validate your schema structure
TestSpec schema validate my-workflow

# See where a schema resolves from (useful for debugging)
TestSpec schema which my-workflow
```

Schemas are stored in `TestSpec/schemas/` (project-local, version controlled) or `~/.local/share/TestSpec/schemas/` (user global).

**Schema structure:**
```
TestSpec/schemas/research-first/
├── schema.yaml
└── templates/
    ├── research.md
    ├── proposal.md
    └── tasks.md
```

**Example schema.yaml:**
```yaml
name: research-first
artifacts:
  - id: research        # Added before proposal
    generates: research.md
    requires: []

  - id: proposal
    generates: proposal.md
    requires: [research]  # Now depends on research

  - id: tasks
    generates: tasks.md
    requires: [proposal]
```

**Dependency Graph:**
```
   research ──�?proposal ──�?tasks
```

### Summary

| Aspect | Legacy | OPSX |
|--------|----------|------|
| **Templates** | Hardcoded TypeScript | External YAML + Markdown |
| **Dependencies** | None (all at once) | DAG with topological sort |
| **State** | Phase-based mental model | Filesystem existence |
| **Customization** | Edit source, rebuild | Create schema.yaml |
| **Iteration** | Phase-locked | Fluid, edit anything |
| **Editor Support** | Tool-specific configurator/adapters | Single skills directory |

## Schemas

Schemas define what artifacts exist and their dependencies. Currently available:

- **spec-driven** (default): proposal �?specs �?design �?tasks

```bash
# List available schemas
TestSpec schemas

# See all schemas with their resolution sources
TestSpec schema which --all

# Create a new schema interactively
TestSpec schema init my-workflow

# Fork an existing schema for customization
TestSpec schema fork spec-driven my-workflow

# Validate schema structure before use
TestSpec schema validate my-workflow
```

## Tips

- Use `/testspec:explore` to think through an idea before committing to a change
- `/testspec:ff` when you know what you want, `/testspec:continue` when exploring
- During `/testspec:apply`, if something's wrong �?fix the artifact, then continue
- Tasks track progress via checkboxes in `tasks.md`
- Check status anytime: `TestSpec status --change "name"`

## Feedback

This is rough. That's intentional �?we're learning what works.

Found a bug? Have ideas? Join us on [Discord](https://discord.gg/YctCnvvshC) or open an issue on [GitHub](https://github.com/Pluto-AI-Workbench/TestSpec/issues).
