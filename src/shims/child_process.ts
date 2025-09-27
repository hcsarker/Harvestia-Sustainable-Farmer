// Browser shim for Node's child_process. Some dependencies reference it in code paths
// that should be tree-shaken out for the browser, but bundlers may still attempt to resolve it.
// We export minimal stubs so the build can proceed. If called at runtime, they will throw.

export function spawn(): never {
  throw new Error('child_process.spawn is not available in the browser environment')
}

export function execFile(): never {
  throw new Error('child_process.execFile is not available in the browser environment')
}

export default {
  spawn,
  execFile,
}
