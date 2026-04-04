"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════
   Quantr — About Page
   Editorial luxury design. Signature work.
   ═══════════════════════════════════════════════════════ */

// ── Animated counter hook ──
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame: number;
    const t0 = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(target * ease));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);
  return count;
}

// ── Intersection observer hook ──
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Noise canvas background ──
function NoiseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    let frame: number;
    const draw = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 12;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 18;
      }
      ctx.putImageData(imageData, 0, 0);
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.6 }}
    />
  );
}

// ── Orbiting SVG line decoration ──
function OrbitLines() {
  return (
    <svg
      viewBox="0 0 800 800"
      style={{
        position: "absolute", width: "min(900px, 110vw)", height: "min(900px, 110vw)",
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        opacity: 0.04, pointerEvents: "none", zIndex: 0,
      }}
    >
      <ellipse cx="400" cy="400" rx="380" ry="200" fill="none" stroke="var(--ab-gold)" strokeWidth="0.8"
        style={{ transformOrigin: "400px 400px", animation: "ab-orbit 22s linear infinite" }} />
      <ellipse cx="400" cy="400" rx="300" ry="340" fill="none" stroke="var(--ab-gold)" strokeWidth="0.5"
        style={{ transformOrigin: "400px 400px", animation: "ab-orbit 34s linear infinite reverse" }} />
      <ellipse cx="400" cy="400" rx="250" ry="150" fill="none" stroke="#ffffff" strokeWidth="0.4"
        style={{ transformOrigin: "400px 400px", animation: "ab-orbit 18s linear infinite" }} />
      <circle cx="400" cy="400" r="2" fill="var(--ab-gold)" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function AboutPage() {
  const [entered, setEntered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);

  // Stats section
  const { ref: statsRef, visible: statsVisible } = useInView(0.3);
  const c1 = useCounter(5200, 2000, statsVisible);
  const c2 = useCounter(99, 1600, statsVisible);
  const c3 = useCounter(22, 1400, statsVisible);

  // Section observers
  const { ref: manifestoRef, visible: manifestoVisible } = useInView(0.15);
  const { ref: valuesRef, visible: valuesVisible } = useInView(0.1);
  const { ref: teamRef, visible: teamVisible } = useInView(0.1);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setCursorVisible(true);
    };
    const onLeave = () => setCursorVisible(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="ab-root">
      <style>{css}</style>
      <NoiseCanvas />

      {/* Custom cursor glow */}
      <div
        className="ab-cursor"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          opacity: cursorVisible ? 1 : 0,
        }}
      />

      {/* ─── NAV ─── */}
      <nav className={`ab-nav ${scrollY > 20 ? "ab-nav--solid" : ""}`}>
        <div className="ab-nav__inner">
          <Link href="/" className="ab-nav__brand">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,26 2,26" stroke="var(--ab-gold)" strokeWidth="1.6" fill="none" />
              <line x1="14" y1="8" x2="14" y2="20" stroke="var(--ab-gold)" strokeWidth="1.2" />
            </svg>
            <span>Quantr</span>
          </Link>
          <div className="ab-nav__center">
            <span className="ab-nav__label">About</span>
          </div>
          <Link href="/dashboard" className="ab-nav__cta">
            Launch App <span>→</span>
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="ab-hero">
        <OrbitLines />

        {/* Year stamp */}
        <div className={`ab-hero__stamp ${entered ? "in" : ""}`}>
          <span>Est.</span>
          <span className="ab-hero__stamp-year">2024</span>
        </div>

        {/* Main headline */}
        <div className={`ab-hero__copy ${entered ? "in" : ""}`}>
          <div className="ab-hero__eyebrow">
            <span className="ab-dot ab-dot--gold" />
            The Company
          </div>
          <h1 className="ab-hero__h1">
            We built the tool<br />
            we always <span className="ab-hero__highlight">wanted.</span>
          </h1>
          <p className="ab-hero__sub">
            Institutional-grade market intelligence.<br />
            Made accessible. Made beautiful.
          </p>
        </div>

        {/* Scroll cue */}
        <div className={`ab-hero__scroll ${entered ? "in" : ""}`}>
          <div className="ab-hero__scroll-line" />
          <span>Scroll</span>
        </div>

        {/* Corner indices */}
        <div className={`ab-corner ab-corner--br ${entered ? "in" : ""}`}>
          <span className="ab-corner__label">BSE · NSE · MCX</span>
          <span className="ab-corner__sub">Indian Equities</span>
        </div>
      </section>

      {/* ─── MANIFESTO ─── */}
      <section
        className={`ab-manifesto ${manifestoVisible ? "in" : ""}`}
        ref={manifestoRef as React.RefObject<HTMLElement>}
      >
        <div className="ab-manifesto__inner">
          <div className="ab-manifesto__left">
            <span className="ab-section-num">01</span>
            <span className="ab-section-label">Manifesto</span>
          </div>
          <div className="ab-manifesto__right">
            <p className="ab-manifesto__line ab-manifesto__line--lg">
              The Indian market generates <em>terabytes</em> of data every second.
            </p>
            <p className="ab-manifesto__line">
              Yet most investors still make decisions on gut feel, broker tips, and half-read headlines.
              Not because they don't want better — but because better didn't exist.
            </p>
            <p className="ab-manifesto__line">
              Quantr is the answer to a question serious investors ask every day:
              <em> "Why should institutional-grade tools only exist for institutions?"</em>
            </p>
            <p className="ab-manifesto__line ab-manifesto__line--gold">
              We disagree with that premise. Deeply.
            </p>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section
        className="ab-stats"
        ref={statsRef as React.RefObject<HTMLElement>}
      >
        <div className="ab-stats__track">
          <div className="ab-stat">
            <span className="ab-stat__n">{c1.toLocaleString("en-IN")}+</span>
            <span className="ab-stat__l">Stocks tracked live</span>
          </div>
          <div className="ab-stat__sep" />
          <div className="ab-stat">
            <span className="ab-stat__n">{c2}%</span>
            <span className="ab-stat__l">Data accuracy</span>
          </div>
          <div className="ab-stat__sep" />
          <div className="ab-stat">
            <span className="ab-stat__n">{c3}</span>
            <span className="ab-stat__l">Sectors covered</span>
          </div>
          <div className="ab-stat__sep" />
          <div className="ab-stat">
            <span className="ab-stat__n">∞</span>
            <span className="ab-stat__l">Curiosity</span>
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section
        className={`ab-values ${valuesVisible ? "in" : ""}`}
        ref={valuesRef as React.RefObject<HTMLElement>}
      >
        <div className="ab-values__header">
          <span className="ab-section-num">02</span>
          <span className="ab-section-label">What We Stand For</span>
        </div>
        <div className="ab-values__grid">
          {[
            {
              num: "I",
              title: "Radical Transparency",
              body: "Every number we show you has a source. Every metric has a definition. No black boxes, no vague algorithms, no 'trust us'. You see what we see.",
            },
            {
              num: "II",
              title: "Speed as Respect",
              body: "Markets don't wait. Neither should your tools. We obsess over latency because every second of delay is a second we've stolen from your decision-making.",
            },
            {
              num: "III",
              title: "Depth over Decoration",
              body: "Anyone can make a dashboard look busy. We make it meaningful. Fewer widgets, more insight. Less noise, more signal.",
            },
            {
              num: "IV",
              title: "The Investor First",
              body: "We don't sell your data. We don't optimize for engagement. We optimize for one thing only: your ability to make better investment decisions.",
            },
          ].map((v, i) => (
            <div
              key={i}
              className="ab-vcard"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <span className="ab-vcard__num">{v.num}</span>
              <div className="ab-vcard__body">
                <h3 className="ab-vcard__title">{v.title}</h3>
                <p className="ab-vcard__text">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PULL QUOTE ─── */}
      <section className="ab-quote">
        <div className="ab-quote__inner">
          <div className="ab-quote__mark">&ldquo;</div>
          <blockquote className="ab-quote__text">
            The market rewards those<br />
            who think clearly<br />
            when others cannot.
          </blockquote>
          <div className="ab-quote__attr">— The Quantr Philosophy</div>
          <div className="ab-quote__line" />
        </div>
      </section>

      {/* ─── TEAM / STORY ─── */}
      <section
        className={`ab-team ${teamVisible ? "in" : ""}`}
        ref={teamRef as React.RefObject<HTMLElement>}
      >
        <div className="ab-team__inner">
          <div className="ab-team__left">
            <span className="ab-section-num">03</span>
            <span className="ab-section-label">The Story</span>
            <h2 className="ab-team__heading">
              Built by<br />
              <em>investors,</em><br />
              for investors.
            </h2>
          </div>
          <div className="ab-team__right">
            <div className="ab-team__paragraph">
              <p>
                Quantr started with a single frustration: why did professional-grade stock
                analysis tools cost tens of thousands of rupees a year, run on archaic UIs
                designed in 2003, and still require a Bloomberg terminal subscription just
                to access real data?
              </p>
            </div>
            <div className="ab-team__paragraph">
              <p>
                We set out to build something different — a platform that treats the retail
                investor with the same respect as a fund manager. That means real-time NSE/BSE
                data, 120+ screening metrics, AI-driven portfolio analysis, and a design that
                doesn't make you feel like you're filing your taxes.
              </p>
            </div>
            <div className="ab-team__paragraph">
              <p>
                We're a small, obsessive team. We don't have VC-funded offices or ping-pong
                tables. What we have is a genuine belief that the democratisation of financial
                intelligence is one of the most important things we can build — and we're
                building it right here, for India.
              </p>
            </div>
            <div className="ab-team__sig">
              <span className="ab-team__sig-line">— The Quantr Team</span>
              <div className="ab-team__sig-dot" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECH STRIP ─── */}
      <section className="ab-tech">
        <div className="ab-tech__inner">
          <span className="ab-section-label" style={{ marginBottom: "2rem", display: "block" }}>Under the Hood</span>
          <div className="ab-tech__grid">
            {[
              { label: "Data Layer", value: "NSE · BSE · MCX · Alpha Vantage" },
              { label: "Screening Engine", value: "120+ Real-time Metrics" },
              { label: "AI Layer", value: "GPT-4 · Custom RAG Pipeline" },
              { label: "Latency", value: "Sub-15s Data Refresh" },
              { label: "Coverage", value: "5,200+ Indian Equities" },
              { label: "Infrastructure", value: "Globally Distributed Edge" },
            ].map((t, i) => (
              <div key={i} className="ab-tech__item">
                <span className="ab-tech__label">{t.label}</span>
                <span className="ab-tech__value">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CLOSING CTA ─── */}
      <section className="ab-closing">
        <div className="ab-closing__inner">
          <div className="ab-closing__ring" />
          <div className="ab-closing__ring ab-closing__ring--2" />
          <div className="ab-closing__content">
            <h2 className="ab-closing__heading">
              Start seeing the<br />
              <em>whole picture.</em>
            </h2>
            <p className="ab-closing__sub">
              Join investors who've moved beyond gut feel.
            </p>
            <Link href="/dashboard" className="ab-closing__btn">
              Open Quantr
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/" className="ab-closing__back">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="ab-footer">
        <div className="ab-footer__inner">
          <div className="ab-footer__brand">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,26 2,26" stroke="var(--ab-gold)" strokeWidth="1.4" fill="none" />
              <line x1="14" y1="8" x2="14" y2="20" stroke="var(--ab-gold)" strokeWidth="1.1" />
            </svg>
            <span>Quantr</span>
          </div>
          <span className="ab-footer__copy">© 2026 Quantr Technologies</span>
          <div className="ab-footer__links">
            <Link href="/">Home</Link>
            <Link href="/screener">Screener</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  CSS
// ═══════════════════════════════════════════════════════
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ── Tokens ── */
.ab-root {
  --ab-bg: #0a0a0c;
  --ab-bg2: #111216;
  --ab-surface: #1A1D24;
  --ab-gold: #3b82f6; /* Swapped to UI Blue */
  --ab-gold-dim: rgba(59, 130, 246, 0.12);
  --ab-gold-glow: rgba(59, 130, 246, 0.08);
  --ab-white: #f8fafc;
  --ab-dim: #94a3b8;
  --ab-xdim: #475569;
  --ab-border: rgba(59, 130, 246, 0.08);
  --ab-border2: rgba(255,255,255,0.05);
  --ab-display: var(--font-plus-jakarta, 'Plus Jakarta Sans', system-ui, sans-serif);
  --ab-sans: var(--font-inter, 'Inter', system-ui, sans-serif);
  --ab-mono: var(--font-jetbrains-mono, ui-monospace, 'JetBrains Mono', monospace);
  --ab-tr: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ab-tr-slow: 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  font-family: var(--ab-sans);
  background: var(--ab-bg);
  color: var(--ab-white);
  min-height: 100vh;
  overflow-x: hidden;
  cursor: none;
}

/* ── Custom cursor ── */
.ab-cursor {
  position: fixed;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
  transition: opacity 0.3s;
}

/* ── Animations ── */
@keyframes ab-orbit {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes ab-fade-up {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ab-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ab-line-in {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes ab-scroll-pulse {
  0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
  50%       { opacity: 1;   transform: scaleY(1); }
}
@keyframes ab-spin-slow {
  from { transform: translate(-50%,-50%) rotate(0deg); }
  to   { transform: translate(-50%,-50%) rotate(360deg); }
}

/* ── Utility ── */
.ab-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.ab-dot--gold {
  background: var(--ab-gold);
  box-shadow: 0 0 10px var(--ab-gold);
}
.ab-section-num {
  font-family: var(--ab-mono);
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--ab-gold);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.ab-section-label {
  font-family: var(--ab-mono);
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--ab-xdim);
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

/* ══════════════════════════
   NAV
══════════════════════════ */
.ab-nav {
  position: fixed;
  inset: 0 0 auto 0;
  height: 60px;
  z-index: 100;
  transition: background var(--ab-tr), border-color var(--ab-tr);
  border-bottom: 1px solid transparent;
}
.ab-nav--solid {
  background: rgba(8,8,8,0.9);
  backdrop-filter: blur(20px);
  border-color: var(--ab-border);
}
.ab-nav__inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
}
.ab-nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-family: var(--ab-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ab-white);
  letter-spacing: -0.01em;
  cursor: none;
}
.ab-nav__center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.ab-nav__label {
  font-family: var(--ab-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ab-xdim);
}
.ab-nav__cta {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ab-gold);
  text-decoration: none;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: none;
  transition: opacity var(--ab-tr);
}
.ab-nav__cta:hover { opacity: 0.7; }
.ab-nav__cta span { transition: transform var(--ab-tr); }
.ab-nav__cta:hover span { transform: translateX(3px); }

/* ══════════════════════════
   HERO
══════════════════════════ */
.ab-hero {
  position: relative;
  height: 100vh;
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid var(--ab-border);
}

/* Corner year stamp */
.ab-hero__stamp {
  position: absolute;
  top: 80px;
  left: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  opacity: 0;
  transform: translateY(-12px);
  transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
  z-index: 2;
}
.ab-hero__stamp.in { opacity: 1; transform: translateY(0); }
.ab-hero__stamp > span:first-child {
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ab-dim);
}
.ab-hero__stamp-year {
  font-family: var(--ab-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ab-gold);
  letter-spacing: -0.01em;
}

/* Hero copy */
.ab-hero__copy {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 0 24px;
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 1s ease 0.4s, transform 1s ease 0.4s;
}
.ab-hero__copy.in { opacity: 1; transform: translateY(0); }

.ab-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--ab-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ab-xdim);
  margin-bottom: 32px;
}

.ab-hero__h1 {
  font-family: var(--ab-display);
  font-size: clamp(3rem, 7.5vw, 6.2rem);
  font-weight: 800;
  color: var(--ab-white);
  letter-spacing: -0.04em;
  line-height: 1.05;
  text-align: center;
  margin: 0 0 32px;
}
.ab-hero__highlight { color: var(--ab-gold); }

.ab-hero__sub {
  font-size: 0.88rem;
  font-weight: 300;
  color: var(--ab-dim);
  line-height: 1.8;
  letter-spacing: 0.04em;
}

/* Scroll indicator */
.ab-hero__scroll {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.8s ease 1.4s;
}
.ab-hero__scroll.in { opacity: 1; }
.ab-hero__scroll span {
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ab-xdim);
}
.ab-hero__scroll-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, var(--ab-gold), transparent);
  transform-origin: top;
  animation: ab-scroll-pulse 2s ease-in-out infinite;
}

