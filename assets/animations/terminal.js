class TypingAnimation {
  constructor(options = {}) {
    this.defaultSpeed = options.speed ?? 15;
    this.outputElement = options.outputElement || null;
    this.cursorElement = options.cursorElement || null;
    this.onChar = options.onChar || null;
    this.onComplete = options.onComplete || null;
    this.isTyping = false;
    this.skipRequested = false;
    this.currentText = '';
    this.renderedText = '';
    this.animationFrameId = null;
  }

  async type(text, speed = this.defaultSpeed) {
    this.currentText = text;
    this.renderedText = '';
    this.isTyping = true;
    this.skipRequested = false;
    if (this.cursorElement) this.cursorElement.classList.add('typing');
    const chars = [...text];
    for (let i = 0; i < chars.length; i++) {
      if (this.skipRequested) { this.renderedText = text; this._renderOutput(); break; }
      this.renderedText += chars[i];
      this._renderOutput();
      if (this.onChar) this.onChar(chars[i], i, text);
      await this._delay(speed);
    }
    this.isTyping = false;
    if (this.cursorElement) this.cursorElement.classList.remove('typing');
    if (this.onComplete) this.onComplete(this.renderedText);
  }

  skip() { this.skipRequested = true; }
  stop() { this.skipRequested = true; this.isTyping = false; if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; } }
  reset() { this.stop(); this.currentText = ''; this.renderedText = ''; if (this.outputElement) this.outputElement.innerHTML = ''; }

  _renderOutput() {
    if (!this.outputElement) return;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(() => { this.outputElement.innerHTML = this.renderedText; this.animationFrameId = null; });
  }

  _delay(ms) {
    if (typeof ReducedMotion !== 'undefined' && ReducedMotion.isEnabled) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class BlinkingCursor {
  constructor(options = {}) {
    this.container = options.container || null;
    this.blinkRate = options.blinkRate ?? 1000;
    this.element = null;
    this.isBlinking = false;
    this.isTyping = false;
  }
  create() {
    if (this.element) return this.element;
    this.element = document.createElement('span');
    this.element.className = 'terminal-cursor';
    this.element.setAttribute('aria-hidden', 'true');
    if (typeof ReducedMotion !== 'undefined' && ReducedMotion.isEnabled) this.element.classList.add('reduced-motion');
    if (this.container) this.container.appendChild(this.element);
    return this.element;
  }
  start() { if (!this.element) this.create(); this.isBlinking = true; this.element.classList.remove('typing', 'paused'); }
  stop() { this.isBlinking = false; if (this.element) this.element.classList.add('paused'); }
  setTypingMode(isTyping) { this.isTyping = isTyping; if (this.element) this.element.classList.toggle('typing', isTyping); }
  show() { if (this.element) this.element.style.display = 'inline-block'; }
  hide() { if (this.element) this.element.style.display = 'none'; }
  destroy() { if (this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element); this.element = null; }
}

const SyntaxHighlighter = {
  patterns: [
    { regex: /^(┌|└|│|─|┬|├|┴|┼)/gm, class: 'terminal-header' },
    { regex: /^\s{2}\[([A-Z\s&]+)\]$/gm, class: 'terminal-section' },
    { regex: /^(\s{2}•)/gm, class: 'terminal-bullet' },
    { regex: /(https?:\/\/[^\s<>"]+|[\w.-]+@[\w.-]+\.\w{2,})/g, class: 'terminal-link' },
    { regex: /^(Command not found.*|Error:.*)$/gm, class: 'terminal-error' },
    { regex: /^(\$\s)/gm, class: 'terminal-prompt' }
  ],
  escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, c => map[c]);
  },
  highlight(text) {
    let result = this.escapeHtml(text);
    for (const { regex, class: cls } of this.patterns) {
      result = result.replace(regex, match => `<span class="${cls}">${match}</span>`);
    }
    return result;
  }
};

const ASCIIBanner = {
  variants: [
    `
  ┌──────────────────────────────────────────────────┐
  │                                                  │
  │   ╔═══════╗                                      │
  │   ║  S B  ║  SBrophy-dev                         │
  │   ╚═══════╝                                      │
  │                                                  │
  │   Infrastructure Engineer                        │
  │   Cloud · Automation · Security                  │
  │                                                  │
  │   Type "help" for available commands             │
  │                                                  │
  └──────────────────────────────────────────────────┘`,
    `
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║   ┏━━━━━━━┓                                      ║
  ║   ┃  S B  ┃  SBrophy-dev                         ║
  ║   ┗━━━━━━━┛  terminal v1.0                       ║
  ║                                                  ║
  ║   ☁ Cloud  ·  ⚙ Automation  ·  🔒 Security      ║
  ║                                                  ║
  ║   Type "help" for available commands             ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝`,
    `
  ┌──────────────────────────────────────────────────┐
  │                                                  │
  │   ┌───────┐                                      │
  │   │ ╔═╗╔╗ │                                      │
  │   │ ╚═╗╠╩╗│  SBrophy-dev                         │
  │   │ ╚═╝╚═╝│  terminal v1.0                       │
  │   └───────┘                                      │
  │                                                  │
  │   Type "help" for available commands             │
  │                                                  │
  └──────────────────────────────────────────────────┘`
  ],
  getRandom() { return this.variants[Math.floor(Math.random() * this.variants.length)]; },
  render(useRandom = true) { return `<span class="terminal-banner">${useRandom ? this.getRandom() : this.variants[0]}</span>`; },
  getPlainText(useRandom = true) { return useRandom ? this.getRandom() : this.variants[0]; }
};

class GlitchEffect {
  constructor(options = {}) {
    this.element = options.element || null;
    this.duration = options.duration ?? 300;
    this.isEnabled = true;
    this.timeoutId = null;
    if (typeof ReducedMotion !== 'undefined') {
      this.isEnabled = !ReducedMotion.isEnabled;
      ReducedMotion.onChange((enabled) => { this.isEnabled = !enabled; });
    }
  }
  trigger() {
    if (!this.element || !this.isEnabled) return Promise.resolve();
    return new Promise((resolve) => {
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.element.classList.add('glitching');
      this.timeoutId = setTimeout(() => { this.element.classList.remove('glitching'); this.timeoutId = null; resolve(); }, this.duration);
    });
  }
}

const TerminalFeedback = {
  isLoading: false,
  inputElement: null,
  outputElement: null,
  init(inputEl, outputEl) { this.inputElement = inputEl; this.outputElement = outputEl; },
  showLoading() {
    if (this.isLoading || !this.outputElement) return;
    this.isLoading = true;
    if (this.inputElement) this.inputElement.disabled = true;
    const span = document.createElement('span');
    span.className = 'terminal-loading';
    span.textContent = 'Processing';
    this.outputElement.appendChild(span);
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  },
  hideLoading() {
    if (!this.isLoading || !this.outputElement) return;
    this.isLoading = false;
    if (this.inputElement) { this.inputElement.disabled = false; this.inputElement.focus(); }
    const el = this.outputElement.querySelector('.terminal-loading');
    if (el) el.remove();
  },
  showError(message) {
    if (!this.outputElement) return;
    const span = document.createElement('span');
    span.className = 'terminal-error';
    span.textContent = '\n  ' + message + '\n';
    this.outputElement.appendChild(span);
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  },
  getIsLoading() { return this.isLoading; }
};

class MatrixEffect {
  constructor(options = {}) {
    this.container = options.container || null;
    this.fontSize = options.fontSize ?? 14;
    this.color = options.color || 'rgba(255, 153, 0, 0.6)';
    this.fadeColor = options.fadeColor || 'rgba(17, 17, 24, 0.05)';
    this.canvas = null;
    this.ctx = null;
    this.columns = [];
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    this.isRunning = false;
    this.animationFrameId = null;
    this.isEnabled = true;
    if (typeof ReducedMotion !== 'undefined') {
      this.isEnabled = !ReducedMotion.isEnabled;
      ReducedMotion.onChange((enabled) => { this.isEnabled = !enabled; if (enabled && this.isRunning) this.stop(); });
    }
  }
  init() {
    if (typeof HTMLCanvasElement === 'undefined') return null;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'matrix-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.6;';
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return null;
    if (this.container) this.container.appendChild(this.canvas);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    return this.canvas;
  }
  resize() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    const count = Math.floor(this.canvas.width / this.fontSize);
    this.columns = [];
    for (let i = 0; i < count; i++) this.columns[i] = Math.random() * (this.canvas.height / this.fontSize);
  }
  start() {
    if (!this.isEnabled) return false;
    if (!this.canvas) this.init();
    if (!this.canvas || !this.ctx) return false;
    this.isRunning = true;
    this.animate();
    return true;
  }
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
    if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  toggle() { if (this.isRunning) { this.stop(); return false; } return this.start(); }
  animate() {
    if (!this.isRunning || !this.ctx || !this.canvas) return;
    this.ctx.fillStyle = this.fadeColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.color;
    this.ctx.font = `${this.fontSize}px "JetBrains Mono", monospace`;
    for (let i = 0; i < this.columns.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      this.ctx.fillText(char, i * this.fontSize, this.columns[i] * this.fontSize);
      if (this.columns[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) this.columns[i] = 0;
      this.columns[i]++;
    }
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
  destroy() { this.stop(); if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas); this.canvas = null; this.ctx = null; }
}

const SoundSystem = {
  isEnabled: false,
  isUnlocked: false,
  audioContext: null,
  soundBuffers: new Map(),
  init() {
    if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') return false;
    try { this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
    const unlock = () => {
      if (this.isUnlocked) return;
      if (this.audioContext && this.audioContext.state === 'suspended') this.audioContext.resume().then(() => { this.isUnlocked = true; }).catch(() => {});
      else this.isUnlocked = true;
      ['click', 'keydown', 'touchstart'].forEach(ev => document.removeEventListener(ev, unlock));
    };
    ['click', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, unlock, { once: true }));
    return true;
  },
  toggle() { this.isEnabled = !this.isEnabled; return this.isEnabled; },
  async play(name) {
    if (!this.isEnabled || !this.audioContext || !this.isUnlocked) return;
    let buffer = this.soundBuffers.get(name);
    if (!buffer) buffer = await this.createSyntheticSound(name);
    if (!buffer) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  },
  createSyntheticSound(name) {
    if (!this.audioContext) return null;
    const ctx = this.audioContext;
    let buffer;
    switch (name) {
      case 'keystroke': buffer = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate); { const d = buffer.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-(i / d.length) * 20) * 0.3; } break;
      case 'success': buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate); { const d = buffer.getChannelData(0); for (let i = 0; i < d.length; i++) { const t = i / ctx.sampleRate; d[i] = (Math.sin(2 * Math.PI * 880 * t) * 0.5 + Math.sin(2 * Math.PI * 1108.73 * t) * 0.5) * Math.exp(-t * 8) * 0.2; } } break;
      case 'error': buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate); { const d = buffer.getChannelData(0); for (let i = 0; i < d.length; i++) { const t = i / ctx.sampleRate; d[i] = Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 5) * 0.3; } } break;
      default: return null;
    }
    this.soundBuffers.set(name, buffer);
    return buffer;
  }
};
