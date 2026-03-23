import { useState, useRef, useEffect } from "react";

const URGENCY = {
  emergency: { label: "Emergency — Go to Vet Now", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  "vet-soon": { label: "See a Vet Today", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  monitor:   { label: "Monitor Closely", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
  ok:        { label: "Likely OK", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};
const LIKELIHOOD_COLOR = { High: "#dc2626", Moderate: "#d97706", Low: "#16a34a" };
const SOURCE_COLOR = { "PubMed": "#2563eb", "Europe PMC": "#7c3aed", "OpenAlex": "#0891b2", "Semantic Scholar": "#059669" };
const LOGO_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' rx='10' fill='%230f4c81'/><circle cx='20' cy='24' r='7' fill='white' opacity='0.95'/><circle cx='13' cy='17' r='3.5' fill='white' opacity='0.95'/><circle cx='20' cy='14' r='3.5' fill='white' opacity='0.95'/><circle cx='27' cy='17' r='3.5' fill='white' opacity='0.95'/><rect x='18.5' y='21' width='3' height='6' rx='1' fill='%230f4c81'/><rect x='17' y='22.5' width='6' height='3' rx='1' fill='%230f4c81'/></svg>`;

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
  if (!text) return null;
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
      style={{ display:"block", textDecoration:"none", border: highlighted ? "2px solid #3b82f6" : "1px solid #e5e7eb", borderRadius:"10px", padding:"12px 14px", background: highlighted ? "#eff6ff" : "#fff", transition:"all 0.15s", marginBottom:"8px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
        <span style={{ minWidth:"20px", height:"20px", background:color+"15", color, borderRadius:"50%", fontSize:"10px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${color}30` }}>{index + 1}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:"12px", fontWeight:"600", color:"#111827", lineHeight:1.4, marginBottom:"3px" }}>{paper.title}</div>
          <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:"10px", fontWeight:"700", color, background:color+"12", padding:"1px 6px", borderRadius:"999px" }}>{paper.source}</span>
            {paper.author && <span style={{ fontSize:"11px", color:"#6b7280" }}>{paper.author}</span>}
            {paper.year && <span style={{ fontSize:"11px", color:"#9ca3af" }}>{paper.year}</span>}
            {paper.journal && <span style={{ fontSize:"11px", color:"#9ca3af", fontStyle:"italic" }}>{paper.journal}</span>}
          </div>
          {paper.abstract && paper.abstract.length > 80 && (
            <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"5px", lineHeight:1.5 }}>{paper.abstract.slice(0, 140)}...</div>
          )}
        </div>
        <span style={{ fontSize:"11px", color:"#3b82f6", flexShrink:0 }}>↗</span>
      </div>
    </a>
  );
}

function Badge({ text, color }) {
  return <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:"999px", fontSize:"11px", fontWeight:"600", background:color+"15", color, border:`1px solid ${color}25` }}>{text}</span>;
}

