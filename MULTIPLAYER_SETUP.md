# Multiplayer Setup Instructions

## ✅ Implementation Complete

All code has been implemented for real-time multiplayer functionality using Supabase Realtime.

## 🔧 Setup Steps

### 1. Run Database Migration

**IMPORTANT:** You need to run the migration to create the `game_sessions` table and functions.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `lboblynzenqucobukauj`
3. Navigate to: **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of `/backend/supabase/migrations/004_multiplayer_sessions.sql`
6. Paste and click **Run**

You should see: `Success. No rows returned`

### 2. Verify Migration

Test that the migration worked:

```sql
-- Test 1: Check table exists
SELECT * FROM game_sessions LIMIT 1;

-- Test 2: Generate a session code
SELECT generate_session_code();
```

## 🎮 Testing Multiplayer

### Quick Test (Two Browser Windows)

1. **Player 1 (Window 1):**
   - Open `http://localhost:5173/multiplayer`
   - Click "Skapa multiplayer-spel"
   - Copy the 6-character code (e.g., `XJ4K9P`)
   - Click "Gå till spelet"
   - You should see "Väntar på motspelare..."

2. **Player 2 (Window 2 - Incognito/Different Browser):**
   - Open `http://localhost:5173/multiplayer`
   - Click "Joina spel med kod"
   - Enter the code from Player 1
   - Click "Joina spel"
   - Game should start for both players!

3. **Play Together:**
   - Player 1 clicks a word → Player 2 sees it instantly
   - Turn switches after selecting 1, 2, or 3 words
   - Current player clicks 4th word and can guess
   - Win together when all 4 groups found!

### Verification Checklist

- [ ] Can create a game and get a session code
- [ ] Code is displayed clearly (6 characters)
- [ ] Can join game with code
- [ ] Both players see "Båda anslutna ✓"
- [ ] Turn indicator shows whose turn it is
- [ ] Word selection syncs in real-time
- [ ] Can only click on your turn
- [ ] Guessing works and syncs
- [ ] Win modal appears for both players
- [ ] Browser refresh keeps you in game

## 🏗️ Architecture Overview

### Files Created

1. **Database:**
   - `backend/supabase/migrations/004_multiplayer_sessions.sql` - Game sessions table + RPC functions

2. **Frontend Infrastructure:**
   - `src/lib/supabase.ts` - Supabase client with Realtime config
   - `src/router.tsx` - React Router setup
   - Updated: `src/main.tsx` - Use RouterProvider

3. **Multiplayer Logic:**
   - `src/hooks/useMultiplayerGameState.ts` - Core multiplayer hook with Realtime sync
   - Updated: `src/types.ts` - Added MultiplayerGameState interface

4. **UI Components:**
   - `src/pages/GameLobby.tsx` - Create/join lobby
   - `src/pages/MultiplayerGame.tsx` - Multiplayer game container

### How It Works

```
Player 1 Action:
1. Click word → Update local state (optimistic)
2. Update Supabase game_sessions row
3. Supabase sends Realtime broadcast

Player 2:
4. Receives Realtime update
5. Syncs local state → UI updates
6. Sees same game state
```

## 🔍 Troubleshooting

### Migration Fails
- Make sure you're using the SERVICE_KEY, not ANON key
- Check that word_sets and users tables exist
- Run statements one at a time if needed

### Realtime Not Working
- Check browser console for errors
- Verify VITE_SUPABASE_ANON_KEY is set in `.env`
- Restart dev server after .env changes
- Check RLS policies allow SELECT/UPDATE

### Session Code Not Found
- Verify migration created `generate_session_code()` function
- Check game_sessions table exists
- Test function: `SELECT generate_session_code();`

### Words Not Syncing
- Check browser console for Realtime subscription status
- Verify both players on same session code
- Check last_activity timestamp updates

## 🚀 Next Steps (Optional Enhancements)

1. **Authentication:**
   - Add Supabase Auth
   - Track player profiles
   - Match history

2. **Chat:**
   - Real-time chat using Broadcast channels
   - Emoji reactions

3. **Rematch:**
   - Quick rematch button
   - Same players, new word set

4. **Spectator Mode:**
   - Watch live games
   - Share spectator links

## 📱 Deployment

The app is already configured for Vercel deployment:
- Frontend environment variables configured
- API routes work with serverless functions
- Supabase connection is cloud-based

Just push to Git and Vercel will auto-deploy!

## 🐛 Known Issues / Edge Cases Handled

- ✅ Simultaneous clicks: Optimistic UI + server authority
- ✅ Mid-game disconnect: last_activity tracking + 30s timeout
- ✅ Browser refresh: Session state persists in URL
- ✅ Code collisions: UNIQUE constraint + retry logic
- ✅ Echo updates: isUpdatingRef prevents local echo
