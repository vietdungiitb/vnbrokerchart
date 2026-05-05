# S-5: GoCharting-Style Settings Dialog

**Status:** Canonical implementation spec

## Goal

Replace the old right-side settings panel with a modal settings dialog opened from a gear icon in the top-right topbar cluster, next to the theme toggle. The dialog is the single source of truth for indicator configuration, pane layout, and optional template selection.

## Non-Negotiables

- The gear icon is the primary entry point for settings.
- Do not keep the old right-side settings panel as the primary UX.
- Indicator add/edit flows must require a Y-axis choice: `left` or `right`.
- Indicator add/remove, Y-axis changes, and pane visibility changes must redraw immediately.
- Max visible panes must be configurable in the dialog and persisted.
- Theme changes must apply to the whole shell, not just the chart canvas.

## Dialog Layout

The dialog should feel close to GoCharting: a modal overlay, centered card, strong header, and a left rail for navigation.

Suggested sections:

- Theme
- Layout
- Indicators
- Data
- Templates
- Reset

Implementation guidance:

- Keep the modal wide enough for pane-level editing, but allow vertical scroll.
- Closing the modal should not require a full page reload.
- Changes should write through immediately rather than staying in an unsaved draft state.
- If the modal is extracted into a local component, keep it inside `src/demo` so the demo slice stays self-contained.

## Layout Tab

The Layout tab is the pane manager.

It must provide:

- A list of all registered panes.
- A visible/hidden toggle for each pane.
- Reorder affordances for visible panes.
- A `maxVisiblePanes` control, persisted in demo settings.
- A clear distinction between pinned panes and regular panes.

Suggested behavior:

- `price` remains pinned and cannot be hidden or removed.
- `maxVisiblePanes` defaults to 5, but the control must allow changing it at runtime.
- If the user lowers `maxVisiblePanes`, the UI should prevent adding new visible panes until the count is back under the limit.
- Restoring a hidden pane should preserve its previous height ratio.

## Pane Inspector

Each pane card in the dialog acts as a pane-local inspector.

The inspector must show:

- The pane title and pinned state.
- The current indicator list for that pane.
- Add / edit / remove controls for indicators in that pane.
- A per-indicator Y-axis selector that is always explicit.
- A per-indicator template selector when the registry supports more than one render mode.

Mandatory rules:

- A new indicator cannot be committed until `yAxis` is selected.
- The default `yAxis` should come from the registry, but the user must be able to override it before saving.
- If a pane contains series on both axes, `splitScale` must be enabled so the renderer creates the correct chart slots.
- Removing the last visible series from a non-pinned pane should hide that pane automatically.

## Indicator Composer

The add/edit flow should reuse the same composer UI so the behavior is consistent.

Required fields:

- Indicator type
- Y-axis: `left` / `right`
- Template: `line`, `bar`, `area`, `histogram`, or other registry-supported modes
- Params from the indicator schema
- Optional color override

Behavior rules:

- Changing Y-axis should immediately update the pane layout.
- Changing template should re-render the indicator with the new series renderer.
- If the registry only supports one template, hide the template field.
- If a custom indicator exposes multiple data shapes, the composer should default to the registry’s preferred template.

## Runtime Update Rules

The following changes must redraw immediately:

- Add indicator
- Remove indicator
- Toggle indicator visibility
- Change indicator Y-axis
- Change pane visibility
- Change `maxVisiblePanes`
- Reorder panes

Recommended implementation detail:

- Make `DynamicChart` depend on the current pane config and a small `chartRevision` counter so the chart tree is rebuilt when the settings dialog commits a structural change.
- Keep data enrichment and pane layout separate so the settings dialog can update the structural slice without waiting for a full data reload.

## Data Model Notes

At minimum, the runtime state needs:

```ts
interface DemoSettings {
  maxVisiblePanes: number;
  settingsOpen: boolean;
  activePaneId?: string;
}

type YAxisSide = "left" | "right";

interface IndicatorDraft {
  type: string;
  yAxis: YAxisSide;
  template?: string;
  params: Record<string, unknown>;
  color?: string;
}
```

The existing pane model should continue to carry:

- `visible`
- `pinned`
- `heightRatio`
- `series`
- `splitScale`

## Suggested Implementation Touchpoints

- `src/demo/LibraryShowcaseDemo.tsx` for the top-right gear icon and dialog wiring.
- `src/demo/demo.css` for the modal shell and pane inspector styling.
- `src/lib/core/hooks/useDynamicPanes.ts` for max-pane enforcement and pane mutations.
- `src/lib/core/types/pane-descriptor.ts` for any new indicator fields required by the dialog.
- `src/lib/core/DynamicChart.tsx` for immediate rerender behavior when pane or indicator structure changes.
- `src/lib/core/SeriesPicker.tsx` or an equivalent pane-inspector helper for the composer UI.
- `src/lib/core/IndicatorLegend.tsx` if the legend needs to expose Y-axis or template context.

## Stretch Goal: Custom Indicator Templates

If time allows, support custom indicator templates beyond the built-in overlay series.

Desired shape:

- Registry entries may declare supported render modes such as `line`, `bar`, `area`, or `histogram`.
- Custom indicators may provide an external data source key plus a renderer template.
- The composer should expose template selection only when the registry advertises multiple options.
- Every custom indicator must still choose a Y-axis.

This stretch should be documented as optional, but the data model should leave room for it so the team does not need to redesign the dialog later.

## Acceptance Criteria

- Gear icon is visible in the top-right cluster next to theme.
- Gear icon opens the settings modal.
- No primary right-side settings panel remains.
- Indicator add/edit flow always includes an explicit Y-axis choice.
- Pane-local inspector can add, edit, and remove indicators.
- `maxVisiblePanes` is adjustable and persisted.
- Add/remove/update actions redraw immediately.
- Custom template support is documented as an optional extension path.
- The dialog and chart shell remain responsive on desktop and mobile widths.