function ResultView({ data, papers, onCite }) {
  return (
    <div>
      {/* Summary */}
      <p style={{ fontSize:"15px", lineHeight:1.8, color:"#1f2937", margin:"0 0 20px" }}>
        <CitedText text={data.summary} papers={papers} onCite={onCite} />
      </p>

      {data.prognosis && (
        <p style={{ fontSize:"13px", color:"#374151", margin:"0 0 16px", padding:"10px 14px", background:"#f0fdf4", borderRadius:"8px", border:"1px solid #bbf7d0" }}>
          📈 <strong>Prognosis:</strong> {data.prognosis}
        </p>
      )}
      {data.species_note && (
        <p style={{ fontSize:"13px", color:"#6b7280", fontStyle:"italic", margin:"0 0 16px", padding:"10px 14px", background:"#f9fafb", borderRadius:"8px", border:"1px solid #f3f4f6" }}>
          🐾 {data.species_note}
        </p>
      )}

      {/* Red Flags */}
      {data.red_flags?.length > 0 && (
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderLeft:"4px solid #dc2626", borderRadius:"8px", padding:"14px 16px", marginBottom:"20px" }}>
          <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.06em", textTransform:"uppercase", color:"#dc2626", marginBottom:"8px" }}>⚠️ Seek Urgent Care If:</div>
          {data.red_flags.map((f, i) => <div key={i} style={{ fontSize:"13px", color:"#991b1b", padding:"2px 0" }}>• {f}</div>)}
        </div>
      )}

      {/* Differentials */}
      {data.differentials?.length > 0 && (
        <div style={{ marginBottom:"20px" }}>
          <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"10px" }}>Differential Diagnoses</div>
          {data.differentials.map((d, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"10px", padding:"8px 0", borderBottom:"1px solid #f9fafb" }}>
              <Badge text={d.likelihood} color={LIKELIHOOD_COLOR[d.likelihood] || "#6b7280"} />
              <div>
                <div style={{ fontSize:"13px", fontWeight:"600", color:"#111827" }}>{d.name}</div>
                <div style={{ fontSize:"12px", color:"#6b7280", marginTop:"1px" }}>
                  <CitedText text={d.reason} papers={papers} onCite={onCite} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diagnostics + Treatment */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px" }}>
        {data.diagnostics?.length > 0 && (
          <div>
            <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"8px" }}>Diagnostics</div>
            {data.diagnostics.map((d, i) => (
              <div key={i} style={{ fontSize:"13px", color:"#374151", padding:"4px 0", borderBottom:"1px solid #f9fafb", display:"flex", gap:"6px" }}>
                <span style={{ color:"#0f4c81" }}>›</span>
                <CitedText text={d} papers={papers} onCite={onCite} />
              </div>
            ))}
          </div>
        )}
        <div>
          {data.treatment?.immediate?.length > 0 && (
            <div style={{ marginBottom:"14px" }}>
              <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"8px" }}>Immediate</div>
              {data.treatment.immediate.map((t, i) => (
                <div key={i} style={{ fontSize:"13px", color:"#374151", padding:"4px 0", borderBottom:"1px solid #f9fafb", display:"flex", gap:"6px" }}>
                  <span style={{ color:"#d97706" }}>›</span>
                  <CitedText text={t} papers={papers} onCite={onCite} />
                </div>
              ))}
            </div>
          )}
          {data.treatment?.ongoing?.length > 0 && (
            <div>
              <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"8px" }}>Ongoing Care</div>
              {data.treatment.ongoing.map((t, i) => (
                <div key={i} style={{ fontSize:"13px", color:"#374151", padding:"4px 0", borderBottom:"1px solid #f9fafb", display:"flex", gap:"6px" }}>
                  <span style={{ color:"#16a34a" }}>›</span>
                  <CitedText text={t} papers={papers} onCite={onCite} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drug Dosing */}
      {data.drug_dosing?.length > 0 && (
        <div style={{ marginBottom:"20px" }}>
          <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"10px" }}>Drug Dosing</div>
          {data.drug_dosing.map((d, i) => (
            <div key={i} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"12px 14px", marginBottom:"8px" }}>
              <div style={{ fontSize:"13px", fontWeight:"700", color:"#111827", marginBottom:"6px" }}>{d.drug}</div>
              <div style={{ display:"grid", gridTemplateColumns:"80px 1fr", gap:"3px 10px", fontSize:"12px" }}>
                <span style={{ color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", fontSize:"10px" }}>Dose</span><span style={{ color:"#374151" }}>{d.dose}</span>
                <span style={{ color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", fontSize:"10px" }}>Route</span><span style={{ color:"#374151" }}>{d.route}</span>
                {d.frequency && <><span style={{ color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", fontSize:"10px" }}>Freq.</span><span style={{ color:"#374151" }}>{d.frequency}</span></>}
                {d.notes && <><span style={{ color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", fontSize:"10px" }}>Notes</span><span style={{ color:"#d97706" }}>{d.notes}</span></>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ background:"#f8fafc", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"12px 16px", marginTop:"8px" }}>
        <p style={{ fontSize:"12px", color:"#6b7280", margin:0, lineHeight:1.6 }}>
          <strong style={{ color:"#374151" }}>Disclaimer:</strong> VetMD is a research tool designed for licensed veterinarians and veterinary professionals. It generates AI-assisted, evidence-based content and citations. It is not veterinary medical advice, diagnosis, or treatment, and does not replace independent professional judgment or primary-source verification.
        </p>
      </div>
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
  const [highlighted, setHighlighted] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const sourcesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
    link.type = "image/svg+xml";
    link.rel = "icon";
    link.href = `data:image/svg+xml,${LOGO_SVG}`;
    document.head.appendChild(link);
  }, []);

  async function search(q) {
    const trimmed = (q || query).trim();
    if (!trimmed) return;
    setLoading(true); setResult(null); setPapers([]);
    setError(null); setCurrentQuery(trimmed);
    setHighlighted(null); setQuery("");
    try {
      setStage("Searching research databases...");
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const found = data.papers || [];
      setPapers(found);
      setResult(data);
      const id = Date.now();
      setActiveHistoryId(id);
      setHistory(prev => [{ id, query: trimmed, urgency: data.urgency, result: data, papers: found }, ...prev].slice(0, 20));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false); setStage("");
    }
  }

  function loadHistory(item) {
    setResult(item.result);
    setPapers(item.papers);
    setCurrentQuery(item.query);
    setActiveHistoryId(item.id);
    setHighlighted(null);
    setError(null);
    setQuery("");
  }

  function handleCite(idx) {
    setHighlighted(idx);
    sourcesRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  const urgencyConfig = result ? URGENCY[result.urgency] || URGENCY["monitor"] : null;
  const urgencyDot = { emergency:"#dc2626", "vet-soon":"#d97706", monitor:"#ca8a04", ok:"#16a34a" };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Instrument Sans','Helvetica Neue',sans-serif", color:"#111827", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; }
        ::placeholder { color:#9ca3af; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:3px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .chip:hover { background:#eff6ff !important; border-color:#bfdbfe !important; color:#1d4ed8 !important; }
        .go:hover { background:#0d3d6b !important; }
        .hist-item:hover { background:#f9fafb !important; }
        .new-btn:hover { background:#eff6ff !important; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width:"240px", minHeight:"100vh", background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, height:"100vh" }}>
        {/* Logo */}
        <div style={{ padding:"16px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:"8px" }}>
          <Logo size={28} />
          <div>
            <div style={{ fontSize:"15px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em" }}>VetMD</div>
            <div style={{ fontSize:"10px", color:"#9ca3af" }}>Evidence-Based AI</div>
          </div>
        </div>

        {/* New search */}
        <div style={{ padding:"12px" }}>
          <button className="new-btn" onClick={() => { setResult(null); setQuery(""); setPapers([]); setActiveHistoryId(null); setError(null); }}
            style={{ width:"100%", background:"#f3f4f6", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"8px 12px", fontSize:"13px", fontWeight:"600", color:"#374151", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:"6px", transition:"all 0.15s" }}>
            <span style={{ fontSize:"16px", lineHeight:1 }}>+</span> New Search
          </button>
        </div>

        {/* History */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 8px" }}>
          {history.length === 0 ? (
            <div style={{ padding:"20px 8px", fontSize:"12px", color:"#9ca3af", textAlign:"center", lineHeight:1.6 }}>
              Your search history<br/>will appear here
            </div>
          ) : (
            <>
              <div style={{ fontSize:"10px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", padding:"8px 8px 4px" }}>Recent</div>
              {history.map(item => (
                <button key={item.id} className="hist-item" onClick={() => loadHistory(item)}
                  style={{ width:"100%", background: activeHistoryId===item.id ? "#eff6ff" : "transparent", border: activeHistoryId===item.id ? "1px solid #bfdbfe" : "1px solid transparent", borderRadius:"8px", padding:"8px 10px", cursor:"pointer", fontFamily:"inherit", textAlign:"left", marginBottom:"2px", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    <span style={{ width:"7px", height:"7px", borderRadius:"50%", background: urgencyDot[item.urgency] || "#9ca3af", flexShrink:0 }} />
                    <span style={{ fontSize:"12px", fontWeight:"500", color: activeHistoryId===item.id ? "#1d4ed8" : "#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.query}</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Source badges */}
        <div style={{ padding:"12px", borderTop:"1px solid #f3f4f6" }}>
          <div style={{ fontSize:"10px", fontWeight:"600", color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>Sources</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
            {Object.entries(SOURCE_COLOR).map(([name, color]) => (
              <span key={name} style={{ fontSize:"9px", fontWeight:"700", color, background:color+"12", padding:"2px 6px", borderRadius:"999px", border:`1px solid ${color}20` }}>{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:"100vh" }}>

        {/* Top bar */}
        <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 28px", height:"52px", display:"flex", alignItems:"center" }}>
          <span style={{ fontSize:"12px", color:"#9ca3af" }}>For licensed veterinarians and veterinary professionals</span>
        </div>

        <div style={{ flex:1, padding:"36px 28px 60px", maxWidth:"1000px", width:"100%", margin:"0 auto" }}>

          {/* Welcome */}
          {!result && !loading && (
            <div style={{ animation:"fadeUp 0.4s ease" }}>
              <div style={{ marginBottom:"28px" }}>
                <h1 style={{ fontSize:"26px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em", margin:"0 0 6px" }}>How can I help you today?</h1>
                <p style={{ color:"#6b7280", fontSize:"14px", margin:0 }}>Search peer-reviewed veterinary literature for evidence-based clinical answers.</p>
              </div>

              <div style={{ display:"flex", gap:"8px", background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:"12px", padding:"6px 6px 6px 16px", marginBottom:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <input ref={inputRef} value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && search()}
                  placeholder="e.g. canine hematemesis management, amoxicillin dosing dogs..."
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:"14px", color:"#111827", fontFamily:"inherit", padding:"8px 0" }}
                />
                <button className="go" onClick={() => search()}
                  style={{ background:"#0f4c81", color:"#fff", border:"none", borderRadius:"8px", padding:"10px 22px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s" }}>
                  Search
                </button>
              </div>

              <div style={{ marginBottom:"24px" }}>
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

              {/* Disclaimer on welcome screen */}
              <div style={{ background:"#f8fafc", border:"1px solid #e5e7eb", borderRadius:"10px", padding:"14px 18px" }}>
                <p style={{ fontSize:"12px", color:"#6b7280", margin:0, lineHeight:1.7 }}>
                  <strong style={{ color:"#374151" }}>Disclaimer:</strong> VetMD is a research tool designed for licensed veterinarians and veterinary professionals. It generates AI-assisted, evidence-based content and citations. It is not veterinary medical advice, diagnosis, or treatment, and does not replace independent professional judgment or primary-source verification.
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign:"center", padding:"100px 0" }}>
              <div style={{ width:"30px", height:"30px", border:"3px solid #e5e7eb", borderTop:"3px solid #0f4c81", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 14px" }} />
              <div style={{ fontSize:"14px", color:"#6b7280" }}>{stage}</div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>

              {/* Search bar stays */}
              <div style={{ display:"flex", gap:"8px", background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:"12px", padding:"6px 6px 6px 16px", marginBottom:"20px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <input value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && search()}
                  placeholder="Ask another question..."
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:"14px", color:"#111827", fontFamily:"inherit", padding:"8px 0" }}
                />
                <button className="go" onClick={() => search()}
                  style={{ background:"#0f4c81", color:"#fff", border:"none", borderRadius:"8px", padding:"10px 22px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s" }}>
                  Search
                </button>
              </div>

              <h2 style={{ fontSize:"19px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em", margin:"0 0 14px" }}>{currentQuery}</h2>

              {/* Urgency */}
              <div style={{ background:urgencyConfig.bg, border:`1.5px solid ${urgencyConfig.border}`, borderLeft:`4px solid ${urgencyConfig.color}`, borderRadius:"10px", padding:"12px 16px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:urgencyConfig.color, flexShrink:0 }} />
                <span style={{ fontSize:"14px", fontWeight:"700", color:urgencyConfig.color }}>{urgencyConfig.label}</span>
                <span style={{ fontSize:"13px", color:"#374151" }}>{result.urgency_reason}</span>
              </div>

              {/* Two column */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"24px", alignItems:"start" }}>
                <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:"12px", padding:"22px" }}>
                  <ResultView data={result} papers={papers} onCite={handleCite} />
                </div>
                <div ref={sourcesRef}>
                  <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", marginBottom:"10px" }}>
                    {papers.length} Sources
                  </div>
                  {papers.length > 0 ? papers.map((p, i) => (
                    <SourceCard key={i} paper={p} index={i} highlighted={highlighted === i} />
                  )) : (
                    <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"10px", padding:"20px", textAlign:"center", color:"#9ca3af", fontSize:"13px" }}>
                      No papers retrieved
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"10px", padding:"16px", color:"#991b1b", fontSize:"13px" }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
