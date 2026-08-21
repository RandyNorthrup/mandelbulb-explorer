import { BootError } from './boot'
import { ERROR_SELECTOR, UNKNOWN_BOOT_FAILURE } from './constants'

export function formatUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return UNKNOWN_BOOT_FAILURE
}

export function revealErrorOverlay(root: ParentNode, message: string): void {
  const overlay = root.querySelector(ERROR_SELECTOR)
  if (!(overlay instanceof HTMLElement)) {
    throw new BootError(
      `Error overlay ${ERROR_SELECTOR} is missing; original message: ${message}`,
    )
  }
  overlay.hidden = false
  overlay.textContent = message
}
