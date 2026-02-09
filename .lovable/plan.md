

# Privacy-Friendly Monitoring, Error Logging, and Feedback

## Overview

Add three layers of developer insight to the app -- all privacy-first:

1. **Cookieless analytics** via Plausible (hosted, no cookies, no PII) for pageviews and custom events
2. **Anonymous error logging** to a Supabase `error_logs` table
3. **Feature feedback** submission to a Supabase `feedback` table
4. A hidden **`/admin` dashboard** showing cloud session counts, recent errors, and feedback

---

## Prerequisites

Lovable Cloud must be enabled first (Supabase backend). This will provide `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables.

---

## Part 1: Plausible Analytics (Cookieless)

### `index.html`
Add the Plausible script tag in `<head>`:
```html
<script defer data-domain="rootandroutine.lovable.app"
  src="https://plausible.io/js/script.js"></script>
```
This tracks pageviews automatically. No cookies, no IP storage.

### `src/lib/analytics.ts` (new file)
A thin wrapper for custom events:
- `trackEvent(name: string, props?: Record<string, string | number>)` -- calls `window.plausible()` if available
- Events to track:
  - `timer_start` with prop `{ duration_category: "custom" }`
  - `session_saved`
  - `account_created`
  - `sync_initiated` / `sync_completed`
  - `pwa_installed`

### PWA Install Tracking
In `src/hooks/usePWAInstall.ts`, add a call to `trackEvent('pwa_installed')` inside the `appinstalled` event listener.

### Timer Tracking
In `src/pages/Index.tsx`, call `trackEvent('timer_start')` inside `handleTimerStart`.

---

## Part 2: Supabase Tables (Migrations)

### Migration 1: `error_logs` table
```
- id (UUID, primary key, auto-generated)
- error_message (TEXT, not null)
- error_stack (TEXT)
- context (TEXT) -- e.g. "IndexedDB", "timer", "sync"
- app_version (TEXT)
- created_at (TIMESTAMPTZ, default now())
```
**No RLS restrictions on INSERT** (anonymous logging allowed). SELECT restricted to service role only (not accessible from client -- admin reads via edge function).

### Migration 2: `feedback` table
```
- id (UUID, primary key, auto-generated)
- message (TEXT, not null, max 1000 chars)
- app_version (TEXT)
- created_at (TIMESTAMPTZ, default now())
```
Same RLS approach: public INSERT, no public SELECT.

---

## Part 3: Error Logging

### `src/lib/errorLogger.ts` (new file)
- `logError(error: Error, context?: string)` -- inserts a row into `error_logs` via Supabase client
- Catches and silently drops any logging failures (never blocks the user)
- Strips PII -- only sends error message, stack trace, and context string

### Global error handler
In `src/main.tsx`, add:
- `window.addEventListener('error', ...)` for uncaught errors
- `window.addEventListener('unhandledrejection', ...)` for promise rejections
- Both call `logError()` with the relevant context

### IndexedDB quota detection
In `src/hooks/useCompressedStorage.ts`, catch `QuotaExceededError` specifically and call `logError(err, 'IndexedDB:QuotaExceeded')`.

---

## Part 4: Feedback System

### `src/components/FeedbackDialog.tsx` (new file)
- A dialog with a textarea (max 1000 chars) and "Send Feedback" button
- On submit, inserts into the `feedback` table with `app_version` from a constant in `src/lib/constants.ts`
- Shows a success toast on completion
- Validates input with zod (non-empty, max length)

### `src/lib/constants.ts` (new file)
- `APP_VERSION = '1.0.0'` -- used by error logger and feedback

### UI Integration
Add a "Suggest a Feature" button in the footer of `src/pages/Index.tsx`, next to Export and Clear All.

---

## Part 5: Admin Dashboard

### `src/pages/Admin.tsx` (new file)
A simple, hidden route at `/admin` showing:
- **Cloud session count**: Fetches count from `encrypted_data` table (or just local session count if cloud isn't set up yet)
- **Recent errors**: Last 20 entries from `error_logs` (fetched via Supabase)
- **Recent feedback**: Last 20 entries from `feedback`
- Protected by a simple password prompt (stored as a constant or environment variable) -- not Supabase auth, just a basic gate

### `src/App.tsx`
Add route: `<Route path="/admin" element={<Admin />} />`

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| New | `src/lib/analytics.ts` | Plausible event wrapper |
| New | `src/lib/errorLogger.ts` | Anonymous error logging to Supabase |
| New | `src/lib/constants.ts` | App version constant |
| New | `src/components/FeedbackDialog.tsx` | Feature suggestion dialog |
| New | `src/pages/Admin.tsx` | Hidden admin dashboard |
| Edit | `index.html` | Add Plausible script tag |
| Edit | `src/main.tsx` | Global error handlers |
| Edit | `src/App.tsx` | Add `/admin` route |
| Edit | `src/pages/Index.tsx` | Add feedback button, track timer events |
| Edit | `src/hooks/usePWAInstall.ts` | Track PWA install event |
| Edit | `src/hooks/useCompressedStorage.ts` | Catch quota errors |
| Migration | `error_logs` table | Schema + RLS |
| Migration | `feedback` table | Schema + RLS |

