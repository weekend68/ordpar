# Supabase Setup Guide

## Steg 1: Skapa Supabase-projekt

1. Gå till https://supabase.com
2. Logga in eller skapa konto
3. Klicka "New Project"
4. Fyll i:
   - **Project name:** ordpar (eller valfritt namn)
   - **Database password:** [välj starkt lösenord]
   - **Region:** Europe North (Stockholm) eller Central EU
5. Klicka "Create new project"
6. Vänta ~2 minuter medan projektet startas

## Steg 2: Hämta credentials

1. När projektet är klart, gå till **Settings** → **API**
2. Kopiera dessa värden:
   - **URL:** `https://[ditt-projekt-id].supabase.co`
   - **anon public key:** (använd INTE denna i backend)
   - **service_role key:** (secret) - DENNA ska du använda i backend

## Steg 3: Uppdatera .env

Öppna `/Users/jomo/code/ordspel/backend/.env` och ersätt:

```bash
SUPABASE_URL=https://[ditt-projekt-id].supabase.co
SUPABASE_SERVICE_KEY=[din-service-role-key-här]
```

**VIKTIGT:** Använd `service_role` key, INTE `anon` key. Service role behövs för att:
- Skapa word_sets (bara backend får göra detta)
- Bypassa RLS när det behövs

## Steg 4: Kör migration

Två alternativ:

### Alternativ A: Via Supabase Dashboard (enklast)
1. Gå till **SQL Editor** i Supabase dashboard
2. Klicka "New query"
3. Kopiera innehållet från `backend/supabase/migrations/001_initial_schema.sql`
4. Klistra in och klicka "Run"

### Alternativ B: Via Supabase CLI
```bash
# Installera Supabase CLI
brew install supabase/tap/supabase

# Logga in
supabase login

# Länka till projektet
supabase link --project-ref [ditt-projekt-id]

# Kör migration
supabase db push
```

## Steg 5: Verifiera

Efter migration, kolla att tabellerna finns:

1. Gå till **Table Editor** i Supabase dashboard
2. Du ska se dessa tabeller:
   - `users`
   - `pairs`
   - `games`
   - `word_sets`
   - `bad_groups`

## Steg 6: Testa backend-integration

Starta backend (om den inte redan kör):
```bash
cd /Users/jomo/code/ordspel/backend
npm run dev
```

Backenden kommer nu använda Supabase för persistent data.

## Nästa steg: Implementera backend Supabase-integration

Se `backend/src/services/supabase/` för integration med databasen.

---

## Troubleshooting

### "relation 'users' already exists"
- Tabellen finns redan - skippa migration eller dropp tabeller först

### "Invalid API key"
- Dubbelkolla att du använder **service_role** key, inte anon key
- Kolla att .env-filen laddas korrekt (inga mellanslag runt `=`)

### RLS-policies blockerar queries
- Service role key bypassar RLS automatiskt
- Om du får access denied, kolla att SUPABASE_SERVICE_KEY används
