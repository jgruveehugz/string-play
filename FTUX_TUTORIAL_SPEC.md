# STRING FTUX Tutorial Interstitials — Design Spec

## Goals

STRING already uses short `coach` and `pressure` copy per level. This system adds richer first-time explanations for new mechanics without interrupting play.

**Design requirements**

- Tutorial appears **between levels**, before the next board becomes playable.
- Tutorial appears only when a mechanic first debuts.
- Tutorial uses **Canvas 2D drawings only**: no image assets, no sprite sheets.
- Player taps **Got it** to continue into the level.
- Each tutorial is shown **once per mechanic**, persisted in save data.
- Tutorials do **not** repeat on restart, replay, or map re-entry after dismissal.
- System coexists with existing splash, result/share card, map/store/settings panels, and coach tips.

---

## Trigger List

Tutorials are keyed by stable mechanic IDs, not by level number. The level number is only the first opportunity to show that ID.

| Level | Level title | Tutorial ID | Mechanic taught | Why here |
|---:|---|---|---|---|
| 1 | Ignition Grid | `piece-ion` | Ion: cyan circle | First collect color and first basic match loop. |
| 2 | Prism Current | `piece-prism` | Prism: pink triangle | Introduces second visual piece identity. |
| 3 | Line Spark | `special-line` | Line special from match-4; tap to arm, tap again to fire row/column | First special-piece goal. |
| 4 | Beam Loan | `piece-quark` | Quark: green square | First Quark collection target. The Line tutorial already covered the seeded Line behavior. |
| 5 | Nova Primer | `special-nova` | Nova from match-5 in a row; clears one color; tap/tap fire | First Nova lesson and authored primer. |
| 6 | Twin Circuit | `piece-pulse` | Pulse: gold square | First Pulse collection target. |
| 7 | Toolkit Relay | `piece-core` | Core: orange hex | First Core collection target. |
| 8 | Cascade Signal | `mechanic-chain` | Chain/cascade: one clear drops into another | First chain objective. |
| 9 | Echo Chamber | `piece-atom` | Atom: violet atom | First Atom collection target. |
| 9 | Echo Chamber | `obstacle-producer` | Producer: fixed node spawns a goal-colored piece every move | First Producer layout. Show after Atom if both are unseen. |
| 11 | Shield Debut | `obstacle-shield` | Shield/Flux: wall cell; pieces fall through; match beside to break | First shield goal/layout. |
| 12 | Shield Current | `obstacle-reinforced-shield` | Gold Shield/Flux: takes 2 hits | First `strength: 2` shield. |
| 13 | Shield Forge | `mechanic-fusion` | Fusion: swap adjacent specials to combine effects | First adjacent seeded specials. Teach before players discover it accidentally. |
| 14 | Creep Debut | `obstacle-creep` | Spreader/Creep: infection spreads every 3 moves; match infected cell to clear | First spreader goal/layout. |
| 18 | Bomb Shape | `special-bomb` | Bomb from L/T match-5; clears about 5x5 | First Bomb lesson. |
| 22 | Seeker Lock | `special-seeker` | Seeker from 2x2 match-4; flies to hardest objective | First Seeker starter/tutorial level. |
| 32 | Overdrive Primer | `mechanic-overdrive` | Overdrive: rapid matching fills pulse meter | First Overdrive objective. |

### Trigger ordering when multiple tutorials debut on one level

- A level may map to more than one tutorial ID. Example: level 9 has `piece-atom` and `obstacle-producer`.
- Show a **stacked queue** before the level starts.
- Present one card at a time. `Got it` advances to the next queued card; the final `Got it` starts the level.
- Maximum recommended stack size: 2. If future content debuts more than 2 mechanics on a level, split the level design or defer lower-priority tutorials.

---

## Tutorial Content Model

Each tutorial entry should be data-driven so content can be edited without touching flow logic.

Recommended fields:

