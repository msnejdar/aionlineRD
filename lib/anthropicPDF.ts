import Anthropic from '@anthropic-ai/sdk';
import { AIResponse } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface PDFAnalysisRequest {
  pdfBase64: string;
  photos: string[]; // base64
}

function constructPDFPrompt(): string {
  const today = new Date().toISOString().split('T')[0];

  return `Jsi expert na oceňování nemovitostí.

TVŮJ ÚKOL:
1. PŘEČTI PDF formulář "Ocenění rodinného domu" a EXTRAHUJ všechny údaje
2. ZKONTROLUJ extrahované údaje oproti přiloženým fotografiím
3. Buď PŘÍSNÝ a DŮSLEDNÝ při vyhodnocování

STRUKTURA PDF FORMULÁŘE:
- Adresa nemovitosti
- Katastrální údaje (kraj, okres, obec, k.ú., LV)
- Stav rodinného domu (výborně udržovaný / dobře udržovaný / neudržovaný)
- Konstrukce
- Dispozice (např. 4 + kk)
- Počet podlaží
- Podkroví (ANO/NE)
- Využití podkroví
- Typ střechy (valbová, mansardová, plochá, pultová, stanová, věžová, polovalbová)
- Podsklepení (ANO/NE)
- Počet garáží
- Plocha pozemku (m²)
- Zastavěná plocha (m²)
- Celková podlahová plocha (m²)
- Přípojky:
  - Voda (ze sítě / ze studně)
  - Elektřina (ze sítě / ostrovní)
  - Kanalizace (tlaková / spádová / ČOV)
  - Plyn (ANO/NE)
  - Vytápění

KROK 1: EXTRAKCE DAT Z PDF
Přečti PDF a vytvoř JSON strukturu se všemi extrahovanými údaji.

KROK 2: PRIORITNÍ KONTROLA - ODMÍTACÍ KRITÉRIA
Zkontroluj fotografie:
1. ❌ REKONSTRUKCE: Pokud je nemovitost v aktivní rekonstrukci (bourání, lešení, rozestavěné části) → OKAMŽITĚ ZAMÍTNOUT
2. ❌ VÝRAZNÉ POŠKOZENÍ: Pokud nelze nemovitost užívat (zřícené části, chybějící střecha) → OKAMŽITĚ ZAMÍTNOUT
3. ❌ PRASKLINY: Pokud jsou na JAKÉKOLIV fotce viditelné praskliny v konstrukci → OKAMŽITĚ ZAMÍTNOUT
4. ❌ FASÁDA: Pokud chybí více než 20% fasády → OKAMŽITĚ ZAMÍTNOUT
5. ❌ NEKOMPLETNÍ FOTODOKUMENTACE: Pokud chybí požadované fotky → OKAMŽITĚ ZAMÍTNOUT

KROK 3: KONTROLA KAŽDÉHO POLE
Porovnej extrahované údaje z PDF s fotografiemi. Pro každé pole vrať:

{
  "fieldName": {
    "extractedValue": "hodnota z PDF",
    "matches": boolean,              // souhlasí s fotografiemi?
    "confidence": "high" | "medium" | "low",
    "note": string,                  // vysvětlení (max 100 znaků)
    "color": "green" | "red" | "yellow"  // zelená=souhlasí, červená=nesouhlasí, žlutá=nejisté
  }
}

POLE KE KONTROLE:
1. propertyCondition - odpovídá stav na fotkách údaji v PDF?
2. layout (dispozice) - spočítej pokoje z fotek, souhlasí s PDF?
3. numberOfFloors - spočítej podlaží z exteriéru
4. hasAttic - je vidět podkroví?
5. atticHabitable - pokud je podkroví, je obytné? (okna, úprava)
6. hasBasement - pokud jsou fotky sklepa nebo je vidět z venku
7. roofType - souhlasí typ střechy?
8. landArea - pokud je možné odhadnout z fotek
9. builtUpArea - odhadni ze záběrů
10. totalFloorArea - vypočítej z fotek (viz níže)

VÝPOČET PODLAHOVÉ PLOCHY:
Priorita zdrojů:
1. Hodnota z PDF jako základ
2. Odhad z FOTOGRAFIÍ INTERIÉRU - rozměry místností, nábytek jako měřítko
3. Odhad z EXTERIÉRU - zastavěná plocha × počet podlaží

Do započitatelné plochy NEZAHRNUJ:
- Neobytné podkroví
- Sklep
- Garáž

Vrať:
{
  "floorAreaEstimate": {
    "pdfValue": number,             // hodnota z PDF
    "calculated": number,           // tvůj odhad v m²
    "confidence": number,           // 0-100%
    "method": "pdfDocument" | "interiorPhotos" | "exteriorEstimate",
    "details": string,              // jak jsi to spočítal (max 200 znaků)
    "matchesClientData": boolean,   // souhlasí s PDF?
    "difference": number            // rozdíl v m²
  }
}

AKTUÁLNOST FOTEK:
- Zkontroluj roční období na fotkách vs dnešní datum (${today})
- Pokud jsou fotky zjevně staré, označ to

FINÁLNÍ DOPORUČENÍ:
{
  "recommendation": "approved" | "rejected" | "manualReview",
  "summary": string  // 2-3 věty shrnující výsledky kontroly
}

Pokud JAKÉKOLIV odmítací kritérium je splněno → recommendation = "rejected"
Pokud data převážně souhlasí a žádné odmítací kritérium → recommendation = "approved"
Pokud si nejsi jistý u více než 3 polí → recommendation = "manualReview"

FORMÁT ODPOVĚDI:
Vrať POUZE validní JSON objekt, žádný další text:

{
  "extractedData": {
    "address": {
      "street": string,
      "houseNumber": string,
      "city": string,
      "zipCode": string
    },
    "cadastral": {
      "region": string,
      "district": string,
      "municipality": string,
      "cadastralArea": string,
      "landRegistryNumber": string
    },
    "propertyCondition": string,
    "construction": string,
    "layout": string,
    "numberOfFloors": number,
    "hasAttic": boolean,
    "atticHabitable": boolean,
    "hasBasement": boolean,
    "roofType": string,
    "garageCount": number,
    "landArea": number,
    "builtUpArea": number,
    "totalFloorArea": number,
    "utilities": {
      "water": string,
      "electricity": string,
      "sewage": string,
      "gas": boolean,
      "heating": string
    }
  },
  "validation": {
    "propertyCondition": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string },
    "layout": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string },
    "numberOfFloors": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string },
    "hasAttic": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string },
    "atticHabitable": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string },
    "hasBasement": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string },
    "roofType": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string },
    "landArea": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string },
    "builtUpArea": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string },
    "totalFloorArea": { "extractedValue": string, "matches": boolean, "confidence": string, "note": string, "color": string }
  },
  "floorAreaEstimate": {
    "pdfValue": number,
    "calculated": number,
    "confidence": number,
    "method": string,
    "details": string,
    "matchesClientData": boolean,
    "difference": number
  },
  "issues": {
    "underConstruction": boolean,
    "severelyDamaged": boolean,
    "visibleCracks": boolean,
    "facadeDamagePercent": number,
    "missingPhotos": ["..."],
    "photosOutdated": boolean
  },
  "recommendation": "approved" | "rejected" | "manualReview",
  "summary": "..."
}`;
}

