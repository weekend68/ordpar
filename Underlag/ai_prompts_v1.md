# AI-prompts för ordgenerering

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
Exempel:
- Ordförråd: Avancerat
- Ordlekar: Älskar
- Kulturella referenser: Undvik obskyra
- Abstrakt tänkande: Ja tack

TIDIGARE DÅLIGA MÖNSTER ATT UNDVIKA:
{bad_patterns}
Exempel:
- "ord med fordon som fått namn efter personer" (för långsökt)
- "matematiska begrepp" (spelaren gillar inte detta)

KRITISKA REGLER:
1. Max 12 tecken per ord (viktigt för mobilvisning)
2. Inget ord får passa i flera grupper
3. Alla ord ska vara vanliga svenska ord (inga extremt ovanliga ord)
4. Kopplingen ska vara logisk och begriplig när man ser facit
5. Undvik godtyckliga listor utan tydlig koppling
6. Undvik långsökta associationer (som "JUNGLE = kung i djungeln")

VARIATION I SVÅRIGHETSGRAD (för de 6 grupperna):
- 2 grupper: "Uppenbara" - Konkreta kategorier som är lätta att se
- 2 grupper: "Tänkvärda" - Kräver viss eftertanke men är logiska
- 2 grupper: "Knepiga" - Ordlekar, abstrakta kopplingar eller kulturella referenser

TYP-VARIATION (minst):
- 2 konkreta grupper (djur, föremål, platser, yrken, etc)
- 1 abstrakt grupp (egenskaper, känslor, koncept)
- 2 ordleks-grupper (sammansatta ord, rimmar på X, innehåller bokstav/ord, etc)
- 1 kulturell/kontextuell grupp (kända personer, varumärken, filmer, etc)

OUTPUT-FORMAT:
Returnera ENDAST JSON i följande format (ingen annan text):

{
  "groups": [
    {
      "category": "Kan vara runda",
      "words": ["BOLL", "MÅNE", "TALLRIK", "MYNT"],
      "difficulty": "uppenbar",
      "type": "konkret",
      "explanation": "Alla dessa objekt kan ha rund form"
    },
    {
      "category": "Innehåller väderstreck",
      "words": ["NORRSKEN", "SYDPOL", "VÄSTRA", "ÖSTTYSKLAND"],
      "difficulty": "knepig",
      "type": "ordlek",
      "explanation": "Varje ord innehåller ett väderstreck: norr, syd, väst, öst"
    }
    // ... totalt 6 grupper
  ]
}

VIKTIGT:
- Alla ord måste vara UNIKA (inget ord får förekomma i flera grupper)
- Varje ord max 12 tecken
- Returnera ENDAST JSON, ingen markdown eller förklarande text
```

---

## 2. VALIDATOR-PROMPT (Kollar kvalitet)

```
Du är en kvalitetskontrollant för ett ordspel. Du ska analysera ett genererat ordset och hitta problem.

ORDSET ATT VALIDERA:
{generated_groups}

DIN UPPGIFT:
Analysera ordgrupperna och leta efter följande problem:

1. ÖVERLAPP
   - Finns ord som passar i flera grupper?
   - Exempel: Om "BLÅ" finns i både "Färger" och "Börjar på B" är det ett problem

2. ORDLÄNGD
   - Finns ord som är längre än 12 tecken?
   - Lista alla ord som bryter mot denna regel

3. LÅNGSÖKTA KOPPLINGAR
   - Finns kopplingar som är för abstrakta eller omöjliga att gissa?
   - Exempel: "JUNGLE" i gruppen "Har en kung" (king of the jungle) är för långsökt

4. GODTYCKLIGA LISTOR
   - Finns grupper som bara är "saker som börjar på samma bokstav" utan djupare koppling?
   - Undantag: Om det är tydligt en ordlek (t.ex. "Innehåller väderstreck")

5. OBSKYRA ORD
   - Finns ovanliga ord som de flesta svenskar inte känner till?
   - Exempel: Mycket sällsynta facktermer eller dialektord

6. LOGISKA FEL
   - Finns ord som faktiskt INTE passar i sin grupp?
   - Exempel: "TRIANGEL" i gruppen "Kan vara runda"

7. KVALITETSBEDÖMNING PER GRUPP
   - Är kopplingen elegant och tillfredsställande att hitta?
   - Eller känns den konstruerad/tvingad?

OUTPUT-FORMAT:
Returnera ENDAST JSON i följande format:

{
  "valid": true/false,
  "overall_quality": "excellent/good/acceptable/poor",
  "issues": [
    {
      "type": "overlap",
      "severity": "critical/high/medium/low",
      "description": "Ordet 'BLÅ' passar i både grupp 1 och grupp 3",
      "affected_groups": [1, 3],
      "affected_words": ["BLÅ"]
    },
    {
      "type": "too_long",
      "severity": "high",
      "description": "Ordet 'MERCEDES-BENZ' är 13 tecken (max 12)",
      "affected_groups": [2],
      "affected_words": ["MERCEDES-BENZ"]
    }
  ],
  "recommendations": [
    "Grupp 3 har för långsökt koppling, överväg att generera om",
    "Ersätt 'MERCEDES-BENZ' med kortare alternativ som 'TESLA' eller 'VOLVO'"
  ],
  "group_quality": [
    {
      "group_index": 0,
      "quality": "excellent",
      "comment": "Tydlig och elegant koppling"
    },
    {
      "group_index": 1,
      "quality": "poor",
      "comment": "För långsökt - 'JUNGLE' som 'kung i djungeln' är omöjligt att gissa"
    }
  ]
}

