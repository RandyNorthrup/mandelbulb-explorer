import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function windowsUserScriptDirs() {
  const appdata = process.env['APPDATA']
  if (appdata === undefined) {
    return []
  }
  const pythonRoot = path.join(appdata, 'Python')
  if (!existsSync(pythonRoot)) {
    return []
  }
  const dirs = []
  for (const name of readdirSync(pythonRoot)) {
    const scripts = path.join(pythonRoot, name, 'Scripts')
    if (existsSync(scripts)) {
      dirs.push(scripts)
    }
  }
  return dirs
}

function resolveSemgrep(searchPath) {
  const names =
    process.platform === 'win32'
      ? ['pysemgrep.exe', 'semgrep.exe']
      : ['pysemgrep', 'semgrep']
  for (const dir of searchPath.split(path.delimiter)) {
    for (const name of names) {
      const candidate = path.join(dir, name)
      if (existsSync(candidate)) {
        return candidate
      }
    }
  }
  return null
}

const extraDirs = process.platform === 'win32' ? windowsUserScriptDirs() : []
const searchPath = [...extraDirs, process.env['PATH'] ?? ''].join(path.delimiter)
const binary = resolveSemgrep(searchPath)
if (binary === null) {
  throw new Error(
    'Semgrep is not installed. On Windows run: pip install semgrep (pysemgrep.exe lands in the user Python Scripts directory). On Ubuntu CI, pip install semgrep==1.174.0.',
  )
}

const args =
  process.argv.length > 2
    ? process.argv.slice(2)
    : ['.', '--config', '.semgrep.yml', '--config', 'auto', '--error']

const env = {
  ...process.env,
  PYTHONUTF8: '1',
  PATH: searchPath,
}

const result = spawnSync(binary, args, { stdio: 'inherit', env, shell: false })
if (result.error) {
  throw result.error
}
const code = result.status
if (code === null) {
  throw new Error('Semgrep was terminated before it returned a status.')
}
process.exit(code)
