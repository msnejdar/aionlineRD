import { NextRequest, NextResponse } from 'next/server';
import { analyzePropertyFromPDF } from '@/lib/anthropicPDF';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(ip, 5)) {
      return NextResponse.json(
        { success: false, error: 'Překročen limit požadavků. Zkuste to za chvíli.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { pdfBase64, photos } = body;

    // Validate inputs
    if (!pdfBase64) {
      return NextResponse.json(
        { success: false, error: 'PDF formulář je povinný' },
        { status: 400 }
      );
    }

    if (!photos || !Array.isArray(photos) || photos.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Musí být nahráno minimálně 8 fotografií' },
        { status: 400 }
      );
    }

    // Call Claude API
    const result = await analyzePropertyFromPDF({
      pdfBase64,
      photos,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('PDF Analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba při analýze';

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
