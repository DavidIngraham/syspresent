# Startup performance measurements

The public baseline uses deployed SysPresent build
3692c3a4d3a7a6072658276164dc62ca19b32cdf. Local candidate measurements
are separate from the public site and have not been deployed. These records
separate public-network observations, diagnostic instrumentation and controlled
local comparisons.
Desktop Chromium and CPU/network emulation are not physical iOS or Safari evidence.
The measured toolchain was Node 22.14.0, Playwright 1.56.0 and Google Chrome
for Testing 156.0.8078.4 on Linux/WSL. Chromium reported 16 logical processors.

## Public startup before the changes

Each scenario launched a fresh Chromium process and nonpersistent browser context.
Cold means a cleared browser HTTP cache; warm means reloading the same page and
context after its first usable render. The baseline did not rewrite assets or
intercept their responses, since Playwright routing disables HTTP caching.
A DOM observer recorded status transitions, long tasks and the first usable
model: native status ready, loading hidden, initial graph present and layout
settled, followed by two animation frames.

| Model / condition | Cold usable | Warm usable | Cold / warm longest main task |
| --- | ---: | ---: | ---: |
| Flashlight, host connection | 10.27 s | 9.72 s | none above 50 ms |
| Blue Dog, host connection | 27.72 s | 24.92 s | 2.30 / 2.32 s |
| Blue Dog, constrained page | 77.72 s | 69.05 s | 10.33 / 9.96 s |

The constrained condition requested 3 Mbit/s download, 1 Mbit/s upload,
80 ms latency and 4x CPU throttling through the page's Chrome DevTools Protocol
session. The worker WASM transfer took 26.01 s cold and 24.98 s warm, confirming
the network constraint affected it. Native parsing did not exhibit a 4x slowdown;
the CPU rate is therefore reported as page-renderer emulation, not a measured
4x native-worker slowdown.

These are single cold/warm observations, not medians or performance guarantees.
Unthrottled network conditions varied substantially. In these nonpersistent
contexts the large WASM asset was transferred again on warm reload even while
the smaller app, project ZIP and support assets were cached. This observation
must not be generalized to a regular browser's persistent disk cache or Safari.

| Public asset | Encoded response body | Decoded body |
| --- | ---: | ---: |
| App JavaScript | 160,519 bytes | 620,805 bytes |
| Semantic WASM | 9,336,024 bytes | 36,906,708 bytes |
| Layout worker | 470,617 bytes | 1,595,334 bytes |
| Blue Dog project ZIP | 2,122,061 bytes | 2,122,061 bytes |
| Flashlight project ZIP | 3,358 bytes | 3,358 bytes |

The Blue Dog project ZIP contains 106 entries and expands to 28,471,897 bytes.
Its prepared native runtime index is 26,909,465 bytes, compressed to 1,786,511
bytes inside that archive. Source-file size alone does not describe startup work.

Raw public evidence is preserved locally in
build/startup-public-baseline.json and its log, with resource timing records,
response cache fields, status timestamps, long tasks, browser identity and
conditions. All six loads passed with no page errors or unexpected external
requests.

## Public persistent-cache comparison

A separate run used a fresh persistent browser profile per model rather than an
incognito context, then reloaded that same profile. All four loads passed:

| Model, host connection | Cold usable | Warm usable | Warm WASM transfer |
| --- | ---: | ---: | ---: |
| Flashlight | 3.02 s | 1.70 s | 0 bytes |
| Blue Dog | 27.74 s | 23.97 s | 0 bytes |

Warm WASM resource duration was about 87–91 ms, with transferSize zero.
Existing HTTP caching therefore worked in the measured persistent Chromium
profile; the incognito behavior alone does not justify adding persistent model or
asset storage. Network conditions differed between these observations and the
earlier incognito run, so the cold values are not a causal comparison of browser
modes. The remaining warm Blue Dog cost includes complete native parsing and
routing.

Raw evidence is build/startup-public-flashlight-persistent.json and
build/startup-public-blue-dog-persistent.json. Fresh profile directories are
recorded in each artifact.

## Separate diagnostic attribution

A separate instrumented public Blue Dog startup wrapped WASM instantiation and
native call boundaries and sampled the main-thread CPU profile. It was not used
as the unmodified baseline. Its first usable model took 24.29 s.

- Native ParseSources took 16.43 s for the complete supplied project. No
  declaration ExportModel call was needed because the publisher-trusted cache
  matched the parsed model.
- WASM instantiation after the already downloaded ArrayBuffer took 41.5 ms in
  this run. The native API appeared about 169 ms later.
- Orthogonal routing used about 2.06 s of sampled self CPU time and 2.96 s
  inclusive time. The peripheral-routing operation accounted for about 3.48 s
  inclusive time.
- Compile work sampled on the main thread accounted for about 0.62 s inclusive;
  the two prepared-cache verification paths each accounted for about 0.14 s.
  These sampled values are attribution estimates, not additive wall-clock stages.

The CPU results identify routing as a larger main-thread bottleneck than cache
JSON processing in this measured startup. The public unthrottled loads had
roughly 5.7–6.0 s of main-thread long tasks, rising to 26–27 s under constrained
page CPU emulation. An accessible progress label alone cannot repaint during a
single multi-second main-thread task.

