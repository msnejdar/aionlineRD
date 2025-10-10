'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText } from 'lucide-react';
import { validatePDFFile } from '@/lib/imageOptimization';

interface PDFUploaderProps {
  onFileChange: (file: File | null, base64: string) => void;
}

export default function PDFUploader({ onFileChange }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError('');
      setLoading(true);

      try {
        const pdfFile = acceptedFiles[0];

        // Validate PDF
        const validation = validatePDFFile(pdfFile);
        if (!validation.valid) {
          setError(validation.error || 'Neplatný PDF soubor');
          setLoading(false);
          return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];

          setFile(pdfFile);
          setPreview(pdfFile.name);
          onFileChange(pdfFile, base64);
        };
        reader.readAsDataURL(pdfFile);
      } catch (err) {
        setError('Chyba při nahrávání PDF');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [onFileChange]
  );

  const removeFile = () => {
    setFile(null);
    setPreview('');
    onFileChange(null, '');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <label className="block font-semibold" style={{ color: 'var(--color-text)' }}>
        📄 PDF Formulář s oceněním nemovitosti
        <span style={{ color: 'var(--color-error)', marginLeft: '4px' }}>*</span>
      </label>

      {!file ? (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-neutral-medium)' }} />
          {isDragActive ? (
            <p className="font-medium" style={{ color: 'var(--color-primary)' }}>
              Pusťte PDF soubor zde...
            </p>
          ) : (
            <div>
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                Přetáhněte PDF formulář sem
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-neutral-medium)' }}>
                nebo klikněte pro výběr
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--color-neutral-medium)' }}>
                Standardizovaný formulář &quot;Ocenění rodinného domu&quot; • Max 10MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          className="fade-in"
          style={{
            background: 'var(--color-success-lighter)',
            border: '2px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-sm)',
            boxShadow: 'var(--shadow-elevation-2)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'white',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-elevation-1)'
                }}
              >
                <FileText className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {preview}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-neutral-medium)' }}>
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="rounded-full p-2 transition-colors"
              style={{
                background: 'var(--color-error)',
                color: 'white',
                boxShadow: 'var(--shadow-elevation-2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-error-light)';
                e.currentTarget.style.boxShadow = 'var(--shadow-elevation-3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--color-error)';
                e.currentTarget.style.boxShadow = 'var(--shadow-elevation-2)';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <p style={{ fontSize: '0.95rem' }}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-2">
          <div className="loading-shimmer h-2 rounded"></div>
          <p className="text-sm mt-2" style={{ color: 'var(--color-neutral-medium)' }}>
            Načítání PDF...
          </p>
        </div>
      )}
    </div>
  );
}
