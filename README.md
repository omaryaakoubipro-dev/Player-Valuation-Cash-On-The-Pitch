# Player Valuator — Cash On The Pitch

> AI-powered football player market valuation. Search any professional player, get a detailed position-aware valuation with comparable transfers, radar charts, and plain-language analysis.

Built with **Next.js 15**, **Tailwind CSS v4**, **Recharts**, **API-Football**, and **Claude AI (Anthropic)**.

---

## Features

- **Search any player** — 300,000+ players from 1,000+ leagues via API-Football
- **Position-aware analysis** — Defenders are judged on defending, forwards on scoring. The AI uses different metric weights per position.
- **Full valuation breakdown** — Market value range, 6 weighted factors, radar chart, comparable transfers
- **Optional inputs** — Add salary & contract years for higher-precision valuations
- **Bloomberg-terminal aesthetic** — Dark/light mode, clean data-first design
- **Animated loading states** — Cycling scouting messages during fetch/analysis

---

## Architecture

```
app/
├── api/
│   ├── search/route.ts           ← GET /api/search?q=  (player search)
│   ├── player/[id]/route.ts      ← GET /api/player/:id (full stats)
│   └── valuation/route.ts        ← POST /api/valuation (Claude analysis)
├── components/
│   ├── SearchBar.tsx             ← Debounced search with dropdown
│   ├── PlayerCard.tsx            ← Photo, club badge, position-specific stats
│   ├── PlayerRadarChart.tsx      ← Recharts radar: player vs league average
│   ├── ValuationFactorsChart.tsx ← Horizontal bar chart with weights
│   ├── ValuationResult.tsx       ← Full result layout
│   ├── OptionalInputs.tsx        ← Salary & contract fields
│   ├── LoadingState.tsx          ← Animated scouting messages
│   └── ThemeToggle.tsx
├── lib/
│   ├── api-football.ts           ← API-Football REST client
│   ├── claude.ts                 ← Anthropic client + position-aware prompts
│   └── types.ts                  ← TypeScript interfaces
├── globals.css                   ← CSS design tokens + animations
├── layout.tsx                    ← Header + footer shell
└── page.tsx                      ← Main page (state machine)
```

---

## Setup

### 1. Clone & install

```bash
git clone <repo>
cd player-valuation-cash-on-the-pitch
npm install
```

### 2. Configure API keys

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...
API_FOOTBALL_KEY=your_api_sports_key
```

#### Getting API keys

| Service | URL | Free tier |
|---------|-----|-----------|
| Anthropic (Claude) | https://console.anthropic.com/ | Pay-per-use, ~$0.003/valuation |
| API-Football (direct) | https://dashboard.api-football.com/ | 100 req/day free |
| API-Football (RapidAPI) | https://rapidapi.com/api-sports/api/api-football | 100 req/day free |

Use **either** `API_FOOTBALL_KEY` (direct) **or** `RAPIDAPI_KEY` (RapidAPI).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

```bash
npx vercel deploy
```

Add environment variables in the Vercel dashboard under **Settings → Environment Variables**:

- `ANTHROPIC_API_KEY`
- `API_FOOTBALL_KEY` (or `RAPIDAPI_KEY`)

---

## How the Valuation Works

### Data flow

1. User types a name → `/api/search` calls API-Football search endpoint
2. User selects a player → `/api/player/:id` fetches full season stats
3. (Optional) User adds salary/contract → stored in state
4. Submit → `/api/valuation` sends all data to Claude

### Position-specific metrics

| Position | Primary metrics |
|----------|----------------|
| **Forward** | Goals, xG, shots on target, dribbles, conversion rate |
| **Midfielder** | Key passes, progressive passes, assists, interceptions, pass accuracy |
| **Defender** | Tackles, interceptions, aerial duels, blocks, pass accuracy |
| **Goalkeeper** | Saves, save %, clean sheets, goals prevented vs xGA, distribution |

### Valuation factors (weights sum to 100)

1. **Age Curve** — Peak age is 23–29; steep depreciation after 32
2. **Performance Level** — Position-aware stats normalized to league average
3. **Contract Situation** — Expiring contracts reduce leverage; long contracts add value
4. **League Level** — Tier-1 leagues command premium multipliers
5. **Profile Rarity** — Unique skill combinations are scarcer
6. **Marketability** — Nationality, global profile, social reach

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | lucide-react |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Football data | API-Football v3 |
| Deployment | Vercel |

---

## License

MIT
