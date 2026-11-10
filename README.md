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

- **Badge**: adds `brand`, `success` (the `--success` green) and `error` variants.
- **Alert**: adds an amber variant.
- **Card**: a `border` in the brand's border color instead of Vega's grey ring; it clips with `overflow-clip`, so a sticky table header inside it still sticks.
- **Combobox**: the item renders its own row, with Vega's classes on it.
- **Drawer**: built on vaul instead of Base UI's drawer; corners follow Vega.
- **Table**: Railnet's own table, below.

Anything else that differs from `base-vega` is a bug.

## Table

Every table in every app looks the same because the component draws all of it. Never wrap a table in a frame, never give its header a background or a sticky position, never restyle its text: if a table needs something the component doesn't do, add it here.

- **`<Table>`** draws its frame (border, `rounded-xl`, card background). `frame={false}` drops it for a table already inside a card. Wider than the screen, it scrolls sideways under 768px; `scroll` makes it scroll at every width.
- **Header**: white, grey titles at 14px, the only weight change in the table, sticky to the top of the page. Set `--table-sticky-top` on a parent when a bar is fixed above it.
- **Cells**: 14px, regular, black, left-aligned, figures included. `<TableCell numeric>` gives figures equal-width digits. A line under a value is 12px. Addresses are plain text.
- **Logos and icons** in a cell are an `Avatar`, drawn at 20px; an icon goes inside one.
- **`<TableRow nested>`** (or `nested={2}`) is a row under the one above it; put `<TableTreeLine last? depth? parentContinues? />` in its first cell to tie it to its parent. The last nested row closes the group with a line.
- **`<TableFooter>`** holds a total row. **`<TableEmpty colSpan>`** and **`<TableLoading columns rows?>`** cover a table with nothing to show yet.
- **`<TablePagination page pageCount onPageChange>`** sits under the table, with an optional count as its child. Pass `previousLabel`, `nextLabel` and `label` in the app's language.

## Choosing a switch

- **Another view of the same content** (TVL / Share price, APY 7D / 30D, Bubble / Table, 1Y / 5Y): `Tabs`, its default segmented list.
- **A setting on or off** (Favorites, Show risk): `Toggle`, or a yes/no filter.
- **Several options picked together, or a formatting control**: `ToggleGroup`.
- **More than four or five choices**: `Select`.

Primary red is for the main action of a screen, never for the selected state of a switch.

## Filters

`filter` is the filter bar every list uses: `FilterSearch` and one pill per active filter (`FilterSelect`, `FilterRange`, `FilterPill` for a yes/no) on the left, `FilterClear` and the icon-only `FilterMenu` pinned right, inside `FilterBar`. A pill opens the same `FilterOptionList` as the menu's submenu. `MultiFilterSelect` is superseded by `filter` and will be removed once no app uses it.

## Contributing

- Brand values live in `tokens.css` only. Run `bun run build:registry` afterwards; CI fails if `registry.json` or `theme.css` are stale.
- Add a component with `bunx shadcn add <name>`, then `bun run build:registry`.
- Icons are `<IconPlaceholder>` with the names from shadcn's `base` registry; add new Hugeicons ones to `registry/components/icon-placeholder.tsx`.
- Theme CSS rules take one selector each: shadcn duplicates `a, b` rules on update.
- Public repo: nothing client-specific, no internal URL.
- `bun run dev`, `bun run lint`, `bun run typecheck`.
