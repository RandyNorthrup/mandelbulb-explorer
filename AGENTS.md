# Agent instructions — Mandelbulb Explorer

Project-local rules. Do not write global agent memory or user-level IDE
settings for this work.

## What this is

A static, client-only WebGL2 raymarched 3D Mandelbulb explorer. There is no
backend, no auth, no database, and no required environment variables.

## Code standards

- TypeScript strictness is the `tsconfig.strict.json` set, including
  `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- No unexplained magic numbers. Put tunables in `src/constants.ts`.
- No `any`, no non-null assertions, no `@ts-ignore`. `ts-expect-error` needs
  a description and an entry in PLAN.md under "Escape hatches tracker".
- No silent catch, empty fallback, fake render, or mock data in production
  paths. If WebGL2 or a shader fails, show the error overlay.
- HUD and overlays use `textContent`, never `innerHTML`.
- Do not add a dependency without a purpose, a compatibility check against
  peers, and a PLAN.md version note.

## Quality gates

Run `npm run quality` before claiming a milestone is done. Commands:

- `npm run format` / `npm run format:check`
- `npm run lint` (eslint `--max-warnings=0`, stylelint `--max-warnings=0`, htmlhint)
- `npm run typecheck`
- `npm run test:unit` (coverage thresholds are load-bearing)
- `npm run test:e2e`
- `npm run deadcode` (knip, dpdm cycles, jscpd)
- `npm run security:audit`
- `npm run security:sast` (Semgrep; do not use `python -m semgrep`)
- `npm run security:secrets`
- `npm run lighthouse` (Chrome; Performance/A11y/Best Practices floors 90)
- `npm run build`

Do not lower a coverage threshold to make a dead branch pass. Delete the
branch or test it.

Cycle detection is `dpdm`, not knip `cycles` and not `madge`.

## Documentation

- `PLAN.md` is updated when a decision, version pin, or gate result changes.
- `CHANGELOG.md` records what landed, in Keep a Changelog / semver form.
- `README.md` only documents commands that have been run successfully.
- A milestone is not done until its certification checklist in PLAN.md is
  checked.

## Security

- No secrets in the repo. `.env` is gitignored.
- gitleaks runs in pre-commit and CI.
- Production CSP is injected at build time only.

## Testing

- Assert the behaviour (for example `event.defaultPrevented`), not a
  downstream symptom that can be true for unrelated reasons.
- Give the assertion a negative case so it can fail.
- Do not dual-implement the Mandelbulb on the CPU "for tests".
