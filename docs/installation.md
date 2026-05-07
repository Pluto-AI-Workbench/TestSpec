# Installation

## Prerequisites

- **Node.js 20.19.0 or higher** â€?Check your version: `node --version`

## Package Managers

### npm

```bash
npm install -g @Pluto-AI-Workbench/TestSpec@latest
```

### pnpm

```bash
pnpm add -g @Pluto-AI-Workbench/TestSpec@latest
```

### yarn

```bash
yarn global add @Pluto-AI-Workbench/TestSpec@latest
```

### bun

Bun can install OpenSpec globally, but OpenSpec currently runs on Node.js.
You still need Node.js 20.19.0 or higher available on `PATH`.

```bash
bun add -g @Pluto-AI-Workbench/TestSpec@latest
```

## Nix

Run TestSpec directly without installation:

```bash
nix run github:Pluto-AI-Workbench/TestSpec -- init
```

Or install to your profile:

```bash
nix profile install github:Pluto-AI-Workbench/TestSpec
```

Or add to your development environment in `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    TestSpec.url = "github:Pluto-AI-Workbench/TestSpec";
  };

  outputs = { nixpkgs, TestSpec, ... }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [ TestSpec.packages.x86_64-linux.default ];
    };
  };
}
```

## Verify Installation

```bash
TestSpec --version
```

## Next Steps

After installing, initialize TestSpec in your project:

```bash
cd your-project
TestSpec init
```

See [Getting Started](getting-started.md) for a full walkthrough.
