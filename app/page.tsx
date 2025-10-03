'use client';

import { useState } from 'react';
import { Home, FileCheck, Download, LogOut } from 'lucide-react';
import PDFUploader from './components/PDFUploader';
import PhotoUploader from './components/PhotoUploader';
import LoadingAnimation from './components/LoadingAnimation';
import ResultsPanel from './components/ResultsPanel';
import ManualReview from './components/ManualReview';
import type { AIResponse } from '@/types';
import { useRouter } from 'next/navigation';
import { PDFAnalysisResponse } from '@/lib/anthropicPDF';

type Step = 'upload' | 'analyzing' | 'results';

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('upload');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [photos, setPhotos] = useState<{ files: File[]; base64s: string[] }>({
    files: [],
    base64s: [],
  });
  const [results, setResults] = useState<PDFAnalysisResponse | null>(null);
  const [manualEdits, setManualEdits] = useState<Partial<AIResponse> | null>(null);
  const [bankOfficerNote, setBankOfficerNote] = useState('');
  const [error, setError] = useState('');

  const handlePDFChange = (file: File | null, base64: string) => {
    setPdfFile(file);
    setPdfBase64(base64);
  };

  const handlePhotosChange = (files: File[], base64s: string[]) => {
    setPhotos({ files, base64s });
  };

  const handleAnalyze = async () => {
    if (!pdfFile || photos.files.length < 8) {
      setError('Nahrajte prosím PDF formulář a minimálně 8 fotografií');
      return;
    }

    setError('');
    setStep('analyzing');

    try {
      const requestBody = {
        pdfBase64,
        photos: photos.base64s,
      };

      const response = await fetch('/api/analyze-property-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setResults(data.data);
        setStep('results');
      } else {
        setError(data.error || 'Chyba při analýze');
        setStep('upload');
      }
    } catch (err) {
      setError('Chyba při komunikaci se serverem');
      setStep('upload');
      console.error(err);
    }
  };

  const handleManualSave = (edits: Partial<AIResponse>, note: string) => {
    setManualEdits(edits);
    setBankOfficerNote(note);
  };

  const handleExportPDF = async () => {
    if (!results) return;

    try {
      const response = await fetch('/api/generate-pdf-from-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validationResults: results,
          extractedData: results.extractedData,
          manualEdits,
          bankOfficerNote,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vysledek-kontroly-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Chyba při generování PDF');
      }
    } catch (err) {
      setError('Chyba při exportu PDF');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleReset = () => {
    setStep('upload');
    setPdfFile(null);
    setPdfBase64('');
    setPhotos({ files: [], base64s: [] });
    setResults(null);
    setManualEdits(null);
    setBankOfficerNote('');
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="glass-panel fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI Kontrola Nemovitostí</h1>
              <p className="text-sm text-gray-600">Česká spořitelna - Automatická kontrola z PDF</p>
            </div>
          </div>
          <button onClick={handleLogout} className="glass-button-secondary flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Odhlásit se
          </button>
        </div>
      </div>

      {/* PROGRESS INDICATOR */}
      <div className="glass-panel fade-in">
        <div className="flex items-center justify-between">
          {['upload', 'analyzing', 'results'].map((s, idx) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  step === s
                    ? 'bg-primary text-white'
                    : ['upload', 'analyzing', 'results'].indexOf(step) > idx
                    ? 'bg-success text-white'
                    : 'bg-white/50 text-gray-400'
                }`}
              >
                {idx + 1}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {s === 'upload' ? 'Nahrání' : s === 'analyzing' ? 'Analýza' : 'Výsledky'}
                </p>
              </div>
              {idx < 2 && <div className="flex-1 h-1 bg-white/30 mx-4"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="glass-panel bg-error/10 border-2 border-error fade-in">
          <p className="text-error font-medium">{error}</p>
        </div>
      )}

      {/* STEP: UPLOAD */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="glass-panel fade-in">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              📤 Nahrání dokumentů
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Nahrajte standardizovaný PDF formulář &quot;Ocenění rodinného domu&quot; a minimálně 8 fotografií nemovitosti.
              AI automaticky extrahuje data z PDF a zkontroluje je oproti fotografiím.
            </p>

            <div className="space-y-8">
              <PDFUploader onFileChange={handlePDFChange} />
              <PhotoUploader onFilesChange={handlePhotosChange} />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!pdfFile || photos.files.length < 8}
              className="glass-button-primary flex items-center gap-2"
            >
              <FileCheck className="w-5 h-5" />
              Analyzovat nemovitost
            </button>
          </div>
        </div>
      )}

      {/* STEP: ANALYZING */}
      {step === 'analyzing' && (
        <LoadingAnimation message="Analyzuji PDF a fotografie..." />
      )}

      {/* STEP: RESULTS */}
      {step === 'results' && results && (
        <div className="space-y-6">
          {/* Extracted Data Section */}
          <div className="glass-panel fade-in">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">📄 Extrahovaná data z PDF</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Adresa:</p>
                <p>{results.extractedData.address.street} {results.extractedData.address.houseNumber}</p>
                <p>{results.extractedData.address.zipCode} {results.extractedData.address.city}</p>
              </div>
              <div>
                <p className="font-semibold">Dispozice:</p>
                <p>{results.extractedData.layout}</p>
              </div>
              <div>
                <p className="font-semibold">Stav:</p>
                <p>{results.extractedData.propertyCondition}</p>
              </div>
              <div>
                <p className="font-semibold">Plocha:</p>
                <p>Pozemek: {results.extractedData.landArea} m²</p>
                <p>Zastavěná: {results.extractedData.builtUpArea} m²</p>
                <p>Celková: {results.extractedData.totalFloorArea} m²</p>
              </div>
            </div>
          </div>

          <ResultsPanel results={results} formData={results.extractedData as any} />

          <ManualReview results={results} formData={results.extractedData as any} onSave={handleManualSave} />

          <div className="flex justify-between">
            <button onClick={handleReset} className="glass-button-secondary">
              🔄 Nová kontrola
            </button>
            <button onClick={handleExportPDF} className="glass-button-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportovat PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
