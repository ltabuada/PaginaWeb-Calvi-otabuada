# Design

<!-- impeccable:design-schema 1 -->

## World

Palette sampled directly from the real isologo (`public/Logo*.png/.jpeg`), not invented:

- `--navy` `#150b7a` — true brand indigo (headings, primary sections, buttons)
- `--navy-2` `#0e0850` / `--navy-3` `#2e2196` — gradient/accent variants
- `--navy-deep` `#0a052e` — only for full-bleed drama (hero overlay, splash)
- `--gold` `#c79a3a` / `--gold-light` `#e4bb63` / `--gold-dark` `#93701f` — refined metallic gold (buttons, accents, text highlights)
- `--gold-bright` `#f5b90e` — true vivid marigold from the logo, reserved for the brand-mark motif and small high-impact pops
- `--teal` `#0e7c7d` / `--teal-light` / `--teal-dark` — third brand color, sampled from the agency's real storefront signage and `LogoCircular`/`LogoLargo`; used sparingly as a signature accent (hero overlay tail, "en construcción" badges) since it's real brand identity the previous CSS ignored entirely
- Neutrals: `--cream` `#faf8f3`, `--text` `#1a1730` (indigo-tinted near-black)

Typography: Fraunces (display/serif headings) + Inter (UI/body). Fraunces replaced Playfair Display as a more distinctive editorial serif.

Recurring brand motif: a small CSS/SVG reproduction of the isologo's own mark (two overlapping offset squares, gold seam) appears before every `.section-tag` label — ties every section back to the real logo geometry instead of a generic icon.

## Structural form

Direction: **diagonal / overlap continuous flow** (surface concept-seed key `81449884`, candidate 6/7 of the grounded list). Rejects the flat "stack of uniform card-grid sections" template:

- Hero: asymmetric, left-aligned content over a diagonal-clipped full-bleed photo (not centered).
- Servicios: categorías + servicios merged into one editorial two-column layout (diagonal photo panel + numbered list), replacing two redundant uniform 4-card grids.
- Emprendimientos: AI-generated gold-on-indigo architectural blueprint illustration (`blueprint-edificio.webp`, via Higgsfield/z_image) as a diagonal-clipped backdrop behind glass-morphism stat cards.
- Destacadas: asymmetric bento (1 large featured listing + 2 stacked side listings) instead of a uniform 3-card grid; graceful empty state added.
- Cómo trabajamos: ascending diagonal "staircase" (steps offset via `--stagger` custom property) instead of 4 equal boxes in a row.
- Testimonios: the featured review is raised/scaled instead of sitting flush in a uniform grid.
- CTA banner: second AI-generated blueprint illustration (`blueprint-complejo.webp`) as background texture.
- Section seams use matched `clip-path: polygon(...)` cuts + negative margins (hero↔servicios pair uses the same 90px value on both sides so the diagonal nests without a gap).

## Assets

- `public/blueprint-edificio.webp`, `public/blueprint-complejo.webp` — generated via Higgsfield (`z_image` model, free-tier), downsized/converted to WebP with `sharp-cli` (~5.5MB/4.2MB PNG → ~200-245KB WebP).
- Real property/office photography from `public/` (no stock imagery).

## Scope boundary

Frontend-only (JSX/CSS). Firebase, contexts, routing, and the Admin panel/login were not redesigned — they inherit the new color tokens for free (shared CSS variables) but keep their existing layout.
