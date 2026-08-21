import { defineConfig } from 'vite'

const PRODUCTION_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "font-src 'self'",
  "worker-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

export default defineConfig(({ command }) => ({
  base: './',
  build: {
    target: 'es2023',
    sourcemap: true,
  },
  plugins:
    command === 'build'
      ? [
          {
            name: 'production-csp',
            transformIndexHtml(html: string): string {
              const headOpen = '<head>'
              if (!html.includes(headOpen)) {
                throw new Error('Cannot inject CSP: index.html has no <head>.')
              }
              const meta = `<meta http-equiv="Content-Security-Policy" content="${PRODUCTION_CSP}">`
              return html.replace(headOpen, () => `${headOpen}\n    ${meta}`)
            },
          },
        ]
      : [],
}))
