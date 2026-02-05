

# Chart Legend, Button Placement & Session Deletion

## Summary
Three improvements to enhance the study tracker's usability:
1. Show subjects as a legend below the chart (visible in all modes, not just stacked)
2. Move Export/Clear All buttons to the footer for a cleaner layout
3. Add a new "Recent Sessions" section with the ability to delete individual sessions

---

## 1. Subject Legend Below Chart

**Current behavior**: Subject colors only show below the chart when in "stacked" mode

**New behavior**: 
- Always display subject legend at the bottom of the chart area
- Show all user-created subjects with their color dots and names
- Helps users understand what subjects they're tracking at a glance

**Location**: Inside the StudyChart component, below the bar chart

---

## 2. Relocate Export & Clear All Buttons

**Current location**: Centered action buttons below the chart

**New location**: Footer area, alongside the "data stored locally" text

**Layout**:
```text
+--------------------------------------------------+
| Your data is stored locally.  [Export] [Clear All]|
+--------------------------------------------------+
```

This keeps the main content area cleaner and groups data management actions together.

---

## 3. Recent Sessions with Delete Option

**New component**: A compact "Recent Sessions" card showing the last 5-10 logged sessions

**Features**:
- Displays session list: subject color dot, subject name, date, and duration
- Delete button (trash icon) for each session with confirmation dialog
- Scrollable if many sessions exist
- Shows "No sessions yet" empty state

**Placement**: Below the Timer and Manual Entry cards in the left column

---

## Technical Details

### Files to Modify

**src/components/StudyChart.tsx**
- Remove the `mode === 'stacked'` condition from the legend
- Always show subject legend when `subjects.length > 0`

**src/pages/Index.tsx**
- Remove the data actions section (Export/Clear All buttons) from current location
- Add Export and Clear All buttons to the footer
- Import and add RecentSessions component
- Wire up the deleteSession handler

**New file: src/components/RecentSessions.tsx**
- Create a compact card component
- Accept props: sessions, subjects, onDeleteSession
- Display sorted sessions (newest first), limited to ~8 items
- Each session row shows:
  - Color dot for subject
  - Subject name
  - Date (e.g., "Feb 5")
  - Duration (e.g., "45min")
  - Trash icon button with AlertDialog confirmation

### Layout Structure (Updated)

```text
Stats (2x2)
Chart Controls
Chart + Subject Legend (always visible)
-----------------------------------------
Timer         |  Subjects
Log Session   |
Recent Sessions (with delete)
-----------------------------------------
Footer: [text] [Export] [Clear All]
```

On mobile, everything stacks vertically.

