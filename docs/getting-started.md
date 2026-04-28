# Getting Started

This guide explains how TestSpec works after you've installed and initialized it. For installation instructions, see the [main README](../README.md#quick-start).

## How It Works

TestSpec helps you and your AI coding assistant agree on what to build before any code is written.

**Default quick path (core profile):**

```text
/testspec:propose ──�?/testspec:apply ──�?/testspec:archive
```

**Expanded path (custom workflow selection):**

```text
/testspec:new ──�?/testspec:ff or /testspec:continue ──�?/testspec:apply ──�?/testspec:verify ──�?/testspec:archive
```

The default global profile is `core`, which includes `propose`, `explore`, `apply`, and `archive`. You can enable the expanded workflow commands with `TestSpec config profile` and then `TestSpec update`.

## What TestSpec Creates

After running `TestSpec init`, your project has this structure:

```
TestSpec/
├── specs/              # Source of truth (your system's behavior)
�?  └── <domain>/
�?      └── spec.md
├── changes/            # Proposed updates (one folder per change)
�?  └── <change-name>/
�?      ├── proposal.md
�?      ├── design.md
�?      ├── tasks.md
�?      └── specs/      # Delta specs (what's changing)
�?          └── <domain>/
�?              └── spec.md
└── config.yaml         # Project configuration (optional)
```

**Two key directories:**

- **`specs/`** - The source of truth. These specs describe how your system currently behaves. Organized by domain (e.g., `specs/auth/`, `specs/payments/`).

- **`changes/`** - Proposed modifications. Each change gets its own folder with all related artifacts. When a change is complete, its specs merge into the main `specs/` directory.

## Understanding Artifacts

Each change folder contains artifacts that guide the work:

| Artifact | Purpose |
|----------|---------|
| `proposal.md` | The "why" and "what" - captures intent, scope, and approach |
| `specs/` | Delta specs showing ADDED/MODIFIED/REMOVED requirements |
| `design.md` | The "how" - technical approach and architecture decisions |
| `tasks.md` | Implementation checklist with checkboxes |

**Artifacts build on each other:**

```
proposal ──�?specs ──�?design ──�?tasks ──�?implement
   �?          �?         �?                   �?
   └───────────┴──────────┴────────────────────�?
            update as you learn
```

You can always go back and refine earlier artifacts as you learn more during implementation.

## How Delta Specs Work

Delta specs are the key concept in TestSpec. They show what's changing relative to your current specs.

### The Format

Delta specs use sections to indicate the type of change:

```markdown
# Delta for Auth

## ADDED Requirements

### Requirement: Two-Factor Authentication
The system MUST require a second factor during login.

#### Scenario: OTP required
- GIVEN a user with 2FA enabled
- WHEN the user submits valid credentials
- THEN an OTP challenge is presented

## MODIFIED Requirements

### Requirement: Session Timeout
The system SHALL expire sessions after 30 minutes of inactivity.
(Previously: 60 minutes)

#### Scenario: Idle timeout
- GIVEN an authenticated session
- WHEN 30 minutes pass without activity
- THEN the session is invalidated

## REMOVED Requirements

### Requirement: Remember Me
(Deprecated in favor of 2FA)
```

### What Happens on Archive

When you archive a change:

1. **ADDED** requirements are appended to the main spec
2. **MODIFIED** requirements replace the existing version
3. **REMOVED** requirements are deleted from the main spec

The change folder moves to `TestSpec/changes/archive/` for audit history.

## Example: Your First Change

Let's walk through adding dark mode to an application.

### 1. Start the Change (Default)

```text
You: /testspec:propose add-dark-mode

AI:  Created TestSpec/changes/add-dark-mode/
     �?proposal.md �?why we're doing this, what's changing
     �?specs/       �?requirements and scenarios
     �?design.md    �?technical approach
     �?tasks.md     �?implementation checklist
     Ready for implementation!
```

If you've enabled the expanded workflow profile, you can also do this as two steps: `/testspec:new` then `/testspec:ff` (or `/testspec:continue` incrementally).

### 2. What Gets Created

**proposal.md** - Captures the intent:

```markdown
# Proposal: Add Dark Mode

## Intent
Users have requested a dark mode option to reduce eye strain
during nighttime usage.

## Scope
- Add theme toggle in settings
- Support system preference detection
- Persist preference in localStorage

## Approach
Use CSS custom properties for theming with a React context
for state management.
```

**specs/ui/spec.md** - Delta showing new requirements:

```markdown
# Delta for UI

## ADDED Requirements

### Requirement: Theme Selection
The system SHALL allow users to choose between light and dark themes.

#### Scenario: Manual toggle
- GIVEN a user on any page
- WHEN the user clicks the theme toggle
- THEN the theme switches immediately
- AND the preference persists across sessions

#### Scenario: System preference
- GIVEN a user with no saved preference
- WHEN the application loads
- THEN the system's preferred color scheme is used
```

**tasks.md** - Implementation checklist:

```markdown
# Tasks

## 1. Theme Infrastructure
- [ ] 1.1 Create ThemeContext with light/dark state
- [ ] 1.2 Add CSS custom properties for colors
- [ ] 1.3 Implement localStorage persistence

## 2. UI Components
- [ ] 2.1 Create ThemeToggle component
- [ ] 2.2 Add toggle to settings page
- [ ] 2.3 Update Header to include quick toggle

## 3. Styling
- [ ] 3.1 Define dark theme color palette
- [ ] 3.2 Update components to use CSS variables
```

### 3. Implement

```
You: /testspec:apply

AI:  Working through tasks...
     �?1.1 Created ThemeContext with light/dark state
     �?1.2 Added CSS custom properties to globals.css
     �?1.3 Implemented localStorage persistence
     �?2.1 Created ThemeToggle component
     ...
     All tasks complete!
```

During implementation, if you discover the design needs adjustment, just update the artifact and continue.

### 4. Archive

```
You: /testspec:archive

AI:  Archiving add-dark-mode...
     �?Merged specs into TestSpec/specs/ui/spec.md
     �?Moved to TestSpec/changes/archive/2025-01-24-add-dark-mode/
     Done! Ready for the next feature.
```

Your delta specs are now part of the main specs, documenting how your system works.

## Verifying and Reviewing

Use the CLI to check on your changes:

```bash
# List active changes
TestSpec list

# View change details
TestSpec show add-dark-mode

# Validate spec formatting
TestSpec validate add-dark-mode

# Interactive dashboard
TestSpec view
```

## Next Steps

- [Workflows](workflows.md) - Common patterns and when to use each command
- [Commands](commands.md) - Full reference for all slash commands
- [Concepts](concepts.md) - Deeper understanding of specs, changes, and schemas
- [Customization](customization.md) - Make TestSpec work your way
