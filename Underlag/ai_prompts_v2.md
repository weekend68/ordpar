# AI-prompts för ordgenerering v2.0
**Uppdaterad med DN-analys och konkreta exempel**

---

## 1. GENERERINGS-PROMPT (Skapar 6 grupper)

```
Du ska skapa 6 grupper om 4 svenska ord vardera för ett samarbetsordspel där två spelare tillsammans ska hitta ordgrupperna.

KONTEXT:
- Spelet liknar NYT Connections / DN Dagens fyra
- Två spelare ser olika halvor av orden och avslöjar gradvis för varandra
- De ska hitta logiska kopplingar mellan ord

SVÅRIGHETSGRAD: {difficulty_level}
(LÄTT / MEDEL / SVÅR)

SPELAR-PROFIL:
{player_profile}

TIDIGARE DÅLIGA MÖNSTER ATT UNDVIKA:
{bad_patterns}

---

GULDSTANDARD - GÖR MER SOM DESSA EXEMPEL FRÅN DN:

EXCELLENT ordlekar:
- "Palindrom": KAJAK, SMS, ROR, RATTAR (ord som stavas likadant baklänges)
- "Här gömmer sig två djur": SÄLG, MÅSVINGE, HÄSTSVANS, ORMVRÅK (varje ord innehåller två djurnamn)
- "Olika former av -klackar": TAX, STILETT, KIL, BLOCK (alla blir skor med suffix -klackar)

EXCELLENT konkreta:
- "Olika sorters lök": RÖD, VIT, GUL, SILVER (konkreta lökvarianter)
- "Schackpjäser": KUNG, TORN, DAM, BONDE (välkända speltermer)
- "Klassiska drinkar": MANHATTAN, COSMOPOLITAN, MIMOSA, MARGARITA (kända cocktails)

EXCELLENT kulturella:
- "Slang för yrke": MURVEL, AINA, RODDARE, SNOK (murare, polis, taxichaufför, åklagare)
- "Slang för föräldrar": PÄRON, FARSA, STABBE, MAMSING (vardagliga uttryck)

---

UNDVIK DESSA MÖNSTER (dåliga exempel från DN):

❌ ALDRIG godtyckliga bokstavsregler:
- "Enbart två sorters bokstäver": TÅ, UFF, LALLA, TUT TUT (för abstrakt, omöjligt att gissa)

❌ ALDRIG långsökta dolda ord:
- "Innehåller motorfordon": SIFFERKOMBINATION, SVEPA, MCDONALD'S (COMB = traktor?! Helt omöjligt)

❌ ALDRIG oklara regler:
- "Har prickar": GAMMAL BANAN, KID, FARLED, Ö (vad betyder "prickar" här?)

❌ ALDRIG inkonsekvent suffix/prefix-regler:
- "Slutar på olika sorters fett": BISTER, KOLJA, GIFTALG, MESSMÖR (messmör är ett helt ord, inte suffix)

❌ ALDRIG stapla obskyra referenser:
- "Ja, visst handlar det om kungen": XVI, SILVIA, STATSCHEF, KÄRA ÖREBROARE (för många svåra kopplingar)

---

KRITISKA REGLER:

1. **Max 12 tecken per ord** (absolut hårdkodad regel för mobilvisning)
2. **Inget ord får passa i flera grupper** (validator kollar detta)
3. **Alla ord ska vara vanliga svenska ord** (inga extremt ovanliga ord)
4. **Kopplingen ska vara logisk och begriplig när man ser facit** (inte långsökt)
5. **Undvik godtyckliga listor** utan tydlig koppling
6. **Om ordlek med dolda ord**: måste vara uppenbara (SÄLG innehåller SÄL, inte COMB = traktor)
7. **Om ordlek med suffix/prefix**: håll konsekvent (antingen alla har suffix ELLER alla har prefix)

---

VARIATION I SVÅRIGHETSGRAD (för de 6 grupperna):

**LÄTT nivå** (generera 6 grupper):
- 4 grupper: "Uppenbara" (konkreta, lätta att se)
- 2 grupper: "Tänkvärda" (ordlekar eller enklare abstrakta)

**MEDEL nivå** (generera 6 grupper):
- 2 grupper: "Uppenbara" (konkreta)
- 2 grupper: "Tänkvärda" (kräver eftertanke)
- 2 grupper: "Knepiga" (ordlekar eller kulturella)

**SVÅR nivå** (generera 6 grupper):
- 1 grupp: "Uppenbar" (konkret, för att ge en enkel ingång)
- 2 grupper: "Tänkvärda" (abstrakta eller ordlekar)
- 3 grupper: "Knepiga" (komplexa ordlekar, abstrakta, kulturella)

---

TYP-VARIATION (för alla svårighetsnivåer, minst):

- 2 konkreta grupper (djur, föremål, platser, yrken, mat, etc)
- 1 abstrakt grupp (egenskaper, känslor, koncept, antal)
- 2 ordleks-grupper (sammansatta ord, rimmar på X, innehåller bokstav/ord, suffix/prefix, palindrom, etc)
- 1 kulturell/kontextuell grupp (kända personer, varumärken, filmer, slang, etc)

---

ORDLEKS-GUIDELINES:

**BRA ordlekar:**
- Palindrom (KAJAK, ROR)
- Innehåller djurnamn (SÄLG har SÄL, MÅSVINGE har MÅS+VINGE)
- Suffix/prefix som ger ny betydelse (TAX → taxklackar, KIL → kilklackar)
- Rimmar på samma ljud (men undvik godtyckliga rim)

**DÅLIGA ordlekar:**
- Dolda motorfordon där kopplingen är långsökt (COMB = traktor)
- "Enbart vissa bokstäver" (för abstrakt)
- Inkonsekvent användning av suffix/prefix

---

OUTPUT-FORMAT:

Returnera ENDAST JSON i följande format (ingen markdown, ingen annan text):

{
  "groups": [
    {
      "category": "Palindrom",
      "words": ["KAJAK", "SMS", "ROR", "ANNA"],
      "difficulty": "uppenbar",
      "type": "ordlek",
      "explanation": "Alla ord stavas likadant framlänges som baklänges"
    },
    {
      "category": "Klassiska drinkar",
      "words": ["MOJITO", "MARTINI", "NEGRONI", "DAIQUIRI"],
      "difficulty": "tänkvärd",
      "type": "kulturell",
      "explanation": "Välkända cocktails från olika länder"
    }
    // ... totalt 6 grupper
  ]
}

VIKTIGT SISTA KONTROLLEN INNAN DU RETURNERAR:
- ✓ Alla ord är UNIKA (inget ord förekommer i flera grupper)?
- ✓ Varje ord max 12 tecken?
- ✓ Kopplingen är logisk och begriplig i efterhand?
- ✓ Inga långsökta "dolda ord"-kopplingar?
- ✓ Om ordlek med suffix/prefix: konsekvent använd?
- ✓ Returnerar jag ENDAST JSON utan markdown?
```

