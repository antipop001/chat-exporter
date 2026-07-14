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
4. Wait while it scrolls (this can take a bit for long conversations).
5. A `.txt` file downloads automatically with the collected lines.

## How it works

- `manifest.json` — MV3 config. Requests only `activeTab`, `scripting`, and
  `downloads` permissions — no persistent background access, and no host
  permissions, so it only ever runs on the tab you're actively viewing when
  you click the button.
- `scraper.js` — injected into the page. Finds the largest scrollable
  container on the page, scrolls it incrementally in the chosen direction,
  and collects unique trimmed lines of visible text into a `Set`.
- `popup.js` — wires the popup buttons to script injection, then turns the
  returned text into a downloadable blob via `chrome.downloads.download`.
- `popup.html` — the popup UI.

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
