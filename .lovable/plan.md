

# 📚 Interactive Study Tracker - Implementation Plan

## Overview
A beautiful, bullet journal-inspired study tracker web app with a pastel minimalist aesthetic. All data stays private in your browser's local storage - no account needed!

---

## 🎨 Visual Design
- **Open notebook aesthetic** with dotted/grid paper background
- **Soft pastel color palette** (mint, lavender, peach, soft pink, light blue)
- Clean, handwritten-style typography for headers
- Subtle paper texture and page shadows for that journal feel

---

## 📊 Main Dashboard Features

### Dynamic Bar Chart
- Horizontal bars showing study hours (just like your reference images)
- **Toggle between views**: Daily (days 1-31), Weekly, and Monthly summaries
- **Two display modes**:
  - Stacked bars (see breakdown by subject with different colors)
  - Simple bars (total hours per day in a single color)
- Time labels displayed at the end of each bar (e.g., "6h 15min")

### Statistics Panel
- Total hours studied (today/this week/this month)
- Optional study streak counter
- Optional daily/weekly goals with progress indicators

---

## ⏱️ Study Session Logging

### Timer Mode
- Start/stop button to track study sessions in real-time
- Subject selector dropdown (pick from your custom subjects)
- Pause and resume functionality
- Session summary when you stop

### Manual Entry Mode
- Quick form to log past sessions
- Select subject, date, and duration
- Perfect for logging sessions you forgot to time

---

## 📝 Subject Management
- Add your own custom subjects (Math, Biology, History, etc.)
- Assign each subject a unique pastel color
- Edit or delete subjects anytime
- Subjects persist in local storage

---

## 🗄️ Data Management
- **View History**: See all logged sessions in a clean list
- **Edit Sessions**: Modify any past entry
- **Delete Sessions**: Remove individual entries
- **Clear All Data**: Reset everything with confirmation
- **Export Data**: Download your data as JSON for backup

---

## 📱 Responsive Design
- Works beautifully on desktop and mobile
- Touch-friendly controls for mobile devices
- Charts adapt to screen size

---

## 🔒 Privacy & Security
- All data stored locally in your browser (localStorage)
- No accounts, no servers, no tracking
- XSS protection with proper input sanitization
- Data stays on your device

