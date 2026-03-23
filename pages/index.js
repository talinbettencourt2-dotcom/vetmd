import { useState, useRef } from "react";

// ─── PubMed (client side, no key needed) ────────────────────────────
function buildQueries(q) {
  const lower = q.toLowerCase();
  const queries = [q + " veterinary"];
  if (lower.match(/dog|canine/)) queries.push("canine " + q + " treatment");
  else if (lower.match(/cat|feline/)) queries.push("feline " + q + " management");
  else if (lower.match(/horse|equine/)) queries.push("equine " + q + " diagnosis");
  else if (lower.match(/rabbit/)) queries.push("rabbit " + q + " veterinary");
  else queries.push(q + " small animal veterinary");
  if (lower.match(/dose|dosing|mg|antibiotic|amoxicillin|meloxicam|metronidazole|prednisolone/)) {
    queries.push(q + " pharmacokinetics dosing");
  } else {
    queries.push(q + " diagnosis prognosis");
  }
  return [...new Set(queries)].slice(0, 3);
}

async function searchPubMed(userQuery) {
  const queries = buildQueries(userQuery);
  const allIds = [];
  const seenIds = new Set();
  for (const q of queries) {
    try {
      const res = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(q)}&retmax=4&retmode=json&sort=relevance`);
      const data = await res.json();
      for (const id of (data.esearchresult?.idlist || [])) {
        if (!seenIds.has(id)) { seenIds.add(id); allIds.push(id); }
      }
    } catch (e) {}
  }
  if (!allIds.length) return [];
  try {
    const sumRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${allIds.slice(0, 8).join(",")}&retmode=json`);
    const sumData = await sumRes.json();
    const result = sumData.result || {};
    const papers = allIds.slice(0, 8).map(pmid => {
      const doc = result[pmid];
      if (!doc || doc.error) return null;
      const authors = doc.authors || [];
      const author = authors.length > 1 ? `${authors[0].name} et al.` : authors[0]?.name || "";
      return { title: doc.title || "", abstract: `${doc.title}. ${doc.source} (${doc.pubdate?.slice(0, 4)}).`, pmid, year: doc.pubdate?.slice(0, 4) || "", journal: doc.source || "", author, url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` };
    }).filter(p => p && p.title);
    try {
      const fetchRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${allIds.slice(0, 4).join(",")}&retmode=xml&rettype=abstract`);
      const xml = await fetchRes.text();
      const xmlDoc = new DOMParser().parseFromString(xml, "text/xml");
      xmlDoc.querySelectorAll("PubmedArticle").forEach(article => {
        const pmid = article.querySelector("PMID")?.textContent || "";
        const abstract = article.querySelector("AbstractText")?.textContent || "";
        if (abstract.length > 80) {
          const paper = papers.find(p => p.pmid === pmid);
          if (paper) paper.abstract = abstract.slice(0, 500);
        }
      });
    } catch (e) {}
    return papers;
  } catch (e) { return []; }
}

// ─── Urgency config ──────────────────────────────────────────────────
const URGENCY = {
  emergency: { label: "Go to Emergency Vet Now", color: "#e05c5c", bg: "#2a0808", border: "#8a1a1a", icon: "🚨" },
  "vet-soon": { label: "See a Vet Today", color: "#e09a3a", bg: "#1e1408", border: "#7a4a10", icon: "⚠️" },
  monitor: { label: "Monitor Closely", color: "#d4c03a", bg: "#1a1808", border: "#6a5a10", icon: "👁️" },
  ok: { label: "Likely OK", color: "#5ba85c", bg: "#081808", border: "#1a5a1a", icon: "✅" },
};

const LIKELIHOOD_COLOR = { High: "#e05c5c", Moderate: "#e09a3a", Low: "#5ba85c" };

// ─── UI Components ───────────────────────────────────────────────────
function Badge({ text, color }) {
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", background: color + "22", color, border: `1px solid ${color}44` }}>{text}</span>;
}

function Card({ icon, title, accent, children }) {
  const c = accent || "#1e2d3d";
  return (
    <div style={{ marginBottom: "16px", border: `1px solid ${c}`, borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ background: "#0d1b2a", padding: "9px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: `1px solid ${c}` }}>
        <span>{icon}</span>
        <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.09em", textTransform: "uppercase", color: accent || "#7eb8d4" }}>{title}</span>
      </div>
      <div style={{ padding: "14px 16px", background: "#0a1520" }}>{children}</div>
    </div>
  );
}

function CitedText({ text, papers }) {
  return (
    <span>
      {text.split(/(\[\d+\])/g).map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const paper = papers[parseInt(m[1]) - 1];
        return paper ? (
          <a key={i} href={paper.url} target="_blank" rel="noopener noreferrer" title={paper.title}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "20px", height: "17px", padding: "0 4px", borderRadius: "4px", background: "#1a4a6a", color: "#7eb8d4", fontSize: "10px", fontWeight: "700", textDecoration: "none", margin: "0 2px", verticalAlign: "middle", border: "1px solid #2a6a8a" }}>
            {m[1]}
          </a>
        ) : null;
      })}
    </span>
  );
}