| Field | Purpose |
|---|---|
| `id` | Stable save key, e.g. `special-line`. Never rename after shipping without migration. |
| `level` | First level that can trigger this tutorial. |
| `eyebrow` | Small label: `NEW PIECE`, `NEW SPECIAL`, `NEW OBSTACLE`, `NEW TECHNIQUE`. |
| `title` | Short title: `Line`, `Producer`, `Overdrive`. |
| `body` | 2–3 short sentences. Richer than coach text, but still under ~180 characters. |
| `bullets` | Optional 1–3 concise rules. |
| `drawKind` | Names the Canvas illustration routine, e.g. `drawLineTutorial`. |
| `priority` | Order when multiple tutorials trigger on the same level. Lower first. |
| `continueLabel` | Usually `Got it`. May be `Next` when more tutorial cards remain, but keep the primary button position identical. |

### Copy direction

Use confident, action-oriented copy. Avoid long lore. Every card should answer:

1. What is it?
2. How do I create/clear/use it?
3. Why does it matter for the next level?

Examples:

- **Line**: “Match 4 in a row to create a Line. Tap it once to arm the beam, then tap again to clear the full row or column.”
- **Shield/Flux**: “Shields are wall cells. Pieces fall through them, but you cannot match the wall itself. Match beside a shield to crack it open.”
- **Producer**: “A Producer is fixed in place. After every move, it converts a nearby piece into the goal color.”

---

## Screen Layout

The interstitial should feel like part of STRING’s existing neon UI, not a separate browser modal.

### Overall structure

Use a full-screen overlay above the game canvas and below/above existing HTML panels as appropriate.

