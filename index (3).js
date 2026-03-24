// pages/index.js - Landing page with announcement
// The chat lives at /app

import { useRouter } from 'next/router';
import { useState } from 'react';

function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#0f4c81"/>
      <circle cx="20" cy="24" r="7" fill="white" opacity="0.95"/>
      <circle cx="13" cy="17" r="3.5" fill="white" opacity="0.95"/>
      <circle cx="20" cy="14" r="3.5" fill="white" opacity="0.95"/>
      <circle cx="27" cy="17" r="3.5" fill="white" opacity="0.95"/>
      <rect x="18.5" y="21" width="3" height="6" rx="1" fill="#0f4c81"/>
      <rect x="17" y="22.5" width="6" height="3" rx="1" fill="#0f4c81"/>
    </svg>
  );
}

export default function Landing() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"'Instrument Sans','Helvetica Neue',sans-serif", color:"#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        a { text-decoration:none; color:inherit; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .try-btn:hover { background:#0d3d6b !important; }
        .nav-link:hover { color:#0f4c81 !important; }
        .feature-card:hover { border-color:#0f4c81 !important; transform:translateY(-2px); box-shadow:0 8px 24px rgba(15,76,129,0.08) !important; }
        .org-pill:hover { background:#eff6ff !important; border-color:#bfdbfe !important; }
        @media (max-width:768px) {
          .hero-title { font-size:28px !important; }
          .hero-sub { font-size:15px !important; }
          .nav-links { display:none !important; }
          .mobile-menu-btn { display:flex !important; }
          .features-grid { grid-template-columns:1fr !important; }
          .announcement-grid { grid-template-columns:1fr !important; }
          .hero-section { padding:60px 20px 40px !important; }
          .section-pad { padding:60px 20px !important; }
          .orgs-grid { gap:6px !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom:"1px solid #f3f4f6", padding:"0 32px", height:"56px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"#fff", zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <Logo size={30} />
          <span style={{ fontSize:"17px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em" }}>VetMD</span>
        </div>
        <div className="nav-links" style={{ display:"flex", gap:"28px", alignItems:"center" }}>
          {["Features", "Sources", "Updates"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link" style={{ fontSize:"14px", color:"#6b7280", fontWeight:"500", transition:"color 0.15s" }}>{l}</a>
          ))}
        </div>
        <button onClick={() => router.push('/app')} className="try-btn"
          style={{ background:"#0f4c81", color:"#fff", border:"none", borderRadius:"8px", padding:"8px 20px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s" }}>
          Open VetMD →
        </button>
      </nav>

      {/* Hero */}
      <section className="hero-section" style={{ padding:"80px 32px 60px", textAlign:"center", maxWidth:"800px", margin:"0 auto", animation:"fadeUp 0.5s ease" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:"999px", padding:"4px 14px", marginBottom:"24px" }}>
          <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#2563eb" }} />
          <span style={{ fontSize:"12px", fontWeight:"600", color:"#1d4ed8" }}>New: Clinical Guidelines now in answers</span>
        </div>
        <h1 className="hero-title" style={{ fontSize:"40px", fontWeight:"700", color:"#111827", letterSpacing:"-0.03em", lineHeight:1.2, marginBottom:"16px" }}>
          The evidence-based knowledge engine for veterinary professionals
        </h1>
        <p className="hero-sub" style={{ fontSize:"17px", color:"#6b7280", lineHeight:1.7, marginBottom:"32px", maxWidth:"600px", margin:"0 auto 32px" }}>
          Instant access to peer-reviewed research, clinical guidelines, and drug references — all in one place. Ask a question, get a cited answer.
        </p>
        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => router.push('/app')} className="try-btn"
            style={{ background:"#0f4c81", color:"#fff", border:"none", borderRadius:"10px", padding:"13px 28px", fontSize:"15px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s" }}>
            Try VetMD free →
          </button>
          <a href="#updates" style={{ display:"inline-flex", alignItems:"center", padding:"13px 28px", fontSize:"15px", fontWeight:"600", color:"#374151", border:"1px solid #e5e7eb", borderRadius:"10px", transition:"all 0.15s" }}>
            See what's new
          </a>
        </div>
        <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"16px" }}>For licensed veterinarians and veterinary professionals</p>
      </section>

      {/* Announcement banner - Guidelines */}
      <section id="updates" className="section-pad" style={{ padding:"60px 32px", background:"#f8fafc", borderTop:"1px solid #e5e7eb", borderBottom:"1px solid #e5e7eb" }}>
        <div style={{ maxWidth:"860px", margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
            <span style={{ fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.08em", color:"#2563eb" }}>New Release</span>
            <span style={{ fontSize:"11px", color:"#9ca3af" }}>· March 2026</span>
          </div>
          <h2 style={{ fontSize:"26px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em", marginBottom:"16px", lineHeight:1.3 }}>
            Clinical Guidelines now in every answer
          </h2>

          <div className="announcement-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"32px", alignItems:"start" }}>
            <div>
              <p style={{ fontSize:"15px", color:"#374151", lineHeight:1.8, marginBottom:"16px" }}>
                Clinical guidelines define best practice across veterinary medicine — but finding them has never been easy. They're scattered across dozens of organisations, often 30+ pages long, and rarely reach the clinicians who need them most.
              </p>
              <p style={{ fontSize:"15px", color:"#374151", lineHeight:1.8, marginBottom:"16px" }}>
                VetMD now surfaces relevant guideline recommendations directly in your answers — summarised, cited, and linked back to the original source when you want to go deeper.
              </p>
              <p style={{ fontSize:"15px", color:"#374151", lineHeight:1.8 }}>
                Guidelines shouldn't sit unread behind dense PDFs. We believe every veterinarian deserves instant access to the best available clinical knowledge at the point of care.
              </p>
            </div>
            <div>
              <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:"12px", padding:"20px" }}>
                <div style={{ fontSize:"12px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.08em", color:"#9ca3af", marginBottom:"14px" }}>Try asking</div>
                {[
                  "What are ACVIM guidelines for mitral valve disease in dogs?",
                  "WSAVA vaccination recommendations for cats",
                  "AAHA seizure management protocol",
                  "ISFM feline pain assessment guidelines",
                ].map((q, i) => (
                  <div key={i} onClick={() => router.push('/app')} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:"#f9fafb", borderRadius:"8px", marginBottom:"8px", cursor:"pointer", border:"1px solid #f3f4f6", transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#bfdbfe"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="#f9fafb"; e.currentTarget.style.borderColor="#f3f4f6"; }}>
                    <span style={{ fontSize:"14px" }}>💬</span>
                    <span style={{ fontSize:"13px", color:"#374151" }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organisations */}
          <div style={{ marginTop:"32px" }}>
            <div style={{ fontSize:"12px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.08em", color:"#9ca3af", marginBottom:"12px" }}>Guideline sources include</div>
            <div className="orgs-grid" style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
              {["AAHA", "WSAVA", "ACVIM", "AAFP", "ISFM", "ISCAID", "ECEIM", "BEVA", "IVIS", "ESCCAP", "AVMA", "RCVS", "EVJ", "BVA", "ABVP"].map(org => (
                <span key={org} className="org-pill" style={{ fontSize:"12px", fontWeight:"600", color:"#374151", background:"#fff", border:"1px solid #e5e7eb", borderRadius:"999px", padding:"4px 12px", cursor:"default", transition:"all 0.15s" }}>{org}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-pad" style={{ padding:"70px 32px", maxWidth:"900px", margin:"0 auto" }}>
        <h2 style={{ fontSize:"26px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em", textAlign:"center", marginBottom:"8px" }}>Built for clinical practice</h2>
        <p style={{ fontSize:"15px", color:"#6b7280", textAlign:"center", marginBottom:"48px" }}>Everything you need to answer clinical questions quickly and confidently</p>

        <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px" }}>
          {[
            { icon:"📄", title:"Live PubMed Research", desc:"Every answer pulls from current peer-reviewed literature. Citations are always linked to the original paper." },
            { icon:"📗", title:"Clinical Guidelines", desc:"AAHA, WSAVA, ACVIM and 12+ other organisations — surfaced automatically when relevant." },
            { icon:"💊", title:"Drug Dosing", desc:"Species-specific dosing, routes, frequencies and contraindications — without flipping through a formulary." },
            { icon:"🔍", title:"Differential Diagnosis", desc:"Structured differentials with likelihood ratings, grounded in evidence — not just pattern matching." },
            { icon:"⚠️", title:"Red Flag Detection", desc:"Critical warning signs are highlighted prominently so nothing urgent gets missed." },
            { icon:"📚", title:"Multi-Source", desc:"PubMed, Europe PMC, OpenAlex, and Semantic Scholar searched simultaneously for comprehensive coverage." },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{ border:"1px solid #e5e7eb", borderRadius:"12px", padding:"22px", transition:"all 0.2s", cursor:"default" }}>
              <div style={{ fontSize:"24px", marginBottom:"12px" }}>{f.icon}</div>
              <div style={{ fontSize:"14px", fontWeight:"700", color:"#111827", marginBottom:"6px" }}>{f.title}</div>
              <div style={{ fontSize:"13px", color:"#6b7280", lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sources section */}
      <section id="sources" style={{ padding:"60px 32px", background:"#f8fafc", borderTop:"1px solid #e5e7eb" }}>
        <div style={{ maxWidth:"860px", margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:"22px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em", marginBottom:"8px" }}>Powered by trusted sources</h2>
          <p style={{ fontSize:"14px", color:"#6b7280", marginBottom:"32px" }}>Every answer is grounded in real research — never fabricated</p>
          <div style={{ display:"flex", justifyContent:"center", gap:"16px", flexWrap:"wrap" }}>
            {[
              { name:"PubMed", color:"#2563eb", desc:"35M+ papers" },
              { name:"Europe PMC", color:"#7c3aed", desc:"Open access" },
              { name:"OpenAlex", color:"#0891b2", desc:"250M works" },
              { name:"Semantic Scholar", color:"#059669", desc:"AI-enhanced" },
            ].map(s => (
              <div key={s.name} style={{ background:"#fff", border:`1px solid ${s.color}20`, borderRadius:"10px", padding:"16px 24px", textAlign:"center", minWidth:"140px" }}>
                <div style={{ fontSize:"14px", fontWeight:"700", color:s.color, marginBottom:"4px" }}>{s.name}</div>
                <div style={{ fontSize:"12px", color:"#9ca3af" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"70px 32px", textAlign:"center" }}>
        <div style={{ maxWidth:"540px", margin:"0 auto" }}>
          <Logo size={44} />
          <h2 style={{ fontSize:"26px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em", margin:"20px 0 12px" }}>
            Start using VetMD today
          </h2>
          <p style={{ fontSize:"15px", color:"#6b7280", marginBottom:"28px", lineHeight:1.7 }}>
            Free for veterinary professionals. No credit card required.
          </p>
          <button onClick={() => router.push('/app')} className="try-btn"
            style={{ background:"#0f4c81", color:"#fff", border:"none", borderRadius:"10px", padding:"13px 32px", fontSize:"15px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s" }}>
            Open VetMD →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:"1px solid #f3f4f6", padding:"24px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Logo size={20} />
          <span style={{ fontSize:"13px", fontWeight:"600", color:"#374151" }}>VetMD</span>
        </div>
        <p style={{ fontSize:"11px", color:"#9ca3af", maxWidth:"500px", textAlign:"center" }}>
          VetMD is a research tool designed for licensed veterinarians and veterinary professionals. It generates AI-assisted, evidence-based content and citations. It is not veterinary medical advice, diagnosis, or treatment, and does not replace independent professional judgment or primary-source verification.
        </p>
        <div style={{ fontSize:"12px", color:"#9ca3af" }}>© 2026 VetMD</div>
      </footer>
    </div>
  );
}
