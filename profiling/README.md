# Profiling Example App

Exercises the agent's **CPU and heap profilers** end-to-end against the **New Relic collector**. For the CPU profiler you can confirm samples carry the `span:<txn id>:<name>` key with `span_id=...,trace_id=...` values — the labels that feed trace correlation — and for both profilers you can confirm the profiles ship via the `pprof_data` ingest method.

The app is written in **TypeScript** (`index.ts`, `load.ts`) and compiled with `tsc` to `dist/` with source maps (`dist/*.js.map`). That's the setup for the source-mapping experiment below: the profilers sample the *compiled* `dist/index.js`, and the agent's `profiling.source_mapping.enabled` config (NOT the Node `--enable-source-maps` flag) decides whether those frames are resolved back to `index.ts` using the maps. Running the same load with the toggle off vs on shows whether the reported stacks change — for the CPU profiler and for the heap (allocation) profiler.

## Setup

```bash
cp env.sample .env        # add your NEW_RELIC_LICENSE_KEY
npm install
```

`npm install` pulls in `typescript` and the type packages as dev dependencies.

## Run

Which profilers run is controlled by `profiling.include` in `newrelic.js` (currently `['cpu', 'heap']`). Both start scripts run `npm run build` (`tsc`) first, then launch the compiled `dist/index.js`. Terminal 1 — start the app in **one** of the two modes:

```bash
npm start                 # source mapping OFF — frames report dist/index.js
# or:
npm run start:source-map  # source mapping ON  — frames resolve to index.ts
```

`npm run build` on its own just compiles TypeScript to `dist/` if you want to inspect the emitted `dist/index.js` and `dist/index.js.map`.

Terminal 2 — drive sustained load (profiling harvests every 60s, so let it run 2+ minutes):

```bash
npm run load
```

### What the workload does

`/burn` runs a mix of synchronous work spread across several named functions (`countPrimes`, `hashRounds`, `sortChurn`, `fib`, `trigAccumulate`) so the flame graph shows distinct frames rather than one hot loop. The same functions both **burn CPU** (feeding the CPU profiler) and **allocate** — typed arrays, plain arrays, hash buffers, strings — feeding the heap/allocation profiler. It all runs synchronously inside the Express route handler, so the CPU samples stay in the transaction context and pick up the span labels. `/ping` is a cheap route for contrast.

### Source-mapping experiment

Frame resolution is controlled by the agent config `profiling.source_mapping.enabled` (see `newrelic.js`). When enabled, the agent builds a `pprof` `SourceMapper` that scans the working directory for `.map` files and rewrites each sampled frame from `dist/index.js` back to `index.ts`. The same mapper is meant to feed both profilers, so the experiment is to confirm the resolution applies to CPU stacks **and** heap allocation stacks. Because it scans `process.cwd()`, run the app from this directory so `dist/*.js.map` is discoverable.

The two scripts toggle it via the env var `NEW_RELIC_PROFILING_SOURCE_MAPPING_ENABLED` (`start:source-map` sets it to `true`; `start` leaves it at the `false` default). Run the same load under each mode and diff the file/line the profilers attribute samples to:

| Mode | Command                      | Reported frames       |
| ---- | ---------------------------- | --------------------- |
| Off  | `npm start`                | `dist/index.js:<n>` |
| On   | `npm run start:source-map` | `index.ts:<n>`      |

With `trace` logging on, confirm the mapper built by grepping the agent log:

```bash
grep -i "SourceMapper" newrelic_agent.log
```

## Verify it's shipping

Watch the agent log for the harvest POSTs and the collector's response. Each enabled profiler ships its own `pprof_data`:

```bash
grep -i "pprof_data" newrelic_agent.log
```

A `202` means the collector accepted the profile. A `4xx` means the account isn't entitled for `pprof_data` ingest — that's a backend gate, not an agent bug.

## What to look for in the UI

Open the `profiling-example-app` entity and find the CPU and heap profile / flame-graph views. The CPU profile's labels feed trace correlation: you should be able to pivot from a flame-graph frame to its trace, or filter a profile by a `trace.id`. Compare the frame paths between the two run modes to see the source-mapping effect for each profiler.
