# Railnet design rules

What good looks like in Railnet's apps (the Risk app and the Railnet app). One rule per line, its reason right after it. When a rule doesn't cover a case, follow the reasons; when a value or a choice isn't decided here, ask before inventing one.

Each correction to an agent or a screen becomes a new rule here.

## Before adding anything

- **No new component, variant, color, token, or other design-system element is created or invented until Noé or Ilies validates it.**
  The system stays coherent only if every addition is a decision, not a guess; propose it, with why the existing pieces don't fit, and wait for their answer.

## Tokens

- **Take every color, radius and font from the tokens (`tokens.css`), never a hex or a Tailwind palette color (`amber-500`, `gray-200`).**
  Changing a token then changes every app at once, and nothing drifts.
- **In components, use the semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`), not the palette (`--gray-75`, `--deep-red`).**
  The semantic name says what the value is for; the palette is only there to feed it.
- **A color that isn't in the palette gets a new palette step first (as `--gray-75` did), then a semantic token points at it.**
  The palette stays the only place where hex values live.
- **Spacing and text sizes come from Tailwind's scale (`p-3`, `gap-2`, `text-sm`), never arbitrary values (`p-[13px]`, `text-[13.5px]`).**
  Odd values pile up unnoticed and the screens stop lining up.
- **Radii follow shadcn's scale (`--radius` 0.625rem, `rounded-sm` to `rounded-4xl`); a component keeps the radius it ships with.**
  The scale is decided; per-screen radius tweaks make the product look assembled from parts.

| Token | Use it for |
| --- | --- |
| `background` / `foreground` | The page and its text (soft black). |
| `card` | Surfaces that sit on the page: cards, tables, the table header. |
| `muted-foreground` | Secondary text: labels, column titles, hints. Never for values in a table. |
| `muted` / `accent` | Quiet fills: hover rows, selected items, nested table rows. |
| `border` | Every divider and frame. |
| `input` | The border of text fields and outline buttons (same grey as `border`). |
| `primary` (deep red) | The main action of a screen. |
| `secondary` | Dark buttons that aren't the main action. |
| `destructive` (rust) | Deleting, errors. |
| `success` | A finished or healthy state, nothing decorative. |
| `chart-1` … `chart-5` | Chart series, in that order. |

Not decided yet, ask first: a `warning` token (Alert's amber variant still uses Tailwind's amber), and a `success` value taken from the palette.

## Components

- **Use the registry component; if it lacks something, add it to this repository, not to the app.**
  A fix made in one app leaves the other app behind.
- **Components follow shadcn's `base-vega` style; the only exceptions are listed in the README under "Changes to Vega".**
  Anything else that differs from Vega is a bug, not a variant.
- **Only use what exists in `registry/components/ui`; never assume a variant or prop that isn't in the file.**
  An invented variant compiles in one place and breaks in the next.
- **`MultiFilterSelect` is superseded: use `filter`.**
  It will be removed once no app uses it.
- **Icons are `<IconPlaceholder>` in the registry; the app's icon library renders them.**
  Each app keeps its own icon set without forking the components.

## Buttons and fields

- **Primary red is for the main action of a screen, never for the selected state of a switch, a tab or a filter.**
  Red says "do this"; using it for state makes the main action harder to find.
- **An outline button changes only its background on hover; its border stays.**
  The border is the button's shape, it shouldn't flicker.
- **Text fields have the same border as outline buttons (`input`).**
  Controls that sit side by side in a bar should read as one family.

## Choosing a switch

- **Another view of the same content (TVL / Share price, 7D / 30D, 1Y / 5Y): `Tabs`.**
  The content stays the same; only the angle changes.
- **A setting on or off (Favorites, Show risk): `Toggle`, or a yes/no filter.**
- **Several options picked together, or a formatting control: `ToggleGroup`.**
- **More than four or five choices: `Select`.**
  A row of six segments no longer fits or reads.

## Tables

- **Every table is the registry `Table`; never wrap it in a frame, give its header a background or position, or restyle its text.**
  Every table in both apps should read identically; the component draws all of it.
- **`frame={false}` only when the table already sits in a card.**
  Otherwise two borders stack.
- **Cell text is 14px, regular weight, black (`text-foreground`); a line under a value is 12px, regular.**
  One size and one color keep long tables calm to scan.
- **The only weight change in a table is the column titles (grey, 14px, medium); no bold name column, no bold total.**
  Bold inside the body competes with the header and with itself.
- **Every column is left-aligned, figures included; `numeric` only gives equal-width digits.**
  One alignment everywhere reads more consistently; right-aligned figures were tried and dropped.
- **Addresses (wallet, contract, transaction) are ordinary text: same font and size as the row, never monospace.**
  An address is a value like any other in the row.
- **Logos and icons in a cell are an `Avatar`, drawn at 20px; an icon goes inside an Avatar.**
  Mixed icon sizes and ad-hoc circles were the most visible difference between tables.
- **Rows under a parent row use `nested` (depth 1 or 2) with a `TableTreeLine` in the first cell.**
  The tree line and the closing border show where a group ends.
- **Every table handles its empty and loading states with `TableEmpty` and `TableLoading`, and pages with `TablePagination` (labels in the app's language).**
  A table without them shows a blank box or a jump while it loads.

## Filters

- **Every list filters with `filter`: search and active pills on the left, clear and the icon-only filter menu pinned right, inside `FilterBar`.**
  Filters should work the same way on every list of both apps.
- **A pill exists only while its filter is active; filters are added from the menu.**
  A bar of empty pills is noise.
- **The filter menu button is always icon-only, and its submenus open on hover.**

## States

- **Every block that loads data has a loading, an empty and an error state.**
  A blank area looks broken, not empty.
