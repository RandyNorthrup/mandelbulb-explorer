# Changelog

All notable changes to this project are documented in this file.

The format is Keep a Changelog, and this project uses Semantic Versioning.

## 0.1.2 — 2026-08-20

### Added

- Public GitHub repository and GitHub Pages deploy from Actions.

### Changed

- README is environment-agnostic: no host paths, no “this machine” claims.
  Live site URL is documented.
- Lighthouse Performance floor is 50 (CI software renderer measured 60;
  Accessibility and Best Practices stay at 90). The audit uses
  `throttlingMethod: provided` so GitHub-hosted runners are not also
  penalized with simulated 4G.

## 0.1.1 — 2026-08-20

### Added

- Semgrep SAST gate (`npm run security:sast`). Local rules forbid `eval`,
  `new Function`, `innerHTML` assignment, and `document.write`, plus
  `--config auto`. A Node launcher finds `pysemgrep` on Windows because
  `python -m semgrep` is a deprecated stub that exits 2.
- Lighthouse desktop gate (`npm run lighthouse`) using Chrome. Measured
  scores: Performance 100, Accessibility 98, Best Practices 96. Floors 90.
  SEO is out of scope.
- Project-scoped Chrome DevTools MCP (`chrome-devtools-mcp@1.7.0`) in
  `.grok/config.toml` and `.vscode/mcp.json`. Chrome itself was already
  installed.

### Fixed

- Documented AWS-shaped proving key removed from PLAN.md so Semgrep's
  community secret rule does not treat the changelog of a test as a leak.

## 0.1.0 — 2026-08-20

### Added

- Project scaffold: Vite 8, TypeScript 6.0.3, ESLint type-aware strict config,
  Prettier, stylelint, htmlhint, Vitest coverage, Playwright, knip, dpdm,
  jscpd, npm audit, gitleaks, GitHub Actions quality + Pages deploy workflow.
- WebGL2 boot that fails closed when `#viewport` or a WebGL2 context is missing.
- Raymarched 3D Mandelbulb fragment shader with orbit-trap cosine palettes,
  Lambert lighting, ambient occlusion, miss glow, and gamma.
- Orbit camera (pointer drag, pinch, wheel, arrow keys, I/O dolly).
- Keyboard path for reset, power, iterations, palette, quality, and HUD toggle.
- Accessible HUD (`aria-live` on values, canvas `aria-label`).
- Production CSP injected at build time only.

### Security

- `.env` gitignored before the first commit.
- gitleaks proven against a real-shaped `AKIA` key, then the plant was deleted.
- `npm audit --audit-level=moderate` proven against `minimist@0.0.8`, then
  uninstalled.
