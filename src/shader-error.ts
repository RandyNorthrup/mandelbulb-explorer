export class ShaderError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'ShaderError'
  }
}
