/* ============================================================
   AVATAR IMAGE — bob animation
   ============================================================ */
const avatarImg = document.getElementById('avatarImg');
if (avatarImg) {
  let bobUp = true;
  setInterval(() => {
    const y = bobUp ? -8 : 0;
    bobUp = !bobUp;
    avatarImg.style.transform = `translateY(${y}px)`;
    avatarImg.style.transition = 'transform 0.4s steps(2)';
  }, 600);
}

/* ============================================================
   SKY / DAY-NIGHT CYCLE — smooth with rAF + lerp
   ============================================================ */
const sky        = document.getElementById('sky');
const sun        = document.getElementById('sun');
const moon       = document.getElementById('moon');
const starsEl    = document.getElementById('stars');
const progressBar = document.getElementById('progress-bar');

// Each stage: scroll progress [0-1], sky colors, sun/moon params
const skyStages = [
  { p: 0.00, skyTop: '#87CEEB', skyBot: '#B8E4F9', sunY: 10,  sunS: 1.0, sunR: 255, sunG: 215, sunB: 0,   moonOp: 0,   starsOp: 0   },
  { p: 0.25, skyTop: '#FF9A5C', skyBot: '#FFD54F', sunY: 38,  sunS: 1.1, sunR: 255, sunG: 160, sunB: 0,   moonOp: 0,   starsOp: 0   },
  { p: 0.50, skyTop: '#C62828', skyBot: '#FF8A65', sunY: 65,  sunS: 1.2, sunR: 255, sunG: 80,  sunB: 30,  moonOp: 0.3, starsOp: 0.2 },
  { p: 0.75, skyTop: '#4A148C', skyBot: '#E64A19', sunY: 92,  sunS: 0.4, sunR: 255, sunG: 64,  sunB: 129, moonOp: 0.8, starsOp: 0.7 },
  { p: 1.00, skyTop: '#0A0A2E', skyBot: '#1a0033', sunY: 115, sunS: 0,   sunR: 255, sunG: 64,  sunB: 129, moonOp: 1,   starsOp: 1   },
];

function lerpN(a, b, t) { return a + (b - a) * t; }

function getSkyState(progress) {
  let a, b, t;
  for (let i = 0; i < skyStages.length - 1; i++) {
    if (progress >= skyStages[i].p && progress <= skyStages[i + 1].p) {
      a = skyStages[i];
      b = skyStages[i + 1];
      t = (progress - a.p) / (b.p - a.p);
      return { a, b, t };
    }
  }
  const last = skyStages[skyStages.length - 1];
  return { a: last, b: last, t: 0 };
}

// Smooth current values (lerped toward target each frame)
let curSkyTopR=135,curSkyTopG=206,curSkyTopB=235;
let curSkyBotR=184,curSkyBotG=228,curSkyBotB=249;
let curSunY=10, curSunS=1, curSunR=255,curSunG=215,curSunB=0;
let curMoonOp=0, curStarsOp=0;

const SMOOTH = 0.06; // lower = smoother / slower

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

let scrollProgress = 0;

