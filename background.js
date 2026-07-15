// Service worker: owns the whole export.
//
// The popup only sends "start" and polls for status. All scrolling, collecting
// and downloading happens here, so closing the popup (or clicking the page)
// does not interrupt an export in progress.
//
// The scroll loop is driven from here one step at a time rather than as a single
// long-running injected function. Each step is a chrome.scripting call, which
// resets the service worker's idle timer and keeps it alive for the whole run.

const MAX_STEPS = 2000; // safety cap (~40 min at SETTLE_MS) so a lazy-loading page can't loop forever
const SETTLE_MS = 1200; // wait after each scroll for lazy-loaded content to render
const INITIAL_MS = 1000;

let state = { running: false, text: 'Idle.' };

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Injected into the page. Must be self-contained (no closures over outside variables).
// `init` locates and caches the scroller; subsequent calls grab text and scroll one step.
function pageStep(direction, init) {
  const w = window;

  if (init) {
    const candidates = [...document.querySelectorAll('*')].filter(el => {
      const s = getComputedStyle(el);
      return (s.overflowY === 'auto' || s.overflowY === 'scroll')
        && el.scrollHeight > el.clientHeight + 100;
    });
    const scroller = candidates.sort((a, b) => b.scrollHeight - a.scrollHeight)[0]
      || document.scrollingElement;
    if (!scroller) return { ok: false, error: 'No scrollable container found.' };

    w.__chatExporterScroller = scroller;
    scroller.scrollTop = direction === 'topDown' ? 0 : scroller.scrollHeight;
    return { ok: true, lines: [], scrollTop: scroller.scrollTop, atEnd: false };
  }

  const sc = w.__chatExporterScroller;
  if (!sc || !sc.isConnected) {
    return { ok: false, error: 'Scroll container lost — did the page navigate?' };
  }

  const lines = sc.innerText.split('\n').map(l => l.trim()).filter(Boolean);
  const maxScroll = sc.scrollHeight - sc.clientHeight;
  const step = sc.clientHeight * 0.7;

  if (direction === 'topDown') {
    sc.scrollTop = Math.min(maxScroll, sc.scrollTop + step);
  } else {
    sc.scrollTop = Math.max(0, sc.scrollTop - step);
  }

  const atEnd = direction === 'topDown' ? sc.scrollTop >= maxScroll - 1 : sc.scrollTop <= 0;
  return { ok: true, lines, scrollTop: sc.scrollTop, atEnd };
}

// Service workers have no URL.createObjectURL, so the file is handed to the
// downloads API as a base64 data URL instead of a blob URL.
function toDataUrl(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  const CHUNK = 0x8000; // chunked so fromCharCode doesn't blow the argument limit
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return 'data:text/plain;charset=utf-8;base64,' + btoa(bin);
}

async function step(tabId, direction, init) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: pageStep,
    args: [direction, init]
  });
  return result;
}

async function runExport(direction) {
  if (state.running) return;
  state = { running: true, text: 'Starting...' };

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab found.');
    const tabId = tab.id;

    const first = await step(tabId, direction, true);
    if (!first?.ok) throw new Error(first?.error || 'Failed to start.');
    await sleep(INITIAL_MS);

    const collected = new Set();
    let stable = 0;
    let lastTop = -1;
    let steps = 0;

    while (stable < 3 && steps < MAX_STEPS) {
      const r = await step(tabId, direction, false);
      if (!r?.ok) throw new Error(r?.error || 'Failed to scrape page.');

      r.lines.forEach(l => collected.add(l));
      steps++;
      state = { running: true, text: `Scrolling and collecting... ${collected.size} lines` };

      await sleep(SETTLE_MS);

      if (r.scrollTop === lastTop || r.atEnd) stable++;
      else stable = 0;
      lastTop = r.scrollTop;
    }

    const last = await step(tabId, direction, false);
    if (last?.ok) last.lines.forEach(l => collected.add(l));

    if (collected.size === 0) throw new Error('No text collected.');

    await chrome.downloads.download({
      url: toDataUrl([...collected].join('\n')),
      filename: `chat-export-${direction}.txt`,
      saveAs: false
    });

    const capped = steps >= MAX_STEPS ? ' (stopped at step limit)' : '';
    state = { running: false, text: `Done - ${collected.size} lines saved.${capped}` };
  } catch (err) {
    state = { running: false, text: `Error: ${err.message}` };
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.cmd === 'export') {
    runExport(msg.direction); // deliberately not awaited: reply now, keep working
    sendResponse({ started: true });
  } else if (msg?.cmd === 'status') {
    sendResponse(state);
  }
  return false;
});
