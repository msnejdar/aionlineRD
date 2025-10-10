'use client';

import { useState } from 'react';
import { Home, FileCheck, Download, LogOut } from 'lucide-react';
import PDFUploader from './components/PDFUploader';
import PhotoUploader from './components/PhotoUploader';
import CadastralMapUploader from './components/CadastralMapUploader';
import TechnicalDocUploader from './components/TechnicalDocUploader';
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
  const [cadastralMap, setCadastralMap] = useState<{ file: File | null; base64: string }>({
    file: null,
    base64: '',
  });
  const [technicalDoc, setTechnicalDoc] = useState<{ file: File | null; base64: string }>({
    file: null,
    base64: '',
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

  const handleCadastralMapChange = (file: File | null, base64: string) => {
    setCadastralMap({ file, base64 });
  };

  const handleTechnicalDocChange = (file: File | null, base64: string) => {
    setTechnicalDoc({ file, base64 });
  };

  const handleAnalyze = async () => {
    if (!pdfFile || photos.files.length === 0) {
      setError('Nahrajte prosím PDF formulář a fotografie');
      return;
    }

    setError('');
    setStep('analyzing');

    try {
      const requestBody = {
        pdfBase64,
        photos: photos.base64s,
        cadastralMap: cadastralMap.base64 || undefined,
        technicalDoc: technicalDoc.base64 || undefined,
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
    setCadastralMap({ file: null, base64: '' });
    setTechnicalDoc({ file: null, base64: '' });
    setResults(null);
    setManualEdits(null);
    setBankOfficerNote('');
    setError('');
  };

  return (
    <div className="page-wrapper">
      <div className="content-wrapper space-y-6">
        {/* HEADER */}
        <div className="card fade-in" style={{ boxShadow: 'var(--shadow-elevation-2)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 flex items-center justify-center"
                style={{
                  background: 'var(--color-primary)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-elevation-3)'
                }}
              >
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>AI Kontrola Nemovitostí</h1>
                <p style={{ color: 'var(--color-neutral-medium)', fontSize: '0.95rem' }}>
                  Automatická kontrola z PDF pomocí AI
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </button>
          </div>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="card fade-in" style={{ boxShadow: 'var(--shadow-elevation-1)' }}>
          <div className="flex items-center justify-between">
            {['upload', 'analyzing', 'results'].map((s, idx) => {
              const stepIndex = ['upload', 'analyzing', 'results'].indexOf(step);
              const isActive = step === s;
              const isCompleted = stepIndex > idx;

              return (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`progress-step ${
                      isActive ? 'active' : isCompleted ? 'completed' : 'pending'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="ml-3">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: isActive || isCompleted ? 'var(--color-primary)' : 'var(--color-neutral-medium)'
                      }}
                    >
                      {s === 'upload' ? 'Nahrání' : s === 'analyzing' ? 'Analýza' : 'Výsledky'}
                    </p>
                  </div>
                  {idx < 2 && (
                    <div
                      className="flex-1 h-1 mx-4"
                      style={{
                        background: isCompleted ? 'var(--color-success)' : 'var(--color-neutral-light)',
                        borderRadius: '2px'
                      }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="alert alert-error fade-in">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* STEP: UPLOAD */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="card fade-in">
              <h3 className="mb-6" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                📤 Nahrání dokumentů
              </h3>
              <p className="mb-6" style={{ color: 'var(--color-neutral-medium)', fontSize: '0.95rem' }}>
                Nahrajte standardizovaný PDF formulář &quot;Ocenění rodinného domu&quot; a fotografie nemovitosti
                (maximálně 30). AI automaticky extrahuje data z PDF a zkontroluje je oproti fotografiím.
              </p>

              <div className="space-y-8">
                <PDFUploader onFileChange={handlePDFChange} />
                <PhotoUploader onFilesChange={handlePhotosChange} />
                <CadastralMapUploader onFileChange={handleCadastralMapChange} />
                <TechnicalDocUploader onFileChange={handleTechnicalDocChange} />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!pdfFile || photos.files.length === 0}
                className="btn btn-accent"
              >
                <FileCheck className="w-5 h-5" />
                Analyzovat nemovitost
              </button>
            </div>
          </div>
        )}

        {/* STEP: ANALYZING */}
        {step === 'analyzing' && <LoadingAnimation message="Analyzuji PDF a fotografie..." />}

        {/* STEP: RESULTS */}
        {step === 'results' && results && (
          <div className="space-y-6">
            {/* Extracted Data Section */}
            <div className="card fade-in">
              <h3 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                📄 Extrahovaná data z PDF
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ fontSize: '0.95rem' }}>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Adresa:
                  </p>
                  <p style={{ color: 'var(--color-text)' }}>
                    {results.extractedData.address.street} {results.extractedData.address.houseNumber}
                  </p>
                  <p style={{ color: 'var(--color-text)' }}>
                    {results.extractedData.address.zipCode} {results.extractedData.address.city}
                  </p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Dispozice:
                  </p>
                  <p style={{ color: 'var(--color-text)' }}>{results.extractedData.layout}</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Stav:
                  </p>
                  <p style={{ color: 'var(--color-text)' }}>{results.extractedData.propertyCondition}</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Plocha:
                  </p>
                  <p style={{ color: 'var(--color-text)' }}>Pozemek: {results.extractedData.landArea} m²</p>
                  <p style={{ color: 'var(--color-text)' }}>Zastavěná: {results.extractedData.builtUpArea} m²</p>
                  <p style={{ color: 'var(--color-text)' }}>Celková: {results.extractedData.totalFloorArea} m²</p>
                </div>
              </div>
            </div>

            <ResultsPanel results={results} formData={results.extractedData as any} />

            <ManualReview results={results} formData={results.extractedData as any} onSave={handleManualSave} />

            <div className="flex justify-between">
              <button onClick={handleReset} className="btn btn-secondary">
                🔄 Nová kontrola
              </button>
              <button onClick={handleExportPDF} className="btn btn-success">
                <Download className="w-5 h-5" />
                Exportovat PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