---

## 2. VALIDATOR-PROMPT v2.0 (Kollar kvalitet)

```
Du är en kvalitetskontrollant för ett ordspel. Du ska analysera ett genererat ordset och hitta problem.

ORDSET ATT VALIDERA:
{generated_groups}

---

KVALITETSKRITERIER BASERAT PÅ DN-ANALYS:

DIN UPPGIFT:
Analysera ordgrupperna och leta efter följande problem:

---

1. ÖVERLAPP (CRITICAL)
   - Finns ord som passar i flera grupper?
   - Exempel: Om "BLÅ" finns i både "Färger" och "Börjar på B" är det ett CRITICAL problem
   - Detta gör spelet ospelbart

2. ORDLÄNGD (HIGH)
   - Finns ord som är längre än 12 tecken?
   - DN hade "MERCEDES-BENZ" (13), "MICKE 'SYD' ANDERSSON" (21) - för långt!
   - Lista alla ord som bryter mot 12-tecken-regeln

3. LÅNGSÖKTA KOPPLINGAR (HIGH/CRITICAL)
   - Finns kopplingar som är omöjliga att gissa även när man ser facit?
   - DN-exempel: "SIFFERKOMBINATION innehåller motorfordon" (COMB = traktor?!)
   - DN-exempel: "Kan kopplas till Fredrik" där kopplingen är otydlig
   - Särskilt: Dolda ord i mitten av långa ord är nästan alltid för långsökta

4. GODTYCKLIGA REGLER (HIGH)
   - Finns bokstavsregler utan mening? ("Enbart två sorters bokstäver")
   - Är regeln så abstrakt att den är omöjlig att gissa?

5. OKLARA KATEGORIER (HIGH)
   - Kan man förstå kopplingen när man ser facit?
   - DN-exempel: "Har prickar" - vad betyder det egentligen?

6. INKONSEKVENT ORDLEK (MEDIUM)
   - Om suffix/prefix: håller alla ord samma regel?
   - DN-exempel: "Slutar på fett" där MESSMÖR är ett helt ord, inte suffix
   - Alla ord måste följa samma mönster

7. OBSKYRA REFERENSER (MEDIUM/HIGH)
   - Finns för många kulturella referenser som kräver expertkunskap i samma grupp?
   - DN-exempel: XVI (Carl XVI Gustaf) + KÄRA ÖREBROARE i samma grupp
   - EN obskyr referens per grupp är OK, flera är för svårt

8. OVANLIGA ORD (MEDIUM)
   - Finns ord som de flesta svenskar inte känner till?
   - Mycket sällsynta facktermer eller dialektord

9. LOGISKA FEL (CRITICAL)
   - Finns ord som faktiskt INTE passar i sin grupp?
   - Exempel: "TRIANGEL" i gruppen "Kan vara runda"

10. KVALITETSBEDÖMNING PER GRUPP
    - Jämför med DN:s bästa exempel:
      * Palindrom: KAJAK, SMS, ROR, RATTAR (elegant!)
      * Här gömmer sig två djur: SÄLG, MÅSVINGE (kreativt!)
      * Slang för yrke: MURVEL, AINA, RODDARE (kul!)
    - Är kopplingen elegant och tillfredsställande att hitta?
    - Eller känns den konstruerad/tvingad?

---

OUTPUT-FORMAT:

Returnera ENDAST JSON i följande format (ingen markdown):

{
  "valid": true/false,
  "overall_quality": "excellent/good/acceptable/poor",
  "issues": [
    {
      "type": "long_word",
      "severity": "high",
      "description": "MERCEDES-BENZ är 13 tecken (max 12)",
      "affected_groups": [2],
      "affected_words": ["MERCEDES-BENZ"],
      "suggestion": "Ersätt med TESLA (5 tecken) eller VOLVO (5 tecken)"
    },
    {
      "type": "too_obscure",
      "severity": "high",
      "description": "Dolda motorfordon i SIFFERKOMBINATION är omöjligt långsökt",
      "affected_groups": [1],
      "affected_words": ["SIFFERKOMBINATION"],
      "suggestion": "Använd tydligare dolda ord som SÄLG (innehåller SÄL)"
    }
  ],
  "recommendations": [
    "Grupp 3 har för långsökt koppling, generera om",
    "Grupp 5 liknar DN:s bästa exempel - excellent!"
  ],
  "group_quality": [
    {
      "group_index": 0,
      "quality": "excellent",
      "comment": "Tydlig och elegant koppling, liknar DN:s bästa exempel",
      "comparison": "Lika bra som DN:s 'Palindrom'-grupp"
    },
    {
      "group_index": 1,
      "quality": "poor",
      "comment": "För långsökt - liknar DN:s dåliga 'innehåller motorfordon'-exempel",
      "comparison": "Samma problem som DN:s sämsta grupper"
    }
  ]
}

---

BEDÖMNINGSKRITERIER:

**valid: false** om:
- Kritiska överlapp finns (ord i flera grupper)
- Ord över 12 tecken
- Logiska fel (ord passar inte i sin grupp)
- Långsökta dolda ord (som DN:s "COMB = traktor")

**overall_quality:**
- **excellent**: Alla grupper är eleganta, liknar DN:s bästa exempel, inga invändningar
- **good**: De flesta grupper är bra, eventuellt en mindre invändning
- **acceptable**: Funkar men har uppenbara svagheter, bättre än DN:s sämsta
- **poor**: Flera grupper har problem, sämre än DN:s genomsnitt, bör genereras om

**severity:**
- **critical**: Gör spelet ospelbart (överlapp, logiska fel, omöjligt långsökta kopplingar)
- **high**: Skapar dålig spelupplevelse (för långa ord, oklara kategorier, godtyckliga regler)
- **medium**: Mindre problem men spelets kvalitet påverkas (obskyra referenser, inkonsekvent ordlek)
- **low**: Kosmetiska problem (mindre vanliga ord men fortfarande förståeliga)

---

JÄMFÖR MED DN:S EXEMPEL:

**Bättre än DN** om:
- Inga ord över 12 tecken (DN hade flera)
- Inga långsökta "dolda motorfordon"-kopplingar
- Konsekvent användning av ordleksregler
- Elegant och logisk som DN:s bästa exempel

**Sämre än DN** om:
- Godtyckliga bokstavsregler
- Långsökta kopplingar
- Oklara kategorier
- Staplade obskyra referenser

VIKTIGT:
- Returnera ENDAST JSON, ingen markdown eller förklarande text
- Var strikt men rättvis i bedömningen
- Jämför explicit med DN:s bästa och sämsta exempel
- Om du är osäker, markera som "medium severity" och förklara i description
```

