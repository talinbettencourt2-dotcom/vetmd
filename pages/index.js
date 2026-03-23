import { useState, useRef } from "react";

const URGENCY = {
  emergency: { label: "Emergency — Go to Vet Now", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  "vet-soon": { label: "See a Vet Today", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  monitor:   { label: "Monitor Closely", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
  ok:        { label: "Likely OK", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};
const LIKELIHOOD_COLOR = { High: "#dc2626", Moderate: "#d97706", Low: "#16a34a" };
const SOURCE_COLOR = { "PubMed": "#2563eb", "Europe PMC": "#7c3aed", "OpenAlex": "#0891b2", "Semantic Scholar": "#059669" };

function Logo({ size = 32 }) {
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

function CitedText({ text, papers, onCite }) {
  return (
    <span>
      {text.split(/(\[\d+\])/g).map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const idx = parseInt(m[1]) - 1;
        const paper = papers[idx];
        return paper ? (
          <button key={i} onClick={() => onCite && onCite(idx)}
            style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"18px", height:"18px", borderRadius:"50%", background:"#dbeafe", color:"#1d4ed8", fontSize:"10px", fontWeight:"700", border:"none", cursor:"pointer", margin:"0 2px", verticalAlign:"middle" }}>
            {m[1]}
          </button>
        ) : null;
      })}
    </span>
  );
}

function SourceCard({ paper, index, highlighted }) {
  const color = SOURCE_COLOR[paper.source] || "#6b7280";
  return (
    <a href={paper.url} target="_blank" rel="noopener noreferrer"
      style={{ display:"block", textDecoration:"none", border: highlighted ? "2px solid #3b82f6" : "1px solid #e5e7eb", borderRadius:"10px", padding:"14px 16px", background: highlighted ? "#eff6ff" : "#fff", transition:"all 0.15s", marginBottom:"10px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
        <span style={{ minWidth:"22px", height:"22px", background:color+"15", color, borderRadius:"50%", fontSize:"11px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${color}30` }}>{index + 1}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#111827", lineHeight:1.4, marginBottom:"4px" }}>{paper.title}</div>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", alignItems:"center", marginBottom:"4px" }}>
            <span style={{ fontSize:"10px", fontWeight:"700", color, background:color+"15", padding:"1px 7px", borderRadius:"999px", border:`1px solid ${color}25` }}>{paper.source}</span>
            {paper.author && <span style={{ fontSize:"11px", color:"#6b7280" }}>{paper.author}</span>}
            {paper.year && <span style={{ fontSize:"11px", color:"#9ca3af" }}>{paper.year}</span>}
            {paper.journal && <span style={{ fontSize:"11px", color:"#9ca3af", fontStyle:"italic" }}>{paper.journal}</span>}
          </div>
          {paper.abstract && paper.abstract.length > 80 && (
            <div style={{ fontSize:"12px", color:"#6b7280", lineHeight:1.5 }}>{paper.abstract.slice(0, 160)}...</div>
          )}
        </div>
        <span style={{ fontSize:"11px", color:"#3b82f6", flexShrink:0, marginTop:"2px" }}>↗</span>
      </div>
    </a>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:"24px" }}>
      <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"10px" }}>{title}</div>
      {children}
    </div>
  );
}

function Badge({ text, color }) {
  return <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:"999px", fontSize:"11px", fontWeight:"600", background:color+"15", color, border:`1px solid ${color}25` }}>{text}</span>;
}

