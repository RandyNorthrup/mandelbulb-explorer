import { boot } from './boot'
import { startExplorer } from './app'
import { formatUnknownError, revealErrorOverlay } from './error-overlay'
import './styles.css'

try {
  const { canvas, gl } = boot(document)
  startExplorer(canvas, gl, document)
} catch (error: unknown) {
  revealErrorOverlay(document, formatUnknownError(error))
}
