# Palette HEX Display Design

**Date:** 2026-03-30

**Goal:** Replace palette RGB display text with uppercase HEX strings in `#RRGGBB` format while keeping HSB output unchanged.

## Context

The current palette card renders `rgb(...)` text and `hsb(...)` text for `original`, `card`, and `body`. The new requirement changes the first display value to HEX and requires uppercase letters.

## Decision

Keep formatting logic in `ImagesColorThiefService` so the component continues to render prepared display values instead of formatting colors in the template.

`PaletteSwatch` will gain:
- `hexText`

Formatting rules:
- `#RRGGBB`
- uppercase hex digits only

## UI Impact

Each palette row will render:
- role label
- ratio on the `original` row only
- `hexText`
- `hsbText`

Click-to-copy will use `hexText` for the first value and `hsbText` for the second.

## Testing

Add focused regression coverage for:
- service HEX formatting output
- component rendering the HEX string instead of `rgb(...)`
- uppercase output such as `#0C2238`
