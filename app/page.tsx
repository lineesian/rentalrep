"use client";

import Link from "next/link";
import { useState } from "react";

// ── Logo ─────────────────────────────────────────────────────────────────────
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
        <path d="M9 20L18 12L27 20V28H9V20Z" fill="white" fillOpacity="0.9"/>
        <rect x="15" y="22" width="6" height="6" rx="0.5" fill="white" fillOpacity="0.5"/>
        <polygon points="18,16 18.9,18.6 21.7,18.6 19.5,20.2 20.3,22.9 18,21.3 15.7,22.9 16.5,20.2 14.3,18.6 17.1,18.6" fill="#F4B53F"/>
      </svg>
      <div>
        <p className="font-heading font-bold text-lg leading-none">
          <span className="text-white">Rental</span><span style={{ color: "#2FD4C0" }}>Rep</span>
        </p>
        <p className="text-[9px] font-heading tracking-wider" style={{ color: "#2FD4C0" }}>
          Rate. Trust. Rent with Confidence.
        </p>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm font-heading font-medium transition-colors hover:text-white"
      style={{ color: "rgba(255,255,255,0.6)" }}
    >
      {children}
    </a>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-heading font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: "rgba(14,158,146,0.12)", color: "#2FD4C0", border: "1px solid rgba(14,158,146,0.25)" }}
    >
      {children}
    </span>
  );
}

