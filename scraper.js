// This function is injected into the page via chrome.scripting.executeScript.
// It must be self-contained (no closures over outside variables).
async function scrapeChat(direction) {
  const findScroller = () => {
    const candidates = [...document.querySelectorAll('*')].filter(el => {
      const s = getComputedStyle(el);
      return (s.overflowY === 'auto' || s.overflowY === 'scroll')
        && el.scrollHeight > el.clientHeight + 100;
    });
    return candidates.sort((a, b) => b.scrollHeight - a.scrollHeight)[0] || document.scrollingElement;
  };

  const scroller = findScroller();
  if (!scroller) return { ok: false, error: 'No scrollable container found.' };

  const collected = new Set();
  const grab = () => scroller.innerText.split('\n').forEach(l => {
    const t = l.trim();
    if (t) collected.add(t);
  });

  const topDown = direction === 'topDown';

  scroller.scrollTop = topDown ? 0 : scroller.scrollHeight;
  await new Promise(r => setTimeout(r, 1000));

  let stableCount = 0;
  let lastTop = -1;

  while (stableCount < 3) {
    grab();
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    const step = scroller.clientHeight * 0.7;

    if (topDown) {
      scroller.scrollTop = Math.min(maxScroll, scroller.scrollTop + step);
    } else {
      scroller.scrollTop = Math.max(0, scroller.scrollTop - step);
    }

    await new Promise(r => setTimeout(r, 1200));

    const atEnd = topDown
      ? scroller.scrollTop >= maxScroll
      : scroller.scrollTop <= 0;

    if (scroller.scrollTop === lastTop || atEnd) {
      stableCount++;
    } else {
      stableCount = 0;
    }
    lastTop = scroller.scrollTop;
  }

  grab();

  return { ok: true, text: [...collected].join('\n'), count: collected.size };
}
