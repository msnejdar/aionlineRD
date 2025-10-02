import { NextRequest, NextResponse } from 'next/server';
import { analyzeProperty } from '@/lib/anthropic';
import { validatePropertyForm } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import type { AnalyzePropertyRequest, AnalyzePropertyResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(ip, 5)) {
      return NextResponse.json(
        { success: false, error: 'Překročen limit požadavků. Zkuste to za chvíli.' } as AnalyzePropertyResponse,
        { status: 429 }
      );
    }

    // Parse request body
    const body: AnalyzePropertyRequest = await request.json();

    // Validate form data
    const validation = validatePropertyForm(body.formData);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Neplatná data formuláře: ${validation.error.errors[0].message}`,
        } as AnalyzePropertyResponse,
        { status: 400 }
      );
    }

    // Check minimum photo requirements
    if (body.photos.exterior.length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Musí být nahrány minimálně 4 fotografie exteriéru + číslo popisné (celkem 5 fotek)',
        } as AnalyzePropertyResponse,
        { status: 400 }
      );
    }

    if (body.photos.interior.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Musí být nahrány minimálně 3 fotografie interiéru (kuchyň, koupelna, chodba)',
        } as AnalyzePropertyResponse,
        { status: 400 }
      );
    }

    // Call Claude API
    const result = await analyzeProperty({
      formData: body.formData,
      photos: body.photos,
      cadastralMap: body.cadastralMap,
      projectDoc: body.projectDoc,
    });

    return NextResponse.json({ success: true, data: result } as AnalyzePropertyResponse);
  } catch (error: unknown) {
    console.error('Analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba při analýze';

    return NextResponse.json(
      { success: false, error: errorMessage } as AnalyzePropertyResponse,
      { status: 500 }
    );
  }
}
