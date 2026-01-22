# PRD: Samarbetsordspel
**Arbetsnamn:** "Ordpar"  
**Version:** 0.3
**Datum:** 2026-01-22

---

## 1. Produktöversikt

### Vision
Ett snabbt, roligt ordspel för 2 spelare som samarbetar för att hitta ordgrupper. Spelet lär sig er nivå och blir bättre över tid.

### Målgrupp
- Par och vänner som vill spela tillsammans
- Gillar ordspel (Wordfeud, Dagens fyra, Nian)
- Vill ha 5-10 minuters spelomgångar
- Sitter i samma soffa ELLER pratar i telefon

### Kärnvärden
- Roligt och avkopplande (inte stressigt)
- Hjärngympa tillsammans
- Blir aldrig för lätt eller för svårt (adaptive difficulty)
- Bättre ordkvalitet än befintliga spel

---

## 2. Spelmekanik

### Grundkoncept: "Ordmemory"

**Setup:**
- 16 ord totalt, fördelade i 4 grupper om 4 ord
- Spelare A ser 8 av orden
- Spelare B ser 8 av orden
- Ingen överlappning i början

**Spelloop:**
1. Spelare A:s tur → klickar på ett av sina ord → ordet avslöjas för båda
2. Spelare B:s tur → klickar på ett av sina ord → ordet avslöjas för båda
3. Gradvis bygger ni gemensam kunskap om alla 16 ord
4. När ni tror ni hittat en grupp → markera 4 ord och "gissa"
   - ✅ Rätt: Gruppen lyfts ut överst, markerad som klar. Kvarvarande ord FLYTTAS INTE.
   - ❌ Fel: Shake-animation + röd glow i 2 sekunder, sen manuell avmarkering
5. Fortsätt tills alla 4 grupper är hittade (vinst) eller slut på försök (förlust)

**Emoji-reaktioner:**
Mellan varje drag kan spelarna skicka snabba reaktioner:
- 🔥 "Varmt!"
- 🧊 "Nej..."
- 💡 "Aha!"
- 🤔 "Hmm..."
- ❤️ "Bra!"
- 💪 "Vi kan det här!"

### Poängsystem

```
Poäng = (Grundpoäng - Antal_drag) × Svårighetsmodifier

Grundpoäng: 100
Svårighetsmodifier:
- Lätt: 1.0x
- Medel: 1.5x
- Svår: 2.0x
- Expert: 3.0x

Exempel:
- Svår nivå, 18 drag: (100 - 18) × 2.0 = 164p
- Lätt nivå, 18 drag: (100 - 18) × 1.0 = 82p
```

Detta ger:
- Svårare nivåer belönas mer
- Färre drag = högre poäng
- Topplistan blir mer varierad

---

## 3. Adaptive Difficulty

### Första spelet
- Baseline: Medel svårighet
- Mix av konkreta, abstrakta, ordlekar, kulturella referenser

### Efter varje spel
Feedback-prompt:
```
Hur var svårigheten?
😤 För svårt  😕 Lite svårt  😊 Lagom  😁 Lite lätt  😴 För lätt

Spelare A tyckte: 😊
Spelare B tyckte: 😕

[Om stor skillnad (2+ steg)]
⚠️ Ni upplever svårigheten olika! 
Kanske en av er styr för mycket?

Hur var ordkvaliteten?
😍 Perfekt  😊 Bra  😐 Okej  😕 Svag  😤 Usel
```

Om ordkvalitet är dålig → fråga vilken grupp + vad som var fel.

### Anpassning nästa spel
Systemet justerar (baserat på medelvärde om spelarna skiljer sig):
- Ordlistans komplexitet (vanliga ord ↔ ovanliga ord)
- Abstraktion (konkret ↔ abstrakt)
- Ordlekar (enkla ↔ komplexa)
- Kulturella referenser (kända ↔ obskyra)

### Forced variety (80/20)
- 80% av grupperna: enligt er profil
- 20% av grupperna: exploration (testa nya typer)
- Varje set har minst 1 grupp av varje huvudtyp:
  - Konkret
  - Abstrakt  
  - Ordlek
  - Kulturell/kontextuell

### "Filter bubble"-skydd
Efter 10 spel utan en viss typ:
"Ni har inte spelat med matematiska kopplingar på länge, vill ni prova igen?"

---

## 4. AI-generering av ordgrupper

### AI-generering med validering

**Steg 1: Generera 6 grupper**
AI får i uppdrag att generera 6 grupper om 4 ord (totalt 24 ord).