function Sources({ papers }) {
  const [open, setOpen] = useState(null);
  if (!papers.length) return null;
  return (
    <Card icon="📚" title={`${papers.length} PubMed Sources`}>
      {papers.map((p, i) => (
        <div key={i} style={{ borderBottom: i < papers.length - 1 ? "1px solid #1e2d3d" : "none", paddingBottom: "10px", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
            <span style={{ minWidth: "22px", height: "18px", background: "#1a4a6a", color: "#7eb8d4", borderRadius: "4px", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #2a6a8a", flexShrink: 0, marginTop: "2px" }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#cde4f0", lineHeight: 1.4 }}>{p.title}</div>
              <div style={{ fontSize: "11px", color: "#4a7a8a", marginTop: "2px" }}>{[p.author, p.year, p.journal].filter(Boolean).join(" · ")}</div>
            </div>
            <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ fontSize: "10px", color: "#3d9bd4", textDecoration: "none", padding: "3px 8px", border: "1px solid #1e3a50", borderRadius: "4px", background: "#0d1b2a", whiteSpace: "nowrap", flexShrink: 0 }}>
              PubMed ↗
            </a>
          </div>
          {open === i && <div style={{ fontSize: "12px", color: "#7a9ab0", lineHeight: 1.6, marginTop: "6px", paddingLeft: "32px" }}>{p.abstract}</div>}
        </div>
      ))}
    </Card>
  );
}

function OwnerView({ data }) {
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ background: "#0a1a2e", border: "1px solid #1e3a50", borderRadius: "10px", padding: "18px 20px", marginBottom: "16px" }}>
        <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.8, color: "#cde4f0" }}>{data.owner_summary}</p>
        {data.species_note && <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#9dd4a0", fontStyle: "italic" }}>🐾 {data.species_note}</p>}
      </div>
      {data.owner_next_steps?.length > 0 && (
        <Card icon="📋" title="What to do now">
          {data.owner_next_steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", padding: "6px 0", borderBottom: i < data.owner_next_steps.length - 1 ? "1px solid #1e2d3d" : "none" }}>
              <span style={{ background: "#3d9bd4", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "1px" }}>{i + 1}</span>
              <span style={{ fontSize: "14px", color: "#cde4f0", lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </Card>
      )}
      {data.red_flags?.length > 0 && (
        <div style={{ background: "#1e0808", border: "1px solid #5c1e1e", borderLeft: "4px solid #e05c5c", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#e05c5c", marginBottom: "8px" }}>🚨 Go to emergency vet immediately if you see:</div>
          {data.red_flags.map((f, i) => <div key={i} style={{ fontSize: "13px", color: "#f0b8b8", padding: "3px 0" }}>• {f}</div>)}
        </div>
      )}
      {data.prognosis && (
        <div style={{ background: "#0a180a", border: "1px solid #1e3a1e", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#5ba85c", marginBottom: "6px" }}>📈 Prognosis</div>
          <p style={{ margin: 0, fontSize: "13px", color: "#9dd4a0", lineHeight: 1.6 }}>{data.prognosis}</p>
        </div>
      )}
      <div style={{ fontSize: "11px", color: "#2a4a5a", textAlign: "center", padding: "12px 0 0", borderTop: "1px solid #1e2d3d" }}>🔒 {data.disclaimer}</div>
    </div>
  );
}

function VetView({ data, papers }) {
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ background: "linear-gradient(135deg,#0d2137,#0a1a2e)", border: "1px solid #1e3a50", borderLeft: "4px solid #3d9bd4", borderRadius: "10px", padding: "18px 20px", marginBottom: "16px" }}>
        <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.8, color: "#cde4f0" }}><CitedText text={data.vet_summary} papers={papers} /></p>
        {data.prognosis && <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#9dd4a0" }}>📈 <strong>Prognosis:</strong> {data.prognosis}</p>}
        {data.species_note && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#9dd4a0", fontStyle: "italic" }}>🐾 {data.species_note}</p>}
      </div>
      {data.red_flags?.length > 0 && (
        <div style={{ background: "#1e0808", border: "1px solid #5c1e1e", borderLeft: "4px solid #e05c5c", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.09em", textTransform: "uppercase", color: "#e05c5c", marginBottom: "8px" }}>⚠️ Red Flags</div>
          {data.red_flags.map((f, i) => <div key={i} style={{ fontSize: "13px", color: "#f0b8b8", padding: "3px 0" }}>• {f}</div>)}
        </div>
      )}
      {data.differentials?.length > 0 && (
        <Card icon="🔍" title="Differential Diagnoses">
          {data.differentials.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "8px 0", borderBottom: i < data.differentials.length - 1 ? "1px solid #1e2d3d" : "none" }}>
              <Badge text={d.likelihood} color={LIKELIHOOD_COLOR[d.likelihood] || "#7eb8d4"} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#cde4f0" }}>{d.name}</div>
                <div style={{ fontSize: "12px", color: "#7a9ab0", marginTop: "2px" }}><CitedText text={d.reason} papers={papers} /></div>
              </div>
            </div>
          ))}
        </Card>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {data.diagnostics?.length > 0 && (
          <Card icon="🧪" title="Diagnostics">
            {data.diagnostics.map((d, i) => (
              <div key={i} style={{ fontSize: "13px", color: "#b8d4e0", padding: "4px 0", display: "flex", gap: "8px" }}>
                <span style={{ color: "#3d9bd4" }}>›</span><CitedText text={d} papers={papers} />
              </div>
            ))}
          </Card>
        )}
        <div>
          {data.treatment?.immediate?.length > 0 && (
            <Card icon="⚡" title="Immediate">
              {data.treatment.immediate.map((t, i) => (
                <div key={i} style={{ fontSize: "13px", color: "#b8d4e0", padding: "4px 0", display: "flex", gap: "8px" }}>
                  <span style={{ color: "#e09a3a" }}>›</span><CitedText text={t} papers={papers} />
                </div>
              ))}
            </Card>
          )}
          {data.treatment?.ongoing?.length > 0 && (
            <Card icon="📋" title="Ongoing Care">
              {data.treatment.ongoing.map((t, i) => (
                <div key={i} style={{ fontSize: "13px", color: "#b8d4e0", padding: "4px 0", display: "flex", gap: "8px" }}>
                  <span style={{ color: "#5ba85c" }}>›</span><CitedText text={t} papers={papers} />
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
      {data.drug_dosing?.length > 0 && (
        <Card icon="💊" title="Drug Dosing" accent="#2a5a2a">
          <div style={{ display: "grid", gap: "10px" }}>
            {data.drug_dosing.map((d, i) => (
              <div key={i} style={{ background: "#0a180a", border: "1px solid #1e3a1e", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#9dd4a0", marginBottom: "8px" }}>{d.drug}</div>
                <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "4px 12px" }}>
                  <span style={{ fontSize: "11px", color: "#2a6a2a", fontWeight: "700", textTransform: "uppercase" }}>Dose</span><span style={{ fontSize: "13px", color: "#cde4f0" }}>{d.dose}</span>
                  <span style={{ fontSize: "11px", color: "#2a6a2a", fontWeight: "700", textTransform: "uppercase" }}>Route</span><span style={{ fontSize: "13px", color: "#cde4f0" }}>{d.route}</span>
                  {d.frequency && <><span style={{ fontSize: "11px", color: "#2a6a2a", fontWeight: "700", textTransform: "uppercase" }}>Freq.</span><span style={{ fontSize: "13px", color: "#cde4f0" }}>{d.frequency}</span></>}
                  {d.notes && <><span style={{ fontSize: "11px", color: "#2a6a2a", fontWeight: "700", textTransform: "uppercase" }}>Notes</span><span style={{ fontSize: "12px", color: "#e09a3a" }}>{d.notes}</span></>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Sources papers={papers} />
      <div style={{ fontSize: "11px", color: "#2a4a5a", textAlign: "center", padding: "12px 0 0", borderTop: "1px solid #1e2d3d" }}>🔒 {data.disclaimer}</div>
    </div>
  );
}

const SUGGESTIONS = [
  "Dog vomiting blood", "Cat not eating 2 days",
  "Rabbit not moving", "Horse colic signs",
  "Dog ate chocolate", "Cat breathing fast",
  "Amoxicillin dose 10kg dog", "Feline hyperthyroidism",
];

// ─── Main Page ───────────────────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [mode, setMode] = useState("owner");
  const inputRef = useRef(null);

  async function search(q) {
    const trimmed = (q || query).trim();
    if (!trimmed) return;
    setLoading(true); setResult(null); setPapers([]); setError(null); setCurrentQuery(trimmed);
    try {
      setStage("Searching 4 research databases...");
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

  const urgencyConfig = result ? URGENCY[result.urgency] || URGENCY["monitor"] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#060d16", fontFamily: "'DM Sans',sans-serif", color: "#cde4f0" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2a3a", padding: "13px 28px", display: "flex", alignItems: "center", gap: "12px", background: "#070e18", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg,#1a5f8a,#0d3a5a)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>🐾</div>
        <span style={{ fontSize: "15px", fontWeight: "700", color: "#e0f0ff" }}>VetMD AI</span>
        <span style={{ fontSize: "10px", color: "#2a5a6a", letterSpacing: "0.08em", textTransform: "uppercase" }}>Clinical Decision Support</span>
        <span style={{ marginLeft: "auto", fontSize: "10px", color: "#3d9bd4", background: "#0d2137", border: "1px solid #1e3a50", padding: "3px 10px", borderRadius: "999px", fontWeight: "600" }}>PubMed Live</span>
      </div>

      <div style={{ maxWidth: "740px", margin: "0 auto", padding: "36px 20px 80px" }}>

        {!result && !loading && (
          <div style={{ textAlign: "center", marginBottom: "28px", animation: "fadeUp 0.5s ease" }}>
            <h1 style={{ fontSize: "30px", fontWeight: "700", letterSpacing: "-0.03em", color: "#e0f0ff", margin: "0 0 8px" }}>Is my pet OK?</h1>
            <p style={{ color: "#3a6a7a", fontSize: "14px", margin: 0 }}>Describe what's happening — get an instant urgency assessment</p>
          </div>
        )}

        {/* Search */}
        <div style={{ display: "flex", gap: "8px", background: "#0a1520", border: "1px solid #1e3a50", borderRadius: "12px", padding: "6px 6px 6px 16px", marginBottom: "16px", boxShadow: "0 0 40px #3d9bd412" }}>
          <input ref={inputRef} value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="e.g. my dog is vomiting blood..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "14px", color: "#cde4f0", fontFamily: "inherit", padding: "8px 0" }}
          />
          <button className="go" onClick={() => search()}
            style={{ background: "#3d9bd4", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 22px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}>
            Search
          </button>
        </div>

        {!result && !loading && (
          <div style={{ marginBottom: "36px" }}>
            <div style={{ fontSize: "10px", color: "#1e3a4a", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "700", marginBottom: "10px" }}>Common searches</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="chip" onClick={() => { setQuery(s); search(s); }}
                  style={{ background: "#0a1520", border: "1px solid #1a2a3a", borderRadius: "999px", color: "#3a6a7a", fontSize: "12px", padding: "6px 14px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "70px 0" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "18px" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: "8px", height: "8px", background: "#3d9bd4", borderRadius: "50%", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
            <div style={{ fontSize: "13px", color: "#2a5a6a" }}>{stage}</div>
          </div>
        )}

        {result && !loading && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <button onClick={() => { setResult(null); setQuery(""); setPapers([]); }}
              style={{ background: "transparent", border: "none", color: "#3a6a7a", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", padding: "0 0 16px", display: "flex", alignItems: "center", gap: "6px" }}>
              ← New search
            </button>

            {/* Urgency banner */}
            <div style={{ background: urgencyConfig.bg, border: `2px solid ${urgencyConfig.border}`, borderRadius: "14px", padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "36px" }}>{urgencyConfig.icon}</span>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: urgencyConfig.color, letterSpacing: "-0.01em" }}>{urgencyConfig.label}</div>
                <div style={{ fontSize: "14px", color: "#8a9ab0", marginTop: "4px", lineHeight: 1.5 }}>{result.urgency_reason}</div>
              </div>
            </div>

            {/* Mode toggle */}
            <div style={{ display: "flex", background: "#0a1520", border: "1px solid #1a2a3a", borderRadius: "10px", padding: "4px", marginBottom: "20px", gap: "4px" }}>
              {[["owner", "🐾 Pet Owner", "Simple explanation"], ["vet", "🩺 Veterinary", "Clinical detail"]].map(([m, label, sub]) => (
                <button key={m} onClick={() => setMode(m)}
                  style={{ flex: 1, background: mode === m ? "#1a3a5a" : "transparent", border: mode === m ? "1px solid #2a5a8a" : "1px solid transparent", borderRadius: "8px", padding: "10px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: mode === m ? "#7eb8d4" : "#3a6a7a" }}>{label}</div>
                  <div style={{ fontSize: "11px", color: mode === m ? "#4a8aaa" : "#2a4a5a", marginTop: "2px" }}>{sub}</div>
                </button>
              ))}
            </div>

            {mode === "owner" ? <OwnerView data={result} /> : <VetView data={result} papers={papers} />}
          </div>
        )}

        {error && (
          <div style={{ background: "#1e0808", border: "1px solid #5c1e1e", borderRadius: "10px", padding: "16px", color: "#f0b8b8", fontSize: "13px", lineHeight: 1.6 }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
