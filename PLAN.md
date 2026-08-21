# PLAN — Mandelbulb Explorer

Interactive WebGL2 raymarched 3D Mandelbulb. Static client-only web app.

This file records decisions, version verification, gates, and milestone
certification. It is the source of truth for what is planned versus what
has been proven.

## Assumptions

- Empty workspace on 2026-08-20. No source, no configs, not a git repository.
  Confirmed by inventorying the directory (bash `detect-stack.sh` could not
  run: WSL `/bin/bash` is missing on this machine; the same checks were run
  in PowerShell).
- Product: 3D Mandelbulb, pointer + keyboard + HUD, GitHub Actions + GitHub
  Pages. Chosen by the user in the setup questionnaire.
- No backend, database, authentication, or third-party APIs.
- No runtime secrets. No required environment variables.
- License: MIT (cheap default; change if a different license is required).
- Package manager: npm 10.9.3 (already on PATH). Node v22.19.0, which
  satisfies Vite 8's `^20.19.0 || >=22.12.0` engine range.
- No UI framework. A full-viewport canvas does not benefit from React/Vue
  and a framework would add bundle, lint surface, and test cost for no
  interaction model we need.
- Browser support: last two versions of Chromium, Firefox, and Safari with
  WebGL2. WebGL2 is required; the app fails closed with a visible error
  rather than falling back to a fake 2D rendering.
- GitHub Pages project-site and user-site both work because Vite `base` is
  `./` (relative asset URLs).
- CI cannot be executed against GitHub until a remote exists. The workflow
  file is written and reviewed; first live run is Milestone 4.
- `pre-commit` 4.5.1 is installed as a Python module (`python -m pre_commit`).
  The `pre-commit` executable is not on PATH. Hooks invoke
  `python -m pre_commit` and the `gitleaks` binary (8.30.1, on PATH).
- Semgrep 1.174.0 is installed via pip. The working CLI is `pysemgrep`;
  `python -m semgrep` is a deprecated stub. `npm run security:sast` locates
  the binary.

## Resolved decisions

| Decision        | Choice                                              | Why                                                  |
| --------------- | --------------------------------------------------- | ---------------------------------------------------- |
| App type        | Static SPA, client-only                             | Fractal explorer has no server state                 |
| Language        | TypeScript 6.0.3                                    | Type-aware ESLint requires `<6.1.0` (see versions)   |
| Bundler         | Vite 8.2.2                                          | Official current Vite; engines match Node 22.19.0    |
| UI              | Vanilla DOM + WebGL2                                | Canvas is the UI; HUD is a small overlay             |
| Rendering       | WebGL2 fragment-shader raymarcher                   | Real-time Mandelbulb distance estimator              |
| Interaction     | Pointer orbit, wheel dolly, keyboard, HUD           | User choice                                          |
| Tests           | Vitest 4 unit + Playwright e2e                      | Unit for math/input; e2e for canvas boot             |
| Style           | Prettier 3.9.6 + stylelint 17 + htmlhint            | Skill gate set for web                               |
| Lint            | ESLint 10 + typescript-eslint 8 `strictTypeChecked` | Type-aware rules are the point of the stack          |
| Dead code       | knip 6 `--strict` + dpdm cycles                     | knip `cycles` was verified silent in the skill notes |
| Package manager | npm                                                 | Installed; lockfile is `package-lock.json`           |
| CI              | GitHub Actions, Node 22                             | Matches local runtime                                |
| Hosting         | GitHub Pages via Actions                            | User choice                                          |
| Branch          | `main`                                              | Default for Pages deploy job                         |

## Open questions

- Whether a custom domain will be used. Not needed for v0.1.1.
- Lighthouse scores on GitHub Pages hardware/network are a Milestone 4 item
  once the live URL exists. Local desktop scores are the Milestone 3 stand-in.

## Public repository

- Owner: `RandyNorthrup`
- Name: `mandelbulb-explorer` (public)
- Pages URL: `https://randynorthrup.github.io/mandelbulb-explorer/`
- Custom domain: none

## Architecture