export default function RootPage() {

  return (
    <div className="min-h-screen font-body" style={{ color: "#07312C" }}>

      {/* ── Nav ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
        style={{ backgroundColor: "rgba(7,49,44,0.92)", borderBottom: "1px solid rgba(47,212,192,0.1)" }}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <MarketingLogo />
          <nav className="hidden md:flex items-center gap-7">
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#why-verified">Verification</NavLink>
            <NavLink href="#for-agencies">For Agencies</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:block text-sm font-heading font-semibold transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-heading font-bold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0E9E92" }}
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden"
        style={{ background: "#07312C" }}
      >
        {/* Glow orbs */}
        <div className="absolute pointer-events-none" style={{ top: "-10%", right: "-5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(14,158,146,0.18) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "0%", left: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(244,181,63,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />

        <div className="relative max-w-4xl mx-auto px-5 py-20 md:py-28 text-center">
          {/* Eyebrow */}
          <div className="mb-6">
            <span
              className="inline-flex items-center gap-2 text-xs font-heading font-semibold tracking-widest uppercase px-4 py-2 rounded-full"
              style={{ backgroundColor: "rgba(47,212,192,0.12)", color: "#2FD4C0", border: "1px solid rgba(47,212,192,0.25)" }}
            >
              <span>🇿🇦</span>
              South Africa&apos;s first verified rental reputation platform
            </span>
          </div>

          <h1
            className="font-heading font-extrabold text-white leading-tight mb-6 mx-auto"
            style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)", maxWidth: 760 }}
          >
            Know who you&apos;re renting from and to{" "}
            <span style={{ color: "#0E9E92" }}>before</span> you sign.
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed mb-10 mx-auto"
            style={{ color: "rgba(255,255,255,0.65)", maxWidth: 560 }}
          >
            RentalRep lets tenants, landlords, and estate agencies rate each other after every tenancy. Every review is tied to a real lease, so the scores you see are real.
          </p>

          <div className="flex flex-wrap gap-3 mb-16">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 font-heading font-bold text-sm px-6 py-3.5 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0E9E92" }}
            >
              Create free account
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 font-heading font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors"
              style={{ border: "1.5px solid rgba(47,212,192,0.35)", color: "#2FD4C0" }}
            >
              See how it works
            </a>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { figure: "3.5M",       label: "South African rental households" },
              { figure: "0",          label: "Verified reputation platforms in SA, until now" },
              { figure: "100%",       label: "POPIA compliant by design" },
              { figure: "Lease-tied", label: "Every review verified against a real agreement" },
            ].map(({ figure, label }) => (
              <div key={figure} className="rounded-2xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(47,212,192,0.12)" }}>
                <p className="font-heading font-bold text-xl md:text-2xl mb-1.5" style={{ color: "#F4B53F" }}>{figure}</p>
                <p className="text-xs leading-snug" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div>
              <p className="text-xs font-heading font-semibold tracking-widest uppercase mb-3" style={{ color: "#0E9E92" }}>
                The Problem
              </p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl leading-tight mb-5" style={{ color: "#07312C" }}>
                SA&apos;s rental market runs on rumours and references.
              </h2>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: "#5E7470" }}>
                TPN and TransUnion can blacklist a tenant. But neither tells a tenant whether their prospective landlord disappears when the geyser bursts. And neither helps an agency know if the applicant they&apos;re about to approve has trashed three properties. RentalRep closes that gap, for all three sides of every rental relationship.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  quote: "I signed a lease without knowing that three previous tenants had left because the landlord refused to fix a mould problem. There was no way to find out.",
                  role: "Tenant, Sandton, Johannesburg",
                  accent: "#0E9E92",
                },
                {
                  quote: "A tenant I placed on a gut feel left my property with R40,000 in damage. His last landlord gave a glowing verbal reference. There was no record anywhere.",
                  role: "Landlord, Cape Town, Western Cape",
                  accent: "#E05252",
                },
                {
                  quote: "Clients ask me to vouch for landlords I have never worked with. I have no tool to show them verified performance data. I am just guessing like everyone else.",
                  role: "Letting Agent, Durban, KwaZulu-Natal",
                  accent: "#F4B53F",
                },
              ].map(({ quote, role, accent }) => (
                <div key={role} className="rounded-xl p-5" style={{ background: "#F5F8F7", borderLeft: `3px solid ${accent}` }}>
                  <p className="text-sm italic leading-relaxed mb-3" style={{ color: "#2D3B39" }}>
                    &ldquo;{quote}&rdquo;
                  </p>
                  <p className="text-[11px] font-heading font-semibold tracking-wide uppercase" style={{ color: accent }}>
                    {role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 md:py-28" style={{ background: "#F5F8F7" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-heading font-semibold tracking-widest uppercase mb-3" style={{ color: "#0E9E92" }}>How it works</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl leading-tight" style={{ color: "#07312C" }}>
              Mutual ratings. Verified by lease.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              {
                num: "01", title: "Tenants", subtitle: "Rate your landlord and property",
                tags: ["Maintenance", "Deposit handling", "Communication"],
                iconBg: "#0E9E92",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
              },
              {
                num: "02", title: "Landlords", subtitle: "Rate your tenant",
                tags: ["Rent reliability", "Property care", "Notice period"],
                iconBg: "#F4B53F",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="3"/><path d="M6 11c0-2.5 2.7-4 6-4s6 1.5 6 4"/><path d="M3 21l9-7 9 7"/><path d="M5 21v-5h14v5"/></svg>,
              },
              {
                num: "03", title: "Estate Agencies", subtitle: "Rate and be rated by clients",
                tags: ["Professionalism", "Transparency", "Speed"],
                iconBg: "#07312C",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="20" rx="1.5"/><line x1="3" y1="7" x2="21" y2="7"/><rect x="6" y="9" width="4" height="4" rx="0.5"/><rect x="14" y="9" width="4" height="4" rx="0.5"/><rect x="6" y="14" width="4" height="4" rx="0.5"/><rect x="14" y="14" width="4" height="4" rx="0.5"/></svg>,
              },
            ].map(({ num, title, subtitle, tags, iconBg, icon }) => (
              <div key={num} className="bg-white rounded-2xl p-6 transition-shadow hover:shadow-lg" style={{ border: "1px solid #E8EEEC" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
                    {icon}
                  </div>
                  <span className="font-heading font-bold text-2xl tracking-wide" style={{ color: "#E0EBEA" }}>{num}</span>
                </div>
                <h3 className="font-heading font-bold text-lg tracking-wide mb-1" style={{ color: "#07312C" }}>{title}</h3>
                <p className="text-sm mb-4" style={{ color: "#5E7470" }}>{subtitle}</p>
                <div className="flex flex-wrap gap-1.5">{tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
              </div>
            ))}
          </div>

          {/* Mutual rating banner */}
          <div className="rounded-2xl p-6 md:p-8" style={{ background: "#07312C" }}>
            <p className="text-center text-xs font-heading font-semibold tracking-widest uppercase mb-8" style={{ color: "#2FD4C0" }}>
              The mutual rating relationship
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
              {[
                { label: "Tenant",   score: "8.4", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
                { label: "Landlord", score: "7.1", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="3"/><path d="M6 11c0-2.5 2.7-4 6-4s6 1.5 6 4"/><path d="M3 21l9-7 9 7"/><path d="M5 21v-5h14v5"/></svg> },
                { label: "Agency",   score: "9.2", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="20" rx="1.5"/><line x1="3" y1="7" x2="21" y2="7"/><rect x="6" y="9" width="4" height="4" rx="0.5"/><rect x="14" y="9" width="4" height="4" rx="0.5"/></svg> },
              ].map(({ label, score, icon }, i) => (
                <div key={label} className="flex md:flex-row items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: "rgba(14,158,146,0.1)", border: "1.5px solid rgba(14,158,146,0.3)" }}>
                      {icon}
                    </div>
                    <span className="text-xs font-heading font-semibold text-white">{label}</span>
                    <span className="text-xs font-heading font-bold mt-0.5" style={{ color: "#F4B53F" }}>{score} / 10</span>
                  </div>
                  {i < 2 && (
                    <div className="flex md:flex-col gap-1.5 mx-5 md:mx-8 rotate-90 md:rotate-0">
                      <svg width="36" height="12" viewBox="0 0 36 12" fill="none" aria-hidden="true">
                        <path d="M0 6h36M30 2l6 4-6 4" stroke="#2FD4C0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <svg width="36" height="12" viewBox="0 0 36 12" fill="none" style={{ transform: "scaleX(-1)" }} aria-hidden="true">
                        <path d="M0 6h36M30 2l6 4-6 4" stroke="#2FD4C0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Verified ── */}
      <section id="why-verified" className="py-20 md:py-28" style={{ background: "#07312C" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div>
              <p className="text-xs font-heading font-semibold tracking-widest uppercase mb-3" style={{ color: "#2FD4C0" }}>
                Why verified
              </p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl leading-tight mb-4 text-white">
                No lease, no review. Simple.
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
                Every review on RentalRep is tied to a real lease agreement. No lease, no review. This means every score you see was written by someone who actually lived or worked through that tenancy.
              </p>
              <div className="space-y-5">
                {[
                  { n: "1", title: "Submit your lease",           body: "Upload your signed lease when submitting a review. No lease, no review." },
                  { n: "2", title: "Both parties confirm",        body: "Reviews are held privately until both sides submit, or 90 days pass." },
                  { n: "3", title: "Reviews unlock at lease end", body: "The review window opens 14 days before lease end and closes 90 days after." },
                  { n: "4", title: "Score builds your reputation", body: "Every published review contributes to your verified reputation score." },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold font-heading mt-0.5" style={{ backgroundColor: "rgba(14,158,146,0.2)", color: "#2FD4C0" }}>
                      {n}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-sm text-white mb-0.5">{title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FD4C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z"/></svg>,
                  title: "POPIA Compliant",
                  body: "All personal data is processed in accordance with South African privacy law.",
                },
                {
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FD4C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4"/><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v3z"/></svg>,
                  title: "Lease-Verified Reviews Only",
                  body: "No anonymous or unverified reviews. Every score has a lease behind it.",
                },
                {
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FD4C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
                  title: "Quality-Gated Advertising",
                  body: "Promoted listings require a minimum score of 7.5 out of 10.",
                },
                {
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2FD4C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
                  title: "Dispute Resolution",
                  body: "Factually inaccurate reviews can be disputed. Our team reviews within 14 working days.",
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="rounded-2xl p-5" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(47,212,192,0.15)" }}>
                  <div className="mb-3">{icon}</div>
                  <p className="font-heading font-semibold text-sm tracking-wide text-white mb-1.5">{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For Agencies ── */}
      <section id="for-agencies" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div>
              <p className="text-xs font-heading font-semibold tracking-widest uppercase mb-3" style={{ color: "#0E9E92" }}>For Agencies</p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl leading-tight mb-5" style={{ color: "#07312C" }}>
                Your agency&apos;s reputation, finally visible.
              </h2>
              <ul className="space-y-3.5 mb-8">
                {[
                  "A verified public performance profile your clients can trust",
                  "Screen tenants using RentalRep reputation scores before placement",
                  "Upload historical lease records to power the verification engine",
                  "Respond to client reviews directly on your public profile",
                  "Quality-gated promoted listings for agencies with a 7.5 or higher score",
                  "Detailed analytics dashboard showing score trends over time",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm" style={{ color: "#2D3B39" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="#0E9E92" strokeWidth="1.3"/>
                      <path d="M5 8l2.5 2.5 3.5-4" stroke="#0E9E92" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register?role=agency"
                className="inline-flex items-center gap-2 font-heading font-bold text-sm px-6 py-3.5 rounded-xl text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#07312C" }}
              >
                Request a demo
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
            <div className="space-y-4">
              {[
                {
                  name: "Starter",
                  price: "R999",
                  note: "Up to 3 agents, basic profile",
                  highlight: false,
                  features: ["Public agency profile", "Up to 3 agent sub-profiles", "Lease record uploads", "Review responses"],
                },
                {
                  name: "Professional",
                  price: "R1,799",
                  note: "Up to 10 agents, full analytics, priority listing",
                  highlight: true,
                  features: ["Everything in Starter", "Up to 10 agent sub-profiles", "Full analytics dashboard", "Priority promoted listing", "Priority support"],
                },
                {
                  name: "Enterprise",
                  price: "R2,499",
                  note: "Unlimited agents, API access, data licensing",
                  highlight: false,
                  features: ["Everything in Professional", "Unlimited agent profiles", "API access", "Data licensing", "Dedicated account manager"],
                },
              ].map(({ name, price, note, highlight, features }) => (
                <div
                  key={name}
                  className="rounded-2xl p-5"
                  style={highlight
                    ? { background: "#07312C", border: "1.5px solid rgba(47,212,192,0.3)" }
                    : { background: "#F5F8F7", border: "1px solid #E0EBEA" }
                  }
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className={`font-heading font-bold text-base tracking-wide ${highlight ? "text-white" : ""}`} style={highlight ? {} : { color: "#07312C" }}>{name}</p>
                    <p className="font-heading font-bold text-lg" style={{ color: highlight ? "#F4B53F" : "#0E9E92" }}>
                      {price}<span className="text-xs font-normal opacity-60">/mo</span>
                    </p>
                  </div>
                  <p className="text-[11px] mb-3" style={{ color: highlight ? "rgba(255,255,255,0.45)" : "#9BA8A5" }}>{note}</p>
                  <ul className="space-y-1.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs" style={{ color: highlight ? "rgba(255,255,255,0.75)" : "#5E7470" }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6l3 3 5-5" stroke={highlight ? "#2FD4C0" : "#0E9E92"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-xs text-center pt-1" style={{ color: "#9BA8A5" }}>
                For tenants and landlords: Free tier available. Pro plans from R49/month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Get started ── */}
      <GetStartedSection />

      {/* ── Footer ── */}
      <footer style={{ background: "#07312C" }}>
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <MarketingLogo />
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="font-body transition-colors hover:text-white" style={{ color: "rgba(168,240,224,0.6)" }}>Privacy Policy</Link>
            <Link href="/terms"   className="font-body transition-colors hover:text-white" style={{ color: "rgba(168,240,224,0.6)" }}>Terms of Service</Link>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(47,212,192,0.08)" }}>
          <p className="text-center text-xs py-4 font-body" style={{ color: "rgba(168,240,224,0.35)" }}>
            RentalRep 2026. Johannesburg, South Africa. rentalrep.co.za
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Get Started tabs (client component) ──────────────────────────────────────
const TABS = [
  {
    id: "tenant" as const,
    label: "I'm a tenant",
    heading: "Find out who you're renting from.",
    body: "Read verified reviews of landlords, properties, and estate agencies before you sign your next lease.",
    cta: "Create tenant account",
    ctaBg: "#0E9E92",
    href: "/auth/register?role=tenant",
  },
  {
    id: "landlord" as const,
    label: "I'm a landlord",
    heading: "Know your tenant before they move in.",
    body: "Check verified tenant reputation scores before placing an applicant. Rate your tenants after every lease.",
    cta: "Create landlord account",
    ctaBg: "#0E9E92",
    href: "/auth/register?role=landlord",
  },
  {
    id: "agency" as const,
    label: "I'm an agency",
    heading: "Build a verified public profile your clients trust.",
    body: "Get rated by landlords and tenants. Screen applicants. Promote your agency to quality-verified clients.",
    cta: "Create agency account",
    ctaBg: "#07312C",
    href: "/auth/register?role=agency",
  },
];

function GetStartedSection() {
  const [active, setActive] = useState<"tenant" | "landlord" | "agency">("tenant");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section className="py-20 md:py-28" style={{ background: "#F5F8F7" }}>
      <div className="max-w-xl mx-auto px-5 text-center">
        <p className="text-xs font-heading font-semibold tracking-widest uppercase mb-3" style={{ color: "#0E9E92" }}>
          Get started free
        </p>
        <h2 className="font-heading font-bold text-3xl md:text-4xl leading-tight mb-3" style={{ color: "#07312C" }}>
          Be part of building trust<br className="hidden sm:block" /> in SA&apos;s rental market.
        </h2>
        <p className="text-sm mb-10" style={{ color: "#5E7470" }}>
          No credit card required. Free accounts available for all roles.
        </p>

        {/* Tab buttons */}
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: "white", border: "1px solid #E0EBEA" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className="flex-1 py-3 text-xs font-heading font-semibold transition-colors"
              style={active === t.id
                ? { background: "#07312C", color: "white" }
                : { color: "#5E7470", background: "transparent" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CTA card */}
        <div className="bg-white rounded-2xl p-6 text-left shadow-sm" style={{ border: "1px solid #E0EBEA" }}>
          <h3 className="font-heading font-bold text-lg mb-2" style={{ color: "#07312C" }}>{tab.heading}</h3>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "#5E7470" }}>{tab.body}</p>
          <Link
            href={tab.href}
            className="block w-full py-3.5 rounded-xl font-heading font-bold text-sm text-center text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: tab.ctaBg }}
          >
            {tab.cta}
          </Link>
          <p className="text-xs text-center mt-3" style={{ color: "#9BA8A5" }}>
            By signing up you agree to our{" "}
            <Link href="/terms" style={{ color: "#0E9E92" }}>Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" style={{ color: "#0E9E92" }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
