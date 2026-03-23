# VetMD AI 🐾

Veterinary triage tool with dual Pet Owner / Vet mode, powered by Claude AI and live PubMed research.

---

## Deploy to Vercel (free, ~10 minutes)

### Step 1 — Create a GitHub repo
1. Go to github.com and sign up/log in
2. Click "New repository", name it `vetmd-ai`, click Create
3. Upload all these files by dragging them into the repo

### Step 2 — Deploy on Vercel
1. Go to vercel.com and sign up with your GitHub account
2. Click "Add New Project"
3. Select your `vetmd-ai` repo
4. Click Deploy — Vercel auto-detects Next.js

### Step 3 — Add your API key
1. In Vercel, go to your project → Settings → Environment Variables
2. Add a new variable:
   - Name:  ANTHROPIC_API_KEY
   - Value: your key from console.anthropic.com
3. Click Save, then go to Deployments → Redeploy

### Step 4 — Share!
Your app is live at something like `vetmd-ai.vercel.app`
Share that URL with anyone — no API key needed for them.

---

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000

You'll need a `.env.local` file with:
```
ANTHROPIC_API_KEY=your-key-here
```

---

## Project structure

```
vetmd/
├── pages/
│   ├── index.js        # Main app UI
│   ├── _app.js         # App wrapper + fonts
│   └── api/
│       └── ask.js      # Backend API route (keeps key secret)
├── styles/
│   └── globals.css     # Global styles
├── package.json
└── next.config.js
```