---

## 3. TESTFALL - Kör dessa för att validera

### Test 1: MEDEL svårighet

**Input till Generator:**
```json
{
  "difficulty_level": "MEDEL",
  "player_profile": {
    "ordförråd": "avancerat",
    "ordlekar": "älskar",
    "kulturella_referenser": "undvik obskyra",
    "abstrakt_tänkande": "ja tack"
  },
  "bad_patterns": []
}
```

**Förväntat resultat:**
- 2 uppenbara grupper (konkreta)
- 2 tänkvärda grupper
- 2 knepiga grupper
- Alla ord max 12 tecken
- Inga överlapp
- overall_quality: minst "good"

---

### Test 2: SVÅR svårighet

**Input till Generator:**
```json
{
  "difficulty_level": "SVÅR",
  "player_profile": {
    "ordförråd": "avancerat",
    "ordlekar": "älskar",
    "kulturella_referenser": "ja tack",
    "abstrakt_tänkande": "älskar"
  },
  "bad_patterns": [
    "fordon som fått namn efter personer",
    "matematiska symboler"
  ]
}
```

**Förväntat resultat:**
- 1 uppenbar grupp (för ingång)
- 2 tänkvärda grupper
- 3 knepiga grupper
- Undviker de nämnda bad_patterns
- overall_quality: minst "good"
- Minst en grupp som är "excellent"

