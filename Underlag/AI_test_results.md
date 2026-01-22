# Test av AI-prompter - Mock resultat

Detta visar hur prompterna ska användas och vad vi förväntar oss för resultat.

---

## TEST 1: MEDEL svårighet

### Input till Generator:
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

### Förväntat output från Generator:
```json
{
  "groups": [
    {
      "category": "Runda frukter",
      "words": ["APELSIN", "MELON", "ÄPPLE", "PLOMMON"],
      "difficulty": "uppenbar",
      "type": "konkret",
      "explanation": "Frukter som har rund form"
    },
    {
      "category": "Slutar på -are",
      "words": ["LÄRARE", "BAGARE", "MÅLARE", "SNICKARE"],
      "difficulty": "uppenbar",
      "type": "konkret",
      "explanation": "Yrken som slutar på suffix -are"
    },
    {
      "category": "Innehåller väderstreck",
      "words": ["NORDPOLEN", "SYDKOREA", "VÄSTKUSTEN", "ÖSTASIEN"],
      "difficulty": "tänkvärd",
      "type": "ordlek",
      "explanation": "Varje ord innehåller ett väderstreck"
    },
    {
      "category": "Rimmar på -ung",
      "words": ["SPRUNG", "KUNG", "SVÄNGNING", "TUNGVIKTAR"],
      "difficulty": "tänkvärd",
      "type": "ordlek",
      "explanation": "Alla ord slutar med ljudet 'ung'"
    },
    {
      "category": "Svenska slangord",
      "words": ["BRAJJ", "STEKARE", "MACKA", "TJEJS"],
      "difficulty": "knepig",
      "type": "kulturell",
      "explanation": "Vardagliga slanguttryck"
    },
    {
      "category": "Kan betyda 'slut'",
      "words": ["PUNKT", "FINAL", "RIDÅ", "OVER"],
      "difficulty": "knepig",
      "type": "abstrakt",
      "explanation": "Ord som används för att markera avslut"
    }
  ]
}
```

### Input till Validator:
(Skicka generated_groups ovan)

### Förväntat output från Validator:
```json
{
  "valid": true,
  "overall_quality": "good",
  "issues": [
    {
      "type": "minor_concern",
      "severity": "low",
      "description": "TUNGVIKTAR känns lite tvingat för rimmet -ung",
      "affected_groups": [3],
      "affected_words": ["TUNGVIKTAR"],
      "suggestion": "Överväg JUNG eller MUNDUNGUS om de passar bättre"
    }
  ],
  "recommendations": [
    "Grupp 0 och 1 är tydliga och bra",
    "Grupp 2 liknar DN:s bästa exempel med väderstreck",
    "Grupp 5 är elegant och abstrakt - excellent!"
  ],
  "group_quality": [
    {
      "group_index": 0,
      "quality": "good",
      "comment": "Konkret och tydlig, bra ingång",
      "comparison": "Standard konkret grupp, funkar bra"
    },
    {
      "group_index": 1,
      "quality": "good",
      "comment": "Tydlig suffix-ordlek",
      "comparison": "Liknande DN:s -klackar-grupp"
    },
    {
      "group_index": 2,
      "quality": "excellent",
      "comment": "Kreativ och elegant ordlek",
      "comparison": "Lika bra som DN:s väderstreck-exempel"
    },
    {
      "group_index": 3,
      "quality": "acceptable",
      "comment": "Rimmet funkar men TUNGVIKTAR känns tvingat",
      "comparison": "Funkar men inte lika elegant som de bästa"
    },
    {
      "group_index": 4,
      "quality": "good",
      "comment": "Kul slang men se till att alla är välkända",
      "comparison": "Bra kulturell grupp"
    },
    {
      "group_index": 5,
      "quality": "excellent",
      "comment": "Abstrakt men logisk, tillfredsställande att hitta",
      "comparison": "Elegant abstrakt grupp"
    }
  ]
}
```

### Beslut:
- ✅ valid: true
- ✅ overall_quality: "good"
- ✅ 2 excellent + 3 good + 1 acceptable = kan välja 4 bästa
- **Välj grupper:** 0, 1, 2, 5 (skippa 3 och 4)

---

## TEST 2: Dåligt set som ska failas

### Input till Generator (medvetet dåliga instruktioner):
```json
{
  "difficulty_level": "SVÅR",
  "player_profile": {
    "ordförråd": "expert",
    "ordlekar": "komplexa",
    "kulturella_referenser": "ja till allt",
    "abstrakt_tänkande": "älskar"
  },
  "bad_patterns": []
}
```

