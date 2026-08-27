# Visual thesis: The Study Tape

## Direction

**Cassette-era zine** treats a study day like recording a mixtape: the tape has a fixed length, so every new card must earn its place. The interface combines photocopied editorial texture, chunky tape-label typography, registration marks, and precise utility readouts. This is not nostalgia as filler—the cassette metaphor makes the core model legible: reviews occupy part of today's tape; new cards use the remaining minutes.

The product is intentionally single-mode, like black ink and spot colors on warm stock. This preserves the authored zine character and avoids a generic theme toggle. The background is painted explicitly.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#F3EBD8` | page background |
| Ink | `#171611` | primary text, hard rules |
| Faded ink | `#59564C` | secondary copy (7.0:1 on paper) |
| Tape black | `#24231D` | dark panels |
| Signal orange | `#E05A32` | primary action, current marker |
| Orange ink | `#A92F12` | small accent text (5.6:1 on paper) |
| Acid yellow | `#E8DF51` | selected state and highlight |
| Mint | `#9CC9B7` | safe/complete state |
| Warning | `#8B3A1D` | error copy and danger border |
| White | `#FFFDF7` | text on dark panels |

Solid fills, not gradients. Information never relies on color alone: every status includes words, shape, or pattern.

## Typography

- **Headlines / labels:** `Arial Black`, `Franklin Gothic Heavy`, sans-serif. Uppercase, compressed tracking, cut-paper scale changes.
- **Body / controls:** `Courier New`, `Courier`, monospace. This is a deliberate system stack—fast, offline, and reminiscent of typed liner notes. Body is 16px minimum with 1.55 line height.
- Numeric readouts use tabular figures. Measure stays under 72 characters.

No font downloads are required, keeping the offline shell light and private.

## Spacing and geometry

- Base rhythm: 4px; primary steps: 8, 12, 16, 24, 32, 48, 72.
- Content max width: 1180px. Desktop uses a 7/5 composition; below 800px everything stacks and ornamental registration copy disappears.
- Controls are at least 48px high. Corners are nearly square (0–4px), with offset 3px ink shadows and 2px rules.
- Rotations are restrained to ±1.5 degrees and used only on editorial labels, never form fields or body copy.

## Interaction grammar

- The primary flow is a three-step tape: **Budget → Evidence → Today**. Each step is an actual fieldset so the hierarchy survives without styling.
- Inputs resemble typed track-list cells; selected difficulty buttons become yellow punched labels.
- The result is a dark cassette readout. Its largest value is the safe new-card cap, followed by a visible range and a plain-language uncertainty note.
- “Log today” records actual minutes/cards and immediately feeds the estimate. History rows resemble a cassette J-card track list.
- Errors sit beside the relevant action and are announced. Delete is confirmed; imports are validated before replacing data.
- Offline and update state use small persistent status strips, never blocking the calculation.

## Motion policy

- 180–240ms transitions on transform and opacity only. Buttons depress by removing their offset shadow. The recommendation needle enters from its previous position when inputs change.
- No looping motion or flashing. With `prefers-reduced-motion: reduce`, transitions and transforms are removed and state changes are instant.

## Asset plan and provenance

### Hero: `public/art/study-tape.webp`

- Subject: top-down cassette recorder with a short reel representing reviews and loose index cards feeding toward it, on a photocopied desk.
- World/material: torn newsprint, marker arrows, halftone ink, cassette plastic, paper fibers.
- Light/lens: flat editorial overhead light, slight imperfect print registration, no photographic depth blur.
- Palette words: warm oatmeal paper, carbon black, signal orange, acid yellow, muted mint.
- Negative list: no people, hands, readable words, letters, numbers, logos, brands, watermarks, gradients, glossy 3D, UI screenshot.
- Full prompt: “Use case: stylized-concept. Asset type: landing-page editorial hero. A top-down cassette tape recorder as a metaphor for a fixed daily time budget, one partially wound tape reel and a small fan of blank flashcards feeding toward the cassette slot; torn-paper collage with xerox halftone texture, hand-cut edges, registration marks and marker arrows; 1980s independent zine editorial illustration; warm oatmeal paper, carbon black, signal orange, acid yellow, muted mint; flat overhead light, bold simple silhouette, landscape composition, clear subject centered with calm margins. No people or hands. No readable text, letters, numbers, logos, brands, watermarks, gradients, glossy 3D, or UI screenshot.”
- Generated with the factory Azure image deployment (`/opt/fleet/lib/gen-image.sh`, deployment `factory-image`) on 2026-08-27. Original to this product; generated-image disclosure appears in the footer. Source prompt sidecar is stored under `assets/src/`.

### Native assets

The cassette app icon and small tape/reel marks are hand-authored SVG using the same palette. They contain only geometric primitives and no third-party marks.
