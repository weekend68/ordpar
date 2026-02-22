# Ordspel

En svensk, kooperativ ordgissningslek för två spelare – inspirerad av
NY Times Connections och DN:s "Dagens fyra".

## Om spelet

16 ord visas på skärmen, uppdelade i 4 hemliga grupper om 4 ord vardera.
Spelarna turas om att välja ord – när 4 ord är markerade kan de gissa om
det är en grupp. Rätt: gruppen klarmarkeras. Fel: orden skakar och turen
byter spelare. Målet är att hitta alla fyra grupper tillsammans.

## Status & ordmaterial

- Spelet använder för tillfället ordgrupper lånade från Dagens Nyheter (DN)
  enbart i **testsyfte**. Dessa måste bytas ut innan ett eventuellt riktigt
  lansering.
- Koden innehåller ett färdigt AI-genereringssystem (Claude) avsett att
  ersätta det statiska ordmaterialet – men det är inte aktivt just nu.
  Se `api/_lib/services/ai/` för implementationen.

## Teknisk stack

| Del | Teknik |
|-----|--------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| API | Vercel Serverless Functions (TypeScript) |
| Databas & realtid | Supabase (PostgreSQL + Realtime) |
| Hosting | Vercel |

## Lokal utveckling

### Förutsättningar

- Node.js 18+
- Ett Supabase-projekt med korrekt schema (se `backend/supabase/migrations/`)
- Vercel CLI (`npm i -g vercel`) för att köra API-funktionerna lokalt

### Starta

```bash
npm install
vercel dev
```

`vercel dev` startar både frontend (port 5173) och API-funktionerna under `/api`.

### Environment variables

Skapa en `.env.local`-fil i projektroten:

```
VITE_SUPABASE_URL=din_supabase_url
VITE_SUPABASE_ANON_KEY=din_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=din_service_role_key
ANTHROPIC_API_KEY=din_api_key   # Krävs bara om AI-generering aktiveras
```