/* Corner badge */
.ab-corner {
  position: absolute;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.8s ease 1s, transform 0.8s ease 1s;
}
.ab-corner--br {
  bottom: 40px;
  right: 40px;
  text-align: right;
  transform: translateY(12px);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ab-corner--br.in { opacity: 1; transform: translateY(0); }
.ab-corner__label {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ab-gold);
}
.ab-corner__sub {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ab-xdim);
}

/* ══════════════════════════
   MANIFESTO
══════════════════════════ */
.ab-manifesto {
  padding: 120px 40px;
  max-width: 1200px;
  margin: 0 auto;
  border-bottom: 1px solid var(--ab-border);
  opacity: 0;
  transform: translateY(40px);
  transition: opacity var(--ab-tr-slow), transform var(--ab-tr-slow);
}
.ab-manifesto.in { opacity: 1; transform: translateY(0); }
.ab-manifesto__inner {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 80px;
  align-items: start;
}
.ab-manifesto__left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 100px;
}
.ab-manifesto__right {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.ab-manifesto__line {
  font-family: var(--ab-serif);
  font-size: 1.15rem;
  font-weight: 300;
  color: rgba(240,236,230,0.65);
  line-height: 1.85;
  border-left: 1px solid var(--ab-border);
  padding-left: 28px;
}
.ab-manifesto__line em {
  font-style: normal;
  font-weight: 600;
  color: var(--ab-white);
}
.ab-manifesto__line--lg {
  font-size: 1.55rem;
  color: var(--ab-white);
  font-weight: 300;
  border-color: var(--ab-gold);
}
.ab-manifesto__line--gold {
  color: var(--ab-gold);
  border-color: var(--ab-gold);
  font-size: 1.3rem;
}

/* ══════════════════════════
   STATS
══════════════════════════ */
.ab-stats {
  background: var(--ab-surface);
  border-top: 1px solid var(--ab-border);
  border-bottom: 1px solid var(--ab-border);
  padding: 48px 40px;
  overflow: hidden;
}
.ab-stats__track {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.ab-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.ab-stat__n {
  font-family: var(--ab-display);
  font-size: clamp(3rem, 5vw, 4.2rem);
  font-weight: 700;
  color: var(--ab-gold);
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}
.ab-stat__l {
  font-family: var(--ab-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ab-xdim);
}
.ab-stat__sep {
  width: 1px;
  height: 36px;
  background: var(--ab-border);
  flex-shrink: 0;
}

/* ══════════════════════════
   VALUES
══════════════════════════ */
.ab-values {
  padding: 120px 40px;
  max-width: 1200px;
  margin: 0 auto;
  border-bottom: 1px solid var(--ab-border);
  opacity: 0;
  transform: translateY(40px);
  transition: opacity var(--ab-tr-slow), transform var(--ab-tr-slow);
}
.ab-values.in { opacity: 1; transform: translateY(0); }
.ab-values__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 72px;
}
.ab-values__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--ab-border);
}
.ab-vcard {
  background: var(--ab-bg);
  padding: 48px 40px;
  display: flex;
  gap: 28px;
  align-items: flex-start;
  transition: background var(--ab-tr);
}
.ab-vcard:hover { background: var(--ab-bg2); }
.ab-vcard__num {
  font-family: var(--ab-display);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--ab-gold);
  opacity: 0.4;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 4px;
}
.ab-vcard__body { flex: 1; }
.ab-vcard__title {
  font-family: var(--ab-display);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--ab-white);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}