**Steg 2: Validator-agent**
En andra AI-call kollar det genererade setet:
```
Analysera detta ordset och hitta:
- Överlapp (ord som passar i flera grupper)
- Omöjliga kopplingar (för abstrakta eller långsökta)
- Logiska fel
- Ord över 12 tecken

Returnera: {ok: true/false, issues: [...]}
```

**Steg 3: Välj 4 bästa grupper**
Algoritm väljer 4 av 6 baserat på:
- Bäst spridning i ordlängd (undvik alla korta ELLER alla långa)
- Bäst spridning i kategori-typ (konkret, abstrakt, ordlek, kulturell)
- Minst överlapp-risk
- Inga ord över 12 tecken
- Högst kvalitet enligt validator

**Steg 4: Klar för spel**
De 4 valda grupperna (16 ord) används i spelet.

```
Skapa 4 grupper om 4 svenska ord vardera för ett samarbetsordspel.

Svårighetsnivå: [MEDEL/SVÅR/LÄTT]
Spelare-profil:
- Ordförråd: Avancerat
- Ordlekar: Älskar
- Kulturella referenser: Undvik obskyra
- Abstrakt tänkande: Ja tack

Tidigare dåliga grupper att undvika:
[Lista med grupper som fått dålig feedback]

Krav:
- Kopplingen ska vara logisk och begriplig när man väl ser facit
- En grupp ska vara "uppenbar" (konkret, lätt)
- Två grupper ska vara "tänkvärda" (kräver eftertanke)
- En grupp ska vara "knepig" (ordlek, abstrakt, eller kulturell)
- Inget ord får passa i flera grupper
- Variera ordlängd (3-12 bokstäver)
- Undvik:
  * Långsökta kopplingar (som "JUNGLE" = kung i djungeln)
  * Godtyckliga listor
  * Ord som kräver expertkunskap

Tvingad variation - minst en grupp av varje typ:
1. Konkret (djur, föremål, platser)
2. Abstrakt (egenskaper, känslor, koncept)
3. Ordlek (sammansatta ord, rimmar, innehåller X)
4. Kulturell/kontextuell (kända personer, varumärken, citat)

Format för varje grupp:
Kategorinamn: [kort förklaring]
ORD1, ORD2, ORD3, ORD4

Motivering: Varför hör dessa ihop?
```

### Kvalitetskontroll & Återanvändning

**Dåliga grupper:**
När användare markerar en grupp som dålig:
```javascript
{
  bad_pattern: "ord med bilar som fått namn efter personer",
  // Komprimerat till text istället för full JSON
  reason: "Långsökt/obegriplig"
}
```
Max 10 senaste bad_patterns skickas med i AI-prompt (för att hålla nere token-kostnad).
Äldre mönster aggregeras till kategorier: "Användaren gillar INTE matematiska kopplingar"

**Återanvändning:**
- Varje användare får ALDRIG se samma ordgrupp igen
- Globalt: Ordgrupper kan återanvändas (för olika användare)
- Vi lagrar `used_by_users: [user_id_1, user_id_2]` per word_set
- Vid generering: hämta alla word_sets användaren redan sett, skicka till AI som "undvik dessa"

**UI-hantering av långa ord:**
- Ord dynamiskt anpassar teckenstorlek (som DN gör)
- Exempel: "MICKE 'SYD' ANDERSSON" → mindre font
- Max 12 tecken per ord (hårdkodad regel i AI-generering)

**Skalning:**
Om feedback-datan blir för stor:
- Komprimera till text-patterns: "ord med bilar som fått namn efter personer"
- Skicka bara de 10 senaste bad_patterns till AI
- Resten aggregeras till högre nivå: "användaren gillar inte matematiska kopplingar"

**Race condition-hantering:**
Backend måste ha mutex/locking på:
- Gissningar (vad händer om båda gissar samtidigt?)
- Drag (vem var först att klicka?)
Lösning: Kö-baserad state-hantering med timestamps

---

## 5. Teknisk arkitektur (MVP)

### Tech stack
- **Frontend:** React (mobilwebb, responsive)
- **Backend:** Node.js/Express eller Python/Flask
- **Databas:** PostgreSQL (Supabase)
- **Real-time:** WebSockets via Supabase Realtime
- **AI:** Claude API (Sonnet 4)
- **Hosting:** Vercel + Supabase

### Datamodell (förenklad)

**Users**
- id
- name
- created_at

**Pairs** (spelpar)
- id
- player1_id
- player2_id
- difficulty_profile (JSON: ordförråd, ordlekar, kulturella, abstrakta)
- games_played
- created_at

