declare module 'secure-remove' {
  function secureRemove(path: string, options?: Record<string, unknown>): Promise<void>
  export default secureRemove
}