.ab-vcard__text {
  font-size: 0.82rem;
  color: var(--ab-dim);
  line-height: 1.8;
  font-weight: 300;
}

/* ══════════════════════════
   PULL QUOTE
══════════════════════════ */
.ab-quote {
  padding: 120px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ab-surface);
  border-bottom: 1px solid var(--ab-border);
  overflow: hidden;
  position: relative;
}
.ab-quote__inner {
  position: relative;
  max-width: 640px;
  text-align: center;
}
.ab-quote__mark {
  font-family: var(--ab-display);
  font-size: 10rem;
  font-weight: 800;
  color: var(--ab-gold);
  opacity: 0.1;
  line-height: 0.5;
  position: absolute;
  top: 0;
  left: -40px;
}
.ab-quote__text {
  font-family: var(--ab-display);
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--ab-white);
  line-height: 1.25;
  margin: 0 0 32px;
  position: relative;
  z-index: 1;
}
.ab-quote__attr {
  font-family: var(--ab-mono);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ab-gold);
}
.ab-quote__line {
  width: 40px;
  height: 1px;
  background: var(--ab-gold);
  margin: 20px auto 0;
  opacity: 0.4;
}

/* ══════════════════════════
   TEAM / STORY
══════════════════════════ */
.ab-team {
  padding: 120px 40px;
  max-width: 1200px;
  margin: 0 auto;
  border-bottom: 1px solid var(--ab-border);
  opacity: 0;
  transform: translateY(40px);
  transition: opacity var(--ab-tr-slow), transform var(--ab-tr-slow);
}
.ab-team.in { opacity: 1; transform: translateY(0); }
.ab-team__inner {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 80px;
}
.ab-team__left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ab-team__heading {
  font-family: var(--ab-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--ab-white);
  line-height: 1.1;
  margin-top: 24px;
}
.ab-team__heading em {
  color: var(--ab-gold);
  font-style: normal;
}
.ab-team__right {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.ab-team__paragraph {
  padding: 32px 0;
  border-bottom: 1px solid var(--ab-border);
}
.ab-team__paragraph:first-child { padding-top: 0; }
.ab-team__paragraph p {
  font-size: 0.9rem;
  color: rgba(240,236,230,0.65);
  line-height: 1.9;
  font-weight: 300;
}
.ab-team__sig {
  padding-top: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.ab-team__sig-line {
  font-family: var(--ab-sans);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ab-gold);
}
.ab-team__sig-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--ab-gold);
  opacity: 0.5;
}

