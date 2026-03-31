/* ═══════════════════════════════════════════════════════
   Quantr — Landing Page Script
   Canvas background · Typewriter · Backend-connected chips
   Live ticker tape · News feed · Staggered animations
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Backend API base (Next.js app on port 3000) ────────
  const API = window.location.port === '3500'
    ? 'http://localhost:3000/api'   // Development: landing served separately
    : '/api';                        // Production: same origin

  /* ─────────────────────────────────────────────
     1.  ANIMATED CANVAS BACKGROUND
     ───────────────────────────────────────────── */
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const ACCENT = { r: 0, g: 232, b: 123 };
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 150;

  function resizeCanvas() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 2 + 0.4,
        opacity: Math.random() * 0.35 + 0.08,
      });
    }
  }

  let gradientOffset = 0;
  let dataLines = [];

  function initDataLines() {
    dataLines = [];
    for (let l = 0; l < 5; l++) {
      const points = [];
      const y0 = H * (0.2 + l * 0.13);
      for (let i = 0; i <= 60; i++) {
        points.push({
          x: (W / 60) * i,
          baseY: y0,
          offset: (Math.random() - 0.5) * 35,
          speed: 0.3 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
        });
      }
      dataLines.push({ points, alpha: 0.03 + Math.random() * 0.04 });
    }
  }

  function drawBackground() {
    ctx.fillStyle = '#08090a';
    ctx.fillRect(0, 0, W, H);
    gradientOffset += 0.002;

    const cx = W * 0.5 + Math.sin(gradientOffset * 1.3) * W * 0.12;
    const cy = H * 0.5 + Math.cos(gradientOffset) * H * 0.08;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.55);
    grad.addColorStop(0, 'rgba(0, 232, 123, 0.03)');
    grad.addColorStop(0.4, 'rgba(0, 140, 80, 0.012)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const cx2 = W * 0.72 + Math.cos(gradientOffset * 0.7) * W * 0.1;
    const cy2 = H * 0.3 + Math.sin(gradientOffset * 1.1) * H * 0.1;
    const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, Math.max(W, H) * 0.38);
    grad2.addColorStop(0, 'rgba(60, 50, 200, 0.018)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, W, H);
  }

  function drawDataLines(time) {
    for (const line of dataLines) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 232, 123, ${line.alpha})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < line.points.length; i++) {
        const p = line.points[i];
        const y = p.baseY + Math.sin(time * p.speed + p.phase) * p.offset;
        i === 0 ? ctx.moveTo(p.x, y) : ctx.lineTo(p.x, y);
      }
      ctx.stroke();
    }
  }

  function drawParticlesAndConnections() {
    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.07;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    // Particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${p.opacity})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    }
  }

  let animTime = 0;
  function animateCanvas() {
    animTime += 0.01;
    drawBackground();
    drawDataLines(animTime);
    drawParticlesAndConnections();
    requestAnimationFrame(animateCanvas);
  }

  function initCanvas() {
    resizeCanvas();
    createParticles();
    initDataLines();
    animateCanvas();
  }

  window.addEventListener('resize', () => { resizeCanvas(); initDataLines(); });

  /* ─────────────────────────────────────────────
     2.  STAGGERED ENTRY ANIMATIONS
     ───────────────────────────────────────────── */
  function runHeroAnimations() {
    document.querySelectorAll('.hero .anim-fade').forEach((el) => {
      const order = parseInt(el.dataset.anim, 10) || 1;
      setTimeout(() => el.classList.add('visible'), 300 + order * 200);
    });
    document.querySelectorAll('.signal-chip').forEach((chip, i) => {
      setTimeout(() => chip.classList.add('visible'), 1100 + i * 160);
    });
  }

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.animDelay, 10) || 0;
            setTimeout(() => el.classList.add('visible'), delay * 120);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.anim-slide, .features .anim-fade, .news-section .anim-fade, .stats-bar .anim-fade, .cta-section .anim-fade').forEach((el) => {
      observer.observe(el);
    });
  }

  /* ─────────────────────────────────────────────
     3.  TYPEWRITER EFFECT
     ───────────────────────────────────────────── */
  const QUERIES = [
    'Find undervalued stocks with ROE > 20%',
    'Show high-ROCE compounders below ₹500 Cr',
    'Analyze Nifty 50 sector allocation',
    'Compare PE ratios across IT stocks',
    'Screen for low debt-to-equity mid caps',
  ];
  let qIdx = 0, cIdx = 0, isDeleting = false;
  const input = document.getElementById('search-input');
  const cursor = document.getElementById('typewriter-cursor');

  function typewriterTick() {
    const query = QUERIES[qIdx];
    if (!isDeleting) {
      input.placeholder = query.slice(0, cIdx + 1);
      cIdx++;
      if (cIdx >= query.length) {
        isDeleting = true;
        setTimeout(typewriterTick, 2400);
        return;
      }
      setTimeout(typewriterTick, 50 + Math.random() * 30);
    } else {
      input.placeholder = query.slice(0, cIdx);
      cIdx--;
      if (cIdx <= 0) {
        isDeleting = false;
        qIdx = (qIdx + 1) % QUERIES.length;
        setTimeout(typewriterTick, 350);
        return;
      }
      setTimeout(typewriterTick, 22);
    }
  }

  function updateCursorPosition() {
    if (!input || !cursor) return;
    const text = input.placeholder || '';
    const offset = 50 + text.length * 7.8;
    cursor.style.left = Math.min(offset, input.offsetWidth - 48) + 'px';
  }

  input.addEventListener('focus', () => cursor.classList.remove('active'));
  input.addEventListener('blur', () => {
    if (!input.value) cursor.classList.add('active');
  });

  function startTypewriter() {
    cursor.classList.add('active');
    setInterval(updateCursorPosition, 80);
    typewriterTick();
  }

  /* ─────────────────────────────────────────────
     4.  BACKEND: FETCH LIVE MARKET INDICES
     ───────────────────────────────────────────── */
  async function fetchIndices() {
    try {
      const res = await fetch(`${API}/market/indices`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.indices && data.indices.length >= 2) {
        const nifty = data.indices.find(i => i.symbol === '^NSEI') || data.indices[0];
        const sensex = data.indices.find(i => i.symbol === '^BSESN') || data.indices[1];

        // Update NIFTY chip
        document.getElementById('chip-nifty-val').textContent = nifty.value;
        const niftyDelta = document.getElementById('chip-nifty-delta');
        niftyDelta.textContent = `${nifty.change} (${nifty.percent})`;
        niftyDelta.className = `signal-chip__delta ${nifty.isPositive ? 'positive' : 'negative'}`;

        // Update SENSEX chip
        document.getElementById('chip-sensex-val').textContent = sensex.value;
        const sensexDelta = document.getElementById('chip-sensex-delta');
        sensexDelta.textContent = `${sensex.change} (${sensex.percent})`;
        sensexDelta.className = `signal-chip__delta ${sensex.isPositive ? 'positive' : 'negative'}`;
      }
    } catch (err) {
      console.warn('[Quantr] Could not fetch indices:', err.message);
      // Fallback: leave the "—" dashes in place
    }
  }

  /* ─────────────────────────────────────────────
     5.  BACKEND: FETCH TOP GAINERS & STOCK COUNT
     ───────────────────────────────────────────── */
  let allTickerStocks = [];

  async function fetchDashboardData() {
    try {
      const res = await fetch(`${API}/dashboard`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.gainers && data.gainers.length > 0) {
        const top = data.gainers[0];
        document.getElementById('chip-gainer-name').textContent = top.symbol || top.name;
        document.getElementById('chip-gainer-pct').textContent = `+${Math.abs(top.change).toFixed(2)}%`;
      }
    } catch (err) {
      console.warn('[Quantr] Could not fetch dashboard:', err.message);
    }
  }

  async function fetchTickerData() {
    try {
      const res = await fetch(`${API}/screener?limit=40&sort=market_cap&order=desc`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.data && data.data.length > 0) {
        allTickerStocks = data.data;
        buildTickerTape(data.data);

        // Update stock count chip and stat
        const total = data.pagination?.total || data.data.length;
        document.getElementById('chip-stock-count').textContent = total.toLocaleString('en-IN');
        const statEl = document.getElementById('stat-stocks');
        if (statEl) statEl.dataset.count = total;
      }
    } catch (err) {
      console.warn('[Quantr] Could not fetch screener:', err.message);
    }
  }

  /* ─────────────────────────────────────────────
     6.  TICKER TAPE (from screener data)
     ───────────────────────────────────────────── */
  function buildTickerTape(stocks) {
    const track = document.getElementById('ticker-track');
    if (!stocks || stocks.length === 0) return;

    const items = stocks.map(s => {
      const changeVal = s.change || 0;
      const isUp = changeVal >= 0;
      return `<span class="ticker-item">
        <span class="ticker-item__symbol">${s.symbol}</span>
        <span class="ticker-item__price">₹${Number(s.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span class="ticker-item__change ${isUp ? 'up' : 'down'}">${isUp ? '+' : ''}${changeVal.toFixed(2)}%</span>
      </span>`;
    }).join('');

    // Duplicate for seamless loop
    track.innerHTML = items + items;
  }

  /* ─────────────────────────────────────────────
     7.  BACKEND: FETCH NEWS
     ───────────────────────────────────────────── */
  async function fetchNews() {
    try {
      const res = await fetch(`${API}/market/news`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
        const grid = document.getElementById('news-grid');
        grid.innerHTML = data.articles.slice(0, 6).map(a => {
          const timeStr = formatNewsTime(a.timePublished);
          return `<a href="${a.url}" target="_blank" rel="noopener" class="news-card anim-slide">
            <span class="news-card__source">${escapeHtml(a.source)}</span>
            <h3 class="news-card__title">${escapeHtml(a.title)}</h3>
            ${a.summary ? `<p class="news-card__summary">${escapeHtml(a.summary)}</p>` : ''}
            <span class="news-card__time">${timeStr}</span>
          </a>`;
        }).join('');

        // Re-observe for scroll animations
        document.querySelectorAll('.news-card.anim-slide').forEach(el => {
          scrollObserver.observe(el);
        });
      }
    } catch (err) {
      console.warn('[Quantr] Could not fetch news:', err.message);
      document.getElementById('news-grid').innerHTML =
        '<div class="news-placeholder">Unable to load news. <a href="/news" style="color:var(--accent)">View in app →</a></div>';
    }
  }

  function formatNewsTime(raw) {
    if (!raw) return '';
    try {
      // Alpha Vantage format: 20260326T143000
      const y = raw.slice(0, 4), m = raw.slice(4, 6), d = raw.slice(6, 8);
      const h = raw.slice(9, 11), mi = raw.slice(11, 13);
      const date = new Date(`${y}-${m}-${d}T${h}:${mi}:00`);
      const now = new Date();
      const diffH = Math.floor((now - date) / 3600000);
      if (diffH < 1) return 'Just now';
      if (diffH < 24) return `${diffH}h ago`;
      return `${Math.floor(diffH / 24)}d ago`;
    } catch {
      return '';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ─────────────────────────────────────────────
     8.  STATS COUNTER ANIMATION
     ───────────────────────────────────────────── */
  function animateCounters() {
    const counters = document.querySelectorAll('.stat__number');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          if (isNaN(target)) return;
          let current = 0;
          const duration = 1400;
          const increment = target / (duration / 16);
          const animate = () => {
            current += increment;
            if (current >= target) {
              el.textContent = target.toLocaleString('en-IN');
              return;
            }
            el.textContent = Math.floor(current).toLocaleString('en-IN');
            requestAnimationFrame(animate);
          };
          animate();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }

  /* ─────────────────────────────────────────────
     9.  NAV SCROLL EFFECT
     ───────────────────────────────────────────── */
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 60
      ? 'rgba(8, 9, 10, 0.88)'
      : 'rgba(8, 9, 10, 0.6)';
  }, { passive: true });

  /* ─────────────────────────────────────────────
     10.  SCROLL OBSERVER (reusable)
     ───────────────────────────────────────────── */
  let scrollObserver;

  /* ─────────────────────────────────────────────
     11.  INITIALISE
     ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    runHeroAnimations();

    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.animDelay, 10) || 0;
            setTimeout(() => el.classList.add('visible'), delay * 120);
            scrollObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    initScrollAnimations();
    animateCounters();

    // Start typewriter after hero animations settle
    setTimeout(startTypewriter, 1400);

    // ── Fetch real data from backend ──
    fetchIndices();
    fetchDashboardData();
    fetchTickerData();
    fetchNews();

    // Refresh indices every 60 seconds
    setInterval(fetchIndices, 60000);
    // Refresh dashboard data every 2 minutes
    setInterval(fetchDashboardData, 120000);
  });
})();
