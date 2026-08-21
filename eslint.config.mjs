// Strict flat ESLint config (ESLint 9+). Adapted from the high-quality-projects
// skill template: type-aware strictTypeChecked + unicorn, with browser globals
// and config-file overrides.
//
// PIN TYPESCRIPT TO 6.x. typescript-eslint 8.67.0 declares
// peerDependencies.typescript ">=4.8.4 <6.1.0". TypeScript 7 would install
// and then silently drop every type-aware rule. Verified 2026-08-20.

import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import unicorn from 'eslint-plugin-unicorn'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // Two programs: app (DOM) and node (Vite/Playwright configs).
        // projectService only auto-discovers the nearest tsconfig.json and
        // would type-check configs as browser code or not at all.
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { unicorn },
    rules: {
      ...unicorn.configs.recommended.rules,
      'no-unused-private-class-members': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', 'ts-ignore': true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2, 100],
          ignoreArrayIndexes: true,
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/number-literal-case': 'off',
      'unicorn/prefer-global-this': 'off',
      // Renames `params` → `parameters`, `len` → `length_`, and `cosEl` →
      // `cosElement`. Those are worse names for this codebase.
      'unicorn/name-replacements': 'off',
      'unicorn/consistent-boolean-name': 'off',
      // Iterator.prototype.toArray is ES2025; this project targets ES2023.
      'unicorn/prefer-iterator-to-array': 'off',
    },
  },
  {
    files: ['src/constants.ts'],
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/tests/**',
      'e2e/**/*.ts',
      '*.config.ts',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },
  {
    files: ['*.config.ts', 'playwright.config.ts', 'e2e/**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'unicorn/filename-case': 'off',
      // ProcessEnv is an index signature; noPropertyAccessFromIndexSignature
      // requires process.env['CI'], which fights stylistic dot-notation.
      '@typescript-eslint/dot-notation': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: { 'unicorn/filename-case': 'off' },
  },
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
)
