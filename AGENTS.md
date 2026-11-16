# Agents

This repository is Railnet's design system: brand tokens and a shadcn registry consumed by the Risk app and the Railnet app.

- Read `DESIGN.md` before building or changing anything visual: it holds the rules and why they exist.
- Never create a new component, variant, color or token without validation from Noé or Ilies: propose it and wait.
- Read `README.md` for how the registry is installed and released, and for what differs from shadcn's `base-vega`.
- Brand values live in `tokens.css` only; run `bun run build:registry` after changing it or a component.
- Check with `bun run lint` and `bun run typecheck`; `bun run dev` serves the preview.
- Public repository: nothing client-specific, no internal URL.
- When the user corrects a visual choice, propose adding the decision to `DESIGN.md` as a rule with its reason.
