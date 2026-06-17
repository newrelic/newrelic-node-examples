# CPU Profiling Example App

Exercises the agent's CPU profiler end-to-end against the **New Relic collector**, so you can confirm CPU profile samples carry the `span:<txn id>:<name>` key with `span_id=...,trace_id=...` values and that they ship via the `pprof_data` ingest method.

The app is written in **TypeScript** (`index.ts`, `load.ts`) and compiled with `tsc` to `dist/` with source maps (`dist/*.js.map`). That's the setup for the source-mapping experiment below: the profiler samples the *compiled* `dist/index.js`, and the agent's `profiling.source_mapping.enabled` config (NOT the Node `--enable-source-maps` flag) decides whether those frames are resolved back to `index.ts` using the maps. Comparing the two run modes shows whether the CPU profiler's reported stacks change.

## Setup

```bash
cp env.sample .env        # add your NEW_RELIC_LICENSE_KEY
npm install
```

`npm install` pulls in `typescript` and the type packages as dev dependencies.

## Run

Both start scripts run `npm run build` (`tsc`) first, then launch the compiled `dist/index.js`. Terminal 1 — start the app in **one** of the two modes:

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

### Source-mapping experiment

Frame resolution is controlled by the agent config `profiling.source_mapping.enabled` (see `newrelic.js`), **not** the Node `--enable-source-maps` flag. When enabled, the CPU profiler builds a `@datadog/pprof` `SourceMapper` that scans the working directory for `.map` files and rewrites each sampled frame from `dist/index.js` back to `index.ts`. Because it scans `process.cwd()`, run the app from this directory so `dist/*.js.map` is discoverable.

The two scripts toggle it via the env var `NEW_RELIC_PROFILING_SOURCE_MAPPING_ENABLED` (`start:source-map` sets it to `true`; `start` leaves it at the `false` default). Run the same load under each mode and diff the file/line the profiler attributes samples to:

| Mode | Command                      | Reported frames       |
| ---- | ---------------------------- | --------------------- |
| Off  | `npm start`                | `dist/index.js:<n>` |
| On   | `npm run start:source-map` | `index.ts:<n>`      |

With `trace` logging on, confirm the mapper built by grepping the agent log:

```bash
grep -i "SourceMapper" newrelic_agent.log
```

## Verify it's shipping

Watch the agent log for the harvest POSTs and the collector's response:

```bash
grep -i "pprof_data" newrelic_agent.log
```

A `202` means ==the collector== accepted the profile. A `4xx` means the account isn't entitled for `pprof_data` ingest — that's a backend gate, not an agent bug.

## What to look for in the UI

Open the `cpu-profiling-example` entity and find the CPU profile / flame-graph view. The labels feed trace correlation: you should be able to pivot from a flame-graph frame to its trace, or filter a profile by a `trace.id`.
