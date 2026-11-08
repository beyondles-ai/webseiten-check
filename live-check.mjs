// Waits until GitHub Pages serves exactly the docs/index.html of this folder.
// Usage: node live-check.mjs [maxSeconds]   (default 100)
// Exit code 0 = live, 1 = not live yet (just run it again).
import { readFileSync } from 'node:fs';

const norm = s => s.replace(/\r\n/g, '\n').trim();
const local = norm(readFileSync(new URL('./docs/index.html', import.meta.url), 'utf8'));
const domain = readFileSync(new URL('./docs/CNAME', import.meta.url), 'utf8').trim();
const maxSeconds = Number(process.argv[2] || 100);
const started = Date.now();
const secs = () => Math.round((Date.now() - started) / 1000);

while (true) {
  try {
    const res = await fetch(`https://${domain}/?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok && norm(await res.text()) === local) {
      console.log(`LIVE nach ${secs()} Sekunden: https://${domain}/`);
      process.exit(0);
    }
  } catch { /* network hiccup, try again */ }
  if (secs() >= maxSeconds) {
    console.log(`NOCH NICHT LIVE nach ${secs()} Sekunden. GitHub veroeffentlicht noch. Einfach noch einmal aufrufen.`);
    process.exit(1);
  }
  await new Promise(r => setTimeout(r, 4000));
}
