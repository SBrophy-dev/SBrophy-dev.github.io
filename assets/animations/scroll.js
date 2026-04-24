const SectionRevealer = {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px',
  duration: 400,
  selector: '.section',
  observedElements: new Set(),

  init() {
    const sections = document.querySelectorAll(this.selector);
    if (!sections.length) return;
    sections.forEach(section => {
      section.classList.add('reveal-pending');
      ObserverRegistry.observe(section, (entry) => { if (entry.isIntersecting) this.reveal(entry.target); }, { threshold: this.threshold, rootMargin: this.rootMargin });
      this.observedElements.add(section);
    });
  },

  reveal(element) {
    if (ReducedMotion.isEnabled) { element.classList.remove('reveal-pending'); return; }
    element.classList.remove('reveal-pending');
    element.classList.add('reveal-active');
    setTimeout(() => element.classList.remove('reveal-active'), this.duration);
  }
};

const TimelineAnimator = {
  staggerDelay: 150,
  duration: 300,
  threshold: 0.2,
  selector: '.timeline-item',
  observedElements: new Set(),

  init() {
    const items = document.querySelectorAll(this.selector);
    if (!items.length) return;
    items.forEach((item, index) => {
      item.classList.add('timeline-pending');
      ObserverRegistry.observe(item, (entry) => {
        if (entry.isIntersecting) setTimeout(() => this.animateItem(entry.target), index * this.staggerDelay);
      }, { threshold: this.threshold });
      this.observedElements.add(item);
    });
  },

  animateItem(item) {
    if (ReducedMotion.isEnabled) { item.classList.remove('timeline-pending'); return; }
    const marker = item.querySelector('.timeline-marker');
    const content = item.querySelector('.timeline-content');
    if (marker) marker.classList.add('marker-animate');
    if (content) content.classList.add('content-animate');
    item.classList.remove('timeline-pending');
  }
};

const SkillsAnimator = {
  staggerDelay: 100,
  duration: 300,
  threshold: 0.2,
  selector: '.skill-category',
  observedElements: new Set(),

  init() {
    const cards = document.querySelectorAll(this.selector);
    if (!cards.length) return;
    cards.forEach((card, index) => {
      card.classList.add('skill-card-pending');
      ObserverRegistry.observe(card, (entry) => {
        if (entry.isIntersecting) setTimeout(() => this.animateCard(entry.target), index * this.staggerDelay);
      }, { threshold: this.threshold });
      this.observedElements.add(card);
    });
  },

  animateCard(card) {
    if (ReducedMotion.isEnabled) { card.classList.remove('skill-card-pending'); return; }
    card.classList.add('skill-card-active');
    card.classList.remove('skill-card-pending');
    card.querySelectorAll('.skill-pill').forEach((pill, i) => {
      setTimeout(() => pill.classList.add('skill-pill-animate'), i * 30);
    });
    setTimeout(() => card.classList.remove('skill-card-active'), this.duration);
  }
};

const CertsAnimator = {
  staggerDelay: 80,
  duration: 300,
  threshold: 0.2,
  selector: '.cert-card',
  observedElements: new Set(),

  init() {
    const cards = document.querySelectorAll(this.selector);
    if (!cards.length) return;
    cards.forEach((card, index) => {
      card.classList.add('cert-pending');
      ObserverRegistry.observe(card, (entry) => {
        if (entry.isIntersecting) setTimeout(() => this.animateCard(entry.target), index * this.staggerDelay);
      }, { threshold: this.threshold });
      this.observedElements.add(card);
    });
  },

  animateCard(card) {
    if (ReducedMotion.isEnabled) { card.classList.remove('cert-pending'); return; }
    card.classList.add('cert-active');
    card.classList.remove('cert-pending');
    const icon = card.querySelector('.cert-icon');
    if (icon) icon.classList.add('cert-icon-animate');
    setTimeout(() => card.classList.remove('cert-active'), this.duration);
  }
};

const ScrollProgress = {
  bar: null,
  boundHandler: null,

  init() {
    this.bar = document.createElement('div');
    this.bar.className = 'scroll-progress';
    this.bar.setAttribute('aria-hidden', 'true');
    this.bar.style.cssText = 'position:fixed;top:60px;left:0;height:3px;background-color:var(--accent);width:0;opacity:0;transition:opacity 200ms ease;z-index:999;pointer-events:none;';
    document.body.appendChild(this.bar);
    this.boundHandler = MotionUtils.timing.rafThrottle(() => this.update());
    window.addEventListener('scroll', this.boundHandler, { passive: true });
    this.update();
  },

  update() {
    if (!this.bar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.bar.style.opacity = scrollTop > 0 ? '1' : '0';
    this.bar.style.width = `${Math.min(progress, 100)}%`;
  }
};

const ParallaxEffect = {
  hero: null,
  boundHandler: null,

  init() {
    this.hero = document.querySelector('.hero');
    if (!this.hero || ReducedMotion.isEnabled) return;
    this.boundHandler = MotionUtils.timing.rafThrottle(() => this.update());
    window.addEventListener('scroll', this.boundHandler, { passive: true });
    this.update();
  },

  update() {
    if (!this.hero || ReducedMotion.isEnabled) return;
    if (this.hero.getBoundingClientRect().bottom < 0) return;
    this.hero.style.setProperty('--parallax-offset', `${window.scrollY * 0.3}px`);
  }
};
