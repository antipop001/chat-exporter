const statusEl = document.getElementById('status');

async function runExport(direction) {
  statusEl.textContent = 'Scrolling and collecting...';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    statusEl.textContent = 'No active tab found.';
    return;
  }

  try {
    // Inject the scraper function definition first
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['scraper.js']
    });

    // Then call it and get the result back
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (dir) => scrapeChat(dir),
      args: [direction]
    });

    if (!result?.ok) {
      statusEl.textContent = result?.error || 'Failed to scrape page.';
      return;
    }

    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const filename = `chat-export-${direction}.txt`;

    await chrome.downloads.download({
      url,
      filename,
      saveAs: false
    });

    statusEl.textContent = `Done — ${result.count} lines saved.`;
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
  }
}

document.getElementById('exportTopDown').addEventListener('click', () => runExport('topDown'));
document.getElementById('exportBottomUp').addEventListener('click', () => runExport('bottomUp'));
