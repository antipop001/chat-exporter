// The popup is only a remote control. The export itself runs in the service
// worker (background.js), so closing this popup does not stop it.

const statusEl = document.getElementById('status');

async function poll() {
  try {
    const s = await chrome.runtime.sendMessage({ cmd: 'status' });
    if (s?.text) statusEl.textContent = s.text;
  } catch {
    // Service worker asleep between exports; nothing to report.
  }
}

async function start(direction) {
  statusEl.textContent = 'Starting...';
  try {
    await chrome.runtime.sendMessage({ cmd: 'export', direction });
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    return;
  }
  poll();
}

document.getElementById('exportTopDown').addEventListener('click', () => start('topDown'));
document.getElementById('exportBottomUp').addEventListener('click', () => start('bottomUp'));

poll();
setInterval(poll, 500);
