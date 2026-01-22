# Ordpar - Kooperativt Ordspel

Ett svenskt kooperativt ordspel där två spelare tillsammans försöker hitta fyra grupper med fyra ord vardera från en pool av 16 ord. Spelet använder AI (Claude) för att generera nya ordgrupper.

## Teknisk Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Databas:** PostgreSQL (Supabase)
- **AI:** Anthropic Claude API (Sonnet 4)
- **Hosting:** Vercel

## Spelmekanik

- 16 ord totalt, uppdelade i 4 grupper om 4 ord
- Alla 16 ord visas från start
- Spelarna turas om att klicka på individuella ord
- När 4 ord är valda kan spelarna gissa, passa eller rensa
- Rätt gissning: gruppen flyttas upp och markeras som klar
- Fel gissning: shake-animation
- Vinner när alla 4 grupper hittats

## Lokal Development

### Frontend
```bash
npm install
npm run dev
```
Frontend körs på http://localhost:5173

### Backend
```bash
cd backend
npm install
npm run dev
```
Backend körs på http://localhost:3001

### Environment Variables

Backend kräver `.env` fil:
```bash
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
ANTHROPIC_API_KEY=your_api_key
```

## Deployment

### Vercel (Frontend + Backend)
1. Pusha till GitHub
2. Importera projektet i Vercel
3. Sätt environment variables
4. Deploy

## Databasschema

Se `backend/supabase/migrations/001_initial_schema.sql` för fullständigt schema.

Huvudtabeller:
- `users` - Spelare
- `pairs` - Spelpar
- `games` - Spelhistorik
- `word_sets` - AI-genererade ordset
- `bad_groups` - Negativ träningsdata för AI

## API Endpoints

```
POST /api/wordsets/generate       → Generera nytt ordset
POST /api/pairs/create            → Skapa spelpar
POST /api/games/create            → Starta nytt spel
POST /api/games/:id/move          → Uppdatera moves
POST /api/games/:id/complete      → Avsluta spel
POST /api/games/:id/feedback      → Spara feedback
GET  /api/games/pair/:pairId      → Hämta parets historik
```

## License

MIT