Raw diagnostic evidence is
build/startup-public-instrumented.json and
build/startup-public-instrumented.json.cpuprofile. The worker probe records only
method names, durations and request character counts, not model payloads.

## Final controlled local comparison

The before and after sites used byte-identical WASM, Go runtime, engine
provenance, Blue Dog project ZIP and Flashlight ZIP. The baseline was the frozen
bef37f3 site: its app/worker behavior matches deployed 3692c3a, whose additional
change only repaired a native test. The final candidate site was the clean build
8413525755029c12b9c8d845ccf3f6a4a9c3b0ba. Each scenario used a fresh persistent
browser profile, then a warm reload, through the same gzip-level-6 localhost
server and requested CDP conditions.

| Model / condition | Cold before → after | Warm before → after |
| --- | ---: | ---: |
| Flashlight, normal | 2.401 → 2.468 s | 1.533 → 1.732 s |
| Blue Dog, normal | 23.100 → 19.139 s | 22.781 → 18.988 s |
| Blue Dog, constrained page | 75.731 → 60.195 s | 44.262 → 27.198 s |

The observed Blue Dog improvements were 17.2%/16.6% cold/warm under normal
conditions and 20.5%/38.6% under the constrained page condition. No small-model
speedup was observed; its cold observation was about 0.07 s slower and its
warm observation about 0.20 s slower. These single
paired observations are not a universal latency guarantee or a public-mobile
speedup claim.

| Blue Dog blocking measurement | Before → after |
| --- | ---: |
| Normal cold main long-task total | 5.70 → 0.62 s |
| Normal warm main long-task total | 5.81 → 0.50 s |
| Constrained cold main long-task total | 26.06 → 8.69 s |
| Constrained warm main long-task total | 26.15 → 7.57 s |
| Normal cold largest single task | 2.32 s → 175 ms |
| Normal warm largest single task | 2.33 s → 202 ms |
| Constrained cold largest single task | 10.25 s → 658 ms |
| Constrained warm largest single task | 10.15 s → 546 ms |

Long-task totals count only tasks of at least 50 ms; splitting work can reduce
that metric without removing all its CPU cost. Cooperative routing and scene
validation yielded between bounded work batches while retaining checks and
geometry. The observed longest tasks were below one second even under the
requested page CPU emulation; this is not a hard real-time bound for every
model, device or atomic route.

A separate final instrumented load measured native ParseSources at 16.610 s.
It remains the dominant normal warm-start work and is preserved for native
semantics and freshness. The final streaming-instantiation interval was 83.8 ms
on localhost, overlapping the transfer; native API availability followed about
170 ms later. These diagnostic timing values are not additive to network time.
Sampled orthogonal-routing self CPU was about 0.44 s, with about 0.65 s inclusive,
and modelGraph about 43 ms inclusive. The diagnostic profile is separate from
the unmodified six-run comparison.

All twelve final paired loads, plus the separate final diagnostic load, passed
with unchanged native element/view counts and no page errors or unexpected
external requests. Final evidence is:

- build/startup-local-baseline.json
- build/startup-local-final.json
- build/startup-local-final-instrumented.json and its .cpuprofile
- build/startup-final-payload-proof.json
- build/startup-final-comparison.json

The earlier candidate ccb487c observations remain in
build/startup-local-optimized.json and build/startup-paired-comparison.json.
They are intermediate measurements, not the final values above.

The updated publication keys unchanged native assets by the generated native
payload fingerprint, allowing browser HTTP-cache reuse across app/story-only
updates. Changed native bytes invalidate that key. This does not persist private
model state or bypass complete native parsing and publisher/source/model cache
validation.

## Reproducing the measurements

The harness requires an explicitly installed Playwright module and Chromium.
It runs a single browser at a time and refuses to overwrite a result file.
Keep unrelated builds and CPU-intensive work idle during measured runs.

~~~sh
node scripts/wasm-prototype/profile-startup.mjs \
  --playwright /path/to/playwright/index.mjs --chromium /path/to/chromium \
  --output build/startup-public-baseline.json

node scripts/wasm-prototype/profile-startup.mjs --mode instrumented \
  --playwright /path/to/playwright/index.mjs --chromium /path/to/chromium \
  --output build/startup-public-instrumented.json

node scripts/wasm-prototype/profile-startup.mjs --persistent-profile \
  --demo blue-dog --condition normal \
  --playwright /path/to/playwright/index.mjs --chromium /path/to/chromium \
  --output build/startup-public-persistent.json

node scripts/wasm-prototype/profile-startup.mjs --site /path/to/frozen/site \
  --demo blue-dog --condition normal --persistent-profile \
  --playwright /path/to/playwright/index.mjs --chromium /path/to/chromium \
  --output build/startup-local.json
~~~

The local server uses gzip level 6 for compressible assets and a 600-second
HTTP freshness lifetime, except HTML which requires revalidation. A fresh
persistent profile per scenario permits a separate regular-disk-cache comparison;
the profile directory is recorded in the evidence. Localhost transfer timing
does not predict a public mobile connection. Instrumented WASM streaming durations
include overlapping download and compilation and must not be added to resource
download duration as if they were sequential.
