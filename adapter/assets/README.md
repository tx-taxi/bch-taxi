# Social card provenance

`social-card.svg` is the deployed router's `assets/og/explorers/bitcoin.svg`, retrieved on 2026-09-24, matching the composition in router `scripts/generate-og.ts` (inspected checkout 476f9db). It preserves the shared 1200×630 checkerboard, frame, mesh, typography and positions. LTC adaptations: approved #345d9d accent, existing LTC wordmark, chain labels, escaped headline/subtitle slots and a bounded entity identifier line. DejaVu Sans Mono is explicitly selected and installed in the runtime image; the shared generic font-family list resolved differently in the container. No remote fonts or assets are needed at render time.

The initial HTML and client use the same versioned image endpoint. Entity cards retain native data; provider failure renders an unavailable description rather than fabricated values.

2026-09-25 update: the user confirmed the approved chain-colored taxi header logo. The larger navbar logo now has clear space without the duplicated LTC.TX.TAXI eyebrow. Mesh and headings use legible #789de0 blue; checker/frame accents retain #345d9d. The original composition provenance above remains historical. Image URL version 4 invalidates the prior composition for new fetches.
