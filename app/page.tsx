"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Logo (unchanged — confirmed correct) ────────────────────────────────────
function MarketingLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0E9E92"/>
            <stop offset="100%" stopColor="#07312C"/>
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="8" fill="url(#logoGrad)"/>
        <path d="M18,10 L28,17 L26,17 L26,28 L10,28 L10,17 L8,17 Z" fill="white"/>
        <rect x="15" y="21" width="6" height="7" rx="0.5" fill="white" fillOpacity="0.5"/>
        <polygon points="18,15 19.1,18.1 22.4,18.1 19.8,19.9 20.8,23.1 18,21.3 15.2,23.1 16.2,19.9 13.6,18.1 16.9,18.1" fill="#F4B53F"/>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span className="font-heading font-bold text-lg leading-none text-white">
          Rental<span style={{ color: "#2FD4C0" }}>Rep</span>
        </span>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, color: "#2FD4C0", letterSpacing: "0.08em", fontWeight: 500, whiteSpace: "nowrap" }}>
          Rate. Trust. Rent with Confidence.
        </span>
      </div>
    </div>
  );
}

// ─── Hero email form ──────────────────────────────────────────────────────────
function HeroForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) return (
    <div className="mb-5 text-center">
      <p className="font-heading font-semibold text-white text-base">You&apos;re on the list.</p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>We&apos;ll be in touch when RentalRep launches in Johannesburg.</p>
    </div>
  );

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
      style={{
        display: "flex", gap: 10,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 14, padding: 8,
        maxWidth: 520, width: "100%",
        margin: "0 auto 20px",
      }}
    >
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email to join the waitlist"
        style={{
          flex: 1, background: "none", border: "none", outline: "none",
          color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 15, padding: "8px 12px",
        }}
      />
      <button
        type="submit"
        style={{
          background: "#0E9E92", color: "white",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600, fontSize: 15,
          padding: "12px 24px", border: "none", borderRadius: 10,
          cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        Get early access
      </button>
    </form>
  );
}

// ─── Waitlist section tabs ────────────────────────────────────────────────────
const WAITLIST_TABS = [
  {
    id: "tenant" as const,
    label: "I'm a tenant",
    fields: [
      { label: "Full name", type: "text", placeholder: "Your name" },
      { label: "Email address", type: "email", placeholder: "you@email.com" },
      { label: "Your city", type: "text", placeholder: "e.g. Johannesburg" },
    ],
    submitLabel: "Join the waitlist as a tenant",
    privacy: "POPIA compliant. Your details are never shared or sold.",
    submitBg: "#0E9E92",
  },
  {
    id: "landlord" as const,
    label: "I'm a landlord",
    fields: [
      { label: "Full name", type: "text", placeholder: "Your name" },
      { label: "Email address", type: "email", placeholder: "you@email.com" },
      { label: "Number of properties", type: "text", placeholder: "e.g. 1, 5, 20+" },
    ],
    submitLabel: "Join the waitlist as a landlord",
    privacy: "POPIA compliant. Your details are never shared or sold.",
    submitBg: "#0E9E92",
  },
  {
    id: "agency" as const,
    label: "I'm an agency",
    fields: [
      { label: "Agency name", type: "text", placeholder: "Your agency's name" },
      { label: "Your name and role", type: "text", placeholder: "e.g. Sarah, Rental Manager" },
      { label: "Work email", type: "email", placeholder: "you@agency.co.za" },
    ],
    submitLabel: "Request a demo for your agency",
    privacy: "POPIA compliant. We'll contact you to arrange a walkthrough.",
    submitBg: "#07312C",
  },
];

