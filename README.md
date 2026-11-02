# Railnet UI

Railnet's brand tokens and a [shadcn registry](https://ui.shadcn.com/docs/registry) of base components (shadcn `base-maia` on Base UI, Hugeicons), installed straight from this repo.

- **Tokens are shared.** Colors (light and dark), fonts, radius and typography utilities come from `tokens.css`, the only place a brand value is written.
- **Components are yours.** `shadcn add` copies a component into your app once; from then on your team owns it and changes it freely.
- **Browse** the components in light and dark: https://external.railnet.app/ui/

## Install

Pin a release tag (`#v0.3.0`) so every app knows which brand version it carries.

### React + shadcn

```bash
bunx shadcn@latest add railnetorg/ui/railnet-theme#v0.3.0
bunx shadcn@latest add railnetorg/ui/button#v0.3.0 railnetorg/ui/dialog#v0.3.0
```

The theme writes the tokens into your CSS file (`:root`, `.dark`, `@theme inline`) and adds the typography utilities (`text-stat`, `text-label`, `text-section-label`, `text-body-lg`, `text-uppercase`). A component's own dependencies on other Railnet components resolve from `main`.

Components are built for the `base-maia` style (Base UI, Hugeicons). On a Radix or lucide app, take the theme and keep your own components.

### Tailwind v4 without shadcn

Copy `tokens.css` and `theme.css` from the tag into your app and import both:

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./theme.css";
```

To use the registry components there too, run `bunx shadcn@latest init` first: they need `tw-animate-css` and `shadcn/tailwind.css` (animations and `data-*` variants), which init installs and imports.

### Plain CSS (static pages, Astro without Tailwind, React 18 decks)

Copy `tokens.css` from the tag and use the variables (`var(--primary)`, `var(--font-sans)`…). To refresh it:

```bash
curl -fsSL https://raw.githubusercontent.com/railnetorg/ui/v0.3.0/tokens.css -o tokens.css
```

### Mintlify

Copy the brand colors from `tokens.css` into `docs.json` `colors` by hand; they rarely change.

## Fonts

- **Inter Tight** (sans): `railnet-theme` installs it through the `inter-tight` item (`@fontsource-variable/inter-tight`). Without shadcn, `bun add @fontsource-variable/inter-tight` and `@import "@fontsource-variable/inter-tight";`.
- `shadcn init` adds its own font import (Geist, Figtree…): remove it once the theme is installed.
- **ABC Marist** (serif) is licensed and never lives in this repo. Serve the file from your app at `/fonts/ABCMarist-Regular.otf`. `theme.css` declares the `@font-face`; on a shadcn app, add the block from `theme.css` to your CSS.

## Update to a new release

1. Re-run the install command with the new tag (`#v0.3.0`), adding `--diff` to see what changes first.
2. Let your coding agent merge the diff with your local changes, then review it in your PR.

Components you already copied are never updated for you: take a new version only if you want it.

## Releases

Tags follow semver:

- **patch**: a token value changes;
- **minor**: a token, utility or component is added;
- **major**: a token or utility is renamed or removed.

Each release is announced in Slack with what changed.

## Contributing

- A brand value changes in `tokens.css` only. Run `bun run build:registry`, which regenerates `registry.json` and `theme.css` (CI fails when they are out of date).
- Add a component with `bunx shadcn add <name>` (writes to `registry/components/ui/`), then `bun run build:registry`.
- `bun run dev` opens the preview; `bun run lint` and `bun run typecheck` before a PR.
- To see ABC Marist in the preview, copy the licensed file to `preview/public/fonts/ABCMarist-Regular.otf` (git-ignored, never published).
- This repo is public: nothing client-specific, no internal URL, no partner name. Product components stay in their apps.
