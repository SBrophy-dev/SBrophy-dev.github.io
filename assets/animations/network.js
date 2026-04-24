/**
 * NetworkCanvas — Interactive node/connection background
 * Inspired by Claude Design's topology effect, adapted to existing theme
 */
const NetworkCanvas = {
  canvas: null,
  ctx: null,
  animRef: null,
  nodes: [],
  mouse: { x: -1000, y: -1000 },
  nodeCount: 55,
  connectionDistance: 140,
  isRunning: false,

  _getAccentRGB() {
    const theme = document.documentElement.getAttribute('data-theme');
    // Use existing site's accent color: #FF9900 (dark) / #B86B00 (light)
    return theme === 'light' ? '192,112,0' : '255,153,0';
  },

  init() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (ReducedMotion.isEnabled) return;

    // Reduce nodes on mobile for performance
    if (window.innerWidth < 640) this.nodeCount = 30;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'network-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    hero.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    // Defer start to ensure layout is complete
    requestAnimationFrame(() => {
      this._resize();
      this._initNodes();
      this.isRunning = true;
      this._draw();
    });

    this._boundResize = () => { this._resize(); this._initNodes(); };
    this._boundMouse = (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
    };
    this._boundLeave = () => { this.mouse.x = -1000; this.mouse.y = -1000; };

    window.addEventListener('resize', this._boundResize);
    this.canvas.addEventListener('mousemove', this._boundMouse);
    this.canvas.addEventListener('mouseleave', this._boundLeave);

    // Pause canvas when hero is off-screen
    if (typeof ObserverRegistry !== 'undefined') {
      ObserverRegistry.observe(hero, (entry) => {
        if (entry.isIntersecting && !this.isRunning && !ReducedMotion.isEnabled) {
          this.isRunning = true;
          this._draw();
        } else if (!entry.isIntersecting && this.isRunning) {
          this.isRunning = false;
          if (this.animRef) { cancelAnimationFrame(this.animRef); this.animRef = null; }
        }
      }, { threshold: 0 });
    }

    // React to reduced motion changes
    ReducedMotion.onChange((enabled) => {
      if (enabled) this.stop();
      else { this._resize(); this._initNodes(); this.isRunning = true; this._draw(); }
    });
  },

  _resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  _initNodes() {
    if (!this.canvas) return;
    this.nodes = [];
    const w = this.canvas.offsetWidth;
    const h = this.canvas.offsetHeight;
    for (let i = 0; i < this.nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1
      });
    }
  },

  _draw() {
    if (!this.isRunning || !this.ctx || !this.canvas) return;
    const w = this.canvas.offsetWidth;
    const h = this.canvas.offsetHeight;
    const rgb = this._getAccentRGB();
    const ctx = this.ctx;
    const CD = this.connectionDistance;

    ctx.clearRect(0, 0, w, h);

    // Update node positions
    const CD2 = CD * CD;
    this.nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      // Mouse repulsion
      const dx = n.x - this.mouse.x;
      const dy = n.y - this.mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 14400) { // 120^2
        n.x += dx * 0.02;
        n.y += dy * 0.02;
      }
    });

    // Draw connections (batch path for fewer draw calls)
    ctx.lineWidth = 0.5;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CD2) {
          const d = Math.sqrt(d2);
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / CD) * 0.25})`;
          ctx.beginPath();
          ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    this.nodes.forEach(n => {
      ctx.fillStyle = `rgba(${rgb},0.6)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    this.animRef = requestAnimationFrame(() => this._draw());
  },

  stop() {
    this.isRunning = false;
    if (this.animRef) {
      cancelAnimationFrame(this.animRef);
      this.animRef = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    }
  }
};

/**
 * TypingText — Cycling text with typing/deleting animation
 * Adds a dynamic typing effect to the hero role area
 */
const TypingTextEffect = {
  element: null,
  texts: ['Cloud Architecture', 'CI/CD Pipelines', 'AWS Infrastructure', 'Process Automation', 'DevSecOps'],
  speed: 55,
  deleteSpeed: 30,
  pauseDuration: 2200,
  textIndex: 0,
  charIndex: 0,
  isDeleting: false,
  timeoutId: null,
  cursorSpan: null,

  init() {
    this.element = document.getElementById('typingText');
    if (!this.element) return;

    // Create cursor
    this.cursorSpan = document.createElement('span');
    this.cursorSpan.className = 'typing-cursor';
    this.cursorSpan.setAttribute('aria-hidden', 'true');
    this.cursorSpan.textContent = '▌';
    this.element.parentNode.insertBefore(this.cursorSpan, this.element.nextSibling);

    if (ReducedMotion.isEnabled) {
      this.element.textContent = this.texts[0];
      return;
    }

    this._tick();

    ReducedMotion.onChange((enabled) => {
      if (enabled) {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.element.textContent = this.texts[this.textIndex];
      } else {
        this._tick();
      }
    });
  },

  _tick() {
    if (ReducedMotion.isEnabled) return;
    const current = this.texts[this.textIndex];

    if (!this.isDeleting && this.charIndex < current.length) {
      this.charIndex++;
      this.element.textContent = current.substring(0, this.charIndex);
      this.timeoutId = setTimeout(() => this._tick(), this.speed);
    } else if (!this.isDeleting && this.charIndex === current.length) {
      this.timeoutId = setTimeout(() => {
        this.isDeleting = true;
        this._tick();
      }, this.pauseDuration);
    } else if (this.isDeleting && this.charIndex > 0) {
      this.charIndex--;
      this.element.textContent = current.substring(0, this.charIndex);
      this.timeoutId = setTimeout(() => this._tick(), this.deleteSpeed);
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      this.timeoutId = setTimeout(() => this._tick(), this.speed);
    }
  }
};
