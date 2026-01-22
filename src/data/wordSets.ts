import { WordSet } from '../types';

export const wordSets: WordSet[] = [
  {
    id: '2026-01-01',
    groups: [
      {
        category: 'Innehåller ett motorfordon',
        words: ['SIFFERKOMBINATION', 'SVEPA', "MCDONALD'S", 'VESUVIUS'],
      },
      {
        category: 'Klassiska drinkar',
        words: ['MANHATTAN', 'COSMOPOLITAN', 'MIMOSA', 'MARGARITA'],
      },
      {
        category: 'Slutar med två likadana vokaler',
        words: ['HAWAII', 'TAXFREE', 'TENNESSEE', 'DIDGERIDOO'],
      },
      {
        category: 'Kommer sist',
        words: ['JUMBO', 'Ö', 'NYÅRSAFTON', 'FINAL'],
      },
    ],
  },
  {
    id: '2026-01-02',
    groups: [
      {
        category: 'Bildar 2026 med romerska siffror',
        words: ['MM', 'XX', 'V', 'I'],
      },
      {
        category: 'Ja, visst handlar det om kungen',
        words: ['XVI', 'SILVIA', 'STATSCHEF', 'KÄRA ÖREBROARE'],
      },
      {
        category: 'Hör hemma i Dalarna',
        words: ['DD', 'KURBITS', 'KULLA', 'DALHALLA'],
      },
      {
        category: 'Förknippas med kopia',
        words: ['CC', 'EX', 'KLON', 'REPLIK'],
      },
    ],
  },
  {
    id: '2026-01-14',
    groups: [
      {
        category: 'Mage',
        words: ['KULA', 'KAGGE', 'KISTA', 'BUK'],
      },
      {
        category: 'Schackpjäser',
        words: ['KUNG', 'TORN', 'DAM', 'BONDE'],
      },
      {
        category: 'Håller till på vatten',
        words: ['PIRAT', 'SKRÄDDARE', 'LOTS', 'SVAN'],
      },
      {
        category: 'Både svarta och vita',
        words: ['SKATA', 'SJÖRÖVARFLAGGA', 'SCHACKBRÄDE', 'PONGO'],
      },
    ],
  },
  {
    id: '2026-01-15',
    groups: [
      {
        category: 'Har fått namn efter personer',
        words: ['MERCEDES-BENZ', 'TESLA', 'SAXOFON', 'JACUZZI'],
      },
      {
        category: 'Kända Greta',
        words: ['GARBO', 'THUNBERG', 'GRIS', 'HANS SYSTER'],
      },
      {
        category: 'Här gömmer sig två djur',
        words: ['SÄLG', 'MÅSVINGE', 'HÄSTSVANS', 'ORMVRÅK'],
      },
      {
        category: 'Har taggar',
        words: ['INSTAGRAM', 'KAKTUS', 'TÖRNBUSKE', 'SIMPA'],
      },
    ],
  },
  {
    id: '2026-01-22',
    groups: [
      {
        category: 'Resan',
        words: ['TRIPPEN', 'ODYSSÉN', 'TUREN', 'RUTTEN'],
      },
      {
        category: 'Kan kopplas till Fredrik',
        words: ['HESA', 'ÅKARE', 'ADOLF', 'FREDDE'],
      },
      {
        category: 'Börjar på transportmedel',
        words: ['BILLY', 'TÅGÅNGARE', 'CYKELBANA', 'PLANKORSNINGEN'],
      },
      {
        category: 'Har prickar',
        words: ['GAMMAL BANAN', 'KID', 'FARLED', 'Ö'],
      },
    ],
  },
];

// Utility function to get a random word set
export function getRandomWordSet(): WordSet {
  return wordSets[Math.floor(Math.random() * wordSets.length)];
}
