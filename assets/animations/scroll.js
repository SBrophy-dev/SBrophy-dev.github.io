/* ═══════════════════════════════════════════
   Scroll Animations — Carousel, Progress, Parallax
   (Section reveals now handled by GSAP ScrollTrigger in script.js)
   ═══════════════════════════════════════════ */

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

      let startX = 0, isDragging = false;
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
  init() {
    this.bar = document.querySelector('.scroll-progress');
    if (!this.bar) {
      this.bar = document.createElement('div');
      this.bar.className = 'scroll-progress';
      this.bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.bar);
    }
    const handler = () => this.update();
    window.addEventListener('scroll', handler, { passive: true });
    this.update();
  },
  update() {
    if (!this.bar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.bar.style.opacity = scrollTop > 0 ? '1' : '0';
    this.bar.style.width = Math.min(progress, 100) + '%';
  }
};

const ParallaxEffect = {
  hero: null,
  init() {
    this.hero = document.querySelector('.hero');
    if (!this.hero) return;
    if (typeof ReducedMotion !== 'undefined' && ReducedMotion.isEnabled) return;
    const handler = () => this.update();
    window.addEventListener('scroll', handler, { passive: true });
    this.update();
  },
  update() {
    if (!this.hero) return;
    if (typeof ReducedMotion !== 'undefined' && ReducedMotion.isEnabled) return;
    if (this.hero.getBoundingClientRect().bottom < 0) return;
    this.hero.style.setProperty('--parallax-offset', window.scrollY * 0.3 + 'px');
  }
};