```
index.html                 full-viewport page, canvas#viewport, HUD root
src/main.ts                boot: locate DOM, construct app, start loop
src/boot.ts                fail-closed WebGL2 + canvas acquisition
src/app.ts                 rAF loop: input → camera → renderer → HUD
src/constants.ts           every tunable literal lives here
src/orbit-camera.ts        azimuth / elevation / distance / look-at
src/input.ts               pointer, wheel, keyboard → camera + params
src/params.ts              power, iterations, palette, quality (clamped)
src/hud.ts                 accessible overlay bound to params + camera
src/renderer.ts            program, uniforms, resize, draw
src/webgl.ts               compile / link / fullscreen triangle; honest errors
src/math/vec3.ts           vector helpers used by camera
src/math/mat4.ts           if a CPU matrix is required; omit if unused
src/shaders/*.glsl         vertex + Mandelbulb fragment (Vite ?raw)
src/styles.css             HUD + error overlay
e2e/                       Playwright
```

Data flow is unidirectional per frame: input events mutate a small params
and camera state object; the renderer reads it; the HUD reads it. No
framework store.

Honesty rules:

- Missing `#viewport`, failed WebGL2 context, or shader compile/link
  failure throws or shows a blocking error overlay. The canvas is never
  left looking like a successful render of black emptiness without an
  explanation.
- No CPU Mandelbulb fallback.
- No silent catch. Errors surface.

## Research and version verification

Recorded 2026-08-20 from the npm registry (`npm view`) and GitHub API
(`gh api repos/.../git/ref/tags/...`).

### The TypeScript 7 trap (still true)

| Package                               | Version reported                   | Source                                        |
| ------------------------------------- | ---------------------------------- | --------------------------------------------- |
| `typescript` latest                   | 7.0.2                              | `npm view typescript version`                 |
| `typescript-eslint`                   | 8.67.0                             | `npm view typescript-eslint version`          |
| `typescript-eslint` peer `typescript` | `>=4.8.4 <6.1.0`                   | `npm view typescript-eslint peerDependencies` |
| `typescript-eslint` peer `eslint`     | `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` | same                                          |

Installing TypeScript 7 would succeed and then disable every type-aware
ESLint rule (`no-floating-promises`, `no-unsafe-*`, etc.). Pin
**`typescript@6.0.3`**, the highest 6.x release inside the peer range
(`npm view typescript@6 version` lists 6.0.2 and 6.0.3).

### Toolchain pins

