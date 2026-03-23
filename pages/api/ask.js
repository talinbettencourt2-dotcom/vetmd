// ─── Source fetchers ─────────────────────────────────────────────────

async function fetchPubMed(query) {
  try {
    const searchRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query + " veterinary")}&retmax=4&retmode=json&sort=relevance`
    );
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];
    if (!ids.length) return [];

    const sumRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`
    );
    const sumData = await sumRes.json();
    const result = sumData.result || {};

    const papers = ids.map(pmid => {
      const doc = result[pmid];
      if (!doc || doc.error) return null;
      const authors = doc.authors || [];
      const author = authors.length > 1 ? `${authors[0].name} et al.` : authors[0]?.name || "";
      return {
        source: "PubMed",
        title: doc.title || "",
        author,
        year: doc.pubdate?.slice(0, 4) || "",
        journal: doc.source || "",
        abstract: `${doc.title}. ${doc.source} (${doc.pubdate?.slice(0, 4)}).`,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        pmid,
      };
    }).filter(p => p && p.title);

    // Try to get abstracts
    try {
      const fetchRes = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.slice(0, 4).join(",")}&retmode=xml&rettype=abstract`
      );
      const xml = await fetchRes.text();
      const abstractMatches = [...xml.matchAll(/<PMID[^>]*>(\d+)<\/PMID>[\s\S]*?<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)];
      abstractMatches.forEach(([, pmid, abstract]) => {
        const paper = papers.find(p => p.pmid === pmid);
        if (paper && abstract.length > 80) paper.abstract = abstract.replace(/<[^>]+>/g, "").slice(0, 500);
      });
    } catch (e) {}

    return papers;
  } catch (e) {
    console.error("PubMed error:", e);
    return [];
  }
}

async function fetchEuropePMC(query) {
  try {
    const res = await fetch(
      `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query + " veterinary")}&format=json&pageSize=4&sort=RELEVANCE&resultType=core`
    );
    const data = await res.json();
    return (data.resultList?.result || []).map(p => ({
      source: "Europe PMC",
      title: p.title || "",
      author: p.authorString ? p.authorString.split(",")[0].trim() + (p.authorString.includes(",") ? " et al." : "") : "",
      year: p.pubYear || "",
      journal: p.journalTitle || "",
      abstract: p.abstractText?.slice(0, 500) || `${p.title}. ${p.journalTitle} (${p.pubYear}).`,
      url: p.doi ? `https://doi.org/${p.doi}` : `https://europepmc.org/article/${p.source}/${p.id}`,
    })).filter(p => p.title);
  } catch (e) {
    console.error("Europe PMC error:", e);
    return [];
  }
}

async function fetchOpenAlex(query) {
  try {
    const res = await fetch(
      `https://api.openalex.org/works?search=${encodeURIComponent(query + " veterinary")}&per-page=4&sort=relevance_score:desc&filter=is_oa:true&mailto=vetmdai@example.com`
    );
    const data = await res.json();
    return (data.results || []).map(p => {
      const authors = p.authorships || [];
      const firstAuthor = authors[0]?.author?.display_name || "";
      const author = authors.length > 1 ? `${firstAuthor} et al.` : firstAuthor;
      return {
        source: "OpenAlex",
        title: p.display_name || p.title || "",
        author,
        year: p.publication_year?.toString() || "",
        journal: p.primary_location?.source?.display_name || "",
        abstract: p.abstract?.slice(0, 500) || `${p.display_name}. ${p.primary_location?.source?.display_name || ""} (${p.publication_year}).`,
        url: p.primary_location?.landing_page_url || p.doi || `https://openalex.org/${p.id}`,
        openAccess: true,
      };
    }).filter(p => p.title);
  } catch (e) {
    console.error("OpenAlex error:", e);
    return [];
  }
}

async function fetchSemanticScholar(query) {
  try {
    const res = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query + " veterinary")}&limit=4&fields=title,authors,year,journal,abstract,externalIds,openAccessPdf,venue`
    );
    const data = await res.json();
    return (data.data || []).map(p => {
      const firstAuthor = p.authors?.[0]?.name || "";
      const author = p.authors?.length > 1 ? `${firstAuthor} et al.` : firstAuthor;
      const doi = p.externalIds?.DOI;
      return {
        source: "Semantic Scholar",
        title: p.title || "",
        author,
        year: p.year?.toString() || "",
        journal: p.venue || p.journal?.name || "",
        abstract: p.abstract?.slice(0, 500) || `${p.title}. ${p.venue} (${p.year}).`,
        url: doi ? `https://doi.org/${doi}` : `https://www.semanticscholar.org/paper/${p.paperId}`,
        openAccess: !!p.openAccessPdf,
      };
    }).filter(p => p.title);
  } catch (e) {
    console.error("Semantic Scholar error:", e);
    return [];
  }
}

// ─── Deduplicate by title similarity ─────────────────────────────────
function deduplicatePapers(papers) {
  const seen = new Set();
  return papers.filter(p => {
    const key = p.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Main handler ─────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "No query provided" });

  // Fetch all sources in parallel
  const [pubmed, europepmc, openalex, semantic] = await Promise.all([
    fetchPubMed(query),
    fetchEuropePMC(query),
    fetchOpenAlex(query),
    fetchSemanticScholar(query),
  ]);

  // Merge and deduplicate, cap at 10
  const allPapers = deduplicatePapers([...pubmed, ...europepmc, ...openalex, ...semantic]).slice(0, 10);

  const lit = allPapers.length
    ? allPapers.map((p, i) =>
        `[${i + 1}] ${p.author} (${p.year}) — ${p.title} [${p.source}]\n${p.abstract}`
      ).join("\n\n")
    : "No papers retrieved. Use veterinary knowledge.";

  const systemPrompt = `You are VetMD AI, a veterinary clinical tool used by both pet owners and veterinary professionals.

The following peer-reviewed sources were retrieved from PubMed, Europe PMC, OpenAlex, and Semantic Scholar. Use them to ground your answer and cite them inline as [1], [2] etc.

LITERATURE:
${lit}

Respond ONLY with raw JSON (no markdown, no fences):
{
  "urgency": "emergency|vet-soon|monitor|ok",
  "urgency_reason": "One sentence why.",
  "owner_summary": "2-3 plain English sentences a worried pet owner can understand. No jargon. Reassuring but honest.",
  "owner_next_steps": ["Simple action step for owner", "Another step"],
  "vet_summary": "2-3 clinical sentences with citations [1] for veterinary professionals.",
  "differentials": [{"name": "Condition", "likelihood": "High|Moderate|Low", "reason": "Brief clinical reason [1]"}],
  "diagnostics": ["CBC/biochem panel [1]", "Abdominal radiographs"],
  "treatment": {"immediate": ["IV fluids [1]"], "ongoing": ["Gastroprotectants [2]"]},
  "drug_dosing": [{"drug": "Name", "dose": "X mg/kg", "route": "PO/IV/SC/IM", "frequency": "SID/BID/TID", "notes": "Warnings"}],
  "red_flags": ["Sign requiring emergency care"],
  "prognosis": "One sentence or null",
  "species_note": "Breed/species note or null",
  "disclaimer": "This tool supports clinical reasoning and is not a substitute for professional veterinary advice."
}

urgency must be exactly one of: emergency, vet-soon, monitor, ok. Always cite sources inline.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: query }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.content?.map(i => i.text || "").join("") || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1) return res.status(500).json({ error: "No JSON in response" });

    const parsed = JSON.parse(text.slice(start, end + 1));

    // Return result AND papers so frontend can show sources
    return res.status(200).json({ ...parsed, papers: allPapers });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
