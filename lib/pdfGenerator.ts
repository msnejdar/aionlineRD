import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PropertyFormData, AIResponse } from '@/types';

interface PDFGenerationOptions {
  formData: PropertyFormData;
  validationResults: AIResponse;
  manualEdits?: Partial<AIResponse>;
  bankOfficerNote?: string;
}

export async function generateResultsPDF(options: PDFGenerationOptions): Promise<Uint8Array> {
  const { formData, validationResults, manualEdits, bankOfficerNote } = options;

  // Merge manual edits if provided
  const finalResults = manualEdits
    ? { ...validationResults, ...manualEdits }
    : validationResults;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = height - 50;
  const leftMargin = 50;
  const fontSize = 10;
  const lineHeight = 15;

  // Helper functions
  const drawText = (text: string, x: number, y: number, options?: { bold?: boolean; color?: [number, number, number] }) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font: options?.bold ? boldFont : font,
      color: options?.color ? rgb(...options.color) : rgb(0, 0, 0),
    });
  };

  const drawBox = (x: number, y: number, w: number, h: number, color: [number, number, number]) => {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      borderColor: rgb(...color),
      borderWidth: 2,
      color: rgb(color[0] + 0.8, color[1] + 0.8, color[2] + 0.8),
      opacity: 0.3,
    });
  };

  const getColor = (color: string): [number, number, number] => {
    switch (color) {
      case 'green':
        return [0, 0.78, 0.33]; // #00C853
      case 'red':
        return [1, 0.23, 0.19]; // #FF3B30
      case 'yellow':
        return [1, 0.72, 0]; // #FFB800
      default:
        return [0.5, 0.5, 0.5];
    }
  };

  // === HEADER ===
  drawText('VÝSLEDEK KONTROLY NEMOVITOSTI', leftMargin, yPosition, { bold: true });
  yPosition -= lineHeight;
  drawText('AI Automatická Kontrola', leftMargin, yPosition);
  yPosition -= lineHeight * 2;

  // === RECOMMENDATION BOX ===
  const recColor: [number, number, number] =
    finalResults.recommendation === 'approved'
      ? [0, 0.78, 0.33]
      : finalResults.recommendation === 'rejected'
      ? [1, 0.23, 0.19]
      : [1, 0.72, 0];

  drawBox(leftMargin, yPosition - 20, width - 2 * leftMargin, 30, recColor);
  drawText(
    `DOPORUČENÍ: ${finalResults.recommendation.toUpperCase()}`,
    leftMargin + 10,
    yPosition - 5,
    { bold: true }
  );
  yPosition -= 50;

  // === PROPERTY INFO ===
  drawText('ZÁKLADNÍ ÚDAJE', leftMargin, yPosition, { bold: true });
  yPosition -= lineHeight;
  drawText(`Adresa: ${formData.address.street} ${formData.address.houseNumber}, ${formData.address.city}`, leftMargin, yPosition);
  yPosition -= lineHeight;
  drawText(`PSČ: ${formData.address.zipCode}`, leftMargin, yPosition);
  yPosition -= lineHeight * 2;

  // === VALIDATION RESULTS ===
  drawText('VÝSLEDKY KONTROLY POLÍ', leftMargin, yPosition, { bold: true });
  yPosition -= lineHeight;

  const fields: Array<{ key: keyof typeof finalResults.validation; label: string; value: string }> = [
    { key: 'propertyCondition', label: 'Stav nemovitosti', value: formData.propertyCondition },
    { key: 'layout', label: 'Dispozice', value: formData.layout },
    { key: 'numberOfFloors', label: 'Počet podlaží', value: String(formData.numberOfFloors) },
    { key: 'hasAttic', label: 'Podkroví', value: formData.hasAttic ? 'Ano' : 'Ne' },
    { key: 'atticHabitable', label: 'Obytné podkroví', value: formData.atticHabitable ? 'Ano' : 'Ne' },
    { key: 'hasBasement', label: 'Sklep', value: formData.hasBasement ? 'Ano' : 'Ne' },
    { key: 'roofType', label: 'Typ střechy', value: formData.roofType },
    { key: 'landArea', label: 'Plocha pozemku', value: `${formData.landArea} m²` },
    { key: 'builtUpArea', label: 'Zastavěná plocha', value: `${formData.builtUpArea} m²` },
    { key: 'totalFloorArea', label: 'Celková plocha', value: `${formData.totalFloorArea} m²` },
  ];

  for (const field of fields) {
    const validation = finalResults.validation[field.key];
    const color = getColor(validation.color);

    drawBox(leftMargin, yPosition - 12, 20, 12, color);
    drawText(`${field.label}: ${field.value}`, leftMargin + 25, yPosition - 5);
    drawText(`(${validation.note})`, leftMargin + 200, yPosition - 5);

    yPosition -= lineHeight;

    if (yPosition < 100) {
      // New page
      yPosition = height - 50;
    }
  }

  yPosition -= lineHeight;

  // === FLOOR AREA ESTIMATE ===
  drawText('VÝPOČET PODLAHOVÉ PLOCHY', leftMargin, yPosition, { bold: true });
  yPosition -= lineHeight;
  drawText(`Klient uvedl: ${formData.totalFloorArea} m²`, leftMargin, yPosition);
  yPosition -= lineHeight;
  drawText(`AI vypočítala: ${finalResults.floorAreaEstimate.calculated} m²`, leftMargin, yPosition);
  yPosition -= lineHeight;
  drawText(`Jistota: ${finalResults.floorAreaEstimate.confidence}%`, leftMargin, yPosition);
  yPosition -= lineHeight;
  drawText(`Metoda: ${finalResults.floorAreaEstimate.method}`, leftMargin, yPosition);
  yPosition -= lineHeight;
  drawText(`Detail: ${finalResults.floorAreaEstimate.details}`, leftMargin, yPosition);
  yPosition -= lineHeight * 2;

  // === ISSUES ===
  if (
    finalResults.issues.underConstruction ||
    finalResults.issues.severelyDamaged ||
    finalResults.issues.visibleCracks ||
    finalResults.issues.facadeDamagePercent > 0 ||
    finalResults.issues.missingPhotos.length > 0
  ) {
    drawText('NALEZENÉ PROBLÉMY', leftMargin, yPosition, { bold: true });
    yPosition -= lineHeight;

    if (finalResults.issues.underConstruction) {
      drawText('• Nemovitost je v rekonstrukci', leftMargin, yPosition, { color: [1, 0, 0] });
      yPosition -= lineHeight;
    }
    if (finalResults.issues.severelyDamaged) {
      drawText('• Výrazné poškození nemovitosti', leftMargin, yPosition, { color: [1, 0, 0] });
      yPosition -= lineHeight;
    }
    if (finalResults.issues.visibleCracks) {
      drawText('• Viditelné praskliny', leftMargin, yPosition, { color: [1, 0, 0] });
      yPosition -= lineHeight;
    }
    if (finalResults.issues.facadeDamagePercent > 0) {
      drawText(`• Poškození fasády: ${finalResults.issues.facadeDamagePercent}%`, leftMargin, yPosition, {
        color: [1, 0, 0],
      });
      yPosition -= lineHeight;
    }
    if (finalResults.issues.missingPhotos.length > 0) {
      drawText('• Chybějící fotografie:', leftMargin, yPosition, { color: [1, 0.5, 0] });
      yPosition -= lineHeight;
      for (const missing of finalResults.issues.missingPhotos) {
        drawText(`  - ${missing}`, leftMargin + 10, yPosition);
        yPosition -= lineHeight;
      }
    }

    yPosition -= lineHeight;
  }

  // === SUMMARY ===
  drawText('SHRNUTÍ', leftMargin, yPosition, { bold: true });
  yPosition -= lineHeight;

  const summaryLines = finalResults.summary.match(/.{1,80}(\s|$)/g) || [finalResults.summary];
  for (const line of summaryLines) {
    drawText(line.trim(), leftMargin, yPosition);
    yPosition -= lineHeight;
  }

  yPosition -= lineHeight;

  // === BANK OFFICER NOTE ===
  if (bankOfficerNote) {
    drawText('POZNÁMKA BANKÉŘE', leftMargin, yPosition, { bold: true });
    yPosition -= lineHeight;

    const noteLines = bankOfficerNote.match(/.{1,80}(\s|$)/g) || [bankOfficerNote];
    for (const line of noteLines) {
      drawText(line.trim(), leftMargin, yPosition);
      yPosition -= lineHeight;
    }
  }

  // === FOOTER ===
  const now = new Date().toLocaleString('cs-CZ');
  drawText(`Datum kontroly: ${now}`, leftMargin, 30);
  drawText('Zpracováno pomocí umělé inteligence (Claude AI)', leftMargin, 15);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
