# enter-with — Express SSR Memory Leak Test

An Express + React SSR app that generates significant async HTTP activity (14 axios calls per request via JSONPlaceholder) used to compare memory behavior across Node.js versions with and without the New Relic agent.

## Setup

```bash
npm install
```

## Running the app

```bash
# Without agent
npm start

# With New Relic agent
npm run start:agent
```

The server starts on `http://localhost:3000`. Each page load runs 14 outbound axios calls across 4 phases:

- **Phase 1** — 4 parallel calls: `users`, `posts`, `todos`, `albums`
- **Phase 2** — 5 parallel calls: `posts?userId=` for each user
- **Phase 3** — 5 parallel calls: `comments?postId=` for first 5 posts (concurrent with phase 2)
- **Phase 4** — 5 parallel calls: `photos?albumId=` for each album

## Running the memory monitor

The monitor starts the server as a child process, drives continuous load, forces a GC cycle before each sample, and reports heap breakdown every 10 seconds.

```bash
node monitor.js
```

To test with the New Relic agent (the monitor already spawns with `-r newrelic` and `--expose-gc`):

```bash
node monitor.js
```

The `/_gc` endpoint on the server accepts forced GC requests from the monitor and returns:

```json
{
  "freed": 8.4,
  "heapUsed": 31.0,
  "heapTotal": 99.6,
  "rss": 154.3,
  "external": 6.0
}
```

### Sample output

```
[monitor] server ready  pid=13775  node=v22.22.2
[memory|v22.22.2] rss=154.3MB  requests=6   errors=0  trend=collecting…      heapUsed=31MB  heapTotal=99.6MB  external=6MB   freed=22.6MB
[memory|v22.22.2] rss=122.6MB  requests=12  errors=0  trend=collecting…      heapUsed=42.4MB heapTotal=50.2MB external=4.2MB freed=1.5MB
[memory|v22.22.2] rss=135.1MB  requests=19  errors=0  trend=stable delta=-25.8MB  heapUsed=42.1MB heapTotal=63.2MB external=5MB freed=3.3MB
```

### Leak detection

The monitor flags a **LEAK WARNING** when:
- The last 5 consecutive RSS samples are monotonically rising, **and**
- The RSS delta within that window exceeds **5MB** (filters out OS page-rounding noise)

## Comparing Node versions

To reproduce the Node 22 vs Node 24 comparison:

```bash
# Terminal 1 — Node 22
nvm use 22
node monitor.js

# After ~8 samples (80s), Ctrl-C, then:

# Terminal 1 — Node 24
nvm use 24
node monitor.js
```

## Node 22 vs Node 24 findings

Running the same workload with the New Relic agent (`-r newrelic`) reveals a significant difference in steady-state memory on Node 24:

| Metric | Node 22.22.2 | Node 24.14.1 |
|---|---|---|
| RSS baseline | 160.9 MB | 190.4 MB |
| RSS steady state | ~150 MB | ~239 MB |
| heapUsed (post-GC) | ~40 MB | ~44 MB |
| heapTotal peak | 78.5 MB | 178.7 MB |
| freed per GC cycle | 4–10 MB | 44–49 MB |

**Root cause:** not a reference leak — heapUsed stays flat after forced GC on both versions. The elevated RSS on Node 24 is caused by V8 expanding the heap ~2.3× in response to a ~10× higher short-lived allocation rate driven by the New Relic agent. Once the heap expands, the OS high-water mark persists even after V8 shrinks the heap back down.
