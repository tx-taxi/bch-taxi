# BCH emerald native surfaces — local review

User correction: native BCH backgrounds inherited Litecoin. Scope is palette only;
strip/dashboard geometry, chain logo artwork, fee meaning and semantic status
colors are unchanged. No hub export or shared transition/index script changed.

## Implemented palette

- Page/active background `#071510`.
- Navbar/base/card containers `#10251c`; raised box `#112a20`, statistics `#0c2118`.
- Hover `#1b3b2e`, secondary/empty block face `#234b3a`.
- Mined top `#245b45`, side `#143f2d`; pending top/side retain native emerald shades.
- Skeleton `#244a3a` → `#39725a`; tinted borders, input groups, tooltip capacity
  tracks, fee tiers, map, search focus and fade surfaces now use the green family.
- Existing ordered green fee/chart/WebGL palette was retained; screenshots show
  its transaction tiles and incoming-transaction line against the new surfaces.
- Mempool Original explicitly owns navbar and border tokens; retained fee-tier
  tokens prevent custom emerald changes leaking into that theme. CSS URL version
  was incremented.

## Verification

Inspected before/after desktop 1440×1000 and mobile 390×1000 screenshots. Mobile
central divider remains centered. No layout changes. Angular watch compiled
successfully. Actual theme selector exercised default → Original → default,
then reload: body black/secondary `#272f4e` for Original and body `#071510` /
secondary `#234b3a` for BCH. Theme CSS loaded, no browser page errors.

Evidence: `before-1440.png`, `before-390.png`, `after-1440.png`, `after-390.png`,
`original-1440.png`, `default-1440.png`, `theme-switch.json`.

Local watch remains http://127.0.0.1:4361. No production deployment performed.
Integrator must rebuild hub strip CSS from this revision and recapture both
native loading templates. BCH initial/transition surface should use `#071510`;
Original remains black. This report does not claim those integrations are done.
