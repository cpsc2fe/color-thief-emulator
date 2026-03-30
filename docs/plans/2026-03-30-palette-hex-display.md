# Palette HEX Display Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update palette cards to display uppercase HEX strings in `#RRGGBB` format instead of `rgb(...)`.

**Architecture:** Keep color formatting in `ImagesColorThiefService` by extending the palette swatch model with `hexText`. Update the standalone root component to render the prepared HEX display value and keep HSB rendering unchanged.

**Tech Stack:** Angular 17 standalone components, TypeScript strict mode, Jasmine/Karma

---

### Task 1: Add failing tests for HEX display formatting

**Files:**
- Modify: `src/app/service/images-color-thief.service.spec.ts`
- Modify: `src/app/app.component.spec.ts`

**Step 1: Write the failing test**

Add assertions that expect:
- `hexText` to exist on palette swatches
- `hexText` to be formatted as uppercase `#RRGGBB`
- the component to render `hexText` instead of `rgb(...)`

**Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/service/images-color-thief.service.spec.ts --include src/app/app.component.spec.ts`
Expected: FAIL because `hexText` does not exist and the template still expects RGB text.

**Step 3: Write minimal implementation**

Add `hexText` to the swatch model, generate it in `ImagesColorThiefService`, and update the root component template to render and copy HEX.

**Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/service/images-color-thief.service.spec.ts --include src/app/app.component.spec.ts`
Expected: PASS

**Step 5: Verify scope**

Confirm:
- HEX is `#RRGGBB`
- HEX letters are uppercase
- HSB rendering is unchanged
