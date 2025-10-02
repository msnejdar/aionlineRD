import { NextRequest, NextResponse } from 'next/server';
import { generateResultsPDF } from '@/lib/pdfGenerator';
import type { GeneratePDFRequest, GeneratePDFResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePDFRequest = await request.json();

    const pdfBytes = await generateResultsPDF({
      formData: body.formData,
      validationResults: body.validationResults,
      manualEdits: body.manualEdits,
      bankOfficerNote: body.bankOfficerNote,
    });

    // Return PDF as downloadable file
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="vysledek-kontroly-${Date.now()}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error('PDF generation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba při generování PDF';

    return NextResponse.json({ success: false, error: errorMessage } as GeneratePDFResponse, { status: 500 });
  }
}
