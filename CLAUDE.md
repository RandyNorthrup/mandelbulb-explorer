# Claude instructions — Mandelbulb Explorer

Follow `AGENTS.md` and `PLAN.md`. Project-local only; do not write global
Claude memory for this repository.

- Stack: Vite 8 + TypeScript 6.0.3 + WebGL2. No UI framework.
- Gates: `npm run quality`. ESLint `--max-warnings=0`. knip `--strict`.
  Cycles via `dpdm`, not madge.
- TypeScript stays on 6.x until typescript-eslint peers include 7.
- No `any`, no fake WebGL fallback, no `innerHTML` for HUD.
- Tunables live in `src/constants.ts`.
- Update PLAN.md, CHANGELOG.md, and README.md with facts, not hopes.
- A milestone is incomplete until its PLAN.md certification checklist
  passes. Do not skip planted-failure proving for new gates.
