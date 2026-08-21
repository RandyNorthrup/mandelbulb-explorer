# Changelog

All notable changes to this project are documented in this file.

The format is Keep a Changelog, and this project uses Semantic Versioning.

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
