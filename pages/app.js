import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth, UserButton, useUser } from '@clerk/nextjs'
import { useState, useRef } from "react";

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
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
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
      style={{ display:"block", textDecoration:"none", border: highlighted ? "1.5px solid #3b82f6" : "1px solid #e5e7eb", borderRadius:"8px", padding:"10px 12px", background: highlighted ? "#eff6ff" : "#fafafa", marginBottom:"6px", transition:"all 0.15s" }}>
      <div style={{ display:"flex", gap:"8px", alignItems:"flex-start" }}>
        <span style={{ minWidth:"18px", height:"18px", background:color+"15", color, borderRadius:"50%", fontSize:"9px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${color}30` }}>{index+1}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:"12px", fontWeight:"600", color:"#111827", lineHeight:1.3, marginBottom:"3px" }}>{paper.title}</div>
          <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"9px", fontWeight:"700", color, background:color+"12", padding:"1px 5px", borderRadius:"999px" }}>{paper.source}</span>
            {paper.author && <span style={{ fontSize:"10px", color:"#9ca3af" }}>{paper.author}</span>}
            {paper.year && <span style={{ fontSize:"10px", color:"#9ca3af" }}>{paper.year}</span>}
          </div>
        </div>
        <span style={{ color:"#9ca3af", fontSize:"10px", flexShrink:0 }}>↗</span>
      </div>
    </a>
  );
}

function Badge({ text, color }) {
  return <span style={{ display:"inline-block", padding:"1px 7px", borderRadius:"999px", fontSize:"11px", fontWeight:"600", background:color+"15", color, border:`1px solid ${color}25` }}>{text}</span>;
}

