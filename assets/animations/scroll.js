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

const ProjectsAnimator = {
  staggerDelay: 150,
  duration: 400,
  threshold: 0.15,
  selector: '.project-card',
  observedElements: new Set(),

  init() {
    const cards = document.querySelectorAll(this.selector);
    if (!cards.length) return;
    cards.forEach((card, index) => {
      card.classList.add('project-card-pending');
      ObserverRegistry.observe(card, (entry) => {
        if (entry.isIntersecting) setTimeout(() => this.animateCard(entry.target), index * this.staggerDelay);
      }, { threshold: this.threshold });
      this.observedElements.add(card);
    });
  },

  animateCard(card) {
    if (ReducedMotion.isEnabled) { card.classList.remove('project-card-pending'); return; }
    card.classList.add('project-card-active');
    card.classList.remove('project-card-pending');
    setTimeout(() => card.classList.remove('project-card-active'), this.duration);
  }
};

const ProjectCarousel = {
  init() {
    document.querySelectorAll('.project-carousel').forEach(carousel => {
      const track = carousel.querySelector('.project-carousel-track');
      const images = track ? track.querySelectorAll('img') : [];
      const prevBtn = carousel.querySelector('.carousel-prev');
      const nextBtn = carousel.querySelector('.carousel-next');
      const dotsContainer = carousel.querySelector('.carousel-dots');
      if (!track || images.length === 0) return;

      let current = 0;
      const total = images.length;

      // Build dots
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Go to screenshot ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
      const dots = dotsContainer.querySelectorAll('.carousel-dot');

      function goTo(index) {
        current = ((index % total) + total) % total;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
      }

      if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

      // Touch/swipe support
      let startX = 0;
      let isDragging = false;
      carousel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
      carousel.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
      }, { passive: true });
    });
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