| Package                     | Pin     | Why this version                                                                                                                                                                                                                                                                                                                                          |
| --------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript`                | 6.0.3   | Highest in `typescript-eslint` peer range                                                                                                                                                                                                                                                                                                                 |
| `eslint`                    | 10.8.1  | Current; satisfies unicorn `>=10.4` and typescript-eslint `^10`                                                                                                                                                                                                                                                                                           |
| `@eslint/js`                | 10.0.1  | Current `@eslint/js@10` (`npm view @eslint/js@10 version`)                                                                                                                                                                                                                                                                                                |
| `typescript-eslint`         | 8.67.0  | Current; peers match eslint 10 and typescript 6.0.3                                                                                                                                                                                                                                                                                                       |
| `eslint-plugin-unicorn`     | 73.0.0  | Current; peer `eslint >= 10.4`                                                                                                                                                                                                                                                                                                                            |
| `globals`                   | 17.11.0 | Browser globals for ESLint                                                                                                                                                                                                                                                                                                                                |
| `vite`                      | 8.2.2   | Current. Engines `^20.19.0 \|\| >=22.12.0`. Local node is v22.19.0                                                                                                                                                                                                                                                                                        |
| `vitest`                    | 4.1.11  | Current. Peer `vite ^6 \|\| ^7 \|\| ^8`                                                                                                                                                                                                                                                                                                                   |
| `@vitest/coverage-v8`       | 4.1.11  | Must match vitest (peer lists this exact version)                                                                                                                                                                                                                                                                                                         |
| `jsdom`                     | 29.1.1  | Highest jsdom whose engines include Node 22.19.0 (`^20.19.0 \|\| ^22.13.0 \|\| >=24.0.0`). jsdom 30.0.1 requires `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` and npm printed `EBADENGINE` against this machine. Vitest lists `jsdom: "*"` so 29.1.1 is a legal peer. Optional `canvas` peer unused                                                             |
| `prettier`                  | 3.9.6   | Current                                                                                                                                                                                                                                                                                                                                                   |
| `knip`                      | 6.32.2  | Current. Engines `^20.19.0 \|\| >=22.12.0`. Config is `.jsonc`. In 6.32 `--strict` means "production deps only", which would skip every lint package; the fail-closed flags are default `--max-issues 0` and `--treat-config-hints-as-errors`. Explicit `src/**` globs matched zero files on this Windows path, so knip auto-detects via the Vite plugin. |
| `dpdm`                      | 4.3.0   | Cycle gate. Direct dep `typescript ^5.9.3` (nested under dpdm; our tree stays on 6.0.3). No peer on our TypeScript                                                                                                                                                                                                                                        |
| `jscpd`                     | 5.0.16  | Copy-paste gate                                                                                                                                                                                                                                                                                                                                           |
| `stylelint`                 | 17.14.1 | Current                                                                                                                                                                                                                                                                                                                                                   |
| `stylelint-config-standard` | 40.0.0  | Peer `stylelint ^17`                                                                                                                                                                                                                                                                                                                                      |
| `htmlhint`                  | 1.9.2   | Current                                                                                                                                                                                                                                                                                                                                                   |
| `@playwright/test`          | 1.62.1  | Current. Engines `node >=20`                                                                                                                                                                                                                                                                                                                              |
| `@types/node`               | 22.20.1 | Matches Node 22; required by Vite/Vitest optional peer                                                                                                                                                                                                                                                                                                    |
| `lighthouse`                | 13.4.1  | Current. Engines `node >=22.19` (matches this machine). SEO category not run.                                                                                                                                                                                                                                                                             |
| `chrome-launcher`           | 1.2.1   | Lighthouse 13.4.1 dependency; also a direct import in `scripts/run-lighthouse.mjs`                                                                                                                                                                                                                                                                        |
| `chrome-devtools-mcp`       | 1.7.0   | Google's Chrome DevTools MCP for agents. Not imported by the app.                                                                                                                                                                                                                                                                                         |
| `semgrep` (PyPI)            | 1.174.0 | `python -m semgrep` is a stub that exits 2. The working binary is `pysemgrep`.                                                                                                                                                                                                                                                                            |

**Not used:** `madge` (peerOptional `typescript@^5.4.4`; npm would suggest
`--legacy-peer-deps`). Cycle detection is `dpdm`.

### GitHub Actions pins (full commit SHA, 2026-08-20)

Resolved via `gh api repos/<repo>/git/ref/tags/<tag>` (all were commit
objects, not annotated tags).

| Action                          | Tag    | SHA                                        |
| ------------------------------- | ------ | ------------------------------------------ |
| `actions/checkout`              | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node`            | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` |
| `actions/upload-pages-artifact` | v5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| `actions/deploy-pages`          | v5.0.0 | `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128` |
| `gitleaks/gitleaks-action`      | v3.0.0 | `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e` |
| `actions/setup-python`          | v7.0.0 | `5fda3b95a4ea91299a34e894583c3862153e4b97` |
| `browser-actions/setup-chrome`  | v2.2.0 | `48ad923757ca74d66703209fe939badbdf80f2f4` |

`gitleaks-action` v3 is Node 24. It requires `GITHUB_TOKEN`. Organization
repos also need `GITLEAKS_LICENSE`; this project is assumed personal/public.
If the action refuses to run without a license, CI will switch to installing
the gitleaks binary and that change will be recorded here.

### Host tools (this machine)

| Tool       | Present                         | Version / note              |
| ---------- | ------------------------------- | --------------------------- |
| node       | yes                             | v22.19.0                    |
| npm        | yes                             | 10.9.3                      |
| git        | yes                             | 2.52.0.windows.1            |
| gitleaks   | yes                             | 8.30.1                      |
| python     | yes                             | 3.14.0                      |
| pre-commit | yes, via `python -m pre_commit` | 4.5.1                       |
| gh         | yes                             | 2.87.3                      |
| bash/WSL   | **no**                          | `execvpe(/bin/bash)` failed |
| semgrep    | **no**                          | not installed               |
| pnpm       | no                              | unused                      |

## Quality gates

Commands (must fail the process on findings):

| Gate           | Command                    | Fail flag                                                                        |
| -------------- | -------------------------- | -------------------------------------------------------------------------------- |
| format         | `npm run format:check`     | prettier `--check`                                                               |
| lint           | `npm run lint`             | eslint `--max-warnings=0`; stylelint `--max-warnings=0`; htmlhint                |
| types          | `npm run typecheck`        | `tsc --noEmit` (strict + four extra flags)                                       |
| unit tests     | `npm run test:unit`        | vitest non-zero on failure; coverage thresholds                                  |
| dead code      | `npm run deadcode`         | knip (max-issues 0 + config hints as errors); dpdm cycles; jscpd `--threshold 0` |
| security audit | `npm run security:audit`   | `npm audit --audit-level=moderate`                                               |
| secrets        | `npm run security:secrets` | gitleaks non-zero on leak                                                        |
| SAST           | `npm run security:sast`    | Semgrep `--error` with `.semgrep.yml` plus `--config auto`                       |
| lighthouse     | `npm run lighthouse`       | floors 90 for Performance, Accessibility, Best Practices (SEO excluded)          |
| build          | `npm run build`            | vite build                                                                       |
| e2e            | `npm run test:e2e`         | playwright                                                                       |
| aggregate      | `npm run quality`          | all of the above except e2e and lighthouse                                       |
| CI aggregate   | `npm run quality:ci`       | quality without secrets + lighthouse; gitleaks-action is a workflow step         |

A gate is not accepted until it has been seen to fail on a planted case
and then restored. Results live in "Gate proving log" below.

### Coverage policy

Thresholds are load-bearing. If a branch is flagged unreachable, delete it
rather than lower the number, unless the branch is a browser API that tests
cannot reach even with mocks — in which case name it here.

Initial thresholds (Milestone 0, boot + math only):

- statements 80, lines 80, functions 80, branches 75
- include `src/**/*.ts`
- exclude tests, `src/vite-env.d.ts`, GLSL

Shaders are not executed by Vitest. Shader correctness is an e2e + visual
check (non-black framebuffer after a draw, no error overlay).

### Deliberate ESLint loosenings (from the skill template)

- `unicorn/prevent-abbreviations` off
- `unicorn/no-null` off
- `unicorn/number-literal-case` off (fights Prettier)
- `unicorn/prefer-global-this` off (browser `window` typing)
- `no-magic-numbers` off only in `src/constants.ts` and tests
- type-aware rules off for `*.mjs`

Any additional suppression is named, justified inline, and listed here.

## Security

- Static site. Attack surface is XSS in our own DOM writes and dependency
  compromise.
- HUD text is written via `textContent`, never `innerHTML`.
- Production HTML gets a strict CSP (`default-src 'self'`, no `unsafe-inline`
  scripts). Dev server does not inject CSP so Vite HMR keeps working.
- GitHub Pages cannot set arbitrary response headers. CSP meta is the
  residual control. `frame-ancestors` in a meta CSP is ignored by browsers;
  clickjacking residual risk is accepted for a public visual toy.
- `.env` is gitignored. `.env.example` documents that no variables are
  required.
- `npm audit --audit-level=moderate` in `security:audit`.
- gitleaks in pre-commit (`protect --staged`) and in CI.
- `actions/checkout` with `persist-credentials: false`.
- Pages deploy uses `id-token` OIDC, not a stored PAT.

Accepted residual risk: GitHub Pages is a public static host; the fractal
has no user data to steal. Supply-chain risk on npm and Actions is mitigated
by lockfile + SHA-pinned actions, not eliminated.

## Performance gates

- Production build must succeed.
- Bundle budget (Milestone 1+): total hashed JS in `dist/assets` **≤ 80 KiB**
  uncompressed, excluding sourcemaps. No framework, no texture assets.
  Measured with PowerShell `Get-Item` after `npm run build`.
- Frame-time target: 16.7 ms at 1080p on `quality=medium` on a machine with
  a GPU. This is hardware-dependent and is a manual check, not CI.
- Lighthouse (Milestone 3 local preview, Milestone 4 live): Performance,
  Accessibility, Best Practices. SEO is out of scope.

## Documentation requirements

- `README.md` — only commands that have been run successfully.
- `CHANGELOG.md` — Keep a Changelog, semver. Record what landed, not plans.
- `PLAN.md` — this file. Update when a decision or gate result changes.
- Agent instruction files: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`,
  `.github/copilot-instructions.md`. Project-local only.

