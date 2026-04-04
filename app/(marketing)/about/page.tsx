"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Quantr — About Page  (light + dark mode)
   ═══════════════════════════════════════════════════════ */

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

function NoiseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    let frame: number;
    const draw = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 10;
        imageData.data[i] = v; imageData.data[i + 1] = v;
        imageData.data[i + 2] = v; imageData.data[i + 3] = 12;
      }
      ctx.putImageData(imageData, 0, 0);
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.5 }} />;
}

function OrbitLines() {
  return (
    <svg viewBox="0 0 800 800" style={{ position: "absolute", width: "min(900px, 110vw)", height: "min(900px, 110vw)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.05, pointerEvents: "none", zIndex: 0 }}>
      <ellipse cx="400" cy="400" rx="380" ry="200" fill="none" stroke="#2563eb" strokeWidth="0.8" style={{ transformOrigin: "400px 400px", animation: "ab-orbit 22s linear infinite" }} />
      <ellipse cx="400" cy="400" rx="300" ry="340" fill="none" stroke="#2563eb" strokeWidth="0.5" style={{ transformOrigin: "400px 400px", animation: "ab-orbit 34s linear infinite reverse" }} />
      <ellipse cx="400" cy="400" rx="250" ry="150" fill="none" stroke="currentColor" strokeWidth="0.4" style={{ transformOrigin: "400px 400px", animation: "ab-orbit 18s linear infinite" }} />
      <circle cx="400" cy="400" r="2" fill="#2563eb" />
    </svg>
  );
}

export default function AboutPage() {
  const [entered, setEntered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { ref: statsRef, visible: statsVisible } = useInView(0.3);
  const c1 = useCounter(5200, 2000, statsVisible);
  const c2 = useCounter(99, 1600, statsVisible);
  const c3 = useCounter(22, 1400, statsVisible);

  const { ref: manifestoRef, visible: manifestoVisible } = useInView(0.15);
  const { ref: valuesRef, visible: valuesVisible } = useInView(0.1);
  const { ref: teamRef, visible: teamVisible } = useInView(0.1);

  useEffect(() => { setMounted(true); const t = setTimeout(() => setEntered(true), 100); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = !mounted || theme === "dark";

  return (
    <div className="ab-root bg-white dark:bg-[#0a0a0c] text-gray-900 dark:text-[#f8fafc] transition-colors duration-300">
      <style>{css}</style>
      <NoiseCanvas />

      {/* ─── NAV ─── */}
      <nav className={`ab-nav ${scrollY > 20 ? "ab-nav--solid" : ""}`}>
        <div className="ab-nav__inner">
          {/* Logo — matches dashboard */}
          <Link href="/" className="ab-nav__brand">
            <span className="font-bold tracking-[0.12em] text-xl">
              <span className="text-gray-900 dark:text-white">Q</span>
              <span style={{ color: "#2563eb" }}>U</span>
              <span className="text-gray-900 dark:text-white">ANTR</span>
            </span>
          </Link>

          <div className="ab-nav__center">
            <span className="ab-nav__label text-gray-500 dark:text-[#94a3b8]">About</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 transition-all"
                aria-label="Toggle theme"
              >
                {isDark
                  ? <Sun className="w-4 h-4" />
                  : <Moon className="w-4 h-4" />
                }
              </button>
            )}
            <Link href="/dashboard" className="ab-nav__cta" style={{ color: "#2563eb" }}>
              Launch App <span>→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="ab-hero border-b border-gray-100 dark:border-[rgba(59,130,246,0.08)]">
        <OrbitLines />

        <div className={`ab-hero__stamp ${entered ? "in" : ""}`}>
          <span className="text-gray-400 dark:text-[#475569]">Est.</span>
          <span className="ab-hero__stamp-year" style={{ color: "#2563eb" }}>2024</span>
        </div>

        <div className={`ab-hero__copy ${entered ? "in" : ""}`}>
          <div className="ab-hero__eyebrow text-gray-500 dark:text-[#94a3b8]">
            <span className="ab-dot" style={{ background: "#2563eb", boxShadow: "0 0 10px #2563eb" }} />
            The Company
          </div>
          <h1 className="ab-hero__h1">
            <span className="ab-hero__word ab-hero__word--thin text-gray-900/25 dark:text-white/25">We built</span>
            <span className="ab-hero__word ab-hero__word--serif text-gray-900 dark:text-[#f8fafc]">the tool</span>
            <span className="ab-hero__word ab-hero__word--thin text-gray-900/25 dark:text-white/25">we always</span>
            <span className="ab-hero__word ab-hero__word--serif" style={{ color: "#2563eb" }}>wanted.</span>
          </h1>
          <p className="ab-hero__sub text-gray-500 dark:text-[#94a3b8]">
            Institutional-grade market intelligence.<br />
            Made accessible. Made beautiful.
          </p>
        </div>

        <div className={`ab-hero__scroll ${entered ? "in" : ""}`}>
          <div className="ab-hero__scroll-line" />
          <span className="text-gray-400 dark:text-[#475569]">Scroll</span>
        </div>

        <div className={`ab-corner ab-corner--br ${entered ? "in" : ""}`}>
          <span className="ab-corner__label text-gray-400 dark:text-[#475569]">BSE · NSE · MCX</span>
          <span className="ab-corner__sub text-gray-400 dark:text-[#475569]">Indian Equities</span>
        </div>
      </section>

      {/* ─── MANIFESTO ─── */}
      <section className={`ab-manifesto ${manifestoVisible ? "in" : ""} border-b border-gray-100 dark:border-[rgba(59,130,246,0.08)]`} ref={manifestoRef as React.RefObject<HTMLElement>}>
        <div className="ab-manifesto__inner">
          <div className="ab-manifesto__left">
            <span className="ab-section-num" style={{ color: "#2563eb" }}>01</span>
            <span className="ab-section-label text-gray-500 dark:text-[#94a3b8]">Manifesto</span>
          </div>
          <div className="ab-manifesto__right">
            <p className="ab-manifesto__line ab-manifesto__line--lg text-gray-900 dark:text-[#f8fafc] border-[#2563eb]">
              The Indian market generates <em>terabytes</em> of data every second.
            </p>
            <p className="ab-manifesto__line text-gray-500 dark:text-[rgba(240,236,230,0.65)] border-gray-200 dark:border-[rgba(59,130,246,0.08)]">
              Yet most investors still make decisions on gut feel, broker tips, and half-read headlines.
              Not because they don't want better — but because better didn't exist.
            </p>
            <p className="ab-manifesto__line text-gray-500 dark:text-[rgba(240,236,230,0.65)] border-gray-200 dark:border-[rgba(59,130,246,0.08)]">
              Quantr is the answer to a question serious investors ask every day:
              <em className="text-gray-900 dark:text-[#f8fafc]"> "Why should institutional-grade tools only exist for institutions?"</em>
            </p>
            <p className="ab-manifesto__line text-gray-500 dark:text-[rgba(240,236,230,0.65)] border-gray-200 dark:border-[rgba(59,130,246,0.08)]" style={{ color: undefined }}>
              <span style={{ color: "#2563eb" }}>We disagree with that premise. Deeply.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="ab-stats bg-gray-50 dark:bg-[#1A1D24] border-t border-b border-gray-200 dark:border-[rgba(59,130,246,0.08)]" ref={statsRef as React.RefObject<HTMLElement>}>
        <div className="ab-stats__track">
          <div className="ab-stat">
            <span className="ab-stat__n" style={{ color: "#2563eb" }}>{c1.toLocaleString("en-IN")}+</span>
            <span className="ab-stat__l text-gray-500 dark:text-[#94a3b8]">Stocks tracked live</span>
          </div>
          <div className="ab-stat__sep bg-gray-200 dark:bg-[rgba(59,130,246,0.08)]" />
          <div className="ab-stat">
            <span className="ab-stat__n" style={{ color: "#2563eb" }}>{c2}%</span>
            <span className="ab-stat__l text-gray-500 dark:text-[#94a3b8]">Data accuracy</span>
          </div>
          <div className="ab-stat__sep bg-gray-200 dark:bg-[rgba(59,130,246,0.08)]" />
          <div className="ab-stat">
            <span className="ab-stat__n" style={{ color: "#2563eb" }}>{c3}</span>
            <span className="ab-stat__l text-gray-500 dark:text-[#94a3b8]">Sectors covered</span>
          </div>
          <div className="ab-stat__sep bg-gray-200 dark:bg-[rgba(59,130,246,0.08)]" />
          <div className="ab-stat">
            <span className="ab-stat__n" style={{ color: "#2563eb" }}>∞</span>
            <span className="ab-stat__l text-gray-500 dark:text-[#94a3b8]">Curiosity</span>
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className={`ab-values ${valuesVisible ? "in" : ""} border-b border-gray-100 dark:border-[rgba(59,130,246,0.08)]`} ref={valuesRef as React.RefObject<HTMLElement>}>
        <div className="ab-values__header">
          <span className="ab-section-num" style={{ color: "#2563eb" }}>02</span>
          <span className="ab-section-label text-gray-500 dark:text-[#94a3b8]">What We Stand For</span>
        </div>
        <div className="ab-values__grid border border-gray-100 dark:border-[rgba(59,130,246,0.08)]">
          {[
            { num: "I", title: "Radical Transparency", body: "Every number we show you has a source. Every metric has a definition. No black boxes, no vague algorithms, no 'trust us'. You see what we see." },
            { num: "II", title: "Speed as Respect", body: "Markets don't wait. Neither should your tools. We obsess over latency because every second of delay is a second we've stolen from your decision-making." },
            { num: "III", title: "Depth over Decoration", body: "Anyone can make a dashboard look busy. We make it meaningful. Fewer widgets, more insight. Less noise, more signal." },
            { num: "IV", title: "The Investor First", body: "We don't sell your data. We don't optimize for engagement. We optimize for one thing only: your ability to make better investment decisions." },
          ].map((v, i) => (
            <div key={i} className="ab-vcard bg-white dark:bg-[#0a0a0c] hover:bg-gray-50 dark:hover:bg-[#111216] border-gray-100 dark:border-[rgba(59,130,246,0.08)]" style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className="ab-vcard__num" style={{ color: "#2563eb", opacity: 0.4 }}>{v.num}</span>
              <div className="ab-vcard__body">
                <h3 className="ab-vcard__title text-gray-900 dark:text-[#f8fafc]">{v.title}</h3>
                <p className="ab-vcard__text text-gray-500 dark:text-[#94a3b8]">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PULL QUOTE ─── */}
      <section className="ab-quote bg-gray-50 dark:bg-[#1A1D24] border-b border-gray-100 dark:border-[rgba(59,130,246,0.08)]">
        <div className="ab-quote__inner">
          <div className="ab-quote__mark" style={{ color: "#2563eb", opacity: 0.1 }}>&ldquo;</div>
          <blockquote className="ab-quote__text text-gray-900 dark:text-[#f8fafc]">
            The market rewards those<br />
            who think clearly<br />
            when others cannot.
          </blockquote>
          <div className="ab-quote__attr" style={{ color: "#2563eb" }}>— The Quantr Philosophy</div>
          <div className="ab-quote__line" style={{ background: "#2563eb", opacity: 0.4 }} />
        </div>
      </section>

      {/* ─── TEAM / STORY ─── */}
      <section className={`ab-team ${teamVisible ? "in" : ""} border-b border-gray-100 dark:border-[rgba(59,130,246,0.08)]`} ref={teamRef as React.RefObject<HTMLElement>}>
        <div className="ab-team__inner">
          <div className="ab-team__left">
            <span className="ab-section-num" style={{ color: "#2563eb" }}>03</span>
            <span className="ab-section-label text-gray-500 dark:text-[#94a3b8]">The Story</span>
            <h2 className="ab-team__heading text-gray-900 dark:text-[#f8fafc]">
              Built by<br />
              <em style={{ color: "#2563eb", fontStyle: "italic" }}>investors,</em><br />
              for investors.
            </h2>
          </div>
          <div className="ab-team__right">
            {[
              "Quantr started with a single frustration: why did professional-grade stock analysis tools cost tens of thousands of rupees a year, run on archaic UIs designed in 2003, and still require a Bloomberg terminal subscription just to access real data?",
              "We set out to build something different — a platform that treats the retail investor with the same respect as a fund manager. That means real-time NSE/BSE data, 120+ screening metrics, AI-driven portfolio analysis, and a design that doesn't make you feel like you're filing your taxes.",
              "We're a small, obsessive team. We don't have VC-funded offices or ping-pong tables. What we have is a genuine belief that the democratisation of financial intelligence is one of the most important things we can build — and we're building it right here, for India.",
            ].map((text, i) => (
              <div key={i} className="ab-team__paragraph border-b border-gray-100 dark:border-[rgba(59,130,246,0.08)]">
                <p className="text-gray-500 dark:text-[rgba(240,236,230,0.65)]">{text}</p>
              </div>
            ))}
            <div className="ab-team__sig">
              <span className="ab-team__sig-line" style={{ color: "#2563eb" }}>— The Quantr Team</span>
              <div className="ab-team__sig-dot" style={{ background: "#2563eb", opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECH STRIP ─── */}
      <section className="ab-tech bg-gray-50 dark:bg-[#1A1D24] border-b border-gray-100 dark:border-[rgba(59,130,246,0.08)]">
        <div className="ab-tech__inner">
          <span className="ab-section-label text-gray-500 dark:text-[#94a3b8]" style={{ marginBottom: "2rem", display: "block" }}>Under the Hood</span>
          <div className="ab-tech__grid border border-gray-100 dark:border-[rgba(59,130,246,0.08)]">
            {[
              { label: "Data Layer", value: "NSE · BSE · MCX · Alpha Vantage" },
              { label: "Screening Engine", value: "120+ Real-time Metrics" },
              { label: "AI Layer", value: "GPT-4 · Custom RAG Pipeline" },
              { label: "Latency", value: "Sub-15s Data Refresh" },
              { label: "Coverage", value: "5,200+ Indian Equities" },
              { label: "Infrastructure", value: "Globally Distributed Edge" },
            ].map((t, i) => (
              <div key={i} className="ab-tech__item bg-gray-50 dark:bg-[#1A1D24] hover:bg-gray-100 dark:hover:bg-[#111216] border-r border-b border-gray-100 dark:border-[rgba(59,130,246,0.08)]">
                <span className="ab-tech__label text-gray-500 dark:text-[#94a3b8]">{t.label}</span>
                <span className="ab-tech__value text-gray-900 dark:text-[#f8fafc]">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CLOSING CTA ─── */}
      <section className="ab-closing bg-gray-50 dark:bg-[#0a0a0c]">
        <div className="ab-closing__inner">
          <div className="ab-closing__ring border-gray-200 dark:border-[rgba(59,130,246,0.08)]" />
          <div className="ab-closing__ring ab-closing__ring--2 border-[rgba(37,99,235,0.15)] dark:border-[rgba(59,130,246,0.12)]" />
          <div className="ab-closing__content">
            <h2 className="ab-closing__heading">
              <span className="text-gray-900 dark:text-[#f8fafc]">Start seeing the</span><br />
              <em className="text-gray-900/30 dark:text-white/30" style={{ fontStyle: "italic" }}>whole picture.</em>
            </h2>
            <p className="ab-closing__sub text-gray-500 dark:text-[#94a3b8]">
              Join investors who've moved beyond gut feel.
            </p>
            <Link href="/dashboard" className="ab-closing__btn" style={{ background: "#2563eb", color: "#ffffff" }}>
              Open Quantr
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/" className="ab-closing__back text-gray-500 dark:text-[#94a3b8] hover:text-gray-900 dark:hover:text-white">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="ab-footer border-t border-gray-200 dark:border-[rgba(59,130,246,0.08)]">
        <div className="ab-footer__inner">
          <div className="ab-footer__brand">
            <span className="font-bold tracking-[0.12em] text-lg">
              <span className="text-gray-900 dark:text-white">Q</span>
              <span style={{ color: "#2563eb" }}>U</span>
              <span className="text-gray-900 dark:text-white">ANTR</span>
            </span>
          </div>
          <span className="ab-footer__copy text-gray-400 dark:text-[#475569]">© 2026 Quantr Technologies</span>
          <div className="ab-footer__links">
            <Link href="/" className="text-gray-400 dark:text-[#94a3b8] hover:text-[#2563eb] dark:hover:text-[#2563eb]">Home</Link>
            <Link href="/screener" className="text-gray-400 dark:text-[#94a3b8] hover:text-[#2563eb] dark:hover:text-[#2563eb]">Screener</Link>
            <Link href="/dashboard" className="text-gray-400 dark:text-[#94a3b8] hover:text-[#2563eb] dark:hover:text-[#2563eb]">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.ab-root {
  --ab-blue: #2563eb;
  --ab-blue-dim: rgba(37,99,235,0.12);
  --ab-sans: 'Inter', system-ui, sans-serif;
  --ab-tr: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ab-tr-slow: 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  font-family: var(--ab-sans);
  min-height: 100vh;
  overflow-x: hidden;
  cursor: none;
}

@keyframes ab-orbit {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes ab-fade-up {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ab-scroll-pulse {
  0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
  50%       { opacity: 1;   transform: scaleY(1); }
}
@keyframes ab-spin-slow {
  from { transform: translate(-50%,-50%) rotate(0deg); }
  to   { transform: translate(-50%,-50%) rotate(360deg); }
}

.ab-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.ab-section-num {
  font-family: var(--ab-sans);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.ab-section-label {
  font-family: var(--ab-sans);
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* ── NAV ── */
.ab-nav {
  position: fixed;
  inset: 0 0 auto 0;
  height: 60px;
  z-index: 100;
  transition: background var(--ab-tr), border-color var(--ab-tr), backdrop-filter var(--ab-tr);
  border-bottom: 1px solid transparent;
}
.ab-nav--solid {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Light mode nav background when scrolled */
:root:not(.dark) .ab-nav--solid {
  background: rgba(255,255,255,0.92);
  border-color: rgba(0,0,0,0.06);
}
.dark .ab-nav--solid {
  background: rgba(8,8,8,0.9);
  border-color: rgba(37,99,235,0.1);
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
  cursor: none;
}
.ab-nav__center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.ab-nav__label {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.ab-nav__cta {
  font-size: 0.75rem;
  font-weight: 600;
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

/* ── HERO ── */
.ab-hero {
  position: relative;
  height: 100vh;
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

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
}
.ab-hero__stamp-year {
  font-size: 1rem;
  letter-spacing: 0.04em;
}

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
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 32px;
}

.ab-hero__h1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0 32px;
  gap: 0;
}
.ab-hero__word {
  display: block;
  line-height: 1.1;
}
.ab-hero__word--thin {
  font-size: clamp(2.8rem, 7vw, 5.5rem);
  font-weight: 300;
  font-style: italic;
}
.ab-hero__word--serif {
  font-size: clamp(3.2rem, 8vw, 6.5rem);
  font-weight: 400;
  letter-spacing: -0.02em;
}

.ab-hero__sub {
  font-size: 0.88rem;
  font-weight: 300;
  line-height: 1.8;
  letter-spacing: 0.04em;
}

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
}
.ab-hero__scroll-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, #2563eb, transparent);
  transform-origin: top;
  animation: ab-scroll-pulse 2s ease-in-out infinite;
}

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
}
.ab-corner__sub {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── MANIFESTO ── */
.ab-manifesto {
  padding: 120px 40px;
  max-width: 1200px;
  margin: 0 auto;
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
  font-size: 1.15rem;
  font-weight: 300;
  line-height: 1.85;
  border-left: 1px solid;
  padding-left: 28px;
}
.ab-manifesto__line em { font-style: italic; }
.ab-manifesto__line--lg {
  font-size: 1.55rem;
  font-weight: 300;
}

/* ── STATS ── */
.ab-stats {
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
  font-size: 2.8rem;
  font-weight: 400;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.ab-stat__l {
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.ab-stat__sep {
  width: 1px;
  height: 36px;
  flex-shrink: 0;
}

/* ── VALUES ── */
.ab-values {
  padding: 120px 40px;
  max-width: 1200px;
  margin: 0 auto;
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
}
.ab-vcard {
  padding: 48px 40px;
  display: flex;
  gap: 28px;
  align-items: flex-start;
  transition: background var(--ab-tr);
}
.ab-vcard__num {
  font-size: 1.4rem;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 4px;
}
.ab-vcard__body { flex: 1; }
.ab-vcard__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}
.ab-vcard__text {
  font-size: 0.82rem;
  line-height: 1.8;
  font-weight: 300;
}

/* ── PULL QUOTE ── */
.ab-quote {
  padding: 120px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.ab-quote__inner {
  position: relative;
  max-width: 640px;
  text-align: center;
}
.ab-quote__mark {
  font-size: 8rem;
  line-height: 0.5;
  position: absolute;
  top: 0;
  left: -20px;
}
.ab-quote__text {
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 300;
  font-style: italic;
  line-height: 1.5;
  margin: 0 0 24px;
  position: relative;
  z-index: 1;
}
.ab-quote__attr {
  font-size: 0.68rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.ab-quote__line {
  width: 40px;
  height: 1px;
  margin: 20px auto 0;
}

/* ── TEAM ── */
.ab-team {
  padding: 120px 40px;
  max-width: 1200px;
  margin: 0 auto;
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
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 300;
  line-height: 1.2;
  margin-top: 24px;
}
.ab-team__right {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.ab-team__paragraph {
  padding: 32px 0;
}
.ab-team__paragraph:first-child { padding-top: 0; }
.ab-team__paragraph p {
  font-size: 0.9rem;
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
  font-size: 0.9rem;
  font-style: italic;
}
.ab-team__sig-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

/* ── TECH ── */
.ab-tech {
  padding: 80px 40px;
}
.ab-tech__inner {
  max-width: 1000px;
  margin: 0 auto;
}
.ab-tech__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
}
.ab-tech__item {
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background var(--ab-tr);
}
.ab-tech__label {
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.ab-tech__value {
  font-size: 0.95rem;
  font-weight: 300;
}

/* ── CLOSING CTA ── */
.ab-closing {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 120px 40px;
}
.ab-closing__inner {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ab-closing__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ab-spin-slow 40s linear infinite;
  width: min(600px, 90vw);
  height: min(600px, 90vw);
}
.ab-closing__ring--2 {
  width: min(400px, 70vw);
  height: min(400px, 70vw);
  animation-direction: reverse;
  animation-duration: 28s;
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
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 300;
  line-height: 1.25;
  margin: 0;
}
.ab-closing__sub {
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 0.04em;
  margin: 0;
}
.ab-closing__btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 36px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: none;
  transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
  margin-top: 12px;
}
.ab-closing__btn:hover {
  opacity: 0.88;
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(37,99,235,0.3);
}
.ab-closing__back {
  font-size: 0.7rem;
  text-decoration: none;
  letter-spacing: 0.08em;
  cursor: none;
  transition: color 0.2s;
}

/* ── FOOTER ── */
.ab-footer {
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
}
.ab-footer__copy {
  font-size: 0.65rem;
  letter-spacing: 0.06em;
}
.ab-footer__links {
  display: flex;
  gap: 24px;
}
.ab-footer__links a {
  font-size: 0.68rem;
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: color 0.2s;
  cursor: none;
}

/* ── RESPONSIVE ── */
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
  .ab-manifesto, .ab-values, .ab-team, .ab-tech, .ab-closing { padding: 72px 20px; }
  .ab-stats { padding: 40px 20px; }
  .ab-stats__track { flex-direction: column; gap: 24px; }
  .ab-stat__sep { width: 40px; height: 1px; }
  .ab-vcard { flex-direction: column; gap: 12px; padding: 32px 24px; }
  .ab-tech__grid { grid-template-columns: 1fr; }
  .ab-footer__links { display: none; }
  .ab-root { cursor: auto; }
  .ab-nav__brand { cursor: auto; }
  .ab-closing__btn { cursor: auto; }
  .ab-closing__back { cursor: auto; }
  .ab-footer__links a { cursor: auto; }
}
`;
