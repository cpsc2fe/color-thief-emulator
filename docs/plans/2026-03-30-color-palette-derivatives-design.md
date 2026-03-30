# Color Palette Derivatives Design

**Date:** 2026-03-30

**Goal:** Extend the existing image palette extractor so each extracted color reports HSB, is sorted by color ratio, and carries derived `card` and `body` colors.

## Context

The current application extracts a palette from an uploaded image by sampling pixels from a canvas and passing those pixels to `quantize`. The UI renders a flat list of colors as RGB and HEX values only.

The new requirement keeps `quantize` as the source of the original palette, but replaces the flat `number[][]` rendering model with a structured view model per extracted color.

## Decisions

### 1. Keep palette extraction in the existing service

`ImagesColorThiefService` remains the source of truth for:
- pixel sampling
- palette extraction
- color ratio calculation
- RGB/HSB conversion
- derived color generation

This keeps color logic out of the component and avoids turning the component into a transformation layer.

### 2. Sort only original colors

Each extracted color becomes a record with:
- `original`
- `card`
- `body`

Only `original` participates in sorting. `card` and `body` are derived after the original entry is known and remain attached to that entry.

Stable sorting is required. If two colors have the same ratio, their original quantize order is preserved.

### 3. Use HSB/HSV as the display color space

Displayed HSB values:
- `H`: `0-360`
- `S`: `0-100`
- `B`: `0-100`

All HSB values are rounded to integers before display and before derived color generation.

Formatting rules:
- `rgb(r, g, b)`
- `hsb(h, s, b)`
- lowercase only
- one space after each comma

### 4. Derive colors from HSB, not RGB heuristics

Per original color:
- `original`: derived from extracted RGB
- `card`: `H = original.H`, `S = 70`, `B = 22`
- `body`: `H = card.H`, `S = card.S`, `B = round(card.B * 0.6)`

Both derived colors are converted back to RGB for display swatches and `rgb(...)` text.

## Data Model

The flat `number[][]` palette will be replaced by a structured model:

- palette entry
  - `original`
    - `rgb`
    - `hsb`
    - `rgbText`
    - `hsbText`
    - `ratio`
    - `ratioText`
  - `card`
    - `rgb`
    - `hsb`
    - `rgbText`
    - `hsbText`
  - `body`
    - `rgb`
    - `hsb`
    - `rgbText`
    - `hsbText`

## UI Design

The palette section remains a grid. Each grid item becomes one palette card containing three stacked rows:

1. `original`
2. `card`
3. `body`

Each row shows:
- role label
- swatch
- `rgb(...)`
- `hsb(...)`

Only the `original` row also shows ratio.

## Error Handling

- Invalid `colorCount` and `quality` behavior stays as-is.
- If `quantize` returns no colors, the UI shows no palette cards.
- Ratio calculation uses the same sampled pixel set used for quantization so sorting reflects the actual extraction input.

## Testing Strategy

Add focused unit tests for service behavior:
- RGB to HSB conversion rounds correctly
- derived `card` and `body` HSB values match the spec
- ratio sorting is descending
- equal ratios keep original order
- formatted strings use lowercase and correct spacing

Component behavior is kept thin, so service-level tests carry the main regression coverage.