## Definition of done (project)

- Every milestone certification checklist below has passed, or the
  remaining items are listed as deferred with a reason.
- `npm run quality` exits 0 on this machine.
- The Mandelbulb is visible, orbitable, and zoomable, with a HUD and
  keyboard path for every pointer action.
- WebGL2 failure is a visible error, not a blank canvas.
- Production-ready is **not** claimed until Milestone 4 live CI + Pages
  deploy have actually run.

---

## Milestones

### Milestone 0 — Scaffold and gates

**Goal.** Repository, toolchain, configs, and a boot path that acquires a
canvas and a WebGL2 context or fails honestly. No fractal yet.

**Scope.** Config files, `src/boot.ts`, `src/main.ts`, unit tests for boot
failure/success with a mocked `getContext`, HTML/CSS shells, CI workflow,
pre-commit, agent docs, README, CHANGELOG.

**Files affected.** Everything listed in the scaffold file set; no shader.

**Implementation steps.**

1. Write this PLAN.md (done as the first file).
2. Copy skill templates (`eslint.config.mjs`, `tsconfig.strict.json`,
   `knip.jsonc`) and adapt (browser globals, entries, magic-number override
   path).
3. Add Vite / Vitest / Playwright / Prettier / stylelint / htmlhint /
   editorconfig / gitattributes / gitignore / gitleaks / pre-commit / Actions.
