const RippleEffect = {
  duration: 600,
  init() {
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', (e) => this.create(e, button));
    });
  },
  create(e, button) {
    if (ReducedMotion.isEnabled) {
      button.classList.add('btn-flash');
      setTimeout(() => button.classList.remove('btn-flash'), 100);
      return;
    }
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    button.appendChild(ripple);
    setTimeout(() => { if (ripple.parentNode === button) button.removeChild(ripple); }, this.duration);
  }
};

const SmoothScroll = {
  maxDuration: 1000,
  minDuration: 500,
  navOffset: 60,
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) { e.preventDefault(); this.scrollTo(target); }
      });
    });
  },
  scrollTo(target) {
    if (ReducedMotion.isEnabled) { target.scrollIntoView(); return; }
    const start = window.scrollY;
    const end = target.getBoundingClientRect().top + start - this.navOffset;
    const distance = Math.abs(end - start);
    const duration = Math.min(this.maxDuration, Math.max(this.minDuration, distance * 0.5));
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      window.scrollTo(0, start + (end - start) * MotionUtils.easing.easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
};

const LoadingStates = {
  init() {
    // Available for future use
  }
};

const FocusRing = {
  init() {
    // Handled by native :focus-visible in CSS
  }
};

const ToastSystem = {
  container: null,
  defaultDuration: 4000,
  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  },
  show(message, type = 'info') {
    if (!this.container) this.init();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-message">${message}</span><button class="toast-close" aria-label="Dismiss"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/></svg></button>`;
    toast.querySelector('.toast-close').addEventListener('click', () => this.dismiss(toast));
    let timeout = setTimeout(() => this.dismiss(toast), this.defaultDuration);
    toast.addEventListener('mouseenter', () => clearTimeout(timeout));
    toast.addEventListener('mouseleave', () => { timeout = setTimeout(() => this.dismiss(toast), this.defaultDuration); });
    this.container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
    return toast;
  },
  dismiss(toast) {
    toast.classList.remove('toast-visible');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
  }
};

const ParticleSystem = {
  minParticles: 15,
  maxParticles: 25,
  minSize: 4,
  maxSize: 12,
  duration: 1000,
  emit(x, y, count = null) {
    if (typeof ReducedMotion !== 'undefined' && ReducedMotion.isEnabled) return;
    const n = count || Math.floor(Math.random() * (this.maxParticles - this.minParticles + 1)) + this.minParticles;
    for (let i = 0; i < n; i++) this.createParticle(x, y);
  },
  createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * (this.maxSize - this.minSize) + this.minSize;
    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 100;
    const vx = Math.cos(angle) * velocity, vy = Math.sin(angle) * velocity;
    particle.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background-color:var(--accent);`;
    document.body.appendChild(particle);
    let startTime = null;
    const animate = (t) => {
      if (!startTime) startTime = t;
      const progress = (t - startTime) / this.duration;
      if (progress < 1) {
        const eased = 1 - Math.pow(1 - progress, 3);
        particle.style.transform = `translate(${vx * eased}px, ${vy * eased + 50 * eased * eased}px)`;
        particle.style.opacity = 1 - progress;
        requestAnimationFrame(animate);
      } else { particle.remove(); }
    };
    requestAnimationFrame(animate);
  }
};

const EasterEggs = {
  konamiSequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'],
  konamiIndex: 0,
  _initialized: false,
  terminalEggs: {
    sudo: () => '\n  [sudo] password for visitor: \n  \n  Nice try! Permission denied. \n  This incident will be reported.\n',
    coffee: () => '\n    ( (\n     ) )\n   ........\n   |      |]\n   \\      /\n    `----\'\n  \n  Coffee break time! ☕\n'
  },
  init() {
    if (this._initialized) return;
    this._initialized = true;
    document.addEventListener('keydown', (e) => this.handleKonami(e));
  },
  handleKonami(e) {
    const key = e.code || e.key;
    if (key === this.konamiSequence[this.konamiIndex]) {
      this.konamiIndex++;
      if (this.konamiIndex === this.konamiSequence.length) { this.triggerKonami(); this.konamiIndex = 0; }
    } else {
      this.konamiIndex = key === this.konamiSequence[0] ? 1 : 0;
    }
  },
  triggerKonami() {
    document.body.classList.add('konami-active');
    if (typeof ParticleSystem !== 'undefined') ParticleSystem.emit(window.innerWidth / 2, window.innerHeight / 2, 50);
    if (typeof ToastSystem !== 'undefined') { if (!ToastSystem.container) ToastSystem.init(); ToastSystem.show('🎮 Konami code activated!', 'success'); }
    setTimeout(() => document.body.classList.remove('konami-active'), 5000);
  }
};
