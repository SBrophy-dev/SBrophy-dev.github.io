(function () {
  'use strict';

  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'sb-theme';

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  const currentTheme = html.getAttribute('data-theme') || getSystemTheme();
  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* Reduced Motion */
  const motionToggle = document.getElementById('motionToggle');
  const motionToggleMobile = document.getElementById('motionToggleMobile');
  const MOTION_STORAGE_KEY = 'sb-reduced-motion';

  function applyMotionPreference(reducedMotion) {
    html.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false');
    localStorage.setItem(MOTION_STORAGE_KEY, reducedMotion ? 'true' : 'false');
    if (reducedMotion) {
      document.documentElement.style.setProperty('--forced-reduced-motion', 'reduce');
    } else {
      document.documentElement.style.removeProperty('--forced-reduced-motion');
    }
    if (motionToggleMobile) {
      const textSpan = motionToggleMobile.querySelector('span');
      if (textSpan) textSpan.textContent = reducedMotion ? 'Enable Motion' : 'Reduce Motion';
    }
  }

  const storedMotion = localStorage.getItem(MOTION_STORAGE_KEY);
  let currentMotionPreference = storedMotion !== null
    ? storedMotion === 'true'
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  applyMotionPreference(currentMotionPreference);

  if (motionToggle) {
    motionToggle.addEventListener('click', function () {
      applyMotionPreference(html.getAttribute('data-reduced-motion') !== 'true');
    });
  }
  if (motionToggleMobile) {
    motionToggleMobile.addEventListener('click', function () {
      applyMotionPreference(html.getAttribute('data-reduced-motion') !== 'true');
      if (mobileMenu && mobileToggle) {
        mobileMenu.classList.remove('is-open');
        mobileToggle.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(e) {
    if (localStorage.getItem(MOTION_STORAGE_KEY) === null) applyMotionPreference(e.matches);
  });

  /* Mobile menu */
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-open', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });
    mobileMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
        mobileToggle.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* Nav scroll */
  const nav = document.querySelector('.nav');
  function updateNav() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* Active nav link */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('a.nav-link[href^="#"]'));
  function updateActiveLink() {
    let current = '';
    sections.forEach(function (sec) { if (sec.getBoundingClientRect().top <= 80) current = sec.id; });
    navLinks.forEach(function (link) { link.classList.toggle('is-active', link.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* Lucide icons */
  if (typeof lucide !== 'undefined') lucide.createIcons();

  /* Terminal Mode */
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

  const cvData = {
    hero: { name: "Stuart Brophy", role: "Infrastructure Engineer", focus: "Cloud · Automation · Security", tagline: "Building reliable AWS infrastructure at enterprise scale — from CI/CD pipelines and serverless workflows to process automation and cross-platform middleware.", availability: "Open to new opportunities" },
    skills: [
      { category: "Cloud & Infrastructure", items: ["AWS", "Connect", "Lambda", "S3", "DynamoDB", "EC2", "Terraform", "CloudFormation", "Linux", "Networking", "IAM"] },
      { category: "Automation & DevOps", items: ["Python", "PowerShell", "Bash", "CI/CD", "RPA", "Serverless", "Microservices", "Version Control", "Agile / SAFe"] },
      { category: "Security & Compliance", items: ["DevSecOps", "Incident Response", "IAM", "GDPR", "Data Protection", "Monitoring", "Risk Assessment", "Cryptography"] },
      { category: "Middleware & Integration", items: ["MuleSoft / Anypoint", "IBM MQ", "PHP", "Databases", "REST APIs", "IIS / MySQL"] }
    ],
    experience: [
      { role: "Infrastructure Engineer", company: "Unum Ireland", location: "Carlow", dates: "Jan 2024 – Present", bullets: ["Support and enhance AWS-based contact centre infrastructure (Connect, Lambda, EC2, S3, DynamoDB) across large-scale enterprise environments.", "Contribute to CI/CD pipelines and PaaS environments, improving release reliability and deployment speed for contact centre workloads.", "Implement process automation and RPA solutions to reduce manual effort, streamline operations, and improve incident response.", "Provide on-call support across cloud and on-prem middleware platforms; handle Terraform-based deployments, incident RCA, and performance and availability improvements."] },
      { role: "Designer & IT Administrator", company: "CGL Retail Solutions", location: "Carlow", dates: "Mar 2015 – Sep 2021", bullets: ["Led end-to-end client projects combining design delivery with technical documentation and stakeholder presentations.", "Managed company IT systems (servers, workstations, networking, storage) and served as Data Protection Officer.", "Oversaw GDPR compliance, incident resolution, and data protection policy drafting."] },
      { role: "Jr. Web Developer", company: "Design North", location: "Louth", dates: "Mar 2013 – Sep 2013", bullets: ["Developed and maintained client websites using HTML, CSS, JavaScript, and PHP.", "Assisted with system administration tasks (IIS, MySQL) and issue troubleshooting."] }
    ],
    certifications: [
      { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services" },
      { name: "SAFe 6 for Teams", issuer: "Scaled Agile" },
      { name: "SAFe 6 Scrum Master (SSM)", issuer: "Scaled Agile" },
      { name: "GDPR & Drafting Data Protection Policies", issuer: "Carlow Chamber" },
      { name: "DevSecOps Path", issuer: "TryHackMe" },
      { name: "Web Fundamentals", issuer: "TryHackMe" },
      { name: "Complete Beginner · Pre Security · Intro to Cybersecurity", issuer: "TryHackMe" }
    ],
    education: [
      { degree: "BA in Cybercrime & IT Security", grade: "First Class Honours — 1:1", institution: "South-East Technological University, Carlow", dates: "2021 – 2024", subjects: ["Networking", "Scripting for Cybercrime", "Incident Handling & Risk Assessment", "Secure Systems Administration", "Cybercrime Legislation & Compliance", "Cryptography", "Discrete Structures & Algorithms"] },
      { degree: "QQI Level 5 — Computers & Networking", grade: "Distinction", institution: "Carlow Institute, Carlow", dates: "2020 – 2021", subjects: ["ICT Security Policies & Management", "Networking Essentials", "Programming & Design Principles", "Operating Systems", "Communications", "Maths for IT"] }
    ],
    contact: { email: "Stuartbrophy157@gmail.com", phone: "(086) 661-4077", location: "Co. Carlow, Ireland" },
    about: ["I'm a Co. Carlow-based Infrastructure Engineer with a background spanning cloud architecture, security, and automation — shaped by years working across enterprise AWS environments and a First Class Honours degree earned while working full-time. My focus is on building infrastructure that's reliable by design: automated where it should be, secured from the ground up, and observable enough to fail gracefully. I'm particularly drawn to the intersection of cloud engineering and security, where getting the architecture right matters as much as writing the code.", "Outside of work I stay close to the things that keep me sharp: exploring developments in AI, homelab tinkering, and PC building. I play soccer, pick up the guitar when time allows, and try to get out hiking when Carlow's weather cooperates. Photography has been a long-running interest — there's something in the discipline of framing a shot that maps surprisingly well to how I think about system design."]
  };

  function formatHeader(title) {
    const line = '─'.repeat(50);
    return '\n┌' + line + '┐\n│ ' + title.padEnd(48) + ' │\n└' + line + '┘\n';
  }
  function formatBullet(text) { return '  • ' + text + '\n'; }
  function formatSubsection(label, value) { return '  ' + label + ': ' + value + '\n'; }
  function formatSkillCategory(category, skills) { return '\n  [' + category + ']\n  ' + skills.join(' · ') + '\n'; }

  var commands = {
    'help': function() { return formatHeader('Available Commands') + '\n  help, ?          Show this help message\n  home             Display introduction\n  logo             Display the SBrophy.click logo\n  skills           Display skills & technologies\n  experience, exp  Display work experience\n  certs            Display certifications\n  education, edu   Display education\n  about            Display about section\n  contact          Display contact information\n  matrix           Toggle Matrix background effect\n  sound            Toggle sound effects\n  clear, cls       Clear terminal output\n  exit, quit       Return to visual mode\n\n  Tip: Use ↑/↓ arrows to navigate command history\n'; },
    '?': function() { return commands.help(); },
    'logo': function() {
      if (typeof ASCIIBanner !== 'undefined') return '\n' + ASCIIBanner.getPlainText(false) + '\n';
      return '\n   ╔═══════╗\n   ║  S B  ║  sbrophy.click\n   ╚═══════╝\n';
    },
    'home': function() { return formatHeader('Stuart Brophy') + '\n  ' + cvData.hero.name + '\n  ' + cvData.hero.role + ' — ' + cvData.hero.focus + '\n\n  ' + cvData.hero.tagline + '\n\n  ● ' + cvData.hero.availability + '\n'; },
    'skills': function() { var o = formatHeader('Skills & Technologies') + '\n  Hands-on expertise across cloud infrastructure, DevOps, security,\n  and integration — built in regulated enterprise environments.\n'; cvData.skills.forEach(function(c) { o += formatSkillCategory(c.category, c.items); }); return o; },
    'experience': function() { var o = formatHeader('Experience'); cvData.experience.forEach(function(j) { o += '\n  ' + j.role + '\n  ' + j.company + ' · ' + j.location + '\n  ' + j.dates + '\n\n'; j.bullets.forEach(function(b) { o += formatBullet(b); }); }); return o; },
    'exp': function() { return commands.experience(); },
    'certs': function() { var o = formatHeader('Certifications'); cvData.certifications.forEach(function(c) { o += '\n  ' + c.name + '\n    ' + c.issuer + '\n'; }); return o; },
    'certifications': function() { return commands.certs(); },
    'education': function() { var o = formatHeader('Education'); cvData.education.forEach(function(e) { o += '\n  ' + e.degree + '\n  ' + e.institution + '\n  ' + e.dates + ' · ' + e.grade + '\n\n  Subjects: ' + e.subjects.join(', ') + '\n'; }); return o; },
    'edu': function() { return commands.education(); },
    'about': function() { var o = formatHeader('About') + '\n'; cvData.about.forEach(function(p) { o += '  ' + p + '\n\n'; }); return o; },
    'contact': function() { return formatHeader('Contact') + '\n' + formatSubsection('Email', cvData.contact.email) + formatSubsection('Phone', cvData.contact.phone) + formatSubsection('Location', cvData.contact.location) + '\n  Open to new roles, collaborations, and conversations about\n  cloud infrastructure, automation, and security.\n'; },
    'matrix': function() {
      if (typeof MatrixEffect === 'undefined') return '\n  Matrix effect not available.\n';
      if (!terminalState.matrixEffect && terminal) terminalState.matrixEffect = new MatrixEffect({ container: terminal });
      if (terminalState.matrixEffect) { var active = terminalState.matrixEffect.toggle(); return active ? '\n  Matrix effect enabled. Type "matrix" again to disable.\n' : '\n  Matrix effect disabled.\n'; }
      return '\n  Could not initialize matrix effect.\n';
    },
    'sound': function() {
      if (typeof SoundSystem === 'undefined') return '\n  Sound system not available.\n';
      if (!terminalState.soundInitialized) { SoundSystem.init(); terminalState.soundInitialized = true; }
      var enabled = SoundSystem.toggle();
      return enabled ? '\n  Sound effects enabled. Type "sound" again to disable.\n' : '\n  Sound effects disabled.\n';
    },
    'sudo': function() { return '\n  [sudo] password for visitor: \n  \n  Nice try! Permission denied. \n  This incident will be reported.\n'; },
    'coffee': function() { return '\n    ( (\n     ) )\n   ........\n   |      |]\n   \\      /\n    `----\'\n  \n  Coffee break time! ☕\n'; }
  };

  function getWelcomeMessage() {
    var output = '\n';
    if (typeof ASCIIBanner !== 'undefined') { output += ASCIIBanner.getPlainText() + '\n'; }
    else { output += '  ╔══════════════════════════════════════════════════╗\n  ║   Welcome to sbrophy.click terminal interface    ║\n  ║   Type "help" for available commands             ║\n  ╚══════════════════════════════════════════════════╝\n'; }
    output += '\n';
    return output;
  }

  function renderOutput(text, useHighlighting) {
    if (terminalOutput) {
      if (useHighlighting && typeof SyntaxHighlighter !== 'undefined') {
        terminalOutput.innerHTML += SyntaxHighlighter.highlight(text);
      } else {
        terminalOutput.textContent += text;
      }
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  }

  function clearOutput() { if (terminalOutput) terminalOutput.textContent = ''; }

  function executeCommand(input) {
    var trimmed = input.trim().toLowerCase();
    if (!trimmed) return;
    if (typeof TerminalFeedback !== 'undefined' && TerminalFeedback.getIsLoading()) return;
    renderOutput('\nvisitor@sbrophy:~$ ' + input + '\n', true);
    if (trimmed === 'clear' || trimmed === 'cls') { clearOutput(); return; }
    if (trimmed === 'exit' || trimmed === 'quit') { switchToVisualMode(); return; }
    var handler = commands[trimmed];
    if (handler) { renderOutput(handler(), false); }
    else if (typeof TerminalFeedback !== 'undefined') { TerminalFeedback.showError('Command not found: ' + trimmed + '\n\n  Type "help" for available commands.'); }
    else { renderOutput('\n  Command not found: ' + trimmed + '\n\n  Type "help" for available commands.\n', false); }
  }

  function switchToTerminalMode() {
    terminalState.savedScrollY = window.scrollY;
    terminalState.mode = 'terminal';
    document.querySelectorAll('main > section').forEach(function(s) { s.hidden = true; });
    if (terminal) terminal.hidden = false;
    html.setAttribute('data-mode', 'terminal');
    if (modeToggle) modeToggle.setAttribute('aria-label', 'Switch to visual mode');
    localStorage.setItem('sb-mode', 'terminal');
    // Lazy-init terminal modules only when needed
    if (typeof TerminalFeedback !== 'undefined') TerminalFeedback.init(terminalInput, terminalOutput);
    if (!terminalState.glitchEffect && typeof GlitchEffect !== 'undefined' && terminal) {
      terminalState.glitchEffect = new GlitchEffect({ element: terminal });
    }
    if (terminalInput) terminalInput.focus();
    clearOutput();
    renderOutput(getWelcomeMessage(), typeof ASCIIBanner !== 'undefined');
    if (terminalState.glitchEffect) terminalState.glitchEffect.trigger();
  }

  function switchToVisualMode() {
    terminalState.mode = 'visual';
    if (terminal) terminal.hidden = true;
    // Stop terminal effects to free resources
    if (terminalState.matrixEffect && terminalState.matrixEffect.isRunning) terminalState.matrixEffect.stop();
    clearOutput();
    document.querySelectorAll('main > section').forEach(function(s) { s.hidden = false; });
    html.setAttribute('data-mode', 'visual');
    if (modeToggle) modeToggle.setAttribute('aria-label', 'Switch to terminal mode');
    localStorage.setItem('sb-mode', 'visual');
    window.scrollTo(0, terminalState.savedScrollY);
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
    }
  }

  function initTerminal() {
    if (localStorage.getItem('sb-mode') === 'terminal') switchToTerminalMode();
    else html.setAttribute('data-mode', 'visual');
    if (modeToggle) modeToggle.addEventListener('click', function() { terminalState.mode === 'visual' ? switchToTerminalMode() : switchToVisualMode(); });
    if (terminalInput) {
      terminalInput.addEventListener('keydown', handleKeydown);
      if (terminal) terminal.addEventListener('click', function() { terminalInput.focus(); });
    }
  }
  initTerminal();

  /* Initialize Animation Modules */
  function initAnimations() {
    var modules = [
      typeof NetworkCanvas !== 'undefined' ? NetworkCanvas : null,
      typeof TypingTextEffect !== 'undefined' ? TypingTextEffect : null,
      typeof SectionRevealer !== 'undefined' ? SectionRevealer : null,
      typeof TimelineAnimator !== 'undefined' ? TimelineAnimator : null,
      typeof SkillsAnimator !== 'undefined' ? SkillsAnimator : null,
      typeof CertsAnimator !== 'undefined' ? CertsAnimator : null,
      typeof ScrollProgress !== 'undefined' ? ScrollProgress : null,
      typeof ParallaxEffect !== 'undefined' ? ParallaxEffect : null,
      typeof TiltEffect !== 'undefined' ? TiltEffect : null,
      typeof MagneticButton !== 'undefined' ? MagneticButton : null,
      typeof TimelineMarkerHover !== 'undefined' ? TimelineMarkerHover : null,
      typeof SkillPillHover !== 'undefined' ? SkillPillHover : null,
      typeof IconAnimation !== 'undefined' ? IconAnimation : null,
      typeof RippleEffect !== 'undefined' ? RippleEffect : null,
      typeof SmoothScroll !== 'undefined' ? SmoothScroll : null,
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
      var cvLink = document.querySelector('a[href*="Stuart_Brophy_CV.pdf"]');
      if (cvLink) {
        cvLink.addEventListener('click', function() {
          var rect = this.getBoundingClientRect();
          ParticleSystem.emit(rect.left + rect.width / 2, rect.top + rect.height / 2);
          if (typeof ToastSystem !== 'undefined') ToastSystem.show('📄 CV download started!', 'success');
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }
}());
