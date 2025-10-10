// === MAIN FORM DATA ===
export interface PropertyFormData {
  // Základní identifikace
  address: {
    street: string;
    houseNumber: string;
    city: string;
    zipCode: string;
  };

  // Katastrální údaje
  cadastral: {
    region: string;
    district: string;
    municipality: string;
    cadastralArea: string;
    landRegistryNumber: string;
  };

  // Údaje ke kontrole AI
  propertyCondition: 'novostavba' | 'výborně udržovaný' | 'dobře udržovaný' | 'neudržovaný k celkové rekonstrukci';
  layout: '1kk' | '1+1' | '2+1' | '3+1' | '4+1' | '5+1' | '6+1' | '7+1' | 'jiný';
  numberOfFloors: 1 | 2;
  hasAttic: boolean;
  atticHabitable: boolean;
  hasBasement: boolean;
  roofType: 'valbová' | 'mansardová' | 'plochá' | 'pultová' | 'stanová' | 'věžová' | 'polovalbová';

  // Plochy
  landArea: number;
  builtUpArea: number;
  totalFloorArea: number;

  // Další údaje
  constructionYear: number;
  constructionType: string;
  garageCount: number;

  utilities: {
    water: 'síť' | 'studna';
    electricity: 'síť' | 'ostrovní';
    sewage: 'tlaková kanalizace' | 'spádová kanalizace' | 'ČOV (čistička odpadních vod)';
    gas: boolean;
    heating: string;
  };
}

// === UPLOAD STRUCTURE ===
export interface PropertyDocumentation {
  photos: {
    exterior: File[];
    interior: File[];
    additional: File[];
  };
  cadastralMap?: File;
  projectDoc?: File;
  originalForm?: File;
}

// === AI RESPONSE ===
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type FieldColor = 'green' | 'red' | 'yellow';

export interface FieldValidation {
  matches: boolean;
  confidence: ConfidenceLevel;
  note: string;
  color: FieldColor;
}

export interface FloorAreaEstimate {
  calculated: number;
  confidence: number;
  method: 'technicalDocumentation' | 'projectDocumentation' | 'interiorPhotos' | 'exteriorEstimate';
  details: string;
  matchesClientData: boolean;
  difference?: number;
}

export interface CadastralMapCheck {
  available: boolean;
  landAreaMatches: boolean | null;
  buildingLocationCorrect: boolean | null;
  notes: string;
}

export interface PropertyIssues {
  underConstruction: boolean;
  severelyDamaged: boolean;
  visibleCracks: boolean;
  facadeDamagePercent: number;
  missingPhotos: string[];
  photosOutdated: boolean;
  incompleteExteriorCoverage: {
    isRowHouse: boolean;
    missingDirections: string[];
    severity: 'critical' | 'acceptable' | 'complete';
  };
}

export type RecommendationType = 'approved' | 'rejected' | 'manualReview';

export interface AIResponse {
  validation: {
    propertyCondition: FieldValidation;
    layout: FieldValidation;
    numberOfFloors: FieldValidation;
    hasAttic: FieldValidation;
    atticHabitable: FieldValidation;
    hasBasement: FieldValidation;
    roofType: FieldValidation;
    landArea: FieldValidation;
    builtUpArea: FieldValidation;
    totalFloorArea: FieldValidation;
  };
  floorAreaEstimate: FloorAreaEstimate;
  cadastralMapCheck: CadastralMapCheck;
  issues: PropertyIssues;
  recommendation: RecommendationType;
  summary: string;
}

// === API REQUEST/RESPONSE ===
export interface AnalyzePropertyRequest {
  formData: PropertyFormData;
  photos: {
    exterior: string[]; // base64
    interior: string[];
    additional: string[];
  };
  cadastralMap?: string;
  projectDoc?: string;
  originalForm?: string;
}

export interface AnalyzePropertyResponse {
  success: boolean;
  data?: AIResponse;
  error?: string;
}

export interface GeneratePDFRequest {
  validationResults: AIResponse;
  formData: PropertyFormData;
  manualEdits?: Partial<AIResponse>;
  bankOfficerNote?: string;
}

export interface GeneratePDFResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}
