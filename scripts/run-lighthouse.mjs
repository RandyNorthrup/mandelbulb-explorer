import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { launch } from 'chrome-launcher'
import lighthouse, { desktopConfig } from 'lighthouse'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PREVIEW_HOST = '127.0.0.1'
const PREVIEW_PORT = 4173
const PREVIEW_URL = `http://${PREVIEW_HOST}:${String(PREVIEW_PORT)}/`
const READY_TIMEOUT_MS = 30_000
const READY_POLL_MS = 250
const PERCENT = 100
const REPORT_DIR = path.join(PROJECT_ROOT, 'lighthouse-report')
const VITE_BIN = path.join(PROJECT_ROOT, 'node_modules', 'vite', 'bin', 'vite.js')

// Scores are 0–100. SEO is out of scope.
// Performance: a full-viewport WebGL rAF loop on GitHub-hosted Linux
// (no GPU) scored 60. A local discrete GPU scored 100. The floor is the
// CI-realistic regression bar, not the GPU machine. Update PLAN.md when
// these change.
const SCORE_FLOORS = {
  performance: 50,
  accessibility: 90,
  'best-practices': 90,
}

const CATEGORIES = ['performance', 'accessibility', 'best-practices']

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function waitForPreview() {
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      const response = await fetch(PREVIEW_URL)
      if (response.ok) {
        return
      }
    } catch {
      // Preview is not listening yet.
    }
    await sleep(READY_POLL_MS)
  }
  throw new Error(`Preview server did not become ready at ${PREVIEW_URL}`)
}

function stopProcess(child) {
  if (child.pid === undefined) {
    return
  }
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }
  child.kill('SIGTERM')
}

function startPreview() {
  return spawn(
    process.execPath,
    [
      VITE_BIN,
      'preview',
      '--host',
      PREVIEW_HOST,
      '--port',
      String(PREVIEW_PORT),
      '--strictPort',
    ],
    {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: process.env,
    },
  )
}

function assertScores(lhr) {
  const categories = lhr.categories
  if (categories === undefined) {
    throw new Error('Lighthouse report is missing categories.')
  }
  const scores = {}
  const failures = []
  for (const id of CATEGORIES) {
    const category = categories[id]
    if (category === undefined || typeof category.score !== 'number') {
      throw new Error(`Lighthouse report is missing category ${id}.`)
    }
    const score = Math.round(category.score * PERCENT)
    scores[id] = score
    const floor = SCORE_FLOORS[id]
    if (floor === undefined) {
      throw new Error(`No score floor configured for ${id}.`)
    }
    if (score < floor) {
      failures.push(`${id}: ${String(score)} < ${String(floor)}`)
    }
  }
  console.log('Lighthouse scores (desktop):', scores)
  mkdirSync(REPORT_DIR, { recursive: true })
  writeFileSync(
    path.join(REPORT_DIR, 'scores.json'),
    `${JSON.stringify({ scores, floors: SCORE_FLOORS }, null, 2)}\n`,
  )
  writeFileSync(path.join(REPORT_DIR, 'report.json'), `${JSON.stringify(lhr)}\n`)
  if (failures.length > 0) {
    throw new Error(`Lighthouse floors not met: ${failures.join('; ')}`)
  }
}

async function main() {
  const distIndex = path.join(PROJECT_ROOT, 'dist', 'index.html')
  if (!existsSync(distIndex)) {
    throw new Error(
      'dist/index.html is missing. Run npm run build before npm run lighthouse.',
    )
  }
  const preview = startPreview()
  const chrome = await launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
    logLevel: 'silent',
  })
  try {
    await waitForPreview()
    const result = await lighthouse(
      PREVIEW_URL,
      {
        port: chrome.port,
        output: 'json',
        onlyCategories: CATEGORIES,
        logLevel: 'error',
      },
      desktopConfig,
    )
    if (result === undefined) {
      throw new Error('Lighthouse returned no result.')
    }
    assertScores(result.lhr)
  } finally {
    chrome.kill()
    stopProcess(preview)
  }
}

await main()
