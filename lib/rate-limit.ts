/**
 * Small in-memory rate limiters for calls to third-party APIs. Each server
 * instance keeps its own counts, so the global ceiling is set well below the
 * provider's published limit.
 */

export class SlidingWindow {
  private hits: number[] = [];
  private readonly limit: number;
  private readonly windowMs: number;
  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /** Record a call if allowed; false when the window is full. */
  take(now = Date.now()): boolean {
    this.hits = this.hits.filter((t) => now - t < this.windowMs);
    if (this.hits.length >= this.limit) return false;
    this.hits.push(now);
    return true;
  }
}

/** Per-key windows (e.g. per visitor), with old keys forgotten to bound memory. */
export class KeyedWindows {
  private windows = new Map<string, SlidingWindow>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly maxKeys: number;
  constructor(limit: number, windowMs: number, maxKeys = 5_000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.maxKeys = maxKeys;
  }

  take(key: string, now = Date.now()): boolean {
    let w = this.windows.get(key);
    if (!w) {
      if (this.windows.size >= this.maxKeys) this.windows.clear();
      w = new SlidingWindow(this.limit, this.windowMs);
      this.windows.set(key, w);
    }
    return w.take(now);
  }
}