function Answer({ data, papers }) {
  const [showSources, setShowSources] = useState(false);
  const urgencyConfig = URGENCY[data.urgency] || URGENCY["monitor"];

  return (
    <div style={{ marginBottom:"32px" }}>
      <div style={{ marginBottom:"20px" }}>
        <p style={{ fontSize:"18px", fontWeight:"600", color:"#111827", margin:0, lineHeight:1.5 }}>{data.query}</p>
      </div>

      <div style={{ marginBottom:"8px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
          <Logo size={36} />
          <span style={{ fontSize:"14px", fontWeight:"600", color:"#374151" }}>VetMD</span>
        </div>

        <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:urgencyConfig.bg, border:`1px solid ${urgencyConfig.border}`, borderRadius:"999px", padding:"4px 12px", marginBottom:"12px" }}>
          <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:urgencyConfig.color }} />
          <span style={{ fontSize:"12px", fontWeight:"700", color:urgencyConfig.color }}>{urgencyConfig.label}</span>
        </div>

        <div style={{ fontSize:"14px", lineHeight:1.8, color:"#1f2937", marginBottom:"16px" }}>
          <CitedText text={data.summary} papers={papers} />
        </div>

        {data.prognosis && <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"8px", padding:"10px 14px", marginBottom:"14px", fontSize:"13px", color:"#166534" }}>📈 <strong>Prognosis:</strong> {data.prognosis}</div>}
        {data.species_note && <div style={{ fontSize:"13px", color:"#6b7280", fontStyle:"italic", marginBottom:"14px" }}>🐾 {data.species_note}</div>}

        {data.next_steps?.length > 0 && (
          <div style={{ marginBottom:"14px" }}>
            <div style={{ fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.07em", color:"#9ca3af", marginBottom:"8px" }}>What to do</div>
            {data.next_steps.map((s,i) => (
              <div key={i} style={{ display:"flex", gap:"10px", padding:"6px 0", borderBottom:"1px solid #f3f4f6" }}>
                <span style={{ width:"20px", height:"20px", background:"#0f4c81", color:"#fff", borderRadius:"50%", fontSize:"11px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
                <span style={{ fontSize:"13px", color:"#374151", lineHeight:1.6 }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {data.red_flags?.length > 0 && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderLeft:"3px solid #dc2626", borderRadius:"8px", padding:"12px 14px", marginBottom:"14px" }}>
            <div style={{ fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.06em", color:"#dc2626", marginBottom:"6px" }}>⚠️ Seek Urgent Care If:</div>
            {data.red_flags.map((f,i) => <div key={i} style={{ fontSize:"13px", color:"#991b1b", padding:"1px 0" }}>• {f}</div>)}
          </div>
        )}

        {data.differentials?.length > 0 && (
          <div style={{ marginBottom:"14px" }}>
            <div style={{ fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.07em", color:"#9ca3af", marginBottom:"8px" }}>Differential Diagnoses</div>
            {data.differentials.map((d,i) => (
              <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start", padding:"7px 0", borderBottom:"1px solid #f3f4f6" }}>
                <Badge text={d.likelihood} color={LIKELIHOOD_COLOR[d.likelihood]||"#6b7280"} />
                <div>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"#111827" }}>{d.name}</div>
                  <div style={{ fontSize:"12px", color:"#6b7280" }}><CitedText text={d.reason} papers={papers} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(data.diagnostics?.length > 0 || data.treatment?.immediate?.length > 0 || data.treatment?.ongoing?.length > 0) && (
          <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"14px" }}>
            {data.diagnostics?.length > 0 && (
              <div>
                <div style={{ fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.07em", color:"#9ca3af", marginBottom:"6px" }}>Diagnostics</div>
                {data.diagnostics.map((d,i) => (
                  <div key={i} style={{ fontSize:"13px", color:"#374151", padding:"3px 0", display:"flex", gap:"6px" }}>
                    <span style={{ color:"#0f4c81" }}>›</span><CitedText text={d} papers={papers} />
                  </div>
                ))}
              </div>
            )}
            <div>
              {data.treatment?.immediate?.length > 0 && (
                <div style={{ marginBottom:"10px" }}>
                  <div style={{ fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.07em", color:"#9ca3af", marginBottom:"6px" }}>Immediate</div>
                  {data.treatment.immediate.map((t,i) => (
                    <div key={i} style={{ fontSize:"13px", color:"#374151", padding:"3px 0", display:"flex", gap:"6px" }}>
                      <span style={{ color:"#d97706" }}>›</span><CitedText text={t} papers={papers} />
                    </div>
                  ))}
                </div>
              )}
              {data.treatment?.ongoing?.length > 0 && (
                <div>
                  <div style={{ fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.07em", color:"#9ca3af", marginBottom:"6px" }}>Ongoing</div>
                  {data.treatment.ongoing.map((t,i) => (
                    <div key={i} style={{ fontSize:"13px", color:"#374151", padding:"3px 0", display:"flex", gap:"6px" }}>
                      <span style={{ color:"#16a34a" }}>›</span><CitedText text={t} papers={papers} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {data.drug_dosing?.length > 0 && (
          <div style={{ marginBottom:"14px" }}>
            <div style={{ fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.07em", color:"#9ca3af", marginBottom:"8px" }}>Drug Dosing</div>
            {data.drug_dosing.map((d,i) => (
              <div key={i} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"10px 12px", marginBottom:"6px" }}>
                <div style={{ fontSize:"13px", fontWeight:"700", color:"#111827", marginBottom:"5px" }}>{d.drug}</div>
                <div style={{ display:"grid", gridTemplateColumns:"70px 1fr", gap:"2px 8px", fontSize:"12px" }}>
                  <span style={{ color:"#9ca3af", fontWeight:"600", fontSize:"10px", textTransform:"uppercase" }}>Dose</span><span style={{ color:"#374151" }}>{d.dose}</span>
                  <span style={{ color:"#9ca3af", fontWeight:"600", fontSize:"10px", textTransform:"uppercase" }}>Route</span><span style={{ color:"#374151" }}>{d.route}</span>
                  {d.frequency && <><span style={{ color:"#9ca3af", fontWeight:"600", fontSize:"10px", textTransform:"uppercase" }}>Freq.</span><span style={{ color:"#374151" }}>{d.frequency}</span></>}
                  {d.notes && <><span style={{ color:"#9ca3af", fontWeight:"600", fontSize:"10px", textTransform:"uppercase" }}>Notes</span><span style={{ color:"#d97706" }}>{d.notes}</span></>}
                </div>
              </div>
            ))}
          </div>
        )}

        {papers.length > 0 && (
          <div style={{ marginBottom:"10px" }}>
            <button onClick={() => setShowSources(s => !s)}
              style={{ background:"none", border:"1px solid #e5e7eb", borderRadius:"6px", padding:"6px 12px", fontSize:"12px", color:"#6b7280", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:"6px" }}>
              📚 {showSources ? "Hide" : "Show"} {papers.length} sources {showSources ? "▲" : "▼"}
            </button>
            {showSources && <div style={{ marginTop:"10px" }}>{papers.map((p,i) => <SourceCard key={i} paper={p} index={i} highlighted={false} />)}</div>}
          </div>
        )}

        <div style={{ fontSize:"10px", color:"#d1d5db", marginTop:"8px" }}>
          VetMD is a research tool designed for licensed veterinarians and veterinary professionals. It generates AI-assisted, evidence-based content and citations. It is not veterinary medical advice, diagnosis, or treatment, and it does not replace independent professional judgment or primary-source verification.
        </div>
      </div>
    </div>
  );
}

function groupByDate(chats) {
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const groups = { "Today": [], "Yesterday": [], "Previous 7 Days": [], "Older": [] };
  chats.forEach(chat => {
    const d = new Date(chat.createdAt);
    if (d.toDateString() === today.toDateString()) groups["Today"].push(chat);
    else if (d.toDateString() === yesterday.toDateString()) groups["Yesterday"].push(chat);
    else if ((today - d) / 86400000 <= 7) groups["Previous 7 Days"].push(chat);
    else groups["Older"].push(chat);
  });
  return groups;
}

const SUGGESTIONS = [
  "Canine hematemesis — differential diagnosis",
  "Feline hepatic lipidosis management",
  "Amoxicillin dosing 10kg dog",
  "Rabbit GI stasis treatment protocol",
  "Equine colic — triage and workup",
  "Feline hyperthyroidism treatment options",
  "Canine parvovirus supportive care",
  "Meloxicam safety in cats",
];

export default function AppPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  const [query, setQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
    link.type = "image/svg+xml"; link.rel = "icon";
    link.href = `data:image/svg+xml,${LOGO_SVG}`;
    document.head.appendChild(link);
    if (window.innerWidth > 768) setSidebarOpen(true);
  }, []);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [chats, loading]);

  // Show loading while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc" }}>
        <div style={{ width:"30px", height:"30px", border:"3px solid #e5e7eb", borderTop:"3px solid #0f4c81", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const activeChat = chats.find(c => c.id === activeChatId);

  async function send() {
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    setQuery(""); setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ask", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const message = { query: trimmed, result: data, papers: data.papers || [] };
      if (activeChatId) {
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages:[...c.messages, message] } : c));
      } else {
        const id = Date.now().toString();
        setChats(prev => [{ id, title: trimmed.slice(0,50), createdAt: new Date().toISOString(), messages:[message] }, ...prev]);
        setActiveChatId(id);
      }
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const grouped = groupByDate(chats);
  const urgencyDot = { emergency:"#dc2626", "vet-soon":"#d97706", monitor:"#ca8a04", ok:"#16a34a" };

  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"'Instrument Sans','Helvetica Neue',sans-serif", color:"#111827", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}::placeholder{color:#9ca3af}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes logospin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}
        .chip:hover{background:#eff6ff!important;border-color:#bfdbfe!important;color:#1d4ed8!important}
        .go:hover{background:#0d3d6b!important}
        .hist:hover{background:#f3f4f6!important}
        .new-chat:hover{background:#e5e7eb!important}
        textarea{resize:none}
        @media(max-width:768px){
          .sidebar{width:260px!important}
          .main-content{margin-left:0!important}
          .input-bar{left:0!important}
          .two-col{grid-template-columns:1fr!important}
          .sidebar-overlay{display:block!important}
          .msg-padding{padding:20px 14px!important}
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar" style={{ width: sidebarOpen?"260px":"0px", minHeight:"100vh", background:"#f9fafb", borderRight: sidebarOpen?"1px solid #e5e7eb":"none", display:"flex", flexDirection:"column", flexShrink:0, position:"fixed", top:0, left:0, bottom:0, zIndex:20, overflow:"hidden", transition:"width 0.25s ease" }}>
        <div style={{ padding:"16px", display:"flex", alignItems:"center", gap:"8px" }}>
          <Logo size={28} />
          <div>
            <div style={{ fontSize:"15px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em" }}>VetMD</div>
            <div style={{ fontSize:"10px", color:"#9ca3af" }}>Evidence-Based AI</div>
          </div>
        </div>
        <div style={{ padding:"0 12px 12px" }}>
          <button className="new-chat" onClick={() => { setActiveChatId(null); setQuery(""); setError(null); }}
            style={{ width:"100%", background:"#fff", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"8px 12px", fontSize:"13px", fontWeight:"600", color:"#374151", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:"6px", transition:"background 0.15s" }}>
            <span style={{ fontSize:"16px" }}>＋</span> New Chat
          </button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 8px" }}>
          {chats.length === 0 ? (
            <div style={{ padding:"20px 8px", fontSize:"12px", color:"#9ca3af", textAlign:"center", lineHeight:1.7 }}>Your conversations<br/>will appear here</div>
          ) : (
            Object.entries(grouped).map(([group, items]) => items.length === 0 ? null : (
              <div key={group}>
                <div style={{ fontSize:"10px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9ca3af", padding:"10px 8px 4px" }}>{group}</div>
                {items.map(chat => (
                  <button key={chat.id} className="hist" onClick={() => setActiveChatId(chat.id)}
                    style={{ width:"100%", background: activeChatId===chat.id?"#e5e7eb":"transparent", border:"none", borderRadius:"8px", padding:"8px 10px", cursor:"pointer", fontFamily:"inherit", textAlign:"left", marginBottom:"2px", transition:"background 0.15s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <span style={{ width:"7px", height:"7px", borderRadius:"50%", background: urgencyDot[chat.messages[0]?.result?.urgency]||"#9ca3af", flexShrink:0 }} />
                      <span style={{ fontSize:"13px", fontWeight: activeChatId===chat.id?"600":"400", color: activeChatId===chat.id?"#111827":"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{chat.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
        <div style={{ padding:"12px 16px", borderTop:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:"10px", color:"#9ca3af" }}>For licensed veterinary professionals</div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}
          style={{ display:"none", position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:15 }} />
      )}

      {/* Main */}
      <div className="main-content" style={{ flex:1, marginLeft: sidebarOpen?"260px":"0px", display:"flex", flexDirection:"column", minHeight:"100vh", transition:"margin-left 0.25s ease" }}>

        {/* Top bar */}
        <div style={{ position:"sticky", top:0, zIndex:5, background:"#fff", borderBottom:"1px solid #f3f4f6", padding:"10px 16px", display:"flex", alignItems:"center", gap:"8px" }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background:"transparent", border:"1px solid #e5e7eb", borderRadius:"6px", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#6b7280", flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontSize:"13px", color:"#9ca3af" }}>VetMD</span>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"10px" }}>
            {user && <span style={{ fontSize:"13px", color:"#374151", fontWeight:"500" }}>Hi, {user.firstName || user.emailAddresses?.[0]?.emailAddress}</span>}
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox:{ width:"30px", height:"30px" } } }} />
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 0 120px" }}>
          <div className="msg-padding" style={{ maxWidth:"680px", margin:"0 auto", padding:"24px 16px" }}>

            {!activeChat && !loading && (
              <div style={{ animation:"fadeUp 0.4s ease" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:"20px" }}><Logo size={48} /></div>
                <h1 style={{ fontSize:"24px", fontWeight:"700", color:"#111827", textAlign:"center", letterSpacing:"-0.02em", margin:"0 0 8px" }}>How can I help you today?</h1>
                <p style={{ color:"#6b7280", fontSize:"14px", textAlign:"center", margin:"0 0 24px" }}>Search peer-reviewed veterinary literature for evidence-based clinical answers</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center", marginBottom:"24px" }}>
                  {SUGGESTIONS.map((s,i) => (
                    <button key={i} className="chip" onClick={() => { setQuery(s); setTimeout(() => inputRef.current?.focus(), 0); }}
                      style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"999px", color:"#374151", fontSize:"12px", padding:"6px 14px", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                      {s}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize:"10px", color:"#9ca3af", textAlign:"center", lineHeight:1.6 }}>
                  VetMD is a research tool designed for licensed veterinarians and veterinary professionals. It generates AI-assisted, evidence-based content and citations. It is not veterinary medical advice, diagnosis, or treatment, and it does not replace independent professional judgment or primary-source verification.
                </p>
              </div>
            )}

            {activeChat && activeChat.messages.map((msg, i) => (
              <div key={i} style={{ animation:"fadeUp 0.3s ease" }}>
                <Answer data={{ ...msg.result, query: msg.query }} papers={msg.papers} />
              </div>
            ))}

            {loading && (
              <div style={{ marginBottom:"24px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
                  <div style={{ animation:"logospin 1.2s linear infinite", display:"flex" }}><Logo size={36} /></div>
                  <span style={{ fontSize:"14px", fontWeight:"600", color:"#374151" }}>VetMD</span>
                </div>
                <div style={{ display:"flex", gap:"4px" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#d1d5db", animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}

            {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"8px", padding:"12px 16px", color:"#991b1b", fontSize:"13px", marginBottom:"16px" }}><strong>Error:</strong> {error}</div>}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="input-bar" style={{ position:"fixed", bottom:0, left: sidebarOpen?"260px":"0px", right:0, background:"#fff", borderTop:"1px solid #e5e7eb", padding:"12px 16px", transition:"left 0.25s ease", zIndex:10 }}>
          <div style={{ maxWidth:"680px", margin:"0 auto" }}>
            <div style={{ display:"flex", gap:"8px", background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:"12px", padding:"10px 12px", alignItems:"flex-end" }}>
              <textarea ref={inputRef} value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
                placeholder="Ask a clinical question... (Enter to send)"
                rows={1}
                style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:"14px", color:"#111827", fontFamily:"inherit", lineHeight:1.5, maxHeight:"120px", overflowY:"auto" }}
                onInput={e => { e.target.style.height="auto"; e.target.style.height=e.target.scrollHeight+"px"; }}
              />
              <button className="go" onClick={send} disabled={loading}
                style={{ background: loading?"#9ca3af":"#0f4c81", color:"#fff", border:"none", borderRadius:"8px", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", cursor: loading?"not-allowed":"pointer", flexShrink:0, transition:"background 0.15s" }}>
                {loading
                  ? <div style={{ width:"14px", height:"14px", border:"2px solid #fff", borderTop:"2px solid transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
                }
              </button>
            </div>
            <div style={{ fontSize:"10px", color:"#d1d5db", textAlign:"center", marginTop:"4px" }}>VetMD is a research tool designed for licensed veterinarians and veterinary professionals. It generates AI-assisted, evidence-based content and citations. It is not veterinary medical advice, diagnosis, or treatment, and it does not replace independent professional judgment or primary-source verification.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
