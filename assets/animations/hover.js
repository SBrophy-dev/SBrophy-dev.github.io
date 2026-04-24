const TiltEffect = {
  maxRotation: 10,
  perspective: 1000,
  resetDuration: 300,
  selectors: ['.cert-card', '.edu-card', '.contact-card'],
  originalTransforms: new Map(),
  originalShadows: new Map(),
  observedElements: new Set(),

  init() {
    if (ReducedMotion.isEnabled) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const elements = [];
    this.selectors.forEach(s => document.querySelectorAll(s).forEach(el => elements.push(el)));
    if (!elements.length) return;
    elements.forEach(element => {
      this.originalTransforms.set(element, element.style.transform || '');
      this.originalShadows.set(element, element.style.boxShadow || '');
      element.addEventListener('mousemove', (e) => this.handleMove(e, element));
      element.addEventListener('mouseleave', () => this.handleLeave(element));
      this.observedElements.add(element);
    });
  },

  handleMove(e, element) {
    if (ReducedMotion.isEnabled) return;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const centerX = rect.width / 2, centerY = rect.height / 2;
    const rotateX = Math.max(Math.min(((y - centerY) / centerY) * -this.maxRotation, this.maxRotation), -this.maxRotation);
    const rotateY = Math.max(Math.min(((x - centerX) / centerX) * this.maxRotation, this.maxRotation), -this.maxRotation);
    element.style.transform = `perspective(${this.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    element.style.boxShadow = `${rotateY * 0.5}px ${rotateX * 0.5 + 8}px 24px rgba(0, 0, 0, 0.2)`;
  },

  handleLeave(element) {
    if (ReducedMotion.isEnabled) return;
    element.style.transition = `transform ${this.resetDuration}ms ease-out, box-shadow ${this.resetDuration}ms ease-out`;
    element.style.transform = this.originalTransforms.get(element) || '';
    element.style.boxShadow = this.originalShadows.get(element) || '';
    setTimeout(() => { element.style.transition = ''; }, this.resetDuration);
  }
};

const MagneticButton = {
  strength: 0.15,
  resetDuration: 400,
  selectors: ['.btn-primary', '.btn-secondary'],
  observedElements: new Set(),

  init() {
    if (ReducedMotion.isEnabled) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const elements = [];
    this.selectors.forEach(s => document.querySelectorAll(s).forEach(el => elements.push(el)));
    if (!elements.length) return;
    elements.forEach(element => {
      element.addEventListener('mousemove', (e) => this.handleMove(e, element));
      element.addEventListener('mouseleave', () => this.handleLeave(element));
      this.observedElements.add(element);
    });
  },

  handleMove(e, element) {
    if (ReducedMotion.isEnabled) return;
    const rect = element.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left - rect.width / 2) * this.strength;
    const offsetY = (e.clientY - rect.top - rect.height / 2) * this.strength;
    element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    element.style.transition = 'transform 0.1s ease-out';
  },

  handleLeave(element) {
    if (ReducedMotion.isEnabled) return;
    element.style.transform = '';
    element.style.transition = `transform ${this.resetDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    setTimeout(() => { element.style.transition = ''; }, this.resetDuration);
  }
};

const TimelineMarkerHover = {
  pulseDuration: 600,
  pulseScale: { from: 1, to: 1.2 },
  selectors: ['.timeline-marker'],
  activeAnimations: new Map(),
  originalTransforms: new Map(),
  observedElements: new Set(),

  init() {
    const elements = [];
    this.selectors.forEach(s => document.querySelectorAll(s).forEach(el => elements.push(el)));
    if (!elements.length) return;
    elements.forEach(element => {
      this.originalTransforms.set(element, element.style.transform || '');
      element.addEventListener('mouseenter', () => this.handleEnter(element));
      element.addEventListener('mouseleave', () => this.handleLeave(element));
      this.observedElements.add(element);
    });
  },

  handleEnter(element) {
    if (ReducedMotion.isEnabled) { element.style.transform = `scale(${this.pulseScale.to})`; return; }
    this.stopPulse(element);
    const animation = element.animate([
      { transform: `scale(${this.pulseScale.from})` },
      { transform: `scale(${this.pulseScale.to})` },
      { transform: `scale(${this.pulseScale.from})` }
    ], { duration: this.pulseDuration, easing: 'ease-in-out', iterations: Infinity });
    this.activeAnimations.set(element, animation);
  },

  handleLeave(element) {
    this.stopPulse(element);
    const orig = this.originalTransforms.get(element) || '';
    if (ReducedMotion.isEnabled) { element.style.transform = orig; return; }
    const anim = element.animate([{ transform: `scale(${this.pulseScale.from})` }, { transform: orig }], { duration: 200, easing: 'ease-out', fill: 'forwards' });
    anim.onfinish = () => { element.style.transform = orig; };
  },

  stopPulse(element) {
    const anim = this.activeAnimations.get(element);
    if (anim) { anim.cancel(); this.activeAnimations.delete(element); }
  }
};

const SkillPillHover = {
  scaleFactor: 1.1,
  scaleUpDuration: 200,
  returnDuration: 150,
  selectors: ['.skill-pill'],
  originalTransforms: new Map(),
  activeAnimations: new Map(),
  observedElements: new Set(),

  init() {
    const elements = [];
    this.selectors.forEach(s => document.querySelectorAll(s).forEach(el => elements.push(el)));
    if (!elements.length) return;
    elements.forEach(element => {
      this.originalTransforms.set(element, element.style.transform || '');
      element.addEventListener('mouseenter', () => this.handleEnter(element));
      element.addEventListener('mouseleave', () => this.handleLeave(element));
      this.observedElements.add(element);
    });
  },

  handleEnter(element) {
    const orig = this.originalTransforms.get(element) || '';
    if (ReducedMotion.isEnabled) { element.style.transform = `${orig} scale(${this.scaleFactor})`; return; }
    this.stopAnimation(element);
    const anim = element.animate([{ transform: orig }, { transform: `${orig} scale(${this.scaleFactor})` }], { duration: this.scaleUpDuration, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' });
    this.activeAnimations.set(element, anim);
  },

  handleLeave(element) {
    const orig = this.originalTransforms.get(element) || '';
    this.stopAnimation(element);
    if (ReducedMotion.isEnabled) { element.style.transform = orig; return; }
    const anim = element.animate([{ transform: `${orig} scale(${this.scaleFactor})` }, { transform: orig }], { duration: this.returnDuration, easing: 'ease-out', fill: 'forwards' });
    this.activeAnimations.set(element, anim);
    anim.onfinish = () => { element.style.transform = orig; this.activeAnimations.delete(element); };
  },

  stopAnimation(element) {
    const anim = this.activeAnimations.get(element);
    if (anim) { anim.cancel(); this.activeAnimations.delete(element); }
  }
};

const IconAnimation = {
  rotationAngle: 10,
  contactIconScale: 1.15,
  animationDuration: 150,
  originalTransforms: new Map(),
  activeAnimations: new Map(),
  observedElements: new Set(),

  init() {
    const allIcons = [];
    ['.btn i', '.btn svg', '.contact-card i', '.contact-card svg'].forEach(s => {
      document.querySelectorAll(s).forEach(el => allIcons.push(el));
    });
    if (!allIcons.length) return;
    allIcons.forEach(icon => {
      this.originalTransforms.set(icon, icon.style.transform || '');
      icon.addEventListener('mouseenter', () => this.handleEnter(icon));
      icon.addEventListener('mouseleave', () => this.handleLeave(icon));
      this.observedElements.add(icon);
    });
  },

  handleEnter(icon) {
    if (ReducedMotion.isEnabled) return;
    const isContact = icon.closest('.contact-card');
    const transform = isContact ? `scale(${this.contactIconScale})` : `rotate(${this.rotationAngle}deg)`;
    icon.style.transition = `transform ${this.animationDuration}ms ease-out`;
    icon.style.transform = transform;
  },

  handleLeave(icon) {
    if (ReducedMotion.isEnabled) return;
    icon.style.transition = `transform ${this.animationDuration}ms ease-out`;
    icon.style.transform = this.originalTransforms.get(icon) || '';
    setTimeout(() => { icon.style.transition = ''; }, this.animationDuration);
  }
};