function OwnerView({ data, papers, onCite }) {
  return (
    <div>
      <p style={{ fontSize:"16px", lineHeight:1.8, color:"#1f2937", margin:"0 0 20px" }}>{data.owner_summary}</p>
      {data.species_note && <p style={{ fontSize:"14px", color:"#6b7280", fontStyle:"italic", margin:"0 0 20px", padding:"10px 14px", background:"#f9fafb", borderRadius:"8px", border:"1px solid #f3f4f6" }}>🐾 {data.species_note}</p>}

      {data.owner_next_steps?.length > 0 && (
        <Section title="What to do now">
          {data.owner_next_steps.map((s, i) => (
            <div key={i} style={{ display:"flex", gap:"12px", padding:"10px 0", borderBottom:"1px solid #f3f4f6" }}>
              <span style={{ width:"24px", height:"24px", background:"#0f4c81", color:"#fff", borderRadius:"50%", fontSize:"12px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
              <span style={{ fontSize:"14px", color:"#374151", lineHeight:1.6 }}>{s}</span>
            </div>
          ))}
        </Section>
      )}

      {data.red_flags?.length > 0 && (
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderLeft:"4px solid #dc2626", borderRadius:"8px", padding:"14px 16px", marginBottom:"20px" }}>
          <div style={{ fontSize:"12px", fontWeight:"700", letterSpacing:"0.06em", textTransform:"uppercase", color:"#dc2626", marginBottom:"8px" }}>🚨 Go to emergency vet immediately if:</div>
          {data.red_flags.map((f, i) => <div key={i} style={{ fontSize:"13px", color:"#991b1b", padding:"2px 0" }}>• {f}</div>)}
        </div>
      )}

      {data.prognosis && (
        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"8px", padding:"12px 16px", marginBottom:"20px" }}>
          <span style={{ fontSize:"12px", fontWeight:"700", color:"#16a34a", textTransform:"uppercase", letterSpacing:"0.06em" }}>Prognosis </span>
          <span style={{ fontSize:"13px", color:"#166534" }}>{data.prognosis}</span>
        </div>
      )}

      <div style={{ fontSize:"11px", color:"#9ca3af", textAlign:"center", paddingTop:"16px", borderTop:"1px solid #f3f4f6" }}>🔒 {data.disclaimer}</div>
    </div>
  );
}