/* ══════════════════════════
   TECH STRIP
══════════════════════════ */
.ab-tech {
  background: var(--ab-surface);
  padding: 80px 40px;
  border-bottom: 1px solid var(--ab-border);
}
.ab-tech__inner {
  max-width: 1000px;
  margin: 0 auto;
}
.ab-tech__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--ab-border);
}
.ab-tech__item {
  background: var(--ab-surface);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background var(--ab-tr);
}
.ab-tech__item:hover { background: var(--ab-bg2); }
.ab-tech__label {
  font-family: var(--ab-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ab-xdim);
}
.ab-tech__value {
  font-family: var(--ab-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ab-white);
}

/* ══════════════════════════
   CLOSING CTA
══════════════════════════ */
.ab-closing {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 120px 40px;
}
.ab-closing__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--ab-border);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ab-spin-slow 40s linear infinite;
}
.ab-closing__ring:nth-child(1) {
  width: min(600px, 90vw);
  height: min(600px, 90vw);
}
.ab-closing__ring--2 {
  width: min(400px, 70vw);
  height: min(400px, 70vw);
  animation-direction: reverse;
  animation-duration: 28s;
  border-color: var(--ab-gold-dim);
}
.ab-closing__content {
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.ab-closing__heading {
  font-family: var(--ab-display);
  font-size: clamp(3rem, 6vw, 4.8rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--ab-white);
  line-height: 1.1;
  margin: 0;
}
.ab-closing__heading em {
  color: var(--ab-gold);
  font-style: normal;
}
.ab-closing__sub {
  font-size: 0.85rem;
  color: var(--ab-dim);
  font-weight: 300;
  letter-spacing: 0.04em;
  margin: 0;
}
.ab-closing__btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 36px;
  border-radius: 2px;
  background: var(--ab-gold);
  color: #0a0804;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: none;
  transition: background var(--ab-tr), transform var(--ab-tr), box-shadow var(--ab-tr);
  margin-top: 12px;
}
.ab-closing__btn:hover {
  background: #d9bc85;
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(200,169,110,0.2);
}
.ab-closing__back {
  font-size: 0.7rem;
  color: var(--ab-dim);
  text-decoration: none;
  letter-spacing: 0.08em;
  cursor: none;
  transition: color var(--ab-tr);
}
.ab-closing__back:hover { color: var(--ab-gold); }

