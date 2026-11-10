# Railnet UI

Railnet brand tokens and a [shadcn registry](https://ui.shadcn.com/docs/registry) of `base-vega` components (Base UI). Tokens are shared; a component you add is yours to change. Preview: https://external.railnet.app/ui/

## Install

Pin a release tag:

```bash
bunx shadcn@latest add railnetorg/ui/railnet-theme#v0.4.0
bunx shadcn@latest add railnetorg/ui/button#v0.4.0 railnetorg/ui/dialog#v0.4.0
```

- Icons follow the `iconLibrary` of your `components.json`.
- Radix app: take the theme, keep your components.
- Tailwind without shadcn: import `tokens.css` and `theme.css` from the tag.
- Plain CSS: import `tokens.css` and use the variables.
- Monorepo: point `tailwind.css` in `components.json` at the shared stylesheet.

**Fonts.** The theme installs Inter Tight; remove the font `shadcn init` added. ABC Marist is licensed and never lives here: serve it from your app at `/fonts/ABCMarist-Regular.otf`.

**Update.** Re-run `add` with the new tag and `--diff`. Copied components never change on their own.

**Releases.** Semver: patch changes a value, minor adds, major renames or removes.

## Changes to Vega

Components follow shadcn's `base-vega` style, except:

- **Badge**: adds `brand`, `success` and `error` variants.
- **Alert**: adds an amber variant.
- **Card**: a `border` in the brand's border color instead of Vega's grey ring.
- **Combobox**: the item renders its own row, with Vega's classes on it.
- **Drawer**: built on vaul instead of Base UI's drawer; corners follow Vega.
- **Table**: cells keep `px-3 py-3.5` instead of Vega's `p-2`, for dense data tables.

Anything else that differs from `base-vega` is a bug.

## Contributing

- Brand values live in `tokens.css` only. Run `bun run build:registry` afterwards; CI fails if `registry.json` or `theme.css` are stale.
- Add a component with `bunx shadcn add <name>`, then `bun run build:registry`.
- Icons are `<IconPlaceholder>` with the names from shadcn's `base` registry; add new Hugeicons ones to `registry/components/icon-placeholder.tsx`.
- Theme CSS rules take one selector each: shadcn duplicates `a, b` rules on update.
- Public repo: nothing client-specific, no internal URL.
- `bun run dev`, `bun run lint`, `bun run typecheck`.
