const MotionUtils = {
  easing: {
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  },

  timing: {
    debounce(fn, ms) {
      let timeoutId = null;
      return function debounced(...args) {
        if (timeoutId !== null) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { fn.apply(this, args); timeoutId = null; }, ms);
      };
    },
    throttle(fn, ms) {
      let lastCall = 0, timeoutId = null;
      return function throttled(...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;
        if (timeSinceLastCall >= ms) {
          lastCall = now;
          fn.apply(this, args);
        } else {
          if (timeoutId !== null) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => { lastCall = Date.now(); fn.apply(this, args); timeoutId = null; }, ms - timeSinceLastCall);
        }
      };
    },
    rafThrottle(fn) {
      let ticking = false, lastArgs = null;
      return function rafThrottled(...args) {
        lastArgs = args;
        if (!ticking) {
          requestAnimationFrame(() => { fn.apply(this, lastArgs); ticking = false; });
          ticking = true;
        }
      };
    }
  }
};

const ReducedMotion = {
  mediaQuery: null,
  isEnabled: false,
  callbacks: new Set(),

  init() {
    if (typeof window.matchMedia !== 'function') { this.isEnabled = false; return; }
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const manualOverride = document.documentElement.getAttribute('data-reduced-motion');
    this.isEnabled = manualOverride !== null ? manualOverride === 'true' : this.mediaQuery.matches;

    this.mediaQuery.addEventListener('change', (e) => {
      const override = document.documentElement.getAttribute('data-reduced-motion');
      if (override === null) {
        this.isEnabled = e.matches;
        this.callbacks.forEach((cb) => { try { cb(this.isEnabled); } catch (err) {} });
      }
    });

    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-reduced-motion') {
          this.isEnabled = document.documentElement.getAttribute('data-reduced-motion') === 'true';
          this.callbacks.forEach((cb) => { try { cb(this.isEnabled); } catch (err) {} });
        }
      });
    }).observe(document.documentElement, { attributes: true });
  },

  onChange(callback) {
    this.callbacks.add(callback);
    return () => { this.callbacks.delete(callback); };
  }
};

const ObserverRegistry = {
  observers: new Map(),
  elementCallbacks: new Map(),

  _generateKey(options) {
    const threshold = Array.isArray(options.threshold) ? options.threshold.join(',') : String(options.threshold || 0);
    return `${options.root ? 'custom' : 'default'}|${options.rootMargin || '0px'}|${threshold}`;
  },

  getObserver(options = {}) {
    const key = this._generateKey(options);
    if (this.observers.has(key)) return this.observers.get(key);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const data = this.elementCallbacks.get(entry.target);
        if (data && data.key === key) data.callback(entry);
      });
    }, { root: options.root || null, rootMargin: options.rootMargin || '0px', threshold: options.threshold || 0 });
    this.observers.set(key, observer);
    return observer;
  },

  observe(element, callback, options = {}) {
    if (!element || typeof callback !== 'function') return;
    if (this.elementCallbacks.has(element)) this.unobserve(element);
    const key = this._generateKey(options);
    this.elementCallbacks.set(element, { callback, key });
    this.getObserver(options).observe(element);
  },

  unobserve(element) {
    if (!element) return;
    const data = this.elementCallbacks.get(element);
    if (!data) return;
    const observer = this.observers.get(data.key);
    if (observer) observer.unobserve(element);
    this.elementCallbacks.delete(element);
  },

  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.elementCallbacks.clear();
  }
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ReducedMotion.init());
  } else {
    ReducedMotion.init();
  }

  // Cleanup on page unload to prevent memory leaks
  window.addEventListener('pagehide', () => {
    ObserverRegistry.destroy();
  });
}
