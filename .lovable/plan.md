

# Dynamic Subject Indicators Below Chart

## Summary
Update the subject legend at the bottom of the chart to use a cleaner horizontal bullet layout with smart overflow handling - showing names when there are 5 or fewer subjects, and only colored bullets when there are more than 5.

---

## Current Implementation
The chart already displays subject indicators at the bottom with color dots and names. This update will enhance the design with conditional labeling logic and improved positioning.

---

## Changes

### 1. Update Legend Layout & Positioning
**Location**: Directly below the chart's X-axis (hours axis)

**New styling**:
- Horizontal flex layout with centered alignment
- Clean, evenly-spaced bullet indicators
- Responsive gap spacing (`gap-3 sm:gap-4`)
- Proper margin separation from the chart above

### 2. Conditional Labeling Logic
**Rules**:
- **5 or fewer subjects**: Show colored bullet + subject name
- **More than 5 subjects**: Show only colored bullets (no names) to prevent clutter

This prevents UI overflow when users have many subjects while maintaining full visibility when the count is manageable.

### 3. Bullet Styling
- Clean circular dots using consistent sizing (`w-3 h-3`)
- Colors pulled from the existing `colorToHex` mapping
- Tooltip on hover showing subject name (for when names are hidden)
- Consistent with the pastel bullet journal aesthetic

---

## Technical Details

### File to Modify: `src/components/StudyChart.tsx`

**Update the legend section** (lines 243-255):
- Add a `showLabels` computed variable: `subjects.length <= 5`
- Update the flex layout for better horizontal spacing
- Conditionally render subject names based on `showLabels`
- Add `title` attribute to bullet divs for tooltip when names are hidden
- Adjust gap and sizing for responsive design

**New logic structure**:
```text
const showLabels = subjects.length <= 5;

{subjects.length > 0 && (
  <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4 justify-center px-4">
    {subjects.map((subject) => (
      <div 
        key={subject.id} 
        className="flex items-center gap-1.5"
        title={!showLabels ? subject.name : undefined}
      >
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: colorToHex[subject.color] }}
        />
        {showLabels && (
          <span className="text-xs sm:text-sm text-muted-foreground">
            {subject.name}
          </span>
        )}
      </div>
    ))}
  </div>
)}
```

### Visual Behavior

**5 or fewer subjects**:
```text
●  Math   ●  Science   ●  English   ●  History
```

**More than 5 subjects**:
```text
●  ●  ●  ●  ●  ●  ●  ●
(hover on any bullet to see subject name)
```

---

## Design Consistency
- Uses existing `colorToHex` mapping from `@/types/study`
- Maintains pastel color palette
- Follows the notebook/bullet journal aesthetic
- Responsive sizing matches other chart elements
- Uses existing Tailwind utility classes

