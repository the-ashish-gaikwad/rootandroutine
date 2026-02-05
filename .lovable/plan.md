

# Mobile-First Responsive Redesign

## Summary
Make the study tracker fully responsive for mobile devices, remove the unnecessary Session History component (keeping export/clear functionality), and keep the headerless design you prefer.

---

## Changes Overview

### 1. Remove Session History Component
- Delete the SessionHistory card from the layout
- Move **Export Data** and **Clear All Data** buttons to a small actions bar below the chart or as icons in the footer
- Keep the delete session functionality accessible through the chart tooltip (optional enhancement)

### 2. Simplify Layout Structure
**New mobile-first grid layout:**
- **Stats Cards**: 2x2 grid (already works well)
- **Chart + Controls**: Full width, responsive height
- **Timer + Manual Entry + Subjects**: Stack vertically on mobile, 2 columns on tablet, stay compact on desktop

### 3. Fix Responsive Breakpoints

**Current problem:**
- Grid jumps from 1 column (mobile) directly to 3 columns (large screens)
- No intermediate layout for tablets

**Solution:**
```
Mobile (< 640px):    1 column - everything stacked
Tablet (640-1024px): 2 columns - Timer+Manual | Subjects
Desktop (> 1024px):  2 columns - same, more horizontal space
```

### 4. Chart Responsiveness
- Reduce chart height on mobile: `h-[280px] sm:h-[350px] lg:h-[400px]`
- Adjust chart margins for smaller screens
- Make legend text smaller on mobile

### 5. Chart Controls Mobile Fix
- Stack controls vertically on very small screens
- Use `flex-col sm:flex-row` for the view/mode toggles

### 6. Touch-Friendly Improvements
- Ensure all tap targets are at least 44x44px
- Add slightly more padding on mobile
- Delete buttons always visible on mobile (no hover state needed)

---

## Technical Details

### Files to Modify

**src/pages/Index.tsx**
- Remove SessionHistory import and component
- Remove empty header element
- Change grid from `lg:grid-cols-3` to `sm:grid-cols-2` with 2 columns
- Add export/clear actions in a small utility bar

**src/components/StudyChart.tsx**
- Change fixed `h-[400px]` to responsive `h-[280px] sm:h-[350px] lg:h-[400px]`
- Adjust chart margins: `margin={{ top: 10, right: 40, left: 25, bottom: 10 }}` on mobile
- Smaller font sizes for mobile axis labels

**src/components/ChartControls.tsx**
- Add `flex-col sm:flex-row` for mobile stacking
- Center controls on mobile

**src/components/SubjectManager.tsx**
- Make delete button always visible on touch devices using `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`

**src/components/StatsCards.tsx**
- Already responsive, minor padding adjustments if needed

### New Component: DataActions (or inline in Index)
Small action buttons for Export and Clear All Data - can be placed:
- Option A: Below the chart as small text buttons
- Option B: In the footer alongside the "data stored locally" text
- Option C: As a small dropdown menu icon

---

## Proposed New Layout

```text
+------------------------------------------+
|           Stats (2x2 grid)               |
+------------------------------------------+
|         Chart Controls (stacked          |
|           on mobile)                     |
+------------------------------------------+
|                                          |
|          Study Chart                     |
|        (shorter on mobile)               |
|                                          |
+------------------------------------------+
|    [Export]  [Clear All]  (small btns)   |
+------------------------------------------+
|  Study Timer    |     Subjects           |
|-----------------|------------------------|
|  Log Session    |     (2-col on tablet+) |
+------------------------------------------+
|              Footer                      |
+------------------------------------------+
```

On mobile (single column):
```text
Stats (2x2)
Chart Controls
Chart
Actions
Timer
Log Session
Subjects
Footer
```

