# Ordpar AI Service (Railway)

Dedikerad AI-generering service för Ordpar. Körs på Railway.app för att undvika Vercels 10s timeout.

## Deployment till Railway

### 1. Skapa Railway projekt

1. Gå till https://railway.app
2. Logga in med GitHub
3. Klicka "New Project" → "Deploy from GitHub repo"
4. Välj **weekend68/ordpar**
5. Railway kommer auto-detecta Node.js

### 2. Konfigurera Root Directory

Railway måste veta att bygga från `/railway`:

1. I Railway project settings → **Settings**
2. **Root Directory:** `/railway`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`

### 3. Sätt Environment Variables

I Railway project → **Variables** tab:

```
SUPABASE_URL=https://lboblynzenqucobukauj.supabase.co
SUPABASE_SERVICE_KEY=[din-service-role-key]
ANTHROPIC_API_KEY=[din-claude-api-key]
```

### 4. Deploy

- Railway deployar automatiskt vid push till `main`
- Första deployen tar ~2-3 minuter

### 5. Hämta URL

Efter deployment:
1. Gå till **Settings** → **Networking**
2. Klicka "Generate Domain"
3. Kopiera din URL (t.ex. `ordpar-ai.railway.app`)

### 6. Uppdatera Vercel

I Vercel project → **Settings** → **Environment Variables**:

```
RAILWAY_AI_URL=https://ordpar-ai.railway.app
```

Redeploya Vercel.

## Testa

```bash
curl https://ordpar-ai.railway.app/health

# Generera word set (kan ta 30-60s, inget problem!)
curl -X POST https://ordpar-ai.railway.app/generate \
  -H "Content-Type: application/json" \
  -d '{"difficulty_level": "MEDEL"}'
```

## Arkitektur

```
User → Vercel (frontend + API)
         ↓
       Kolla cache (Supabase)
         ↓ (om tom)
       Railway AI Service (AI-generering, ingen timeout)
         ↓
       Spara till Supabase
         ↓
       Returnera till Vercel → User
```

## Kostnader

Railway Free Tier:
- $5 gratis credits/månad
- ~500 hours/månad
- Mer än tillräckligt för detta projekt

## Lokal Development

```bash
cd railway
npm install
npm run dev
```

Servern körs på http://localhost:3002
