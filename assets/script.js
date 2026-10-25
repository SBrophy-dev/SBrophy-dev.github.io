(function () {
  'use strict';

  const html = document.documentElement;
  const prefersReduced = () =>
    html.getAttribute('data-reduced-motion') === 'true' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════
     Theme
     ═══════════════════════════════════════════ */
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'sb-theme';

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }
  applyTheme(html.getAttribute('data-theme') || getSystemTheme());
  if (themeToggle) {
    themeToggle.addEventListener('click', () =>
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
    );
  }

  /* ═══════════════════════════════════════════
     Reduced Motion
     ═══════════════════════════════════════════ */
  const motionToggle = document.getElementById('motionToggle');
  const motionToggleMobile = document.getElementById('motionToggleMobile');
  const MOTION_STORAGE_KEY = 'sb-reduced-motion';

  function applyMotionPreference(reduced) {
    html.setAttribute('data-reduced-motion', reduced ? 'true' : 'false');
    localStorage.setItem(MOTION_STORAGE_KEY, reduced ? 'true' : 'false');
    if (motionToggleMobile) {
      const s = motionToggleMobile.querySelector('span');
      if (s) s.textContent = reduced ? 'Enable Motion' : 'Reduce Motion';
    }
  }
  const storedMotion = localStorage.getItem(MOTION_STORAGE_KEY);
  let currentMotion = storedMotion !== null
    ? storedMotion === 'true'
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  applyMotionPreference(currentMotion);

  if (motionToggle) motionToggle.addEventListener('click', () => applyMotionPreference(html.getAttribute('data-reduced-motion') !== 'true'));
  if (motionToggleMobile) motionToggleMobile.addEventListener('click', () => {
    applyMotionPreference(html.getAttribute('data-reduced-motion') !== 'true');
    if (mobileMenu && mobileToggle) {
      mobileMenu.classList.remove('is-open');
      mobileToggle.classList.remove('is-open');
    }
  });

  /* ═══════════════════════════════════════════
     Mobile Menu
     ═══════════════════════════════════════════ */
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-open', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });
    mobileMenu.querySelectorAll('.nav-link').forEach(link =>
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        mobileToggle.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      })
    );
  }

  /* ═══════════════════════════════════════════
     Nav Scroll
     ═══════════════════════════════════════════ */
  const nav = document.querySelector('.nav');
  function updateNav() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('a.nav-link[href^="#"]'));
  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => { if (sec.getBoundingClientRect().top <= 100) current = sec.id; });
    // If we've scrolled past the about section but contact is the last section,
    // highlight contact since the page can't scroll far enough to bring it to the top.
    if (current === 'about') {
      const contact = document.getElementById('contact');
      if (contact && contact.getBoundingClientRect().top < window.innerHeight * 0.6) {
        current = 'contact';
      }
    }
    navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* Lucide icons */
  if (typeof lucide !== 'undefined') lucide.createIcons();

  /* ═══════════════════════════════════════════
     Contact — Click to Reveal
     ═══════════════════════════════════════════ */
  document.querySelectorAll('.contact-card-reveal').forEach(card => {
    card.addEventListener('click', () => {
      const wasRevealed = card.classList.contains('is-revealed');
      // Reveal
      card.classList.add('is-revealed');
      const valueEl = card.querySelector('.contact-value-hidden');
      const hintEl  = card.querySelector('.contact-reveal-hint');
      if (valueEl) valueEl.removeAttribute('aria-hidden');
      if (hintEl)  hintEl.setAttribute('aria-hidden', 'true');
      // If this card has a link (email/tel), navigate after a short delay
      if (!wasRevealed) return; // first click = reveal only
      const href = card.getAttribute('data-href');
      if (href) window.location.href = href;
    });
  });

  /* ═══════════════════════════════════════════
     Preloader
     ═══════════════════════════════════════════ */
  function runPreloader() {
    const preloader = document.getElementById('preloader');
    const counter = document.getElementById('preloaderCount');
    const bar = document.getElementById('preloaderBar');
    if (!preloader || prefersReduced()) {
      if (preloader) preloader.remove();
      revealHero();
      return;
    }
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 12) + 3;
      if (count >= 100) {
        count = 100;
        clearInterval(interval);
        counter.textContent = count;
        bar.style.width = '100%';
        setTimeout(() => {
          if (typeof gsap !== 'undefined') {
            gsap.to(preloader, {
              yPercent: -100,
              duration: 0.9,
              ease: 'power4.inOut',
              onComplete: () => { preloader.remove(); revealHero(); }
            });
          } else {
            preloader.remove();
            revealHero();
          }
        }, 300);
        return;
      }
      counter.textContent = count;
      bar.style.width = count + '%';
    }, 50);
  }

  /* ═══════════════════════════════════════════
     Hero Reveal (GSAP)
     ═══════════════════════════════════════════ */
  function revealHero() {
    const heroEls = ['.hero-badge', '.hero-logo', '.hero-name', '.hero-role', '.hero-tagline', '.hero-actions', '.hero-contact'];
    if (prefersReduced() || typeof gsap === 'undefined') {
      heroEls.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) { el.style.visibility = 'visible'; el.style.opacity = '1'; }
      });
      return;
    }

    // Text line reveal on hero name
    const nameLines = document.querySelectorAll('.hero-name .line');
    if (nameLines.length) {
      gsap.set(nameLines, { y: '110%' });
      gsap.set('.hero-name', { visibility: 'visible' });
    }

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.set(heroEls.join(','), { visibility: 'visible' })
      .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 })
      .from('.hero-logo', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .to(nameLines, { y: '0%', duration: 1, stagger: 0.12 }, '-=0.3')
      .from('.hero-role', { opacity: 0, y: 20, duration: 0.6 }, '-=0.5')
      .from('.hero-tagline', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from('.hero-actions', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
      .from('.hero-contact', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');
  }

  /* ═══════════════════════════════════════════
     Lenis Smooth Scroll
     ═══════════════════════════════════════════ */
  function initLenis() {
    if (typeof Lenis === 'undefined' || prefersReduced()) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // Connect to GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -64 }); }
      });
    });
  }

  /* ═══════════════════════════════════════════
     Custom Cursor
     ═══════════════════════════════════════════ */
  function initCursor() {
    if (prefersReduced() || window.matchMedia('(hover: none)').matches) return;
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursorDot');
    if (!cursor || !dot || typeof gsap === 'undefined') return;

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.05 });
    });

    gsap.ticker.add(() => {
      curX += (mouseX - curX) * 0.12;
      curY += (mouseY - curY) * 0.12;
      gsap.set(cursor, { x: curX, y: curY });
    });

    document.querySelectorAll('a, button, [data-cursor="hover"]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  /* ═══════════════════════════════════════════
     GSAP ScrollTrigger Animations
     ═══════════════════════════════════════════ */
  function initScrollAnimations() {
    if (prefersReduced() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Section title line reveals
    document.querySelectorAll('.section-title').forEach(title => {
      const lines = title.querySelectorAll('.line');
      if (!lines.length) return;
      gsap.from(lines, {
        y: '110%',
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.1,
        scrollTrigger: { trigger: title, start: 'top 85%' }
      });
    });

    // Skill cards stagger
    gsap.from('.skill-category', {
      y: 40, opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '.skills-grid', start: 'top 80%' }
    });

    // Timeline items
    document.querySelectorAll('.timeline-item').forEach((item, i) => {
      gsap.from(item, {
        x: -30, opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: { trigger: item, start: 'top 85%' }
      });
    });

    // Cert cards
    gsap.from('.cert-card', {
      y: 24, opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: '.certs-grid', start: 'top 80%' }
    });

    // Education cards
    gsap.from('.edu-card', {
      y: 30, opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: '.education-grid', start: 'top 80%' }
    });

    // About text paragraphs
    gsap.from('.about-text', {
      y: 30, opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: { trigger: '.about-content', start: 'top 80%' }
    });

    // Contact cards
    gsap.from('.contact-card', {
      y: 24, opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '.contact-cards', start: 'top 85%' }
    });

    // About orbit visual
    gsap.from('.about-orbit', {
      scale: 0.6, opacity: 0, rotation: -30,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.about-layout', start: 'top 75%' }
    });

    // Project cards entrance animation
    gsap.from('.project-card', {
      y: 32, opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '.projects-grid', start: 'top 80%' }
    });
  }

  /* ═══════════════════════════════════════════
     Terminal Mode (preserved from original)
     ═══════════════════════════════════════════ */
  const terminalState = {
    mode: 'visual',
    commandHistory: [],
    historyIndex: -1,
    savedScrollY: 0,
    glitchEffect: null,
    matrixEffect: null,
    soundInitialized: false
  };

  const modeToggle = document.getElementById('modeToggle');
  const terminal = document.getElementById('terminal');
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalInput = document.getElementById('terminalInput');
  const mobileModeMedia = window.matchMedia('(max-width: 640px)');

  const cvData = {
    hero: { name: "Stuart Brophy", role: "Infrastructure Engineer", focus: "Cloud · Automation · Security", tagline: "Engineering an Amazon Connect estate across nine accounts for 600+ agents, with serverless tools, automation, and production incident ownership.", availability: "Open to new opportunities" },
    skills: [
      { category: "Cloud & Infrastructure", items: ["AWS", "Amazon Connect", "Lambda", "S3", "DynamoDB", "EC2", "Terraform", "CloudFormation", "Linux", "Networking", "IAM", "Infrastructure as Code"] },
      { category: "Automation & DevOps", items: ["Python", "TypeScript", "PowerShell", "Bash", "Power Automate", "REST APIs", "CI/CD", "RPA", "Serverless", "Microservices", "Git", "JUnit / SARIF"] },
      { category: "Security & Compliance", items: ["DevSecOps", "Incident Response", "IAM", "GDPR", "Data Protection", "Monitoring", "Risk Assessment", "Cryptography"] },
      { category: "Middleware & Integration", items: ["MuleSoft / Anypoint", "IBM MQ", "PHP", "Databases", "REST APIs", "IIS / MySQL"] }
    ],
    experience: [
      { role: "Infrastructure Engineer", company: "Unum Ireland", location: "Carlow", dates: "Jan 2024 – Present", bullets: ["Engineer an Amazon Connect estate across nine accounts for 600+ agents.", "Build Lambda (Python), EC2, DynamoDB, and S3 integrations.", "Cut a key call workflow from about 10 minutes to 2 through agent login automation.", "Resolve 30+ monthly incidents through root cause analysis and corrective action."] },
      { role: "Designer & IT Administrator", company: "CGL Retail Solutions", location: "Carlow", dates: "Mar 2015 – Sep 2021", bullets: ["Led end-to-end client projects.", "Managed company IT systems and served as Data Protection Officer.", "Oversaw GDPR compliance and incident resolution."] },
      { role: "Jr. Web Developer", company: "Design North", location: "Louth", dates: "Mar 2013 – Sep 2013", bullets: ["Developed client websites using HTML, CSS, JavaScript, and PHP.", "Assisted with system administration tasks."] }
    ],
    certifications: [
      { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services" },
      { name: "AWS Certified AI Practitioner", issuer: "Amazon Web Services" },
      { name: "SAFe 6 for Teams", issuer: "Scaled Agile" },
      { name: "SAFe 6 Scrum Master (SSM)", issuer: "Scaled Agile" },
      { name: "GDPR & Drafting Data Protection Policies", issuer: "Carlow Chamber" },
      { name: "DevSecOps Path", issuer: "TryHackMe" },
      { name: "Web Fundamentals", issuer: "TryHackMe" },
      { name: "Complete Beginner · Pre Security · Intro to Cybersecurity", issuer: "TryHackMe" },
      { name: "Software Security Practitioner (SSP)", issuer: "Security Compass" }
    ],
    education: [
      { degree: "BA in Cybercrime & IT Security", grade: "First Class Honours — 1:1", institution: "South-East Technological University, Carlow", dates: "2021 – 2024", subjects: ["Networking", "Scripting for Cybercrime", "Incident Handling & Risk Assessment", "Secure Systems Administration", "Cybercrime Legislation & Compliance", "Cryptography", "Discrete Structures & Algorithms"] },
      { degree: "QQI Level 5 — Computers & Networking", grade: "Distinction", institution: "Carlow Institute, Carlow", dates: "2020 – 2021", subjects: ["ICT Security Policies & Management", "Networking Essentials", "Programming & Design Principles", "Operating Systems", "Communications", "Maths for IT"] }
    ],
    contact: { email: "Stuartbrophy157@gmail.com", phone: "(086) 661-4077", location: "Co. Carlow, Ireland" },
    about: ["I'm a Co. Carlow-based Infrastructure Engineer with a background spanning cloud architecture, security, and automation — shaped by years working across enterprise AWS environments and a First Class Honours degree earned while working full-time.", "Outside of work I stay close to the things that keep me sharp: exploring developments in AI, homelab tinkering, and PC building."]
  };

  function formatHeader(title) {
    const line = '─'.repeat(50);
    return '\r\n┌' + line + '┐\r\n│ ' + title.padEnd(48) + ' │\r\n└' + line + '┘\r\n';
  }
  function formatBullet(text) { return '  • ' + text + '\r\n'; }
  function formatSubsection(label, value) { return '  ' + label + ': ' + value + '\r\n'; }
  function formatSkillCategory(category, skills) { return '\r\n  [' + category + ']\r\n  ' + skills.join(' · ') + '\r\n'; }

  var commands = {
    'help': function() { return formatHeader('Available Commands') + '\r\n  help, ?          Show this help message\r\n  home             Display introduction\r\n  logo             Display the SBrophy-dev logo\r\n  skills           Display skills & technologies\r\n  experience, exp  Display work experience\r\n  projects         Display side projects\r\n  certs            Display certifications\r\n  education, edu   Display education\r\n  about            Display about section\r\n  contact          Display contact information\r\n  matrix           Toggle Matrix background effect\r\n  sound            Toggle sound effects\r\n  clear, cls       Clear terminal output\r\n  exit, quit       Return to visual mode\r\n\r\n  Tip: Use ↑/↓ arrows to navigate command history\r\n'; },
    '?': function() { return commands.help(); },
    'logo': function() {
      if (typeof ASCIIBanner !== 'undefined') return '\r\n' + ASCIIBanner.getPlainText(false) + '\r\n';
      return '\r\n   ╔═══════╗\r\n   ║  S B  ║  SBrophy-dev\r\n   ╚═══════╝\r\n';
    },
    'home': function() { return formatHeader('Stuart Brophy') + '\r\n  ' + cvData.hero.name + '\r\n  ' + cvData.hero.role + ' — ' + cvData.hero.focus + '\r\n\r\n  ' + cvData.hero.tagline + '\r\n\r\n  ● ' + cvData.hero.availability + '\r\n'; },
    'skills': function() { var o = formatHeader('Skills & Technologies'); cvData.skills.forEach(function(c) { o += formatSkillCategory(c.category, c.items); }); return o; },
    'experience': function() { var o = formatHeader('Experience'); cvData.experience.forEach(function(j) { o += '\r\n  ' + j.role + '\r\n  ' + j.company + ' · ' + j.location + '\r\n  ' + j.dates + '\r\n\r\n'; j.bullets.forEach(function(b) { o += formatBullet(b); }); }); return o; },
    'exp': function() { return commands.experience(); },
    'certs': function() { var o = formatHeader('Certifications'); cvData.certifications.forEach(function(c) { o += '\r\n  ' + c.name + '\r\n    ' + c.issuer + '\r\n'; }); return o; },
    'certifications': function() { return commands.certs(); },
    'projects': function() { return formatHeader('Side Projects') + '\r\n  [✂️ Clip Chimp]\r\n  Local AI video pipeline · Whisper · Gemma · FFmpeg\r\n\r\n  [🔍 FlowLens]\r\n  Amazon Connect flow simulation · Audit · CI runner\r\n\r\n  [⚔️ Dev Legend: Code RPG]\r\n  VS Code Extension · TypeScript · Vite\r\n\r\n  [📚 Django Learning Dashboard]\r\n  Full-Stack · Django · PostgreSQL · Docker\r\n\r\n  [🏰 Realms of Iron]\r\n  Browser Game · React 19 · TypeScript · Vitest\r\n'; },
    'education': function() { var o = formatHeader('Education'); cvData.education.forEach(function(e) { o += '\r\n  ' + e.degree + '\r\n  ' + e.institution + '\r\n  ' + e.dates + ' · ' + e.grade + '\r\n\r\n  Subjects: ' + e.subjects.join(', ') + '\r\n'; }); return o; },
    'edu': function() { return commands.education(); },
    'about': function() { var o = formatHeader('About') + '\r\n'; cvData.about.forEach(function(p) { o += '  ' + p + '\r\n\r\n'; }); return o; },
    'contact': function() { return formatHeader('Contact') + '\r\n' + formatSubsection('Email', cvData.contact.email) + formatSubsection('Phone', cvData.contact.phone) + formatSubsection('Location', cvData.contact.location) + '\r\n'; },
    'matrix': function() {
      if (typeof MatrixEffect === 'undefined') return '\r\n  Matrix effect not available.\r\n';
      if (!terminalState.matrixEffect && terminal) terminalState.matrixEffect = new MatrixEffect({ container: terminal });
      if (terminalState.matrixEffect) { var active = terminalState.matrixEffect.toggle(); return active ? '\r\n  Matrix effect enabled.\r\n' : '\r\n  Matrix effect disabled.\r\n'; }
      return '\r\n  Could not initialize matrix effect.\r\n';
    },
    'sound': function() {
      if (typeof SoundSystem === 'undefined') return '\r\n  Sound system not available.\r\n';
      if (!terminalState.soundInitialized) { SoundSystem.init(); terminalState.soundInitialized = true; }
      var enabled = SoundSystem.toggle();
      return enabled ? '\r\n  Sound effects enabled.\r\n' : '\r\n  Sound effects disabled.\r\n';
    },
    'sudo': function() { return '\r\n  Nice try! Permission denied.\r\n'; },
    'coffee': function() { return '\r\n    ( (\r\n     ) )\r\n   ........\r\n   |      |]\r\n   \\      /\r\n    `----\'\r\n  Coffee break time! ☕\r\n'; }
  };

  function getWelcomeMessage() {
    var output = '\r\n';
    if (typeof ASCIIBanner !== 'undefined') output += ASCIIBanner.getPlainText() + '\r\n';
    else output += '  Welcome to SBrophy-dev terminal. Type "help" for commands.\r\n';
    return output + '\r\n';
  }

  function renderOutput(text, useHighlighting) {
    if (terminalOutput) {
      if (useHighlighting && typeof SyntaxHighlighter !== 'undefined') terminalOutput.innerHTML += SyntaxHighlighter.highlight(text);
      else terminalOutput.textContent += text;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  }
  function clearOutput() { if (terminalOutput) terminalOutput.textContent = ''; }

  function executeCommand(input) {
    var trimmed = input.trim().toLowerCase();
    if (!trimmed) return;
    if (typeof TerminalFeedback !== 'undefined' && TerminalFeedback.getIsLoading()) return;
    renderOutput('\r\nvisitor@sbrophy-dev:~$ ' + input + '\r\n', true);
    if (trimmed === 'clear' || trimmed === 'cls') { clearOutput(); return; }
    if (trimmed === 'exit' || trimmed === 'quit') { switchToVisualMode(); return; }
    var handler = commands[trimmed];
    if (handler) renderOutput(handler(), false);
    else if (typeof TerminalFeedback !== 'undefined') TerminalFeedback.showError('Command not found: ' + trimmed + '\r\n\r\n  Type "help" for available commands.');
    else renderOutput('\r\n  Command not found: ' + trimmed + '\r\n  Type "help" for available commands.\r\n', false);
  }

  function switchToTerminalMode() {
    terminalState.savedScrollY = window.scrollY;
    terminalState.mode = 'terminal';
    document.querySelectorAll('main > section, .marquee-section').forEach(s => s.hidden = true);
    if (terminal) terminal.hidden = false;
    html.setAttribute('data-mode', 'terminal');
    localStorage.setItem('sb-mode', 'terminal');
    if (typeof TerminalFeedback !== 'undefined') TerminalFeedback.init(terminalInput, terminalOutput);
    if (!terminalState.glitchEffect && typeof GlitchEffect !== 'undefined' && terminal) terminalState.glitchEffect = new GlitchEffect({ element: terminal });
    if (terminalInput) terminalInput.focus();
    clearOutput();
    renderOutput(getWelcomeMessage(), typeof ASCIIBanner !== 'undefined');
    if (terminalState.glitchEffect) terminalState.glitchEffect.trigger();
  }

  function switchToVisualMode(options = {}) {
    const persist = options.persist !== false;
    const restoreScroll = options.restoreScroll !== false;
    terminalState.mode = 'visual';
    if (terminal) terminal.hidden = true;
    if (terminalState.matrixEffect && terminalState.matrixEffect.isRunning) terminalState.matrixEffect.stop();
    clearOutput();
    document.querySelectorAll('main > section, .marquee-section').forEach(s => s.hidden = false);
    html.setAttribute('data-mode', 'visual');
    if (persist) localStorage.setItem('sb-mode', 'visual');
    if (restoreScroll) window.scrollTo(0, terminalState.savedScrollY);
    else if (!window.location.hash) window.scrollTo(0, 0);
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (terminalState.historyIndex < terminalState.commandHistory.length - 1) { terminalState.historyIndex++; if (terminalInput) terminalInput.value = terminalState.commandHistory[terminalState.historyIndex]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (terminalState.historyIndex > 0) { terminalState.historyIndex--; if (terminalInput) terminalInput.value = terminalState.commandHistory[terminalState.historyIndex]; }
      else if (terminalState.historyIndex === 0) { terminalState.historyIndex = -1; if (terminalInput) terminalInput.value = ''; }
    } else if (e.key === 'Enter') {
      var input = terminalInput ? terminalInput.value : '';
      if (input.trim()) {
        executeCommand(input);
        terminalState.commandHistory.unshift(input);
        if (terminalState.commandHistory.length > 50) terminalState.commandHistory.pop();
        terminalState.historyIndex = -1;
        if (terminalInput) terminalInput.value = '';
      }
    } else if (e.key.length === 1 || e.key === 'Backspace') {
      if (typeof SoundSystem !== 'undefined' && SoundSystem.isEnabled) SoundSystem.play('keystroke');
    }
  }

  function initTerminal() {
    if (mobileModeMedia.matches) switchToVisualMode({ persist: false, restoreScroll: false });
    else if (localStorage.getItem('sb-mode') === 'terminal') switchToTerminalMode();
    else html.setAttribute('data-mode', 'visual');

    const handleMobileModeChange = (event) => {
      if (event.matches && terminalState.mode === 'terminal') {
        switchToVisualMode({ persist: false, restoreScroll: false });
      }
    };
    if (mobileModeMedia.addEventListener) mobileModeMedia.addEventListener('change', handleMobileModeChange);
    else if (mobileModeMedia.addListener) mobileModeMedia.addListener(handleMobileModeChange);

    if (modeToggle) modeToggle.addEventListener('click', () => terminalState.mode === 'visual' ? switchToTerminalMode() : switchToVisualMode());
    if (terminalInput) {
      terminalInput.addEventListener('keydown', handleKeydown);
      if (terminal) terminal.addEventListener('click', () => terminalInput.focus());
    }
  }
  initTerminal();

  /* ═══════════════════════════════════════════
     Init Everything
     ═══════════════════════════════════════════ */
  function initAll() {
    // Animation modules from existing files
    var modules = [
      typeof NetworkCanvas !== 'undefined' ? NetworkCanvas : null,
      typeof TypingTextEffect !== 'undefined' ? TypingTextEffect : null,
      typeof ProjectCarousel !== 'undefined' ? ProjectCarousel : null,
      typeof ScrollProgress !== 'undefined' ? ScrollProgress : null,
      typeof ParallaxEffect !== 'undefined' ? ParallaxEffect : null,
      typeof TiltEffect !== 'undefined' ? TiltEffect : null,
      typeof TimelineMarkerHover !== 'undefined' ? TimelineMarkerHover : null,
      typeof SkillPillHover !== 'undefined' ? SkillPillHover : null,
      typeof IconAnimation !== 'undefined' ? IconAnimation : null,
      typeof RippleEffect !== 'undefined' ? RippleEffect : null,
      typeof LoadingStates !== 'undefined' ? LoadingStates : null,
      typeof FocusRing !== 'undefined' ? FocusRing : null,
      typeof ToastSystem !== 'undefined' ? ToastSystem : null,
      typeof EasterEggs !== 'undefined' ? EasterEggs : null
    ];
    modules.forEach(function(mod) {
      if (mod && typeof mod.init === 'function') {
        try { mod.init(); } catch (e) { console.warn('Animation init error:', e); }
      }
    });

    // Particle effects on CV download
    if (typeof ParticleSystem !== 'undefined') {
      var cvLink = document.querySelector('a[href*="Stuart_Brophy_CV_Ext-2.docx"]');
      if (cvLink) {
        cvLink.addEventListener('click', function() {
          var rect = this.getBoundingClientRect();
          ParticleSystem.emit(rect.left + rect.width / 2, rect.top + rect.height / 2);
          if (typeof ToastSystem !== 'undefined') ToastSystem.show('📄 CV download started!', 'success');
        });
      }
    }

    // New systems
    initLenis();
    initCursor();
    initScrollAnimations();
  }

  // Run preloader on load, then init everything
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      runPreloader();
      initAll();
    });
  } else {
    runPreloader();
    initAll();
  }

}());