BEDÖMNINGSKRITERIER:

**valid: false** om:
- Kritiska överlapp finns (ord i flera grupper)
- Ord över 12 tecken
- Logiska fel (ord passar inte i sin grupp)

**overall_quality:**
- excellent: Alla grupper är eleganta och tillfredsställande
- good: De flesta grupper är bra, någon mindre invändning
- acceptable: Funkar men har uppenbara svagheter
- poor: Flera grupper har problem, bör genereras om

**severity:**
- critical: Gör spelet ospelbart (överlapp, logiska fel)
- high: Skapar dålig spelupplevelse (för långa ord, omöjliga kopplingar)
- medium: Mindre problem men spelets kvalitet påverkas
- low: Kosmetiska problem

VIKTIGT:
- Returnera ENDAST JSON, ingen markdown eller förklarande text
- Var strikt men rättvis i bedömningen
- Om du är osäker, markera som "medium severity" och förklara i description
```

---

## 3. ANVÄNDNING I KOD

```javascript
// Steg 1: Generera 6 grupper
const generatePrompt = `
  [GENERERINGS-PROMPT ovan med ifyllda variabler]
`;

const generatedResponse = await callClaudeAPI({
  prompt: generatePrompt,
  max_tokens: 2000
});

const generated = JSON.parse(generatedResponse);

// Steg 2: Validera
const validatePrompt = `
  [VALIDATOR-PROMPT ovan med generated_groups]
`;

const validationResponse = await callClaudeAPI({
  prompt: validatePrompt,
  max_tokens: 1500
});

const validation = JSON.parse(validationResponse);

// Steg 3: Beslut
if (!validation.valid || validation.overall_quality === 'poor') {
  // Generera om eller försök fixa issues
  console.log('Regenerating due to:', validation.issues);
  return regenerate();
}

// Steg 4: Välj 4 bästa av 6
const selected = selectBest4Groups(generated.groups, validation.group_quality);

// Steg 5: Returnera till spel
return {
  word_set: selected,
  difficulty_level: difficulty,
  quality_score: validation.overall_quality
};
```

---

## 4. EXEMPEL PÅ VARIABLER

### difficulty_level
```
"MEDEL"
```

### player_profile
```
{
  "ordförråd": "avancerat",
  "ordlekar": "älskar",
  "kulturella_referenser": "undvik obskyra",
  "abstrakt_tänkande": "ja tack"
}
```

### bad_patterns (komprimerat till max 10 senaste)
```
[
  "fordon som fått namn efter personer",
  "matematiska begrepp med grekiska bokstäver",
  "obskyra svenska dialektord"
]
```

---

## 5. HANTERING AV EDGE CASES

### Om JSON-parsing misslyckas
```javascript
try {
  const parsed = JSON.parse(response);
} catch (e) {
  // AI returnerade markdown eller extra text
  // Försök strippa ```json``` och parsa igen
  const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned);
}
```

### Om validering hittar critical issues
```javascript
if (validation.issues.some(i => i.severity === 'critical')) {
  // Försök inte fixa, generera helt nytt set
  return regenerate();
}

if (validation.issues.some(i => i.severity === 'high')) {
  // Försök fixa specifika ord eller generera om den gruppen
  const fixedGroups = await fixHighSeverityIssues(generated, validation);
  // Validera igen efter fix
}
```

### Om för få "excellent" grupper
```javascript
const excellentGroups = validation.group_quality.filter(g => g.quality === 'excellent');

if (excellentGroups.length < 2) {
  // Vi har 6 grupper men färre än 2 är "excellent"
  // Generera om för att få bättre kvalitet
  console.log('Not enough excellent groups, regenerating');
  return regenerate();
}
```

---

## 6. TIPS FÖR CLAUDE CODE

När du implementerar detta i Claude Code:

1. **Separera prompterna i egna filer:**
   - `prompts/generator.txt`
   - `prompts/validator.txt`

2. **Använd template strings:**
   ```javascript
   const prompt = generatorTemplate
     .replace('{difficulty_level}', difficulty)
     .replace('{player_profile}', JSON.stringify(profile))
     .replace('{bad_patterns}', JSON.stringify(badPatterns));
   ```

3. **Lägg till retry-logik:**
   ```javascript
   let attempts = 0;
   const maxAttempts = 3;
   
   while (attempts < maxAttempts) {
     const generated = await generate();
     const validation = await validate(generated);
     
     if (validation.valid && validation.overall_quality !== 'poor') {
       return selectBest4(generated);
     }
     
     attempts++;
   }
   
   throw new Error('Failed to generate valid word set after 3 attempts');
   ```

4. **Logga för debugging:**
   ```javascript
   console.log('Generated 6 groups:', generated);
   console.log('Validation result:', validation);
   console.log('Selected 4 groups:', selected);
   ```