---

### Test 3: Validering ska fånga dåliga exempel

**Input till Validator (medvetet dåligt set):**
```json
{
  "groups": [
    {
      "category": "Innehåller motorfordon",
      "words": ["SIFFERKOMBINATION", "ELBILEN", "LASTBILSCHAUFFÖR", "MOTORCYKELHJÄLM"],
      "explanation": "Alla innehåller fordon"
    }
  ]
}
```

**Förväntat resultat:**
- valid: false
- issues innehåller "too_obscure" eller "long_word"
- "LASTBILSCHAUFFÖR" flaggas som för långt (17 tecken)
- "MOTORCYKELHJÄLM" flaggas som för långt (16 tecken)
- overall_quality: "poor"

---

## 4. ANVÄNDNING I KOD

```javascript
// Generera
const generateResponse = await callClaudeAPI(generatorPrompt);
const generated = JSON.parse(cleanJSON(generateResponse));

// Validera
const validateResponse = await callClaudeAPI(validatorPrompt);
const validation = JSON.parse(cleanJSON(validateResponse));

// Beslut
if (!validation.valid) {
  console.log('❌ Invalid set:', validation.issues);
  return regenerate();
}

if (validation.overall_quality === 'poor') {
  console.log('⚠️ Poor quality, regenerating');
  return regenerate();
}

if (validation.overall_quality === 'acceptable') {
  console.log('⚠️ Acceptable but not great');
  // Kanske acceptera eller regenerera beroende på kontext
}

// Välj 4 bästa av 6
const excellent = validation.group_quality.filter(g => g.quality === 'excellent');
const good = validation.group_quality.filter(g => g.quality === 'good');

if (excellent.length + good.length < 4) {
  console.log('⚠️ Not enough good groups');
  return regenerate();
}

const selected = selectBest4Groups(generated.groups, validation.group_quality);
console.log('✅ Selected 4 groups:', selected);
```