# BCH native router band (local candidate)

Build with `node hub/build.cjs`. The export imports this worktree's actual Angular blockchain, mined-block, pending-block, amount, fee, tooltip and pool components, their templates and styles. `facade.ts` supplies isolated per-mount state; the shadow root isolates native styles. No router source is modified.

`source.json` identifies the reviewed candidate source commit; `dist/provenance.json` includes hashes of imported native source files. The ancestor is LTC6ba310ede, with deliberate BCH semantics and candidate green palette adaptations. No production registration is authorized.

`feed.js` reads the local gateway at http://127.0.0.1:4361 using the implemented native feed lifecycle. Fifteen retained wire blocks match the native and extracted dynamic strip boundary. Capacity is supplied by actual BCHN ABLA state; observed pool fee rates are not confirmation forecasts. Destination guard allows canonical HTTPS and the exact local review origin only.

Parent integrator owns router parity/lifecycle evidence at /home/lukee/dev/tx-taxi-utxo-hub. Latest measured desktop text/geometry/colors match; mobile pending tile differs by one fractional-scroll rounding pixel. Local export is not an approved or deployed BCH baseline.
