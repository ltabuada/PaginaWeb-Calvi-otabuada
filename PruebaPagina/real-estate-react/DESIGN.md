# Design

<!-- impeccable:design-schema 1 -->

## World

Palette derived from the real isologo (`public/Logo*.png/.jpeg`) — but from its
**proportions**, not just its hues. Measured pixel coverage of `LogoLargo.jpeg`:

| Color | Coverage | Saturation |
|---|---|---|
| teal `#4b9fa1` | **51.4%** | 36% |
| white | 10.4% | — |
| indigo `#130574` | 4.1% | **92%** |
| gold `#eec144` | **0.2%** | 83% |

The previous palette inverted this: indigo (4% of the logo, 92% saturated) ran
every dark section and gold (0.2% of the logo) was used 74 times — 37 of them as
body text. Two highly saturated colors in near-equal measure means no hierarchy,
and indigo+gold together reads as a football club, not an agency.

The current tokens restore the logo's own proportions:

- `--brand` `#1b6f70` — the teal, and the only color that leads. At 36%
  saturation it cannot shout.
- `--brand-dark` `#113f45` / `--brand-deep` `#0b2630` — dark sections, hero, splash
- `--brand-on-dark` `#6fc0c0` — same hue raised for legibility on dark grounds
- `--ink` `#13293d` — text and the darkest surfaces
- `--ink-2` `#55656f` / `--ink-3` `#64727b` — secondary/tertiary text
  (`--ink-3` is pinned at 4.59:1 against `--surface`; don't lighten it)
- `--accent` `#c9a227` — the gold, as a micro-accent only: review stars, the odd
  badge. **Never body text.**
- `--surface` `#f7f6f2`, `--line` `#e4e1d9` — neutrals

Legacy `--navy` / `--gold` names are kept as aliases so ~140 existing
declarations keep working; `--gold` now points at the teal, which is why title
emphasis went from gold to teal in one move.

Rule of thumb: **weight carries hierarchy, color carries one voice.** A heading
is dark ink with a teal emphasis span — never two saturated colors side by side.
On dark sections that emphasis switches to `--brand-on-dark`.

Typography: **Schibsted Grotesk** for everything, one family, hierarchy by
weight. 400/500 for body, 700 with -0.028em tracking for headings. It went
Fraunces → Source Serif 4 → Inter Tight → here: Fraunces read decorative, and
Inter is the single most over-used face in generated interfaces (the detector
flagged it 36 times). Schibsted is drawn for Norwegian press, so it holds both
running text and headlines, and its a/g/R carry character Inter does not.

The two blueprint illustrations were generated in the old gold-on-indigo palette.
Rather than regenerate them, they render with `mix-blend-mode: luminosity` over a
teal ground, so they inherit whatever the palette is.

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

## Motion

**Tesis: la obra se levanta.** El sitio se arma mientras se lo mira, con el
vocabulario que ya tiene la marca: el corte diagonal del isologo, el trazo de
plano y la máscara por la que sube el texto. La pasada anterior había dejado
una sola apertura y nada más; el pedido ahora es lo opuesto (animación
protagonista, estilo Awwards), así que el criterio cambió de *cuánto* a
*cómo*: pocos gestos, siempre los mismos, para que se lean como un solo idioma
y no como efectos sueltos.

Cinco gestos:

| Gesto | Qué hace | Dónde |
|---|---|---|
| **Máscara** | los títulos suben palabra por palabra desde una línea de corte (`Titulo`) | todos los `h1`/`h2`, y el nombre gigante del pie |
| **Cortina** | un barrido descubre la pieza; las fotos llegan agrandadas y se asientan | fotos de servicios y nosotros, tarjetas, reseñas, carteles |
| **Trazo** | una línea se dibuja y el contenido se descubre debajo | filas de servicio, el recorrido de "Cómo trabajamos", barra de búsqueda y cifras del hero |
| **Fondo** | la foto se mueve más lento que su marco (paralaje con `animation-timeline`) | fotos, hero, plano del CTA |
| **Respuesta** | imán en botones; luz que sigue al puntero en tarjetas | solo con mouse real |

Momentos de autor (los que se recuerdan):
- **Apertura + hero.** Los dos cuadrados del isologo se encuentran y la cortina
  se abre en diagonal; detrás, la foto respira (zoom lento) y cada foto nueva
  entra con el mismo corte diagonal en vez de fundirse. Al hacer scroll el
  fondo baja más despacio y el contenido se despide.
- **Cómo trabajamos.** Los cuatro pasos suben en escalera y un trazo los une,
  encendiendo cada círculo numerado cuando la línea llega.
- **Emprendimientos.** Un haz de luz recorre el plano y lo va revelando
  (`@property --scan`).
- **Cintas.** Dos bandas que se cruzan en sentidos opuestos entre propiedades y
  "Nosotros"; se detienen al pasar el mouse.
- **Entre páginas.** View Transitions: la página nueva entra con el corte del
  isologo.

Reglas que se respetan:
- **Visible por defecto.** Todo estado oculto cuelga de `html[data-motion="on"]`,
  que un script del `<head>` activa antes del primer pintado solo si no hay
  `prefers-reduced-motion`. Sin JS o con movimiento reducido nada se oculta y
  lo infinito (cintas, anillo) se detiene.
- **Lo recortado a sí mismo deja 2px y `opacity: 0`.** Un elemento con
  `clip-path` total no cuenta como visible para `IntersectionObserver` y nunca
  recibiría el aviso de entrada (se descubrió en la práctica).
- Se anima `transform`, `opacity`, `clip-path` y propiedades registradas; no
  layout. Un solo observador global (`Movimiento`), listeners pasivos, el
  puntero se lee y se escribe en `rAF` sin mezclar lecturas y escrituras.
- Las transiciones se listan propiedad por propiedad (`--transition` ya no es
  `all`).
- El stagger de listas se corta a tres; los contadores esperan a que la
  cortina de apertura suelte la pantalla.

## Browser surfaces

Selection, caret, scrollbar, focus ring, underline offset and tabular numerals
are themed from the palette rather than left to the browser.

## Assets

- `public/blueprint-edificio.webp`, `public/blueprint-complejo.webp` — generated via Higgsfield (`z_image` model, free-tier), downsized/converted to WebP with `sharp-cli` (~5.5MB/4.2MB PNG → ~200-245KB WebP).
- Real property/office photography from `public/` (no stock imagery).

## Scope boundary

Frontend-only (JSX/CSS). Firebase, contexts, routing, and the Admin panel/login were not redesigned — they inherit the new color tokens for free (shared CSS variables) but keep their existing layout.