### Simulerat dåligt output (för att testa validator):
```json
{
  "groups": [
    {
      "category": "Innehåller motorfordon",
      "words": ["SIFFERKOMBINATION", "LASTBILSCHAUFFÖR", "MOTORCYKELHJÄLM", "ELBILSLADDARE"],
      "difficulty": "knepig",
      "type": "ordlek",
      "explanation": "Alla ord innehåller dolda fordon"
    },
    {
      "category": "Enbart två sorters bokstäver",
      "words": ["AA", "UU", "LALLA", "MIMIMI"],
      "difficulty": "knepig",
      "type": "ordlek",
      "explanation": "Varje ord använder bara två olika bokstäver"
    },
    {
      "category": "Kungar genom tiderna",
      "words": ["XVI", "BERNADOTTE", "BIRGER JARL", "KÄRA ÖREBROARE"],
      "difficulty": "knepig",
      "type": "kulturell",
      "explanation": "Kopplade till svenska kungar"
    },
    {
      "category": "Färger",
      "words": ["RÖD", "BLÅ", "GRÖN", "GUL"],
      "difficulty": "uppenbar",
      "type": "konkret",
      "explanation": "Grundfärger"
    },
    {
      "category": "Börjar på samma bokstav",
      "words": ["BANAN", "BIL", "BLÅ", "BERG"],
      "difficulty": "uppenbar",
      "type": "ordlek",
      "explanation": "Alla börjar på B"
    },
    {
      "category": "Har prickar",
      "words": ["Ä", "Ö", "KID", "FARLED"],
      "difficulty": "knepig",
      "type": "abstrakt",
      "explanation": "Alla har prickar på något sätt"
    }
  ]
}
```

### Validator output (ska faila):
```json
{
  "valid": false,
  "overall_quality": "poor",
  "issues": [
    {
      "type": "too_obscure",
      "severity": "critical",
      "description": "SIFFERKOMBINATION innehåller 'COMB' som traktor är omöjligt långsökt, exakt samma problem som DN:s sämsta exempel",
      "affected_groups": [0],
      "affected_words": ["SIFFERKOMBINATION"],
      "suggestion": "Använd tydligare dolda ord som SÄLG (SÄL) eller MÅSVINGE (MÅS)"
    },
    {
      "type": "long_word",
      "severity": "high",
      "description": "Flera ord över 12-tecken-gränsen",
      "affected_groups": [0],
      "affected_words": ["LASTBILSCHAUFFÖR", "MOTORCYKELHJÄLM", "ELBILSLADDARE"],
      "suggestion": "Max 12 tecken - ersätt med kortare ord"
    },
    {
      "type": "arbitrary_rule",
      "severity": "high",
      "description": "Enbart två sorters bokstäver är godtycklig regel, samma problem som DN:s dåliga exempel",
      "affected_groups": [1],
      "affected_words": ["AA", "UU", "LALLA", "MIMIMI"],
      "suggestion": "Undvik abstrakt

a bokstavsregler"
    },
    {
      "type": "obscure_references",
      "severity": "high",
      "description": "För många obskyra kungliga referenser i samma grupp",
      "affected_groups": [2],
      "affected_words": ["XVI", "KÄRA ÖREBROARE"],
      "suggestion": "Max en obskyr referens per grupp"
    },
    {
      "type": "overlap",
      "severity": "critical",
      "description": "BLÅ finns i både grupp 3 (Färger) och grupp 4 (Börjar på B)",
      "affected_groups": [3, 4],
      "affected_words": ["BLÅ"],
      "suggestion": "Varje ord får bara finnas i EN grupp"
    },
    {
      "type": "unclear_category",
      "severity": "high",
      "description": "Har prickar är oklar, samma problem som DN:s dåliga exempel - vad betyder 'prickar' för KID och FARLED?",
      "affected_groups": [5],
      "affected_words": ["KID", "FARLED"],
      "suggestion": "Kategorin måste vara begriplig i efterhand"
    }
  ],
  "recommendations": [
    "REJECT hela detta set - för många kritiska problem",
    "Liknar DN:s sämsta exempel (motorfordon, prickar, kungliga obskyra)",
    "Generera helt nytt set med tydligare instruktioner"
  ],
  "group_quality": [
    {
      "group_index": 0,
      "quality": "poor",
      "comment": "Långsökt och för långa ord - samma fel som DN:s sämsta",
      "comparison": "Sämre än DN:s genomsnitt"
    },
    {
      "group_index": 1,
      "quality": "poor",
      "comment": "Godtycklig bokstavsregel",
      "comparison": "Samma problem som DN:s dåliga exempel"
    },
    {
      "group_index": 2,
      "quality": "poor",
      "comment": "Staplade obskyra referenser",
      "comparison": "Samma problem som DN:s XVI/KÄRA ÖREBROARE"
    },
    {
      "group_index": 3,
      "quality": "acceptable",
      "comment": "Enkel konkret grupp men BLÅ skapar överlapp",
      "comparison": "Skulle vara OK om inte överlapp"
    },
    {
      "group_index": 4,
      "quality": "poor",
      "comment": "För godtycklig 'börjar på samma bokstav' utan djupare mening",
      "comparison": "Saknar elegans"
    },
    {
      "group_index": 5,
      "quality": "poor",
      "comment": "Oklar kategori",
      "comparison": "Samma problem som DN:s 'har prickar'"
    }
  ]
}
```