4. Install pinned dependencies. Commit the lockfile.
5. Prove every gate (plant a failure, observe non-zero, revert).
6. `npm run quality` green on the scaffold.
7. README and CHANGELOG from what exists.
8. `git init` and first commit.

**Acceptance criteria.**

- `npm run quality` exits 0.
- Boot throws a named error when `#viewport` is missing.
- Boot throws a named error when `getContext('webgl2')` returns `null`.
- Boot returns the canvas and context when both exist.
- No fractal shader, no fake render.

**Required tests.** `src/boot.test.ts` covers the three paths above. The
success path supplies a mock context; it does not require a real GPU.

**Required gates.** format, lint, typecheck, test:unit, deadcode,
security:audit, security:secrets, build.

**Required docs.** README, CHANGELOG 0.1.0 (scaffold), PLAN gate log,
AGENTS.md and siblings.

**Required security checks.** gitleaks proven with a real-shaped test
secret (not the well-known AWS example allowlist key), then deleted. `.env`
gitignored
before first commit.

**Required performance checks.** Production build succeeds. Bundle budget
does not yet apply (no renderer).

**Certification checklist.**

- [x] Gate proving log complete for every configured gate
- [x] `npm run quality` run, exit 0
- [x] First commit exists (`b4bb9b9`)
- [x] No file that already existed was overwritten (N/A: empty repo)

### Milestone 1 — Raymarched Mandelbulb

**Goal.** A recognizable 3D Mandelbulb on screen at a framed default
camera.

**Scope.** Distance-estimator fragment shader, fullscreen triangle,
orbit-camera math, renderer uniforms, resize, quality-to-step mapping.

**Files affected.** `src/shaders/*`, `src/renderer.ts`, `src/webgl.ts`,
`src/orbit-camera.ts`, `src/math/vec3.ts`, `src/params.ts`,
`src/constants.ts`, tests for camera clamp and params clamp.

**Implementation steps.**

1. Orbit camera: position from azimuth, elevation, distance, target.
   Elevation clamped off the poles. Distance clamped to a named range.
2. WebGL helpers: compile, link, fullscreen triangle. Shader errors throw
   with the info log.
3. Mandelbulb DE in GLSL, orbit-trap coloring, cosine palette, Lambert +
   AO + miss glow, gamma.
4. Default camera frames the bulb (power 8).
5. Window resize updates drawing buffer using `devicePixelRatio` scaled by
   quality.

**Acceptance criteria.**

- `npm run dev` shows a 3D Mandelbulb, not a silhouette disk or 2D
  Mandelbrot.
- Resize does not stretch incorrectly (canvas buffer matches CSS size ×
  pixel ratio × quality scale).
- Shader compile failure shows the overlay, not a black canvas pretending
  to work.
- Bundle JS ≤ 80 KiB uncompressed.

**Required tests.** Camera clamp and look vectors. Params clamp. WebGL
compile/link error paths with mocks. e2e: page loads, canvas present, no
`[data-error]` overlay when WebGL2 exists.

**Required gates.** All of Milestone 0 plus `npm run build` size check.

**Required docs.** README usage (dev, controls still limited). CHANGELOG.

**Required security checks.** HUD still `textContent`. CSP still valid
after adding no inline scripts.

