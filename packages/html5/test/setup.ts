/**
 * Shared setup for DOM (jsdom) tests in the html5 package.
 *
 * jsdom does not implement requestAnimationFrame unless the environment is
 * created with `pretendToBeVisual`, and psgraph's rput rendering relies on it.
 * Polyfill with a timer so rendering tests are deterministic.
 */
if (typeof (globalThis as any).requestAnimationFrame === 'undefined') {
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0) as unknown as number;
  (globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
}