### Beslut:
- ❌ valid: false (överlapp + kritiska problem)
- ❌ overall_quality: "poor"
- ❌ 0 excellent, 0 good, 1 acceptable (men den har överlapp)
- **REJECT - generera helt nytt set**

---

## TEST 3: SVÅR nivå (bra exempel)

### Input till Generator:
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

### Förväntat output:
```json
{
  "groups": [
    {
      "category": "Svenska städer",
      "words": ["MALMÖ", "LUND", "YSTAD", "HELSINGBORG"],
      "difficulty": "uppenbar",
      "type": "konkret",
      "explanation": "Städer i Skåne"
    },
    {
      "category": "Innehåller djurnamn",
      "words": ["SÄLG", "MÅSVINGE", "KATTHAJ", "ORMVRÅK"],
      "difficulty": "tänkvärd",
      "type": "ordlek",
      "explanation": "Varje ord innehåller minst ett djurnamn"
    },
    {
      "category": "Palindrom",
      "words": ["KAJAK", "SIRAP", "ANNA", "RADAR"],
      "difficulty": "tänkvärd",
      "type": "ordlek",
      "explanation": "Stavas likadant framlänges som baklänges"
    },
    {
      "category": "Kan betyda 'snabb'",
      "words": ["KVICK", "RASK", "HASTIG", "PROMPT"],
      "difficulty": "knepig",
      "type": "abstrakt",
      "explanation": "Synonymer för snabbhet"
    },
    {
      "category": "Svenska poeter",
      "words": ["FRÖDING", "KARLFELDT", "TRANSTRÖMER", "LAGERKVIST"],
      "difficulty": "knepig",
      "type": "kulturell",
      "explanation": "Nobelpristagare i litteratur"
    },
    {
      "category": "Handlar om fem",
      "words": ["FEMKAMP", "FEMÖRING", "FEMTAKT", "PENTAGON"],
      "difficulty": "knepig",
      "type": "abstrakt",
      "explanation": "Alla relaterar till siffran 5"
    }
  ]
}
```

### Validator output:
```json
{
  "valid": true,
  "overall_quality": "excellent",
  "issues": [],
  "recommendations": [
    "Grupp 1 är excellent - liknar DN:s bästa djur-exempel",
    "Grupp 2 är elegant palindrom-ordlek",
    "Alla grupper har hög kvalitet",
    "Perfekt svårighetsbalans: 1 uppenbar, 2 tänkvärda, 3 knepiga"
  ],
  "group_quality": [
    {
      "group_index": 0,
      "quality": "excellent",
      "comment": "Konkret och tydlig ingång",
      "comparison": "Bra balans för svår nivå"
    },
    {
      "group_index": 1,
      "quality": "excellent",
      "comment": "Kreativ ordlek, liknar DN:s bästa exempel",
      "comparison": "Lika bra som DN:s 'här gömmer sig två djur'"
    },
    {
      "group_index": 2,
      "quality": "excellent",
      "comment": "Elegant och tillfredsställande",
      "comparison": "Lika bra som DN:s palindrom-grupp"
    },
    {
      "group_index": 3,
      "quality": "excellent",
      "comment": "Abstrakt men logisk synonymgrupp",
      "comparison": "Bra abstrakt kategori"
    },
    {
      "group_index": 4,
      "quality": "good",
      "comment": "Kulturell kunskap men alla är välkända nobelpristagare",
      "comparison": "Bra kulturell nivå, inte för obskyr"
    },
    {
      "group_index": 5,
      "quality": "excellent",
      "comment": "Kreativ numerisk koppling",
      "comparison": "Liknar DN:s 'handlar om tio' men bättre"
    }
  ]
}
```

### Beslut:
- ✅ valid: true
- ✅ overall_quality: "excellent"
- ✅ 5 excellent + 1 good = fantastiskt!
- **Välj grupper:** 0, 1, 2, 5 (alla är utmärkta, välj de mest varierade)

---

## SAMMANFATTNING AV TESTER

### Test 1 (MEDEL): GODKÄND ✅
- 2 excellent + 3 good + 1 acceptable
- Kunde välja 4 bra grupper
- Bättre än DN:s genomsnitt

### Test 2 (DÅLIGT SET): KORREKT FAILAD ❌
- Validator fångade alla problem:
  - Överlapp (BLÅ i två grupper)
  - För långa ord (13-17 tecken)
  - Långsökta kopplingar (motorfordon)
  - Godtyckliga regler (två sorters bokstäver)
  - Obskyra referenser (kungliga)
- Rekommendation: REJECT

### Test 3 (SVÅR): UTMÄRKT ✅
- 5 excellent + 1 good
- Alla grupper håller hög kvalitet
- Betydligt bättre än DN:s bästa

---

## NÄSTA STEG FÖR CLAUDE CODE

1. **Implementera prompterna** från ai_prompts artifact
2. **Kör faktiska tester** med Claude API
3. **Justera** baserat på verkliga resultat
4. **Bygg selection-algoritm** som väljer 4 bästa av 6

Prompterna är klara att användas! 🎉