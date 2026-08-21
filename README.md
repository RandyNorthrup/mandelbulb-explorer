# Mandelbulb Explorer

Interactive WebGL2 raymarched 3D Mandelbulb. Drag to orbit, wheel to zoom,
keyboard for every action, HUD for live parameters.

**Live site:** [https://randynorthrup.github.io/mandelbulb-explorer/](https://randynorthrup.github.io/mandelbulb-explorer/)

This is a static client-only app. There is no backend, no authentication, and
no required environment variables.

## Stack

- TypeScript 6.0.3 (pinned; typescript-eslint 8.67 does not support TypeScript 7)
- Vite 8.2.2
- WebGL2 fragment-shader distance estimator
- Vitest 4.1.11 + Playwright 1.62.1
- ESLint 10 `strictTypeChecked`, Prettier 3.9.6, knip 6.32.2, dpdm 4.3.0

## Requirements

- Node.js 22.12.0 or newer (see `package.json` `engines`)
- npm 10.9.x
- A browser with WebGL2
- Google Chrome or Chromium for `npm run lighthouse`
- [gitleaks](https://github.com/gitleaks/gitleaks) on PATH for `npm run security:secrets` and the pre-commit hook
- [Semgrep](https://semgrep.dev) 1.174.0 (`pip install semgrep`) for `npm run security:sast`. Use the `pysemgrep` / `semgrep` binary, not `python -m semgrep`.
- Playwright Chromium for `npm run test:e2e` (`npx playwright install chromium`)

## Install

```bash
npm ci
npx playwright install chromium
pre-commit install
```

If `pre-commit` is not on PATH, `python -m pre_commit install` works after
`pip install pre-commit`. `npm ci` needs the lockfile in this repository. For a
first-time install from a dirty tree, `npm install` also works.

## Development

```bash
npm run dev
```

Open the printed local URL. The canvas fills the viewport.

### Controls

| Input                  | Action                                          |
| ---------------------- | ----------------------------------------------- |
| Drag / one-finger drag | Orbit                                           |
| Wheel / pinch          | Dolly                                           |
| `R`                    | Reset camera and parameters                     |
| `[` `]`                | Power down / up                                 |
| `-` `=`                | Iterations down / up                            |
| `P`                    | Cycle palette (ember, aurora, ice, toxic, mono) |
| `Q`                    | Cycle quality (low, medium, high)               |
| Arrow keys             | Orbit                                           |
| `I` `O`                | Dolly in / out                                  |
| `H`                    | Hide / show HUD                                 |

If WebGL2 is missing, an error overlay explains that. There is no CPU fallback.

## Quality gates

| Command                    | What it does                                                        |
| -------------------------- | ------------------------------------------------------------------- |
| `npm run format`           | Prettier write                                                      |
| `npm run format:check`     | Prettier check                                                      |
| `npm run lint`             | ESLint `--max-warnings=0`, stylelint `--max-warnings=0`, htmlhint   |
| `npm run typecheck`        | `tsc --noEmit` for app and node projects                            |
| `npm run test:unit`        | Vitest with coverage thresholds                                     |
| `npm run test:e2e`         | Playwright Chromium                                                 |
| `npm run deadcode`         | knip, dpdm cycles, jscpd `--exit-code 1`                            |
| `npm run security:audit`   | `npm audit --audit-level=moderate`                                  |
| `npm run security:sast`    | Semgrep (project rules + `--config auto`, `--error`)                |
| `npm run security:secrets` | gitleaks working-tree scan                                          |
| `npm run lighthouse`       | Chrome Lighthouse desktop: Performance / A11y / Best Practices ≥ 90 |
| `npm run build`            | Typecheck + Vite production build                                   |
| `npm run quality`          | All of the above except e2e and lighthouse                          |
| `npm run quality:ci`       | quality without secrets + lighthouse                                |
| `npm run preview`          | Serve `dist/`                                                       |

Coverage excludes the WebGL draw loop (`src/app.ts`, `src/renderer.ts`) and the
composition root (`src/main.ts`). Camera, input, params, HUD, boot, and shader
compile/link paths are tested.

## Environment variables

None required. See `.env.example`.

Optional: Vite's `base` is `./` so GitHub project pages and user pages both
resolve assets. You do not need `VITE_BASE` unless you change that.

## Project structure

```
index.html                 canvas, HUD, error overlay
src/main.ts                boot + start the explorer
src/boot.ts                canvas + WebGL2, fail closed
src/app.ts                 pointer, keyboard, rAF loop
src/renderer.ts            uniforms + draw
src/shaders/               Mandelbulb distance estimator
src/orbit-camera.ts        azimuth / elevation / distance
src/input.ts               key and wheel commands
src/constants.ts           every tunable
e2e/                       Playwright
.github/workflows/ci.yml   quality + Pages deploy
```

## Build and deploy

```bash
npm run build
npm run preview
```

Production JS in `dist/assets` is about 15 KiB uncompressed (about 5.5 KiB
gzip), under the 80 KiB budget.

GitHub Actions (`.github/workflows/ci.yml`) runs quality gates on pull requests
and on `main`. Pushes to `main` upload `dist/` and deploy to GitHub Pages
(source: GitHub Actions). Action SHAs are pinned; see PLAN.md.

## Security

- Static site, no user data, no secrets at runtime
- HUD uses `textContent`, never `innerHTML`
- Production HTML injects a strict CSP (`default-src 'self'`, no inline scripts)
- `.env` is gitignored; `.env.example` documents that nothing is required
- gitleaks in pre-commit (`protect --staged`) and CI
- Residual risk: GitHub Pages cannot set `frame-ancestors`; clickjacking of a
  public visual toy is accepted

## Troubleshooting

- **Black canvas with an error overlay** — the browser has no WebGL2. Use a
  current Chromium, Firefox, or Safari.
- **`gitleaks` not found** — install the binary. CI still runs gitleaks-action.
- **TypeScript 7** — do not upgrade. typescript-eslint 8.67.0 peers stop at
  `<6.1.0`. See PLAN.md.
- **`python -m semgrep` exits 2** — that entry point is a deprecated stub.
  Use `npm run security:sast`, which runs `pysemgrep`.
- **`semgrep` / `pysemgrep` not found** — `pip install semgrep`. On Windows a
  pip `--user` install puts the binary in the user Python Scripts directory;
  `npm run security:sast` adds that directory to PATH.

## License

MIT