function WaitlistSection() {
  const [active, setActive] = useState<"tenant"|"landlord"|"agency">("tenant");
  const [submitted, setSubmitted] = useState(false);
  const tab = WAITLIST_TABS.find(t => t.id === active)!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function switchTab(id: "tenant"|"landlord"|"agency") {
    setActive(id);
    setSubmitted(false);
  }

  return (
    <section id="waitlist" style={{ background: "#F5F8F7", padding: "96px 5%", textAlign: "center" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0E9E92", display: "block", marginBottom: 14 }}>
          Early access
        </span>
        <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, color: "#07312C", lineHeight: 1.12, letterSpacing: "-0.8px", maxWidth: 600, margin: "0 auto 16px" }}>
          Be part of building trust in SA&apos;s rental market.
        </h2>
        <p style={{ fontSize: 17, color: "#4a6b67", maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7 }}>
          Join the waitlist and get early access when RentalRep launches in Johannesburg. Tell us who you are so we can show you what&apos;s built for you.
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          {WAITLIST_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              style={{
                padding: "10px 22px", borderRadius: 30,
                fontSize: 14, fontWeight: 600,
                cursor: "pointer",
                border: `1.5px solid ${active === t.id ? "#07312C" : "#d4e6e4"}`,
                background: active === t.id ? "#07312C" : "white",
                color: active === t.id ? "white" : "#8aa5a2",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div style={{ maxWidth: 480, margin: "0 auto", background: "white", borderRadius: 20, padding: 36, boxShadow: "0 4px 32px rgba(7,49,44,0.08)", border: "1px solid #d4e6e4" }}>
          {submitted ? (
            <div style={{ padding: "20px 0" }}>
              <p className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: "#07312C", marginBottom: 8 }}>You&apos;re on the list.</p>
              <p style={{ fontSize: 14, color: "#4a6b67" }}>We&apos;ll be in touch when RentalRep launches in Johannesburg.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {tab.fields.map(f => (
                <div key={f.label} style={{ marginBottom: 16, textAlign: "left" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#07312C", marginBottom: 6, letterSpacing: "0.02em" }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type} placeholder={f.placeholder} required
                    style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #d4e6e4", borderRadius: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#07312C", outline: "none", background: "#F5F8F7" }}
                    onFocus={e => { e.target.style.borderColor = "#0E9E92"; e.target.style.background = "white"; }}
                    onBlur={e => { e.target.style.borderColor = "#d4e6e4"; e.target.style.background = "#F5F8F7"; }}
                  />
                </div>
              ))}
              <button
                type="submit"
                style={{ width: "100%", background: tab.submitBg, color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, padding: 14, border: "none", borderRadius: 10, cursor: "pointer", marginTop: 8 }}
              >
                {tab.submitLabel} →
              </button>
              <p style={{ fontSize: 12, color: "#8aa5a2", marginTop: 14, textAlign: "center" }}>{tab.privacy}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RootPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#07312C", lineHeight: 1.6, overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(7,49,44,0.96)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 5%", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <MarketingLogo />

        {/* Desktop links — hidden below md, shown from md up */}
        <div className="hidden md:flex" style={{ gap: 28, alignItems: "center" }}>
          <a href="#how" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>How it works</a>
          <a href="#verification" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Verification</a>
          <a href="#agencies" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>For Agencies</a>
          <a href="#waitlist" style={{ textDecoration: "none", background: "#0E9E92", color: "white", padding: "8px 18px", borderRadius: 8, fontWeight: 600, fontSize: 13 }}>Join early access</a>
        </div>

        {/* Hamburger — shown below md, hidden from md up */}
        <button
          className="flex md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
          style={{ background: "none", border: "none", padding: 8, cursor: "pointer" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 99, background: "#07312C", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 5% 26px", display: "flex", flexDirection: "column", gap: 18 }}
        >
          <a href="#how" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>How it works</a>
          <a href="#verification" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>Verification</a>
          <a href="#agencies" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>For Agencies</a>
          <a href="#waitlist" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", background: "#0E9E92", color: "white", padding: "10px 18px", borderRadius: 8, fontWeight: 600, fontSize: 14, textAlign: "center" }}>Join early access</a>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", background: "#07312C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 5% 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 80% 20%, rgba(14,158,146,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(244,181,63,0.10) 0%, transparent 50%)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(14,158,146,0.15)", border: "1px solid rgba(14,158,146,0.35)", color: "#0E9E92", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 20, marginBottom: 28 }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>🇿🇦</span> South Africa&apos;s first verified rental reputation platform
        </div>

        <h1 className="font-heading" style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, color: "white", lineHeight: 1.08, letterSpacing: "-1.5px", maxWidth: 820, marginBottom: 24 }}>
          Renting in South Africa runs on trust <em style={{ fontStyle: "normal", color: "#0E9E92" }}>no one can verify.</em> Until now.
        </h1>

        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.65)", maxWidth: 560, margin: "0 auto 44px", lineHeight: 1.65, fontWeight: 400 }}>
          Deposit disputes. Tenants who trash a place and vanish. Landlords who ghost when the geyser bursts. RentalRep fixes the one thing every lease is missing: proof of what actually happened.
        </p>

        <HeroForm />

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          <strong style={{ color: "rgba(255,255,255,0.7)" }}>Free to join.</strong> No card required. Launching in Johannesburg first.
        </p>

        {/* Trust cards */}
        <div style={{ display: "flex", gap: 14, marginTop: 60, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4B53F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 9l5-5 5 5"/><path d="M6 4v12"/><path d="M3 21h6M13 9l5-5 5 5"/><path d="M18 4v12"/><path d="M15 21h6"/></svg>,
              val: <><span style={{ color: "#07312C" }}>3.5</span><span style={{ color: "#F4B53F" }}>M</span></>,
              label: "South African rental households",
            },
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="#F4B53F" stroke="#F4B53F" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
              val: <span style={{ color: "#F4B53F" }}>0</span>,
              label: "Verified reputation platforms in SA, until now",
            },
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4B53F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
              val: <>100<span style={{ color: "#F4B53F" }}>%</span></>,
              label: "POPIA compliant by design",
            },
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4B53F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
              val: <>Lease<span style={{ color: "white" }}>-</span>tied</>,
              label: "Every review verified against a real agreement",
            },
          ].map(({ icon, val, label }, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "18px 22px", textAlign: "left", width: 200 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
              <div className="font-heading" style={{ fontSize: 28, fontWeight: 700, color: "white", lineHeight: 1, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" style={{ background: "white", padding: "96px 5%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", maxWidth: 1100, margin: "0 auto" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0E9E92", display: "block", marginBottom: 14 }}>The problem</span>
            <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, color: "#07312C", lineHeight: 1.12, letterSpacing: "-0.8px", marginBottom: 20 }}>
              SA&apos;s rental market runs on rumours and references.
            </h2>
            <p style={{ fontSize: 17, color: "#4a6b67", maxWidth: 560, lineHeight: 1.7 }}>
              TPN and TransUnion can blacklist a tenant. But neither tells a tenant whether their prospective landlord disappears when the geyser bursts. And neither helps an agency know if the applicant they&apos;re about to approve has trashed three properties.
            </p>
            <p style={{ fontSize: 17, color: "#4a6b67", maxWidth: 560, lineHeight: 1.7, marginTop: 16 }}>
              RentalRep closes that gap, for all three sides of every rental relationship.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { quote: "My lease had a clause letting the landlord charge up to three months' rent if I cancelled early, even with proper notice, if they couldn't relet the place fast enough. I only found out after I'd already lost my deposit.", role: "Tenant, KwaZulu-Natal", bad: true },
              { quote: "Our tenant left after three months owing two months' rent. Their reference checked out perfectly.", role: "Landlord, Cape Town", bad: true },
              { quote: "If I could see a tenant's actual payment and behaviour history from previous tenancies, I'd make better placements, and so would they.", role: "Letting Agent, Pretoria", bad: false },
            ].map(({ quote, role, bad }) => (
              <div key={role} style={{ background: "#F5F8F7", borderLeft: `3px solid ${bad ? "#e05252" : "#0E9E92"}`, borderRadius: "0 12px 12px 0", padding: "18px 20px" }}>
                <p style={{ fontSize: 15, color: "#07312C", fontStyle: "italic", lineHeight: 1.55, marginBottom: 8 }}>&ldquo;{quote}&rdquo;</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#8aa5a2", textTransform: "uppercase", letterSpacing: "0.06em" }}>{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background: "#F5F8F7", padding: "96px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0E9E92", display: "block", marginBottom: 14 }}>How it works</span>
          <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, color: "#07312C", lineHeight: 1.12, letterSpacing: "-0.8px", marginBottom: 20 }}>
            Mutual ratings. Verified by lease.
          </h2>
          <p style={{ fontSize: 17, color: "#4a6b67", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            Like Uber&apos;s two-way rating system, but built specifically for the South African rental market, with one critical addition: every review is confirmed against a real lease agreement.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, maxWidth: 1100, margin: "0 auto" }}>
          {[
            {
              num: "01 Tenants",
              iconBg: "#E6F9F8",
              icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
              heading: "Build proof, from day one",
              body: "Check your lease for risky clauses before you sign. Then log your deposit, your move-in condition, and every maintenance request the moment they happen, a timestamped paper trail that backs you up if things go wrong, even before anyone else has joined. Then rate your landlord and property once the lease ends.",
              tags: [
                { label: "Lease Check", gold: true },
                { label: "Deposit tracker", gold: false },
                { label: "Maintenance log", gold: false },
                { label: "Communication", gold: false },
              ],
            },
            {
              num: "02 Landlords",
              iconBg: "#FEF6E4",
              icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F4B53F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
              heading: "Rate your tenant",
              body: "Score tenants on rent reliability, property care, and conduct. A verified track record helps good tenants stand out from day one.",
              tags: [
                { label: "Rent reliability", gold: false },
                { label: "Property care", gold: false },
                { label: "Notice period", gold: true },
              ],
            },
            {
              num: "03 Estate agencies",
              iconBg: "rgba(7,49,44,0.08)",
              icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#07312C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="18" height="20" rx="1"/><path d="M9 22V12h6v10"/><rect x="7" y="5" width="2.5" height="2.5" rx="0.3"/><rect x="14.5" y="5" width="2.5" height="2.5" rx="0.3"/><rect x="7" y="9" width="2.5" height="2.5" rx="0.3"/><rect x="14.5" y="9" width="2.5" height="2.5" rx="0.3"/></svg>,
              heading: "Rate & be rated by clients",
              body: "Agencies earn verified scores from both tenants and landlords. Stand out on professionalism, transparency, and client satisfaction.",
              tags: [
                { label: "Professionalism", gold: false },
                { label: "Transparency", gold: false },
                { label: "Speed", gold: false },
              ],
            },
          ].map(({ num, iconBg, icon, heading, body, tags }) => (
            <div key={num} style={{ background: "white", borderRadius: 20, padding: "36px 28px", border: "1px solid #d4e6e4", transition: "box-shadow 0.2s, transform 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(7,49,44,0.10)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              <div className="font-heading" style={{ fontSize: 11, fontWeight: 700, color: "#0E9E92", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>{num}</div>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>{icon}</div>
              <h3 className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: "#07312C", marginBottom: 12, letterSpacing: 0.3 }}>{heading}</h3>
              <p style={{ fontSize: 15, color: "#4a6b67", lineHeight: 1.65 }}>{body}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20 }}>
                {tags.map(t => (
                  <span key={t.label} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: t.gold ? "#FEF6E4" : "#E6F9F8", color: t.gold ? "#b8860b" : "#0E9E92", letterSpacing: "0.04em" }}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mutual ratings diagram */}
        <div style={{ maxWidth: 1100, margin: "56px auto 0", background: "#07312C", borderRadius: 24, padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          {/* Tenant */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1, minWidth: 120 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(14,158,146,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
            <div className="font-heading" style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Tenant</div>
            <div className="font-heading" style={{ background: "#F4B53F", color: "#07312C", fontSize: 15, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>8.4 / 10</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 0.8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>rates</span>
            <span style={{ color: "#0E9E92", fontSize: 18, fontWeight: 700 }}>&#x27F5; &#x27F6;</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>rates</span>
          </div>
          {/* Landlord */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1, minWidth: 120 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(14,158,146,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg></div>
            <div className="font-heading" style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Landlord</div>
            <div className="font-heading" style={{ background: "#F4B53F", color: "#07312C", fontSize: 15, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>9.1 / 10</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 0.8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>rates</span>
            <span style={{ color: "#0E9E92", fontSize: 18, fontWeight: 700 }}>&#x27F5; &#x27F6;</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>rates</span>
          </div>
          {/* Agency */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1, minWidth: 120 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(14,158,146,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="18" height="20" rx="1"/><path d="M9 22V13h6v9"/><rect x="7" y="5" width="2" height="2" rx="0.3"/><rect x="15" y="5" width="2" height="2" rx="0.3"/><rect x="7" y="9" width="2" height="2" rx="0.3"/><rect x="15" y="9" width="2" height="2" rx="0.3"/></svg></div>
            <div className="font-heading" style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Agency</div>
            <div className="font-heading" style={{ background: "#F4B53F", color: "#07312C", fontSize: 15, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>7.8 / 10</div>
          </div>
        </div>
      </section>

      {/* ── VERIFICATION ── */}
      <section id="verification" style={{ background: "#07312C", color: "white", padding: "96px 5%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", maxWidth: 1100, margin: "0 auto" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0E9E92", display: "block", marginBottom: 14 }}>Why it&apos;s different</span>
            <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, color: "white", lineHeight: 1.12, letterSpacing: "-0.8px", marginBottom: 20 }}>
              No lease, no review. Simple.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", maxWidth: 560, lineHeight: 1.7 }}>
              Fake reviews undermine every rating platform. RentalRep solves this at the source, you can only review someone you&apos;ve actually rented with, verified against a real lease agreement.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 40 }}>
              {[
                { n: "1", title: "Submit your lease",            body: "Either party uploads or links their signed lease agreement. Personal details are protected under POPIA." },
                { n: "2", title: "Both parties confirm",         body: "The other party verifies the tenancy relationship. Both must agree before either can review." },
                { n: "3", title: "Reviews unlock at lease end",  body: "Once a tenancy ends, the review window opens for both parties simultaneously, preventing early pressure or retaliation." },
                { n: "4", title: "Score builds your reputation", body: "Verified scores are cumulative. Your RentalRep score reflects your full rental history, not just one tenancy." },
              ].map(({ n, title, body }) => (
                <div key={n} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <div className="font-heading" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(14,158,146,0.2)", border: "1px solid rgba(14,158,146,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#0E9E92", flexShrink: 0, marginTop: 2 }}>{n}</div>
                  <div>
                    <h4 className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: "white", marginBottom: 4 }}>{title}</h4>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: "POPIA Compliant",
                desc: "All personal data is handled in line with South Africa's Protection of Personal Information Act. You control your data.",
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
                title: "Lease-Verified Reviews Only",
                desc: "No anonymous reviews. No fake scores. Every rating is tied to a real, verified rental agreement.",
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#F4B53F" stroke="#F4B53F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                title: "Quality-Gated Advertising",
                desc: "Only landlords and agencies with a 7.5+ RentalRep score can promote listings on the platform.",
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                title: "Dispute Resolution",
                desc: "A fair, structured process for flagging inaccurate or unfair reviews, with human moderation oversight.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "24px 28px", display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
                <div>
                  <div className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: "white", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENCIES ── */}
      <section id="agencies" style={{ background: "white", padding: "96px 5%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", maxWidth: 1100, margin: "0 auto" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0E9E92", display: "block", marginBottom: 14 }}>For estate agencies</span>
            <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, color: "#07312C", lineHeight: 1.12, letterSpacing: "-0.8px", marginBottom: 20 }}>
              Your agency&apos;s reputation, finally visible.
            </h2>
            <p style={{ fontSize: 17, color: "#4a6b67", maxWidth: 560, lineHeight: 1.7 }}>
              RentalRep gives your agency a verified public scorecard, built from real client reviews. Stand out from competitors who rely only on word-of-mouth and Google reviews that anyone can write.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, margin: "32px 0" }}>
              {[
                "Verified agency profile with cumulative trust score",
                "Individual agent profiles and ratings",
                "Tenant and landlord review dashboard",
                "Early access to tenant reputation scores before placement",
                "Priority listing placement for high-rated agencies",
                "Monthly performance reports and analytics",
                "Fewer disputes to mediate, with timestamped deposit and maintenance records for every tenancy",
              ].map(b => (
                <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 15, color: "#4a6b67", lineHeight: 1.55 }}>
                  <span style={{ color: "#0E9E92", fontWeight: 700, fontSize: 15, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <a href="#waitlist" style={{ background: "#07312C", color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 15, padding: "14px 28px", border: "none", borderRadius: 10, cursor: "pointer", display: "inline-block", textDecoration: "none" }}>
              Request a demo
            </a>
          </div>
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { name: "Starter",      desc: "Up to 3 agents · Basic profile",                          price: "R999",   period: "/ month", featured: false },
                { name: "Professional", desc: "Up to 10 agents · Full analytics · Priority listing",      price: "R1,799", period: "/ month", featured: true  },
                { name: "Enterprise",   desc: "Unlimited agents · API access · Data licensing",           price: "R2,499", period: "/ month", featured: false },
              ].map(({ name, desc, price, period, featured }) => (
                <div key={name} style={{ borderRadius: 16, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1.5px solid ${featured ? "#07312C" : "#d4e6e4"}`, background: featured ? "#07312C" : "white", cursor: "default" }}>
                  <div>
                    <div className="font-heading" style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: featured ? "white" : "#07312C" }}>{name}</div>
                    <div style={{ fontSize: 13, color: featured ? "rgba(255,255,255,0.5)" : "#8aa5a2" }}>{desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="font-heading" style={{ fontSize: 22, fontWeight: 700, color: featured ? "#F4B53F" : "#0E9E92", whiteSpace: "nowrap" }}>{price}</div>
                    <div style={{ fontSize: 12, color: featured ? "rgba(255,255,255,0.4)" : "#8aa5a2" }}>{period}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "16px 4px" }}>
                <p style={{ fontSize: 13, color: "#8aa5a2", lineHeight: 1.6 }}>
                  <strong style={{ color: "#07312C" }}>For tenants and landlords:</strong> Free tier available. Pro plans from R49/month. Only users with a 7.5+ score can promote listings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <WaitlistSection />

      {/* ── FOOTER ── */}
      <footer style={{ background: "#07312C", padding: "48px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: "white" }}>
              Rental<span style={{ color: "#2FD4C0" }}>Rep</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Rate. Trust. Rent with Confidence.</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "Privacy Policy",  href: "/privacy" },
              { label: "Terms of Use",    href: "/terms"   },
              { label: "POPIA Notice",    href: "/privacy" },
              { label: "For Agencies",    href: "#agencies" },
              { label: "Early access",    href: "#waitlist" },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{label}</a>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", width: "100%", textAlign: "center", marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", maxWidth: 1100, marginLeft: "auto", marginRight: "auto" }}>
          &copy; 2026 RentalRep. Johannesburg, South Africa. rentalrep.co.za &middot; All rights reserved.
        </p>
      </footer>

    </div>
  );
}
