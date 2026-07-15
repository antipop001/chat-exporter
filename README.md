# Chat Exporter

A minimal Chrome extension (Manifest V3) that scrolls through a scrollable
chat/conversation pane on the active tab, collects the visible text, and
downloads it as a `.txt` file.

## Why

Some chat UIs virtualize/lazy-load messages as you scroll, so a simple
"select all + copy" won't capture the whole conversation. This extension
auto-scrolls the page's chat container (in either direction), grabs text at
each step, and de-duplicates lines before exporting.

## Install (unpacked)

1. Clone or download this repo.
2. Go to `chrome://extensions` in Chrome.
3. Toggle **Developer mode** on (top right).
4. Click **Load unpacked** and select this folder.
5. Pin the extension if you'd like quick access.

## Usage

1. Open the chat/conversation page you want to export.
2. Click the extension icon.
3. Choose **Export (top → bottom)** or **Export (bottom → top)**.
4. Wait while it scrolls (this can take a bit for long conversations). You can
   close the popup and keep using the browser — the export continues in the
   background. Reopen the popup to check progress.
5. A `.txt` file downloads automatically with the collected lines.

## How it works

- `manifest.json` — MV3 config. Requests only `activeTab`, `scripting`, and
  `downloads` permissions — no host permissions, so it only ever runs on the
  tab you're actively viewing when you click the button.
- `background.js` — the service worker, which owns the whole export. It drives
  the scroll loop one step at a time via `chrome.scripting`, collects unique
  trimmed lines into a `Set`, and downloads the result. Running here rather
  than in the popup is deliberate: an extension popup is destroyed as soon as
  it loses focus, which would silently abandon a long export mid-run.
- `popup.js` / `popup.html` — a thin remote control. The buttons tell the
  service worker to start; the status line polls it for progress.

The page-side scroll/collect step is injected from `background.js` via
`chrome.scripting.executeScript`'s `func` option. Driving it one step per call
(rather than one long-running injected function) also keeps the service worker
alive for the duration, since each call resets its idle timer.

## Limitations

- Relies on generic heuristics (largest scrollable element with
  `overflow-y: auto|scroll`) to find the chat pane — this may need
  adjustment for sites with unusual layouts.
- If a site aggressively unmounts DOM nodes for messages that scroll far out
  of view, some content may not be captured regardless of direction.
- Output is a flat list of de-duplicated lines, not a structured transcript
  — good for search/reference, not for preserving exact message boundaries
  or ordering guarantees.

## License

MIT — see [LICENSE](LICENSE).