export interface PDFAnalysisResponse extends AIResponse {
  extractedData: {
    address: {
      street: string;
      houseNumber: string;
      city: string;
      zipCode: string;
    };
    cadastral: {
      region: string;
      district: string;
      municipality: string;
      cadastralArea: string;
      landRegistryNumber: string;
    };
    propertyCondition: string;
    construction: string;
    layout: string;
    numberOfFloors: number;
    hasAttic: boolean;
    atticHabitable: boolean;
    hasBasement: boolean;
    roofType: string;
    garageCount: number;
    landArea: number;
    builtUpArea: number;
    totalFloorArea: number;
    utilities: {
      water: string;
      electricity: string;
      sewage: string;
      gas: boolean;
      heating: string;
    };
  };
}

export async function analyzePropertyFromPDF(data: PDFAnalysisRequest): Promise<PDFAnalysisResponse> {
  try {
    // Build content array with PDF and photos
    const content: Anthropic.MessageParam['content'] = [];

    // Add PDF as document (Claude 3.5 Sonnet supports PDF)
    content.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: data.pdfBase64,
      },
    } as any); // TypeScript workaround for document type

    // Add all photos
    for (const photo of data.photos) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: photo,
        },
      });
    }

    // Add text prompt
    content.push({
      type: 'text',
      text: constructPDFPrompt(),
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    const result = JSON.parse(jsonMatch[0]) as PDFAnalysisResponse;
    return result;
  } catch (error: unknown) {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        throw new Error('Překročen limit požadavků. Zkuste to za chvíli.');
      }
      if (error.status === 401) {
        throw new Error('Neplatný API klíč.');
      }
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('Chyba při komunikaci s AI. Zkuste to znovu.');
  }
}
