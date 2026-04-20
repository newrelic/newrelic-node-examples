// Starts the SSR server, drives load, and tracks RSS for leak patterns.
// Run with: node --expose-gc monitor.js
const { spawn, execSync } = require('child_process');
const http = require('http');

const INTERVAL_MS = 1500;   // ms between requests
const SAMPLE_SECS = 10;     // memory sample interval
const LEAK_WINDOW = 5;      // consecutive rising samples = warning

const server = spawn('node', ['--expose-gc', '-r', 'newrelic', 'index.js'], { stdio: ['ignore', 'pipe', 'pipe'] });
const pid = server.pid;
const nodeVersion = process.version;

let ready = false;
let reqCount = 0;
let errCount = 0;
const rssSamples = [];

server.stdout.on('data', d => {
  const msg = d.toString().trim();
  if (!ready && msg.includes('listening')) {
    ready = true;
    console.log(`[monitor] server ready  pid=${pid}  node=${nodeVersion}`);
    startLoad();
    startMemoryWatch();
  }
});

server.stderr.on('data', d => {
  process.stderr.write('[server] ' + d.toString());
});

server.on('exit', code => {
  console.log(`[monitor] server exited  code=${code}`);
  process.exit(code ?? 1);
});

function sendRequest() {
  if (!ready) return;
  const req = http.get('http://localhost:3000', res => {
    res.resume();
    reqCount++;
  });
  req.on('error', () => errCount++);
  req.setTimeout(15000, () => { req.destroy(); errCount++; });
}

function rssKB() {
  try {
    return parseInt(execSync(`ps -o rss= -p ${pid}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim());
  } catch {
    return null;
  }
}

const LEAK_MIN_MB = 5; // ignore growth below this threshold (OS page rounding)

function trend(samples) {
  if (samples.length < 3) return 'collecting…';
  const window = samples.slice(-LEAK_WINDOW);
  const rising = window.every((v, i, a) => i === 0 || v >= a[i - 1]);
  const windowDeltaMB = (window[window.length - 1] - window[0]) / 1024;
  const totalDelta = samples[samples.length - 1] - samples[0];
  const deltaMB = (totalDelta / 1024).toFixed(1);
  if (rising && samples.length >= LEAK_WINDOW && windowDeltaMB >= LEAK_MIN_MB)
    return `LEAK WARNING +${deltaMB}MB over ${samples.length} samples`;
  return `stable  delta=${deltaMB}MB`;
}

function gcAndSample() {
  return new Promise(resolve => {
    const req = http.get('http://localhost:3000/_gc', res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

function startMemoryWatch() {
  setInterval(async () => {
    // Force GC in the server process, get heap breakdown post-GC
    const heap = await gcAndSample();
    const kb = rssKB();
    if (kb == null) { console.log('[memory] could not read rss'); return; }
    rssSamples.push(kb);
    const mb = (kb / 1024).toFixed(1);
    const t = trend(rssSamples);
    const heapLine = heap
      ? `  heapUsed=${heap.heapUsed}MB heapTotal=${heap.heapTotal}MB external=${heap.external}MB freed=${heap.freed}MB`
      : '';
    console.log(`[memory|${nodeVersion}] rss=${mb}MB  requests=${reqCount}  errors=${errCount}  trend=${t}${heapLine}`);
  }, SAMPLE_SECS * 1000);
}

function startLoad() {
  setInterval(sendRequest, INTERVAL_MS);
}

process.on('SIGINT', () => {
  console.log('[monitor] shutting down');
  server.kill();
  process.exit(0);
});
