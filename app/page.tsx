'use client';

import { useState } from 'react';
import { Home, FileCheck, Download, LogOut } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import ImageUploader from './components/ImageUploader';
import LoadingAnimation from './components/LoadingAnimation';
import ResultsPanel from './components/ResultsPanel';
import ManualReview from './components/ManualReview';
import type { PropertyFormData, AIResponse, AnalyzePropertyRequest } from '@/types';
import { useRouter } from 'next/navigation';

type Step = 'form' | 'upload' | 'analyzing' | 'results';

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<PropertyFormData | null>(null);
  const [photos, setPhotos] = useState<{
    exterior: { files: File[]; base64s: string[] };
    interior: { files: File[]; base64s: string[] };
    additional: { files: File[]; base64s: string[] };
  }>({
    exterior: { files: [], base64s: [] },
    interior: { files: [], base64s: [] },
    additional: { files: [], base64s: [] },
  });
  const [results, setResults] = useState<AIResponse | null>(null);
  const [manualEdits, setManualEdits] = useState<Partial<AIResponse> | null>(null);
  const [bankOfficerNote, setBankOfficerNote] = useState('');
  const [error, setError] = useState('');

  const handleFormSubmit = (data: PropertyFormData) => {
    setFormData(data);
    setStep('upload');
  };

  const handleAnalyze = async () => {
    if (!formData) return;

    setError('');
    setStep('analyzing');

    try {
      const requestBody: AnalyzePropertyRequest = {
        formData,
        photos: {
          exterior: photos.exterior.base64s,
          interior: photos.interior.base64s,
          additional: photos.additional.base64s,
        },
      };

      const response = await fetch('/api/analyze-property', {
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
    if (!formData || !results) return;

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          validationResults: results,
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
    setStep('form');
    setFormData(null);
    setPhotos({
      exterior: { files: [], base64s: [] },
      interior: { files: [], base64s: [] },
      additional: { files: [], base64s: [] },
    });
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
              <p className="text-sm text-gray-600">Česká spořitelna</p>
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
          {['form', 'upload', 'analyzing', 'results'].map((s, idx) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  step === s
                    ? 'bg-primary text-white'
                    : ['form', 'upload', 'analyzing', 'results'].indexOf(step) > idx
                    ? 'bg-success text-white'
                    : 'bg-white/50 text-gray-400'
                }`}
              >
                {idx + 1}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {s === 'form'
                    ? 'Formulář'
                    : s === 'upload'
                    ? 'Nahrání fotek'
                    : s === 'analyzing'
                    ? 'Analýza'
                    : 'Výsledky'}
                </p>
              </div>
              {idx < 3 && <div className="flex-1 h-1 bg-white/30 mx-4"></div>}
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

      {/* STEP: FORM */}
      {step === 'form' && <PropertyForm onSubmit={handleFormSubmit} />}

      {/* STEP: UPLOAD */}
      {step === 'upload' && formData && (
        <div className="space-y-6">
          <div className="glass-panel fade-in">
            <h3 className="text-xl font-bold mb-4 text-gray-800">📸 Nahrání fotodokumentace</h3>
            <p className="text-sm text-gray-600 mb-6">
              Nahrajte fotografie podle požadavků uvedených v zadání. Minimálně 5 fotek exteriéru + 3 fotky interiéru.
            </p>

            <div className="space-y-8">
              <ImageUploader
                label="Fotografie exteriéru (min. 5)"
                minFiles={5}
                maxFiles={10}
                onFilesChange={(files, base64s) => setPhotos((p) => ({ ...p, exterior: { files, base64s } }))}
              />

              <ImageUploader
                label="Fotografie interiéru (min. 3)"
                minFiles={3}
                maxFiles={20}
                onFilesChange={(files, base64s) => setPhotos((p) => ({ ...p, interior: { files, base64s } }))}
              />

              {formData.garageCount > 0 && (
                <ImageUploader
                  label={`Vedlejší stavby (garáže: ${formData.garageCount})`}
                  minFiles={0}
                  maxFiles={10}
                  onFilesChange={(files, base64s) => setPhotos((p) => ({ ...p, additional: { files, base64s } }))}
                />
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep('form')} className="glass-button-secondary">
              ← Zpět na formulář
            </button>
            <button
              onClick={handleAnalyze}
              disabled={photos.exterior.files.length < 5 || photos.interior.files.length < 3}
              className="glass-button-primary flex items-center gap-2"
            >
              <FileCheck className="w-5 h-5" />
              Analyzovat nemovitost
            </button>
          </div>
        </div>
      )}

      {/* STEP: ANALYZING */}
      {step === 'analyzing' && <LoadingAnimation message="Analyzuji nemovitost..." />}

      {/* STEP: RESULTS */}
      {step === 'results' && results && formData && (
        <div className="space-y-6">
          <ResultsPanel results={results} formData={formData} />

          <ManualReview results={results} formData={formData} onSave={handleManualSave} />

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
