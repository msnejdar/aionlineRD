import { z } from 'zod';

export const PropertyFormSchema = z.object({
  address: z.object({
    street: z.string().min(1, 'Povinné pole'),
    houseNumber: z.string().min(1, 'Povinné pole'),
    city: z.string().min(1, 'Povinné pole'),
    zipCode: z.string().regex(/^\d{5}$/, 'Neplatné PSČ (formát: 12345)'),
  }),

  cadastral: z.object({
    region: z.string().min(1, 'Povinné pole'),
    district: z.string().min(1, 'Povinné pole'),
    municipality: z.string().min(1, 'Povinné pole'),
    cadastralArea: z.string().min(1, 'Povinné pole'),
    landRegistryNumber: z.string().min(1, 'Povinné pole'),
  }),

  propertyCondition: z.enum([
    'novostavba',
    'výborně udržovaný',
    'dobře udržovaný',
    'neudržovaný k celkové rekonstrukci'
  ]),

  layout: z.enum(['1kk', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1', '7+1', 'jiný']),

  numberOfFloors: z.union([z.literal(1), z.literal(2)]),

  hasAttic: z.boolean(),
  atticHabitable: z.boolean(),
  hasBasement: z.boolean(),

  roofType: z.enum([
    'valbová',
    'mansardová',
    'plochá',
    'pultová',
    'stanová',
    'věžová',
    'polovalbová'
  ]),

  landArea: z.number().positive('Plocha pozemku musí být kladné číslo'),
  builtUpArea: z.number().positive('Zastavěná plocha musí být kladné číslo'),
  totalFloorArea: z.number().positive('Celková plocha musí být kladné číslo'),

  constructionYear: z.number()
    .int('Rok musí být celé číslo')
    .min(1800, 'Rok výstavby musí být po roce 1800')
    .max(new Date().getFullYear() + 2, 'Rok výstavby nemůže být v budoucnosti'),

  constructionType: z.string().min(1, 'Povinné pole'),

  garageCount: z.number().int().min(0, 'Počet garáží nemůže být záporný'),

  utilities: z.object({
    water: z.enum(['síť', 'studna']),
    electricity: z.enum(['síť', 'ostrovní']),
    sewage: z.enum(['tlaková kanalizace', 'spádová kanalizace', 'ČOV (čistička odpadních vod)']),
    gas: z.boolean(),
    heating: z.string().min(1, 'Povinné pole'),
  }),
});

export type PropertyFormValidated = z.infer<typeof PropertyFormSchema>;

export function validatePropertyForm(data: unknown) {
  return PropertyFormSchema.safeParse(data);
}

// Helper: Get required number of room photos based on layout
export function getRequiredRoomsCount(layout: string): number {
  const map: Record<string, number> = {
    '1kk': 1,
    '1+1': 1,
    '2+1': 2,
    '3+1': 3,
    '4+1': 4,
    '5+1': 5,
    '6+1': 6,
    '7+1': 7,
    'jiný': 1,
  };
  return map[layout] || 1;
}

// Helper: Get required minimum photos
export function getRequiredPhotoCounts(layout: string, garageCount: number) {
  return {
    exterior: 5, // 4 světové strany + číslo popisné
    interior: {
      kitchen: 1,
      bathroom: 1,
      hallway: 1,
      rooms: getRequiredRoomsCount(layout),
    },
    garage: garageCount,
  };
}
