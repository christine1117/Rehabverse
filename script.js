// Scroll reveal animation
const revealEls = document.querySelectorAll('.section, .cta-inner, .feature-card, .biz-block');revealEls.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => io.observe(el));

// Subtle parallax on hero product stage
const stage = document.querySelector('.product-stage');
if (stage) {
  window.addEventListener('mousemove', (ev) => {
    const x = (ev.clientX / window.innerWidth - 0.5) * 14;
    const y = (ev.clientY / window.innerHeight - 0.5) * 14;
    stage.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// Staggered "pop" entrance for grid children
const staggerGroups = document.querySelectorAll('.feature-grid, .biz-side, .gallery, .spec-list');
const staggerIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const kids = e.target.children;
      Array.from(kids).forEach((kid, i) => {
        kid.style.animationDelay = (i * 90) + 'ms';
        kid.classList.add('pop');
      });
      staggerIO.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
staggerGroups.forEach(g => staggerIO.observe(g));

// Holographic pointer glow that follows the cursor across glass cards
const holoCards = document.querySelectorAll('.feature-card, .biz-card, .shot, .arch-card, .pain-col, .solution-col, .main-shot');
holoCards.forEach(card => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty('--mx', px + '%');
    card.style.setProperty('--my', py + '%');
  });
});

// 3D tilt on feature cards
const tiltCards = document.querySelectorAll('.biz-block');
tiltCards.forEach(card => {
  card.style.transformStyle = 'preserve-3d';
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
    card.style.transform = `translateY(-6px) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);
const spyIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = '#' + e.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
sections.forEach(s => spyIO.observe(s));

// Randomly place the big screenshots on the left/right at random heights
function placeBigshots() {
  const bigshots = document.querySelectorAll('.bigshot');
  if (!bigshots.length) return;
  const docH = document.body.scrollHeight;
  const startY = docH * 0.38;          // begin below the hero
  const usableH = docH * 0.5;          // spread across the lower half
  bigshots.forEach((img, i) => {
    const side = i % 2 === 0 ? 'right' : 'left';
    const top = startY + usableH * (i / bigshots.length) + Math.random() * 120;
    const rot = (Math.random() * 8 - 4).toFixed(1);   // -4 ~ +4 deg, gentle
    img.style.left = img.style.right = 'auto';
    img.style[side] = '18px';          // fully on-screen, not cropped
    img.style.top = top + 'px';
    img.style.transform = `rotate(${rot}deg)`;
  });
}
window.addEventListener('load', placeBigshots);