function updateSky() {
  const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
  scrollProgress = Math.min(window.scrollY / maxScroll, 1);

  // Progress bar — instant is fine
  progressBar.style.width = (scrollProgress * 100) + '%';

  const { a, b, t } = getSkyState(scrollProgress);

  // Target values
  const [atR,atG,atB] = hexToRgb(a.skyTop);
  const [btR,btG,btB] = hexToRgb(b.skyTop);
  const tTopR = lerpN(atR,btR,t), tTopG = lerpN(atG,btG,t), tTopB = lerpN(atB,btB,t);

  const [abR,abG,abB] = hexToRgb(a.skyBot);
  const [bbR,bbG,bbB] = hexToRgb(b.skyBot);
  const tBotR = lerpN(abR,bbR,t), tBotG = lerpN(abG,bbG,t), tBotB = lerpN(abB,bbB,t);

  const tSunY  = lerpN(a.sunY,  b.sunY,  t);
  const tSunS  = lerpN(a.sunS,  b.sunS,  t);
  const tSunR2 = lerpN(a.sunR,  b.sunR,  t);
  const tSunG2 = lerpN(a.sunG,  b.sunG,  t);
  const tSunB2 = lerpN(a.sunB,  b.sunB,  t);
  const tMoon  = lerpN(a.moonOp, b.moonOp, t);
  const tStars = lerpN(a.starsOp, b.starsOp, t);

  // Smooth toward target
  curSkyTopR += (tTopR - curSkyTopR) * SMOOTH;
  curSkyTopG += (tTopG - curSkyTopG) * SMOOTH;
  curSkyTopB += (tTopB - curSkyTopB) * SMOOTH;
  curSkyBotR += (tBotR - curSkyBotR) * SMOOTH;
  curSkyBotG += (tBotG - curSkyBotG) * SMOOTH;
  curSkyBotB += (tBotB - curSkyBotB) * SMOOTH;
  curSunY  += (tSunY  - curSunY)  * SMOOTH;
  curSunS  += (tSunS  - curSunS)  * SMOOTH;
  curSunR  += (tSunR2 - curSunR)  * SMOOTH;
  curSunG  += (tSunG2 - curSunG)  * SMOOTH;
  curSunB  += (tSunB2 - curSunB)  * SMOOTH;
  curMoonOp  += (tMoon  - curMoonOp)  * SMOOTH;
  curStarsOp += (tStars - curStarsOp) * SMOOTH;

  sky.style.background = `linear-gradient(180deg,
    rgb(${curSkyTopR|0},${curSkyTopG|0},${curSkyTopB|0}) 0%,
    rgb(${curSkyBotR|0},${curSkyBotG|0},${curSkyBotB|0}) 100%)`;

  sun.style.top       = curSunY + '%';
  sun.style.transform = `scale(${curSunS})`;
  sun.style.background = `rgb(${curSunR|0},${curSunG|0},${curSunB|0})`;
  sun.style.boxShadow  = `0 0 0 8px rgba(${curSunR|0},${curSunG|0},${curSunB|0},0.5), 0 0 0 16px rgba(${curSunR|0},${curSunG|0},${curSunB|0},0.2)`;

  moon.style.opacity  = curMoonOp;
  starsEl.style.opacity = curStarsOp;

  requestAnimationFrame(updateSky);
}

window.addEventListener('scroll', () => {}, { passive: true }); // keep passive flag
requestAnimationFrame(updateSky);

/* ============================================================
   GENERATE PIXEL STARS
   ============================================================ */
for (let i = 0; i < 80; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  star.style.left = Math.random() * 100 + '%';
  star.style.top  = Math.random() * 80  + '%';
  star.style.animationDelay = Math.random() * 2 + 's';
  const big = Math.random() > 0.7;
  star.style.width  = (big ? 6 : 4) + 'px';
  star.style.height = star.style.width;
  starsEl.appendChild(star);
}

/* ============================================================
   TYPING EFFECT
   ============================================================ */
const phrases = [
  'SOFTWARE DEVELOPER',
  'FLUTTER ENTHUSIAST',
  'BACKEND BUILDER',
  'FULL-STACK EXPLORER',
  'PIXEL ART FAN',
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typeTarget = document.getElementById('typeTarget');

function typeLoop() {
  const current = phrases[phraseIdx];
  if (!deleting) {
    typeTarget.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1800);
      return;
    }
  } else {
    typeTarget.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }
  setTimeout(typeLoop, deleting ? 60 : 90);
}
typeLoop();

/* ============================================================
   SCROLL REVEAL — professional staggered animations
   ============================================================ */
const revealEls = document.querySelectorAll('.fade-in');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings that come in together
      const siblings = [...entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)')];
      const idx = siblings.indexOf(entry.target);
      const delay = idx >= 0 ? idx * 80 : 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

/* ============================================================
   PIXEL CURSOR SPARKLE
   ============================================================ */
// Inject sparkle keyframe
const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes sparkleAnim {
  0%   { opacity:1; transform: translate(-50%,-50%) scale(1); }
  100% { opacity:0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); }
}`;
document.head.appendChild(styleTag);

document.addEventListener('click', (e) => {
  const sparkles = ['★', '✦', '◆', '♦', '●'];
  const colors   = ['#FFD700','#FF4081','#00E5FF','#4CAF50'];
  for (let i = 0; i < 5; i++) {
    const el = document.createElement('div');
    el.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    const dx = (Math.random() - 0.5) * 80;
    const dy = (Math.random() - 0.5) * 80;
    el.style.cssText = `
      position:fixed;
      left:${e.clientX}px;
      top:${e.clientY}px;
      font-size:${12 + Math.random() * 16}px;
      color:${colors[Math.floor(Math.random() * colors.length)]};
      pointer-events:none;
      z-index:9999;
      font-family:monospace;
      animation:sparkleAnim 0.6s forwards;
      transform:translate(-50%,-50%);
      --dx:${dx}px;
      --dy:${dy}px;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }
});