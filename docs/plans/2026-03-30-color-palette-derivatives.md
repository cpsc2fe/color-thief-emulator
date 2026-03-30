# Color Palette Derivatives Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add HSB output, ratio-based original color sorting, and `card` / `body` derived colors to the palette extraction flow.

**Architecture:** Keep extraction and color transformation logic inside `ImagesColorThiefService`, and update the standalone root component to render a structured palette-entry model. Use service unit tests to drive the color math, sorting, and formatting changes before touching production logic.

**Tech Stack:** Angular 17 standalone components, TypeScript strict mode, Jasmine/Karma, canvas image sampling, `quantize`

---

### Task 1: Define the structured palette models

**Files:**
- Modify: `src/app/service/images-color-thief.model.ts`
- Test: `src/app/service/images-color-thief.service.spec.ts`

**Step 1: Write the failing test**

Write a spec that expects the extraction result to expose `original`, `card`, and `body` objects with HSB and display strings.

**Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/service/images-color-thief.service.spec.ts`
Expected: FAIL because the structured return type and related fields do not exist.

**Step 3: Write minimal implementation**

Add interfaces for:
- RGB color
- HSB color
- palette swatch display model
- palette entry model

**Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/service/images-color-thief.service.spec.ts`
Expected: PASS for the model shape assertions still being compiled by the spec.

**Step 5: Commit**

```bash
git add src/app/service/images-color-thief.model.ts src/app/service/images-color-thief.service.spec.ts
git commit -m "test: define palette entry models"
```

### Task 2: Add failing service tests for HSB and derived colors

**Files:**
- Create: `src/app/service/images-color-thief.service.spec.ts`
- Modify: `src/app/service/images-color-thief.service.ts`

**Step 1: Write the failing test**

Add tests covering:
- RGB to HSB integer rounding
- derived `card` uses `S = 70`, `B = 22`
- derived `body` uses `round(card.B * 0.6)`
- display strings use lowercase `rgb(...)` and `hsb(...)`

**Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/service/images-color-thief.service.spec.ts`
Expected: FAIL with missing conversion or builder methods.

**Step 3: Write minimal implementation**

Implement RGB/HSB conversion helpers and a palette-entry builder that creates `original`, `card`, and `body`.

**Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/service/images-color-thief.service.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/service/images-color-thief.service.ts src/app/service/images-color-thief.service.spec.ts
git commit -m "feat: add derived palette colors"
```

### Task 3: Add failing service tests for ratio sorting

**Files:**
- Modify: `src/app/service/images-color-thief.service.spec.ts`
- Modify: `src/app/service/images-color-thief.service.ts`

**Step 1: Write the failing test**

Add tests that verify:
- original colors sort by ratio descending
- equal ratios keep original order

Use direct helper-level tests with stub palette entries so the spec is deterministic.

**Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/service/images-color-thief.service.spec.ts`
Expected: FAIL because sorting helpers do not exist or do not preserve stable order.

**Step 3: Write minimal implementation**

Add ratio counting against sampled pixels and apply a stable descending sort before derived colors are returned.

**Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/service/images-color-thief.service.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/service/images-color-thief.service.ts src/app/service/images-color-thief.service.spec.ts
git commit -m "feat: sort palette by ratio"
```

### Task 4: Update the root component to render the new structure

**Files:**
- Modify: `src/app/app.component.ts`
- Modify: `src/app/app.component.html`
- Modify: `src/app/app.component.scss`

**Step 1: Write the failing test**

Add or adapt a component spec that expects one palette card to render `original`, `card`, `body`, plus ratio and HSB text.

**Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/app.component.spec.ts`
Expected: FAIL because the template still expects `number[][]`.

**Step 3: Write minimal implementation**

Update the component state to use structured palette entries, remove obsolete RGB formatting helpers that are now service-driven, and render the three-row card layout.

**Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/app.component.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/app.component.ts src/app/app.component.html src/app/app.component.scss src/app/app.component.spec.ts
git commit -m "feat: render structured palette cards"
```

### Task 5: Run final verification

**Files:**
- Verify: `src/app/service/images-color-thief.service.ts`
- Verify: `src/app/app.component.ts`
- Verify: `src/app/app.component.html`
- Verify: `src/app/app.component.scss`

**Step 1: Run targeted tests**

Run: `npm test -- --watch=false --include src/app/service/images-color-thief.service.spec.ts --include src/app/app.component.spec.ts`
Expected: PASS

**Step 2: Run build**

Run: `npm run build`
Expected: PASS with production build output

**Step 3: Review requirements**

Confirm:
- HSB is displayed for each role
- original colors sort by ratio descending
- equal ratios keep input order
- `card` and `body` do not sort independently
- display strings match lowercase formatting

**Step 4: Commit**

```bash
git add src/app/service/images-color-thief.service.ts src/app/service/images-color-thief.model.ts src/app/app.component.ts src/app/app.component.html src/app/app.component.scss src/app/service/images-color-thief.service.spec.ts src/app/app.component.spec.ts
git commit -m "feat: add palette derivatives and hsb output"
```