**Required performance checks.** Bundle budget. Manual: medium quality
holds interactive frame rate on the development machine.

**Certification checklist.**

- [x] Mandelbulb visible in local preview (classic 8-bulb, framed, ember palette)
- [x] Camera unit tests pass
- [x] Bundle size recorded: `dist/assets/index-DJpMqBhh.js` 15.19 KiB / 5.54 KiB gzip
- [x] quality green

### Milestone 2 — Pointer, keyboard, HUD

**Goal.** The user can orbit, dolly, reset, and change power / iterations /
palette / quality without a control panel, and can do every action from the
keyboard.

**Scope.** `src/input.ts`, `src/hud.ts`, pointer capture, wheel
`preventDefault`, touch (one-finger orbit, pinch dolly), HUD copy.

**Implementation steps.**

1. Pointer drag → azimuth / elevation. Wheel → distance. Pinch → distance.
2. Keys: `R` reset, `[` `]` power, `-` `=` iterations, `P` palette,
   `Q` quality, `H` HUD, arrows orbit, `I`/`O` dolly. Ignore unrelated keys
   (do not preventDefault on those).
3. HUD lists live values and the keymap. `aria-live="polite"` on a values
   region updated on param changes, not every frame.
4. Canvas `role="img"` and an `aria-label` that includes current power.

**Acceptance criteria.**

- Drag orbits. Wheel dollies. `R` restores named defaults.
- Every pointer action has a keyboard equivalent.
- Wheel and orbit keys call `preventDefault`; a letter key that is not a
  binding does not.
- HUD hide/show works. Fractal remains interactive with HUD hidden.

**Required tests.** Input reducer tests (pure): given a key, state
changes; given a non-binding, state is unchanged. Wheel handler sets
`defaultPrevented`. Do not assert "page did not scroll" — that is the
symptom trap from the skill notes.

**Required gates.** All previous. e2e: dispatch a key `r` after mutating
camera via evaluate, assert HUD shows default distance (or equivalent
observable).

**Required docs.** README keyboard table. CHANGELOG.

**Required security checks.** No `innerHTML` in HUD.

**Required performance checks.** Input handlers do not allocate per-move
beyond named scratch vectors.

**Certification checklist.**

- [x] Pointer + keyboard verified in Playwright (`R` reset, `P` palette) and preview
- [x] preventDefault tests distinguish bound vs unbound keys (`r` vs `x`)
- [x] quality green

### Milestone 3 — Palettes, quality, accessibility, polish

**Goal.** Several palettes, three quality presets, reduced-motion respected
(no damping), contrast-safe HUD, error overlay usable.

**Scope.** Palette table in `constants.ts`, quality presets, CSS, maybe
inertia gated on `prefers-reduced-motion`.

**Implementation steps.**

1. Named palettes (ember, aurora, ice, toxic, mono). Cycle with `P`.
2. Quality: low / medium / high maps to pixel scale and max steps.
3. `prefers-reduced-motion: reduce` disables any camera smoothing.
4. HUD contrast against the dark overlay meets WCAG AA for text.
5. Visual pass: default framing, no clipped HUD on 375px width and 1280px
   width.

**Acceptance criteria.**

- Palette and quality changes are visible.
- Reduced-motion: if smoothing exists, it is off.
- Narrow viewport: HUD readable, canvas fills the viewport.

**Required tests.** Palette cycle wraps. Quality cycle wraps. Prefers-
reduced-motion flag is read through a small function that tests can stub.

**Required gates.** All previous. Lighthouse on local preview:
Accessibility ≥ 90, Best Practices ≥ 90. Performance noted but not a
blocker if GPU canvas paints confuse Lighthouse (record the score).

**Required docs.** README palettes/quality. CHANGELOG.

**Required security / performance.** Re-check CSP and bundle budget.

**Certification checklist.**

- [x] Palettes and quality exercised (`P` → aurora in preview; quality cycle unit-tested)
- [x] Mobile (375×667) and desktop (1280×720) screenshots: HUD readable, canvas fills
- [x] Lighthouse desktop (Chrome locally): Performance 100, Accessibility 98, Best Practices 96. Floors 90/90/90. SEO excluded. chrome-devtools-mcp 1.7.0 is a project MCP.

### Milestone 4 — GitHub Pages live deploy

