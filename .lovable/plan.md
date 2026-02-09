

# Add "Create New Series" to Admin Studio

## What changes
Add a "New Series" button to the `StudioImagesManager` component so you can create series directly from the Studio panel without having to navigate to the separate Series Manager section.

## How it works
- A "+" button will be added next to the "Manage Studio" header
- Clicking it shows an inline input field to type the new series name
- On submit (Enter or click confirm), it creates the series using the existing `useCreateSeries` hook
- The new series appears immediately in the list (React Query invalidation already handles this)

## Technical details

### File to modify: `src/components/admin/StudioImagesManager.tsx`
- Import `useCreateSeries` from `@/hooks/useSeriesMutations`
- Add state for `showNewSeries` (boolean) and `newSeriesName` (string)
- Add a `Plus` button in the header area next to the series/images count
- When toggled, show a small inline form (Input + confirm/cancel buttons) above the series list
- On submit, call `createMutation.mutateAsync({ name, description: null, display_order: allSeries.length })` 
- Reset state after success

No new components, hooks, or database changes needed -- everything required already exists (`useCreateSeries`, the `series` table, and RLS policies).