/* ══════════════════════════
   FOOTER
══════════════════════════ */
.ab-footer {
  border-top: 1px solid var(--ab-border);
  padding: 28px 40px;
}
.ab-footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ab-footer__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--ab-display);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ab-white);
}
.ab-footer__copy {
  font-size: 0.65rem;
  color: var(--ab-xdim);
  letter-spacing: 0.06em;
}
.ab-footer__links {
  display: flex;
  gap: 24px;
}
.ab-footer__links a {
  font-size: 0.68rem;
  color: var(--ab-dim);
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: color var(--ab-tr);
  cursor: none;
}
.ab-footer__links a:hover { color: var(--ab-gold); }

/* ══════════════════════════
   RESPONSIVE
══════════════════════════ */
@media (max-width: 900px) {
  .ab-manifesto__inner { grid-template-columns: 1fr; gap: 32px; }
  .ab-manifesto__left { position: static; flex-direction: row; align-items: center; gap: 16px; }
  .ab-values__grid { grid-template-columns: 1fr; }
  .ab-team__inner { grid-template-columns: 1fr; gap: 40px; }
  .ab-tech__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .ab-nav__inner { padding: 0 20px; }
  .ab-nav__center { display: none; }
  .ab-hero__stamp { left: 20px; }
  .ab-hero__stamp-year { font-size: 0.85rem; }
  .ab-manifesto, .ab-values, .ab-team, .ab-tech, .ab-closing { padding: 72px 20px; }
  .ab-stats { padding: 40px 20px; }
  .ab-stats__track { flex-direction: column; gap: 24px; }
  .ab-stat__sep { width: 40px; height: 1px; }
  .ab-vcard { flex-direction: column; gap: 12px; padding: 32px 24px; }
  .ab-tech__grid { grid-template-columns: 1fr; }
  .ab-footer__links { display: none; }
  .ab-cursor { display: none; }
  .ab-root { cursor: auto; }
  .ab-nav__brand { cursor: auto; }
  .ab-closing__btn { cursor: auto; }
  .ab-closing__back { cursor: auto; }
  .ab-footer__links a { cursor: auto; }
}
`;
