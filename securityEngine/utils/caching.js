class CacheManager {
  constructor(defaultTtlMs = 300000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTtl = defaultTtlMs;
  }

  set(key, value, ttlMs = this.defaultTtl) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = CacheManager;