function VetView({ data, papers, onCite }) {
  return (
    <div>
      <p style={{ fontSize:"15px", lineHeight:1.8, color:"#1f2937", margin:"0 0 20px" }}>
        <CitedText text={data.vet_summary} papers={papers} onCite={onCite} />
      </p>
      {data.prognosis && <p style={{ fontSize:"13px", color:"#374151", margin:"0 0 20px", padding:"10px 14px", background:"#f0fdf4", borderRadius:"8px", border:"1px solid #bbf7d0" }}>📈 <strong>Prognosis:</strong> {data.prognosis}</p>}
      {data.species_note && <p style={{ fontSize:"13px", color:"#6b7280", fontStyle:"italic", margin:"0 0 20px" }}>🐾 {data.species_note}</p>}

      {data.red_flags?.length > 0 && (
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderLeft:"4px solid #dc2626", borderRadius:"8px", padding:"14px 16px", marginBottom:"20px" }}>
          <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#dc2626", marginBottom:"8px" }}>Red Flags</div>
          {data.red_flags.map((f, i) => <div key={i} style={{ fontSize:"13px", color:"#991b1b", padding:"2px 0" }}>• {f}</div>)}
        </div>
      )}

      {data.differentials?.length > 0 && (
        <Section title="Differential Diagnoses">
          {data.differentials.map((d, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"10px", padding:"10px 0", borderBottom:"1px solid #f9fafb" }}>
              <Badge text={d.likelihood} color={LIKELIHOOD_COLOR[d.likelihood] || "#6b7280"} />
              <div>
                <div style={{ fontSize:"14px", fontWeight:"600", color:"#111827" }}>{d.name}</div>
                <div style={{ fontSize:"13px", color:"#6b7280", marginTop:"2px" }}><CitedText text={d.reason} papers={papers} onCite={onCite} /></div>
              </div>
            </div>
          ))}
        </Section>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px" }}>
        {data.diagnostics?.length > 0 && (
          <div>
            <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"10px" }}>Diagnostics</div>
            {data.diagnostics.map((d, i) => (
              <div key={i} style={{ fontSize:"13px", color:"#374151", padding:"5px 0", borderBottom:"1px solid #f9fafb", display:"flex", gap:"8px" }}>
                <span style={{ color:"#0f4c81" }}>›</span><CitedText text={d} papers={papers} onCite={onCite} />
              </div>
            ))}
          </div>
        )}
        <div>
          {data.treatment?.immediate?.length > 0 && (
            <div style={{ marginBottom:"16px" }}>
              <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"10px" }}>Immediate</div>
              {data.treatment.immediate.map((t, i) => (
                <div key={i} style={{ fontSize:"13px", color:"#374151", padding:"5px 0", borderBottom:"1px solid #f9fafb", display:"flex", gap:"8px" }}>
                  <span style={{ color:"#d97706" }}>›</span><CitedText text={t} papers={papers} onCite={onCite} />
                </div>
              ))}
            </div>
          )}
          {data.treatment?.ongoing?.length > 0 && (
            <div>
              <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"10px" }}>Ongoing Care</div>
              {data.treatment.ongoing.map((t, i) => (
                <div key={i} style={{ fontSize:"13px", color:"#374151", padding:"5px 0", borderBottom:"1px solid #f9fafb", display:"flex", gap:"8px" }}>
                  <span style={{ color:"#16a34a" }}>›</span><CitedText text={t} papers={papers} onCite={onCite} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.drug_dosing?.length > 0 && (
        <Section title="Drug Dosing">
          {data.drug_dosing.map((d, i) => (
            <div key={i} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"12px 14px", marginBottom:"8px" }}>
              <div style={{ fontSize:"14px", fontWeight:"700", color:"#111827", marginBottom:"8px" }}>{d.drug}</div>
              <div style={{ display:"grid", gridTemplateColumns:"80px 1fr", gap:"4px 12px", fontSize:"13px" }}>
                <span style={{ color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", fontSize:"11px" }}>Dose</span><span style={{ color:"#374151" }}>{d.dose}</span>
                <span style={{ color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", fontSize:"11px" }}>Route</span><span style={{ color:"#374151" }}>{d.route}</span>
                {d.frequency && <><span style={{ color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", fontSize:"11px" }}>Freq.</span><span style={{ color:"#374151" }}>{d.frequency}</span></>}
                {d.notes && <><span style={{ color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", fontSize:"11px" }}>Notes</span><span style={{ color:"#d97706" }}>{d.notes}</span></>}
              </div>
            </div>
          ))}
        </Section>
      )}

      <div style={{ fontSize:"11px", color:"#9ca3af", textAlign:"center", paddingTop:"16px", borderTop:"1px solid #f3f4f6" }}>🔒 {data.disclaimer}</div>
    </div>
  );
}

const SUGGESTIONS = [
  "Dog vomiting blood", "Cat not eating 2 days",
  "Rabbit not moving", "Horse colic signs",
  "Dog ate chocolate", "Cat breathing fast",
  "Amoxicillin dose 10kg dog", "Feline hyperthyroidism",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [mode, setMode] = useState("owner");
  const [highlighted, setHighlighted] = useState(null);
  const sourcesRef = useRef(null);
  const inputRef = useRef(null);

  async function search(q) {
    const trimmed = (q || query).trim();
    if (!trimmed) return;
    setLoading(true); setResult(null); setPapers([]); setError(null);
    setCurrentQuery(trimmed); setHighlighted(null);
    try {
      setStage("Searching research databases...");
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPapers(data.papers || []);
      setResult(data);
      setMode(trimmed.toLowerCase().match(/dose|dosing|mg|drug|antibiotic/) ? "vet" : "owner");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false); setStage("");
    }
  }

  function handleCite(idx) {
    setHighlighted(idx);
    sourcesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const urgencyConfig = result ? URGENCY[result.urgency] || URGENCY["monitor"] : null;

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Instrument Sans', 'Helvetica Neue', sans-serif", color:"#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #9ca3af; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .chip:hover { background:#eff6ff !important; border-color:#bfdbfe !important; color:#1d4ed8 !important; }
        .go:hover { background:#0d3d6b !important; }
        .tab:hover { background:#f9fafb !important; }
      `}</style>

      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 24px", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ maxWidth:"860px", margin:"0 auto", height:"56px", display:"flex", alignItems:"center", gap:"10px" }}>
          <Logo size={32} />
          <span style={{ fontSize:"17px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em" }}>VetMD</span>
          <span style={{ fontSize:"13px", color:"#9ca3af", marginLeft:"2px" }}>Evidence-Based Veterinary AI</span>
          <div style={{ marginLeft:"auto", display:"flex", gap:"6px" }}>
            {["PubMed", "Europe PMC", "OpenAlex", "Semantic Scholar"].map(s => (
              <span key={s} style={{ fontSize:"10px", color: SOURCE_COLOR[s] || "#6b7280", background:(SOURCE_COLOR[s]||"#6b7280")+"10", border:`1px solid ${(SOURCE_COLOR[s]||"#6b7280")}20`, padding:"2px 8px", borderRadius:"999px", fontWeight:"600" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:"860px", margin:"0 auto", padding:"40px 24px 80px" }}>

        {/* Hero */}
        {!result && !loading && (
          <div style={{ textAlign:"center", marginBottom:"36px", animation:"fadeUp 0.5s ease" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"16px" }}>
              <Logo size={56} />
            </div>
            <h1 style={{ fontSize:"32px", fontWeight:"700", color:"#111827", letterSpacing:"-0.03em", margin:"0 0 10px" }}>Is my pet OK?</h1>
            <p style={{ color:"#6b7280", fontSize:"15px", margin:0 }}>Instant veterinary triage grounded in peer-reviewed research</p>
          </div>
        )}

        {/* Search */}
        <div style={{ display:"flex", gap:"8px", background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:"12px", padding:"6px 6px 6px 16px", marginBottom:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <input ref={inputRef} value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Describe symptoms, ask about dosing, or enter a diagnosis..."
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:"14px", color:"#111827", fontFamily:"inherit", padding:"8px 0" }}
          />
          <button className="go" onClick={() => search()}
            style={{ background:"#0f4c81", color:"#fff", border:"none", borderRadius:"8px", padding:"10px 22px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s" }}>
            Search
          </button>
        </div>

        {/* Suggestions */}
        {!result && !loading && (
          <div style={{ marginBottom:"40px" }}>
            <div style={{ fontSize:"11px", color:"#9ca3af", letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:"600", marginBottom:"10px" }}>Common searches</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="chip" onClick={() => { setQuery(s); search(s); }}
                  style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:"999px", color:"#374151", fontSize:"12px", padding:"6px 14px", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ width:"32px", height:"32px", border:"3px solid #e5e7eb", borderTop:"3px solid #0f4c81", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
            <div style={{ fontSize:"14px", color:"#6b7280" }}>{stage}</div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>

            {/* Back */}
            <button onClick={() => { setResult(null); setQuery(""); setPapers([]); }}
              style={{ background:"transparent", border:"none", color:"#6b7280", fontSize:"13px", cursor:"pointer", fontFamily:"inherit", padding:"0 0 20px", display:"flex", alignItems:"center", gap:"4px" }}>
              ← New search
            </button>

            {/* Query */}
            <h2 style={{ fontSize:"20px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em", margin:"0 0 16px" }}>{currentQuery}</h2>

            {/* Urgency banner */}
            <div style={{ background: urgencyConfig.bg, border:`1.5px solid ${urgencyConfig.border}`, borderLeft:`4px solid ${urgencyConfig.color}`, borderRadius:"10px", padding:"14px 18px", marginBottom:"24px", display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"50%", background: urgencyConfig.color, flexShrink:0 }} />
              <div>
                <span style={{ fontSize:"15px", fontWeight:"700", color: urgencyConfig.color }}>{urgencyConfig.label}</span>
                <span style={{ fontSize:"14px", color:"#374151", marginLeft:"10px" }}>{result.urgency_reason}</span>
              </div>
            </div>

            {/* Mode toggle */}
            <div style={{ display:"flex", background:"#f3f4f6", borderRadius:"8px", padding:"3px", marginBottom:"24px", gap:"3px", width:"fit-content" }}>
              {[["owner","🐾 Pet Owner"], ["vet","🩺 Veterinary"]].map(([m, label]) => (
                <button key={m} className="tab" onClick={() => setMode(m)}
                  style={{ background: mode===m ? "#fff" : "transparent", border:"none", borderRadius:"6px", padding:"7px 18px", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", fontWeight: mode===m ? "600" : "400", color: mode===m ? "#111827" : "#6b7280", boxShadow: mode===m ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition:"all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Two column layout */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"32px", alignItems:"start" }}>

              {/* Left — answer */}
              <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:"12px", padding:"24px" }}>
                {mode === "owner"
                  ? <OwnerView data={result} papers={papers} onCite={handleCite} />
                  : <VetView data={result} papers={papers} onCite={handleCite} />
                }
              </div>

              {/* Right — sources */}
              <div ref={sourcesRef}>
                <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"12px" }}>
                  {papers.length} Sources
                </div>
                {papers.length > 0 ? papers.map((p, i) => (
                  <SourceCard key={i} paper={p} index={i} highlighted={highlighted === i} />
                )) : (
                  <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"10px", padding:"20px", textAlign:"center", color:"#9ca3af", fontSize:"13px" }}>
                    No papers retrieved for this query
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"10px", padding:"16px", color:"#991b1b", fontSize:"13px" }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