```
┌────────────────────────────────────┐
│ dimmed live game/map/result bg      │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ EYEBROW                      │  │
│  │ Title                        │  │
│  │                              │  │
│  │ [ Canvas illustration ]      │  │
│  │                              │  │
│  │ Body copy                    │  │
│  │ • Rule 1                     │  │
│  │ • Rule 2                     │  │
│  │                              │  │
│  │ [ Got it ]        [Skip?]    │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### Responsive sizing

- **Phone portrait**
  - Card width: `min(view.width - 32, 420)`.
  - Illustration area: 70–110 px tall for piece cards, 130–170 px for mechanics/obstacles.
  - Button height: minimum 48 px.
- **Tablet/desktop**
  - Card width: 480–560 px.
  - Illustration area: 180–240 px.
  - Keep card centered with max-height guard and scroll body only if needed.

### Visual hierarchy

1. **Eyebrow**: uppercase, cyan/gold, small.
2. **Title**: large, white, 24–32 px depending on viewport.
3. **Canvas illustration**: central, framed by subtle rounded rect or glow.
4. **Body**: 15–17 px, high contrast.
5. **Bullets**: smaller, muted white/cyan.
6. **Got it**: primary CTA, full width on phone, right-aligned on wide screens.
7. **Skip/dismiss**: tertiary text button, smaller, not visually competing with Got it.

### Background handling

- Dim current background with translucent black/navy scrim.
- Freeze board input and suppress coach toasts while tutorial is open.
- Existing music can continue softly; no new required audio behavior.
- Keep HUD visible but visually de-emphasized under the scrim, or hide it if current panel conventions do that.

---

## Canvas Illustration Specs

All illustrations are simple Canvas 2D primitives. They should be deterministic, cheap to draw, and reusable in the game’s existing render loop or in a dedicated tutorial canvas.

### Shared drawing primitives

Use shared helper concepts already implied by the game’s visual language:

- `drawMiniBoard(rows, cols)`: rounded dark cells with thin neon grid lines.
- `drawPiece(type, x, y, size)`: uses the six existing visual identities:
  - Ion: cyan circle
  - Prism: pink triangle
  - Quark: green square
  - Pulse: gold square
  - Core: orange hex
  - Atom: violet atom icon/rings
- `drawArrow(x1, y1, x2, y2)`: motion or transformation arrow.
- `drawGlowRect` / `drawPulseRing`: highlight target cells.
- `drawTapBadge`: small fingertip circle with `1` / `2` for tap-to-arm and tap-to-fire.

### Piece tutorials

For each piece card:

- Draw the piece large in center-left.
- Draw a three-match row of the same piece on center-right.
- Add a small `x3 = collect` indicator.
- Use the exact silhouette and color from gameplay.

Piece-specific notes:

- `piece-ion`: cyan circles; intro to matching/collecting.
- `piece-prism`: pink triangles; “same rule, new shape.”
- `piece-quark`: green squares; avoid confusing with Creep by using normal Quark green, not acid Creep overlay.
- `piece-pulse`: gold squares; visually tie to pulse meter later but do not teach Overdrive yet.
- `piece-core`: orange hexes; six-sided outline so it reads distinct from squares.
- `piece-atom`: violet atom rings; if Producer tutorial follows, show Atom as “goal-colored piece Producer creates.”

### Special tutorials

#### Line (`special-line`)

Draw sequence:

1. Mini 5x5 board with four matching pieces in a row.
2. Arrow to a Line special with a horizontal or vertical beam mark.
3. Tap badge `1` on Line: “arm”.
4. Tap badge `2` with a bright full-row/full-column beam.
5. Fade cleared row/column cells.

Key visual: a full row/column beam extending across the mini-board.

#### Nova (`special-nova`)

Draw sequence:

1. Five same-color pieces in a straight line.
2. Arrow to glowing Nova orb.
3. Tap badge `1`, then `2`.
4. Several pieces of one color across the board glow and dissolve.

Key visual: all one color targeted, not a local blast.

#### Bomb (`special-bomb`)

Draw sequence:

1. L or T shaped five-piece match highlighted.
2. Arrow to Bomb special.
3. Circular blast radius covering roughly a 5x5 footprint.
4. Center cells brighten; outer cells fade.

Key visual: area blast centered on the Bomb.

#### Seeker (`special-seeker`)

Draw sequence:

1. 2x2 square of same-color pieces highlighted.
2. Arrow to Seeker special.
3. Curved flight path from Seeker to the “hardest objective”: reinforced shield, creep, or goal chip.
4. Impact star on target.

Key visual: pathfinding/targeting, not row/area clearing.

### Obstacle tutorials

#### Shield/Flux (`obstacle-shield`)

Draw sequence:

1. Mini board with gray/blue shield cell in the middle.
2. Pieces above/below drawn with downward arrows through the shield to communicate “pieces fall through it.”
3. Highlight an adjacent 3-match touching the shield.
4. Crack lines on shield after match.
5. Open cell shown after break.

Key visual: match beside it, not on it.

#### Reinforced Shield (`obstacle-reinforced-shield`)

Draw sequence:

1. Gold shield with `2` small pips or two armor rings.
2. First adjacent match removes one pip and cracks it.
3. Second adjacent match breaks it open.

Key visual: two-hit state, not a new obstacle family.

#### Creep/Spreader (`obstacle-creep`)

Draw sequence:

1. Green infection overlay on one piece.
2. Small move counter: `Move 1`, `Move 2`, `Move 3`.
3. On `Move 3`, infection spreads to a neighbor.
4. Highlight a match including the infected cell; overlay disappears.

Key visual: clear infected cells before the 3-move spread tick.

#### Producer (`obstacle-producer`)

Draw sequence:

1. Fixed node in center cell, visually not swappable.
2. “Every move” pulse ring emitted from node.
3. Neighbor piece converts into the current goal color, e.g. violet Atom on level 9.
4. Tiny goal chip indicator beside converted piece.

Key visual: Producer helps by creating goal-colored pieces, but occupies space.

### Mechanic tutorials

#### Chain/Cascade (`mechanic-chain`)

Draw sequence:

1. Top half: first match clears with `Clear 1` label.
2. Pieces fall down using downward arrows.
3. Bottom half: new auto-match forms with `Clear 2` label.
4. Chain counter increments `CHAIN x2`.

Key visual: one player move, multiple clears.

#### Fusion (`mechanic-fusion`)

Draw sequence:

1. Two adjacent specials highlighted.
2. Swap arrow between them.
3. Combined effect preview: for level 13, two Lines create crossed beams; for generic future, label “combined effect.”
4. Big merged glow at swap point.

Key visual: swap specials together; do not tap/fire separately first.

#### Overdrive (`mechanic-overdrive`)

Draw sequence:

1. Pulse meter at bottom of illustration.
2. Three rapid match flashes in sequence.
3. Meter fills with each match.
4. Overdrive ready state: meter glows, button/indicator pulses.

Key visual: speed/tempo fills the meter faster.

---

## Data Model / Save State

Tutorial state should live with campaign progression so it migrates and resets consistently with player progress.

### Save shape

Add a new field to campaign save:

```text
campaignSave.tutorials = {
  seen: {
    "piece-ion": true,
    "special-line": true,
    ...
  },
  skippedAll: false,
  version: 1
}
```

### Normalization rules

- Missing `tutorials` means old save: initialize `{ seen: {}, skippedAll: false, version: 1 }`.
- Only known tutorial IDs should be persisted or read. Ignore unknown keys to avoid save bloat.
- `seen[id] === true` means never show that tutorial again.
- `skippedAll === true` means do not show any future tutorial interstitials, but coach tips may still run.

### Persistence timing

Mark a tutorial as seen **when the player dismisses the card**, before the next level starts.

Rationale:

- If the player closes the app after tapping `Got it`, they should not see the same card again.
- If the app crashes while the card is merely visible, it is acceptable to show it again because the player did not confirm reading it.

### Reset behavior

- Full progress reset should clear `campaignSave.tutorials` along with campaign save.
- Restarting a level should not clear or re-evaluate tutorial state.
- Replaying a completed level from the map should not show seen tutorials.

---

## Runtime State

Use a small runtime controller for interstitial flow.

Recommended transient state:

| Field | Purpose |
|---|---|
| `activeTutorial` | Currently displayed tutorial entry or null. |
| `tutorialQueue` | Pending entries for the next level. |
| `pendingTutorialLevelIndex` | Level index to start after queue completes. |
| `tutorialReturnAction` | Usually `start-level`; may be `return-map` if opened from reference/help later. |
| `tutorialPanelOpen` | Input/modal guard. |

Runtime state should not be saved except `seen`/`skippedAll`.

---

## Code Integration Points

This section names where the design should hook into the existing single-file game. It intentionally describes integration behavior, not JavaScript implementation.

### 1. Campaign save read/write

Existing functions found in `main.js`:

- `readCampaignSave()` reads `neon-lattice-campaign` from localStorage.
- `defaultCampaignSave()` creates a new campaign save.
- `writeCampaignSave()` persists `campaignSave`.

Add tutorial normalization beside existing save normalization fields (`missions`, `streak`, `daily`, `event`, `attempts`, `hums`).

Required additions:

- Include `tutorials: normalizeTutorialState(parsed.tutorials)` in `readCampaignSave()`.
- Include `tutorials: normalizeTutorialState(null)` in `defaultCampaignSave()`.
- Save through existing `writeCampaignSave()` after each dismiss/skip.

### 2. Starting a campaign level

Existing entry point:

- `newBoard()` delegates campaign starts to `startLevel(currentLevelIndex)`.
- `startLevel(index)` closes share/map/store/settings panels, registers attempts, builds the board, queues coach tips, updates HUD, and starts gameplay.

Recommended flow change:

- Introduce a wrapper conceptually named `requestStartLevel(index, source)`.
- All campaign transitions that currently call `startLevel(index)` should call the wrapper unless they are internal retries after tutorial completion.
- The wrapper checks tutorial triggers for the target level before `startLevel` registers an attempt or builds the board.

Why before `startLevel`:

- Prevents the tutorial from counting as a level attempt.
- Prevents a board from becoming briefly playable behind the tutorial.
- Lets the interstitial truly occur between levels.

Flow:

1. Player taps next level / result card continues / map selects unlocked level.
2. `requestStartLevel(index, source)` computes unseen tutorials for that level.
3. If none, call `startLevel(index)` immediately.
4. If one or more, open tutorial queue and store `pendingTutorialLevelIndex = index`.
5. When queue completes, call `startLevel(pendingTutorialLevelIndex)` exactly once.

### 3. Result/share card continue

Existing game flow includes result/share panels and a `closeShareCard()` call inside `startLevel()`.

Expected behavior:

- On win, result/share card remains the end-of-level moment.
- When the player chooses to continue to the next level, tutorial interstitial appears **after** result/share is dismissed and **before** next board starts.
- If a tutorial is queued, suppress coach tips until after the tutorial is dismissed and the board has started.

### 4. Map level selection

If the player selects an unlocked level from the map:

- If that level contains an unseen debut tutorial, show it before starting the level.
- If the tutorial has already been seen, start immediately.
- If the player selected a replay of an old level and the tutorial was already seen, do not show it.

### 5. Restart / retry current level

Restart and fail-retry paths should bypass the tutorial wrapper or pass a `source = restart` flag that suppresses tutorials.

Reason:

- Requirement: tutorials do not repeat on restart.
- A failed first attempt should not show the same tutorial again when retrying, because it was marked seen on `Got it` before the first attempt.

### 6. Coach panel interaction

Existing coach system includes:

- `coachSeen`
- `coachQueue`
- `activeCoachTip`
- `showNextCoachTip()`
- `parkActiveCoachTip()`
- `coachPanel`

Tutorial overlay rules:

- Call/perform the equivalent of `parkActiveCoachTip()` before opening tutorial.
- While tutorial is open, `showNextCoachTip()` should early-return/retry later.
- After final `Got it` starts the level, normal `queueLevelCoachTips(currentLevel.id)` and `showNextCoachTip()` behavior resumes.
- Do not mark coach tips as seen because a tutorial displayed; the systems are separate.

### 7. Input guard

When `tutorialPanelOpen` is true:

- Block board pointer input.
- Block booster activation.
- Block keyboard shortcuts that affect gameplay, restart, or debug level navigation.
- Allow only tutorial UI controls: `Got it`, `Skip all tutorials`, optional close/dismiss.

### 8. Rendering hook

Two acceptable implementation approaches:

#### Preferred: HTML overlay panel + dedicated tutorial canvas

- Add a `tutorialPanel` HTML overlay following the existing panel conventions.
- Add a child `<canvas>` for the illustration.
- Draw the tutorial illustration into that canvas when the panel opens and on resize.
- Benefits: simple input, accessibility labels, reuses panel CSS, does not affect main game render loop.

#### Alternative: draw tutorial directly on main game canvas

- Add a modal render layer after normal game draw.
- Define button hit rects in canvas coordinates.
- Requires more custom hit-testing and accessibility work.

Given the existing game already has HTML panels for splash, HUD, mission objectives, share cards, menu, map, store, settings, and coach tips, the **HTML overlay + tutorial canvas** approach fits best.

---

## Got It Button Behavior

Primary button: `Got it`.

On tap/click/Enter/Space:

1. Mark current tutorial ID as seen in `campaignSave.tutorials.seen`.
2. Persist with `writeCampaignSave()` immediately.
3. Remove current tutorial from `tutorialQueue`.
4. If another tutorial is queued for the same level:
   - Render next tutorial card.
   - Button may still say `Got it`; optionally say `Next` until final card.
5. If queue is empty:
   - Close tutorial panel.
   - Clear runtime tutorial state.
   - Start the pending level through the internal start path.

### Debounce

- Disable the button immediately on activation until the next card is drawn or the panel is closed.
- Prevent double-tap from starting the level twice.

### Accessibility

- Focus `Got it` when the panel opens.
- Escape should map to dismiss/skip behavior defined below, not silently start gameplay.
- Panel should use modal semantics if implemented as HTML.

---

## Skip / Dismiss Handling

The system should support two levels of dismissal:

### 1. Dismiss current tutorial

Control: small `Skip` or `Close` text button.

Behavior:

- Treat as “I do not need this card.”
- Mark only the current tutorial ID as seen.
- Persist immediately.
- Continue to next queued tutorial, or start the level if queue is empty.

Reason: this satisfies “only shows once” and prevents annoying replays.

### 2. Skip all future tutorials

Control: secondary text link, preferably behind confirmation:

- `Skip all tutorials`
- Confirmation: `Skip all tutorial cards? Coach tips will still appear.`

Behavior on confirm:

- Set `campaignSave.tutorials.skippedAll = true`.
- Mark current tutorial as seen or simply close queue; either is fine because `skippedAll` suppresses all future tutorials.
- Persist immediately.
- Close panel and start pending level.

### Escape / outside click

- Escape should open the same confirmation as `Skip all tutorials` **or** act like `Skip` for the current card. Prefer current-card skip to avoid trapping players.
- Outside click should not dismiss by default on mobile; accidental taps should not skip teaching.
- Browser back / app background should leave save unchanged unless a button was pressed.

---

## Tutorial Trigger Resolution

A tutorial should be shown only if all are true:

1. Game mode is campaign.
2. Level ID has a tutorial trigger.
3. `campaignSave.tutorials.skippedAll !== true`.
4. Tutorial ID is not already seen.
5. Start source is not `restart`/`retry`.
6. No higher-priority blocking panel is open, except result/share/map panels that are being intentionally dismissed as part of continue.

### Pseudoflow in words

- `getTutorialsForLevel(levelId)` returns authored tutorial IDs for that level.
- `getUnseenTutorialsForLevel(levelId)` filters by save state.
- `requestStartLevel(index, source)` checks `getUnseenTutorialsForLevel`.
- If the array is empty, start level normally.
- If not empty, open queue.

---

## Interaction With Existing Onboarding Copy

Keep `coach` and `pressure` lines. They become tactical reminders rather than full explanations.

Recommended relationship:

- Tutorial interstitial: “What this mechanic is and how it works.”
- Coach line: “What to do on this specific level.”
- Pressure line: “Why this level is tense / what to prioritize.”

Example for level 11:

- Tutorial: explains Shield/Flux rules.
- Coach: “Shields are solid walls. Pieces fall through them. Match right beside a wall to break it open.”
- Pressure: “You can't match a wall. Clear next to it to break it, then the cell opens up.”

This avoids deleting existing copy and keeps short in-level nudges useful.

---

## Edge Cases

### App closes while tutorial is open

- If player did not tap any tutorial control, do not mark seen.
- On next launch / level start, show it again.

### Player taps Got it then app closes before level starts

- Seen was already persisted.
- On next launch, level can start without tutorial.

### Multiple triggers on same level, app closes after first Got it

- First tutorial remains seen.
- Remaining unseen tutorial(s) still show next time that level is started.

### Old save already past tutorial levels

Options:

- Recommended: do not retroactively show all missed tutorials. Only evaluate tutorial triggers when starting a level that owns the trigger.
- If a returning player jumps to level 32 and has never seen `mechanic-overdrive`, show Overdrive because it is the current level’s debut.
- Do not backfill level 1–31 tutorials in a batch.

### Debug next/previous level buttons

- In DEBUG mode, allow a modifier or debug setting to bypass tutorials.
- Default debug level navigation should still be able to surface tutorials for QA.

---

## QA Checklist

- Fresh save: level 1 shows Ion tutorial before the board is playable.
- Tap `Got it`: level 1 starts; localStorage contains `tutorials.seen["piece-ion"] = true`.
- Restart level 1: Ion tutorial does not show.
- Replay level 1 from map: Ion tutorial does not show.
- Fresh save through level 9: Atom tutorial shows, then Producer tutorial shows, then level starts.
- Close app on Producer card before tapping: Atom remains seen; Producer shows again next time.
- Level 11 Shield tutorial blocks board input until dismissed.
- Level 12 Reinforced Shield tutorial is separate and only appears once.
- Level 13 Fusion tutorial appears before the seeded adjacent specials are playable.
- Level 14 Creep tutorial explains 3-move spread and clear-by-match.
- Level 22 Seeker tutorial path points to a hard objective.
- Level 32 Overdrive tutorial appears once and does not reappear on fail/retry.
- `Skip all tutorials` suppresses future tutorial interstitials but does not disable coach tips.
- Existing splash, result/share, map, store, settings, and coach panels still open/close normally.

---

## Implementation Notes / Non-goals

- Do not implement interactive mini-games inside the tutorial. These are explanatory interstitials only.
- Do not pause mid-level to explain a mechanic.
- Do not add external art assets.
- Do not merge tutorial seen state with `coachSeen`; tutorial cards and coach tips have different lifecycles.
- Do not count an attempt until after tutorials are dismissed and the level truly starts.
