import Anthropic from '@anthropic-ai/sdk';
import { PropertyFormData, AIResponse } from '@/types';
import { getRequiredRoomsCount } from './validation';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface AnalysisRequest {
  formData: PropertyFormData;
  photos: {
    exterior: string[]; // base64
    interior: string[];
    additional: string[];
  };
  cadastralMap?: string;
  projectDoc?: string;
}

function constructPrompt(data: AnalysisRequest): string {
  const today = new Date().toISOString().split('T')[0];
  const requiredRooms = getRequiredRoomsCount(data.formData.layout);

  return `Jsi expert na oceňování nemovitostí pro Českou spořitelnu.

TVŮJ ÚKOL:
Analyzuj přiloženou fotodokumentaci a porovnej ji s údaji vyplněnými klientem. Buď PŘÍSNÝ a DŮSLEDNÝ při vyhodnocování.

PRIORITNÍ KONTROLA - ODMÍTACÍ KRITÉRIA:
1. ❌ REKONSTRUKCE: Pokud je nemovitost v aktivní rekonstrukci (bourání, lešení, rozestavěné části) → OKAMŽITĚ ZAMÍTNOUT
2. ❌ VÝRAZNÉ POŠKOZENÍ: Pokud nelze nemovitost užívat (zřícené části, chybějící střecha) → OKAMŽITĚ ZAMÍTNOUT
3. ❌ PRASKLINY: Pokud jsou na JAKÉKOLIV fotce viditelné praskliny v konstrukci → OKAMŽITĚ ZAMÍTNOUT
4. ❌ FASÁDA: Pokud chybí více než 20% fasády → OKAMŽITĚ ZAMÍTNOUT
5. ❌ NEKOMPLETNÍ FOTODOKUMENTACE: Pokud chybí požadované fotky podle dispozice → OKAMŽITĚ ZAMÍTNOUT

POŽADOVANÁ FOTODOKUMENTACE:
Exteriér:
- Přední strana s číslem popisným (MUSÍ být viditelné číslo)
- Zadní strana
- Levá strana
- Pravá strana
- Celkový pohled

Interiér podle dispozice "${data.formData.layout}":
- Kuchyň (1 foto)
- Koupelna (1+ foto)
- Chodba (1 foto)
- Pokoje: ${requiredRooms} fotek

Vedlejší stavby (pokud garageCount > 0):
- Garáž/stodola: ${data.formData.garageCount} fotek

KONTROLA KAŽDÉHO POLE:
Pro každé pole vrať:
{
  "fieldName": {
    "matches": boolean,              // true = souhlasí, false = nesouhlasí
    "confidence": "high" | "medium" | "low",  // jistota
    "note": string,                  // stručné vysvětlení (max 100 znaků)
    "color": "green" | "red" | "yellow"  // zelená=souhlasí+high, červená=nesouhlasí, žlutá=nejisté
  }
}

POLE KE KONTROLE:
1. propertyCondition (klient uvedl: "${data.formData.propertyCondition}") - porovnej skutečný stav s tvrzením klienta
2. layout (klient uvedl: "${data.formData.layout}") - spočítej počet pokojů z fotek interiéru
3. numberOfFloors (klient uvedl: ${data.formData.numberOfFloors}) - spočítej podlaží z exteriérových fotek
4. hasAttic (klient uvedl: ${data.formData.hasAttic}) - zhodnoť z venkovního pohledu
5. atticHabitable (klient uvedl: ${data.formData.atticHabitable}) - pokud je podkroví, je obytné? (okna, úprava)
6. hasBasement (klient uvedl: ${data.formData.hasBasement}) - pokud jsou fotky sklepa nebo je vidět sklep z venku
7. roofType (klient uvedl: "${data.formData.roofType}") - určit typ střechy z exteriéru
8. landArea (klient uvedl: ${data.formData.landArea} m²) - pokud je k dispozici katastrální mapa, ověř
9. builtUpArea (klient uvedl: ${data.formData.builtUpArea} m²) - odhadni ze záběrů shora nebo půdorysu
10. totalFloorArea (klient uvedl: ${data.formData.totalFloorArea} m²) - VYPOČÍTEJ (viz níže)

VÝPOČET PODLAHOVÉ PLOCHY:
Priorita zdrojů:
1. PROJEKTOVÁ DOKUMENTACE (${data.projectDoc ? 'K DISPOZICI' : 'NENÍ K DISPOZICI'}) - vezmi hodnoty odtud
2. FOTOGRAFIE INTERIÉRU - odhadni rozměry místností z úhlu pohledu, nábytek jako měřítko
3. EXTERIÉR - odhadni ze zastavěné plochy × počet podlaží

Do započitatelné plochy NEZAHRNUJ:
- Neobytné podkroví
- Sklep
- Garáž

Vrať:
{
  "floorAreaEstimate": {
    "calculated": number,           // tvůj odhad v m²
    "confidence": number,           // 0-100%
    "method": "projectDocumentation" | "interiorPhotos" | "exteriorEstimate",
    "details": string,              // jak jsi to spočítal (max 200 znaků)
    "matchesClientData": boolean,   // souhlasí s totalFloorArea od klienta?
    "difference": number            // rozdíl v m² (pokud nesouhlasí)
  }
}

AKTUÁLNOST FOTEK:
- Zkontroluj roční období na fotkách vs dnešní datum (${today})
- Pokud jsou fotky zjevně staré (jiné roční období), označ to

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
  "validation": {
    "propertyCondition": { "matches": boolean, "confidence": string, "note": string, "color": string },
    "layout": { "matches": boolean, "confidence": string, "note": string, "color": string },
    "numberOfFloors": { "matches": boolean, "confidence": string, "note": string, "color": string },
    "hasAttic": { "matches": boolean, "confidence": string, "note": string, "color": string },
    "atticHabitable": { "matches": boolean, "confidence": string, "note": string, "color": string },
    "hasBasement": { "matches": boolean, "confidence": string, "note": string, "color": string },
    "roofType": { "matches": boolean, "confidence": string, "note": string, "color": string },
    "landArea": { "matches": boolean, "confidence": string, "note": string, "color": string },
    "builtUpArea": { "matches": boolean, "confidence": string, "note": string, "color": string },
    "totalFloorArea": { "matches": boolean, "confidence": string, "note": string, "color": string }
  },
  "floorAreaEstimate": {
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

export async function analyzeProperty(data: AnalysisRequest): Promise<AIResponse> {
  try {
    // Build content array with images and text
    const content: Anthropic.MessageParam['content'] = [];

    // Add all exterior photos
    for (const photo of data.photos.exterior) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: photo,
        },
      });
    }

    // Add all interior photos
    for (const photo of data.photos.interior) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: photo,
        },
      });
    }

    // Add additional photos (garage, etc.)
    for (const photo of data.photos.additional) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: photo,
        },
      });
    }

    // Add cadastral map if available
    if (data.cadastralMap) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: data.cadastralMap,
        },
      });
    }

    // Add text prompt
    content.push({
      type: 'text',
      text: constructPrompt(data),
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

    const result = JSON.parse(jsonMatch[0]) as AIResponse;
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