**Games**
- id
- pair_id
- word_set_id (referens till Word_sets)
- player1_words (JSON: vilka 8 ord spelare 1 såg)
- player2_words (JSON: vilka 8 ord spelare 2 såg)
- moves (JSON: alla drag)
- result (win/loss)
- score (baserat på poängsystem)
- attempts_used
- difficulty_level
- feedback_difficulty_p1 (1-5)
- feedback_difficulty_p2 (1-5)
- feedback_quality (1-5)
- feedback_bad_group (vilken grupp var dålig, om någon)
- completed_at

**Word_sets** (cache av genererade set)
- id
- difficulty_level
- groups (JSON: 4 grupper med ord + kategorier)
- quality_score (baserat på feedback)
- times_used
- used_by_users (array: [user_id_1, user_id_2, ...])
- avg_completion_rate
- created_at

**Bad_groups** (negativ träningsdata)
- id
- user_id
- category
- words (JSON)
- reason
- created_at

### API-endpoints (MVP)

```
POST /pair/create          → Skapa nytt spelpar
GET  /pair/:id             → Hämta par-info

POST /game/start           → Starta nytt spel (genererar ordset)
GET  /game/:id             → Hämta spel-state
POST /game/:id/move        → Gör ett drag (avslöja ord)
POST /game/:id/guess       → Gissa en grupp
POST /game/:id/emoji       → Skicka emoji-reaktion
POST /game/:id/feedback    → Skicka feedback efter spel

GET  /pair/:id/history     → Topplista för paret
GET  /user/:id/wordsets    → Alla word_sets användaren sett (för att undvika duplikat)
```

---

## 6. UI/UX-flöde (MVP)

### Startsida
```
[Logo: Ordpar]

Spelare 1: [Namn]
Spelare 2: [Namn]

[Starta nytt spel]
[Se tidigare spel]
```

### Spelvy

**Spelare A:s vy:**
```
Klara grupper:
✅ Har taggar: KAKTUS, INSTAGRAM, TÖRNBUSKE, SIMPA

Dina ord:              Gemensamma ord:
□ PIRAT               ☑ INSTAGRAM (B)
□ SVAN                ☑ SIMPA (A)
□ LOTS                
□ GARBO
□ GRIS
□ [?]
□ [?]
□ [?]

[Kvarvarande ord FLYTTAS INTE när grupp hittas]

Din tur!

Emoji: 🔥 🧊 💡 🤔 ❤️ 💪

[Markera grupp och gissa]
Försök kvar: ● ● ● ●
```

**Vid fel gissning:**
- Shake-animation på de 4 markerade orden
- Röd glow i 2 sekunder
- "❌ Inte rätt grupp"
- Manuell avmarkering (klicka på orden igen)

**Spelare B:s vy:**
- Samma layout, men andra ord i "Dina ord"
- Ser samma "Gemensamma ord"
- "Vänta på A..."

### Feedback efter spel
```
Ni klarade det på 18 drag! 🎉
Poäng: 164p (Svår nivå)

Grupper:
✅ Har taggar: KAKTUS, INSTAGRAM, TÖRNBUSKE, SIMPA
✅ Kända Greta: GARBO, THUNBERG, GRIS, HANS SYSTER
✅ [osv]

Hur var svårigheten?
Spelare A: 😤 😕 😊 😁 😴
Spelare B: 😤 😕 😊 😁 😴

Hur var ordkvaliteten?
😍 😊 😐 😕 😤

[Om dålig kvalitet: Vilken grupp var problemet?]

[Spela igen] [Se topplista]
```

### Topplista
```
Era spel:

#1 | 164p | Svår | 18 drag | 2026-01-22 | ⭐️ Ni klarade abstrakt!
#2 | 142p | Medel | 23 drag | 2026-01-21
#3 | 82p | Lätt | 18 drag | 2026-01-20
...

[Olika poäng även vid samma antal drag pga svårighetsgrad]
```

---

## 7. MVP scope

### IN (Måste ha)
- ✅ 2 spelare kan starta ett spel
- ✅ Generera ordset med Claude API
- ✅ Visa olika ord för olika spelare
- ✅ Turbaserat: klicka för att avslöja ord
- ✅ Gissa grupper (rätt/fel med shake-animation)
- ✅ Klara grupper lyfts ut överst, kvarvarande ord flyttas INTE
- ✅ Emoji-reaktioner
- ✅ Feedback efter spel (svårighet separat per spelare + kvalitet)
- ✅ Visa feedback-skillnader mellan spelare
- ✅ Poängsystem baserat på svårighetsgrad
- ✅ Topplista för paret med poäng
- ✅ Adaptive difficulty (grundläggande)
- ✅ Användare ser aldrig samma ordgrupp igen

