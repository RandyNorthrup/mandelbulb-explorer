Follow AGENTS.md and PLAN.md.

This repository is a static Vite + TypeScript WebGL2 Mandelbulb explorer.
There is no backend.

Requirements:

- TypeScript 6.0.3 until typescript-eslint supports 7.
- Strict type-aware ESLint. `--max-warnings=0`.
- Named constants instead of magic numbers (`src/constants.ts`).
- Fail closed when WebGL2 or shaders are unavailable.
- Never use `innerHTML` for the HUD.
- Run `npm run quality` before considering work done.
- Cycle detection is `dpdm`. Do not add `madge`.
- Update PLAN.md, CHANGELOG.md, and README.md with verified facts.