**Goal.** Push to `main` deploys a working site. CI has actually run.

**Scope.** Workflow already written in M0. This milestone is certification
against a real remote.

**Acceptance criteria.**

- `quality` job green on GitHub.
- Pages URL loads the Mandelbulb.
- Live Lighthouse Accessibility and Best Practices ≥ 90.

**Required tests.** None new.

**Required gates.** CI log attached by reference (run URL) in this file.

**Certification checklist.**

- [ ] Remote exists
- [ ] CI run URL recorded
- [ ] Pages URL recorded
- [ ] Live lighthouse recorded

---

## Gate proving log

Filled during Milestone 0. Each row must have a planted failure, a
non-zero exit, and a revert.

| Gate       | Planted case                                                    | Exit code | Restored | Notes                                                                                              |
| ---------- | --------------------------------------------------------------- | --------- | -------- | -------------------------------------------------------------------------------------------------- |
| prettier   | extra indent in `src/constants.ts`                              | 1         | yes      |                                                                                                    |
| eslint     | `export const planted: any = 1`                                 | 1         | yes      | `@typescript-eslint/no-explicit-any`                                                               |
| tsc        | `const plantedTsc: number = 'nope'`                             | 2         | yes      |                                                                                                    |
| stylelint  | `body { color: RED; }`                                          | 2         | yes      | `value-keyword-case`                                                                               |
| htmlhint   | removed `<title>`                                               | 1         | yes      | `title-require`                                                                                    |
| vitest     | `expect(true).toBe(false)`                                      | 1         | yes      |                                                                                                    |
| knip       | unused `src/dead-file.ts`                                       | 1         | yes      | `--strict` in knip 6.32 means production-deps-only; gate is default max-issues=0                   |
| dpdm       | `cycle-a.ts` ↔ `cycle-b.ts`                                     | 1         | yes      |                                                                                                    |
| jscpd      | cloned 10-line functions                                        | 1         | yes      | Needed `--exit-code 1`; threshold alone still exited 0                                             |
| gitleaks   | staged AWS-shaped access key (not the public allowlist example) | 1         | yes      | `gitleaks protect --staged`                                                                        |
| npm audit  | `minimist@0.0.8`                                                | 1         | yes      | critical prototype pollution; then uninstalled, audit clean                                        |
| vite build | `throw new Error('planted build failure')` in cfg               | 1         | yes      |                                                                                                    |
| semgrep    | `eval('1')` in `src/boot.ts`                                    | 1         | yes      | Local `no-eval` rule. `python -m semgrep` is a deprecated stub (exit 2); launcher uses `pysemgrep` |
| lighthouse | performance floor 101                                           | 1         | yes      | Measured 100 / 98 / 96; floor 101 failed `100 < 101`                                               |

## Deferred gates

| Gate                   | Reason                                                   | Plan                              |
| ---------------------- | -------------------------------------------------------- | --------------------------------- |
| Live GitHub Actions    | No remote yet                                            | Milestone 4                       |
| Live Lighthouse        | No Pages URL yet. Local desktop Lighthouse has been run. | Milestone 4                       |
| bash `detect-stack.sh` | No WSL bash                                              | PowerShell inventory used instead |

## Escape hatches tracker

- `eslint.config.mjs` uses `parserOptions.project` with both
  `tsconfig.json` and `tsconfig.node.json` instead of `projectService`.
  Reason: projectService only auto-discovers the nearest `tsconfig.json`,
  so root config files were either untyped (`allowDefaultProject`, which
  produced `no-unsafe-member-access` on `process.env`) or typed as DOM.
  Both programs are still fully type-aware.
- `*.config.ts` / `e2e/**`: `@typescript-eslint/dot-notation` off.
  Reason: `noPropertyAccessFromIndexSignature` requires `process.env['CI']`
  on Node's `ProcessEnv` index signature; stylistic `dot-notation` wants
  the opposite. Bracket access is the strict-correct form.
- ESLint: `unicorn/name-replacements` off. It wanted `cosEl` → `cosElement`
  and `len` → `length_`.
- ESLint: `unicorn/prefer-iterator-to-array` off. `Iterator#toArray` is
  ES2025; `tsconfig` targets ES2023.
- ESLint: `unicorn/consistent-boolean-name` off. `prevented` matches the
  DOM `defaultPrevented` vocabulary used in input tests.