### OUT (Senare)
- ❌ Autentisering/inloggning (använd bara session-baserat)
- ❌ Multiplayer mot andra par
- ❌ Chat-funktion
- ❌ Avancerad statistik
- ❌ Achievements
- ❌ Variabel storlek (5x5, 6x4, osv) → håll 4x4
- ❌ Emoji-reaktioner per specifikt ord (håll generiska i MVP)

### Tekniska förenklingar (MVP)
- ✅ Real-time sync via WebSockets (Supabase Realtime)
- Minimal animation (bara shake på fel gissning)
- Dynamisk font-storlek för långa ord (max 12 tecken)
- Enkel, ren design (Tailwind)
- Ingen PWA/offline mode

---

## 8. Success metrics

### MVP (efter 2 veckor med vänner)
- Ni spelar minst 10 spel
- Genomsnittlig ordkvalitet: minst 😊 (4/5)
- Ingen "😤 Usel" på ordkvalitet
- Adaptive difficulty fungerar: tredje spelet känns "lagom"
- Poängsystemet motiverar: högre svårighetsgrad känns belönande

### V1 (om MVP lyckas)
- 5+ andra par testar
- Retention: minst 50% kommer tillbaka dag 2
- Genomsnittlig speltid: 5-10 minuter

---

## 9. Risker & mitigation

| Risk | Sannolikhet | Impact | Mitigation |
|------|-------------|---------|------------|
| AI genererar dåliga ord | Hög | Hög | Validator-agent + generera 6 välj 4 + manuell QA första veckorna + träna på DN-facit |
| AI skapar överlapp mellan grupper | Hög | Kritisk | Validator-agent kollar dubbel-passning |
| För lätt/svårt från start | Medel | Medel | Snabb anpassning efter första spelet |
| "Filter bubble" | Medel | Medel | 80/20 exploration, forced variety |
| Latens känns för långsam | Medel | Hög | WebSockets från början (Supabase Realtime) |
| Race conditions vid samtidiga gissningar | Medel | Hög | Mutex/locking på backend state |
| Ingen vill spela | Låg | Hög | Testa med vänner först innan utbyggnad |
| Token-kostnad för AI blir för hög | Medel | Medel | Komprimera bad_patterns, max 10 senaste |
| Spelarna upplever svårighet mycket olika | Medel | Medel | Visa skillnad, varna för alpha-player-risk |

---

## 10. Nästa steg

### Parallella spår:

**Spår 1: AI-ordvalidering & träning**
1. Samla DN-facit (alla 65 sets)
2. Analysera: lätt/medel/svår/dålig per grupp
3. Bygg validator-prompt och testa
4. Generera 6 grupper med Claude, välj 4 bästa
5. Jämför kvalitet mot DN
6. Justera prompt baserat på resultat

**Spår 2: Teknisk implementation**
1. Setup: Supabase + Vercel
2. Bygg minimal frontend → Visa 16 ord, turbaserat klickande, dynamisk font
3. Bygg backend → Spara spel, hantera state med race condition-skydd
4. Integrera WebSockets → Real-time sync av drag
5. Integrera Claude API → Generera 6, validera, välj 4
6. Lägg till feedback-loop → Samla data på vad som funkar
7. Implementera poängsystem

**Spår 3: Testa & iterera**
1. Spela 5 spel med dig själv → Justera UX
2. Släpp till vänner → Samla feedback
3. Analysera data → Justera adaptive difficulty

---

## Appendix A: Designprinciper

Från forskning om co-op speldesign:

1. **Delade mål** → Ni vinner/förlorar tillsammans
2. **Komplementära roller** → Ni ser olika ord
3. **Interdependens** → Ingen kan lösa det själv
4. **Begränsad kommunikation** → Emoji, inte chat (i MVP)
5. **Tids/resursbegränsning** → Max försök

---

## Appendix B: DN-facit som träningsdata

**Användning:**
- Exempel på BRA grupper → träna AI att göra liknande
- Exempel på DÅLIGA grupper (JUNGLE-typen) → träna AI att undvika
- Kalibrera svårighetsgrad → märk varje grupp som lätt/medel/svår

**Process:**
1. Samla alla 65 DN-sets
2. Manuell märkning: varje grupp får betyg
3. Skapa "golden set" av bästa exempel
4. Skapa "never do this" av sämsta exempel
5. Använd i AI-prompt: "Gör mer som dessa, mindre som dessa"

---

**Status:** Draft v0.3  
**Uppdaterat med:** Geminis feedback - Validator-agent, generera 6 välj 4, max 12 tecken per ord, WebSockets, race condition-hantering, komprimerade bad_patterns  
**Nästa steg:** Välj spår (AI-validering ELLER teknisk implementation) och börja bygga