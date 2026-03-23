export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { query, papers } = req.body;

  if (!query) return res.status(400).json({ error: "No query provided" });

  const lit = papers?.length
    ? papers.map((p, i) => `[${i + 1}] ${p.author} (${p.year}) — ${p.title}\n${p.abstract}`).join("\n\n")
    : "No papers retrieved. Use veterinary knowledge.";

  const systemPrompt = `You are VetMD AI, a veterinary clinical tool used by both pet owners and veterinary professionals.

Literature:
${lit}

Respond ONLY with raw JSON (no markdown, no fences):
{
  "urgency": "emergency|vet-soon|monitor|ok",
  "urgency_reason": "One sentence why.",
  "owner_summary": "2-3 plain English sentences a worried pet owner can understand. No jargon. Reassuring but honest.",
  "owner_next_steps": ["Simple action step for owner", "Another step"],
  "vet_summary": "2-3 clinical sentences with citations [1] for veterinary professionals.",
  "differentials": [{"name": "Condition", "likelihood": "High|Moderate|Low", "reason": "Brief clinical reason [1]"}],
  "diagnostics": ["CBC/biochem panel", "Abdominal radiographs"],
  "treatment": {"immediate": ["IV fluids [1]"], "ongoing": ["Gastroprotectants"]},
  "drug_dosing": [{"drug": "Name", "dose": "X mg/kg", "route": "PO/IV/SC/IM", "frequency": "SID/BID/TID", "notes": "Warnings"}],
  "red_flags": ["Sign requiring emergency care"],
  "prognosis": "One sentence or null",
  "species_note": "Breed/species note or null",
  "disclaimer": "This tool supports clinical reasoning and is not a substitute for professional veterinary advice."
}

urgency must be exactly one of: emergency, vet-soon, monitor, ok.`;

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

    const text = data.content?.map((i) => i.text || "").join("") || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1) return res.status(500).json({ error: "No JSON in response" });

    const parsed = JSON.parse(text.slice(start, end + 1));
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
