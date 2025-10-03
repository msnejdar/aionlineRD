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
      <label className="block font-semibold text-gray-800">
        📄 PDF Formulář s oceněním nemovitosti
        <span className="text-red-500 ml-1">*</span>
      </label>

      {!file ? (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          {isDragActive ? (
            <p className="text-gray-700 font-medium">Pusťte PDF soubor zde...</p>
          ) : (
            <div>
              <p className="text-gray-700 font-medium">Přetáhněte PDF formulář sem</p>
              <p className="text-gray-500 text-sm mt-2">nebo klikněte pro výběr</p>
              <p className="text-gray-400 text-xs mt-2">
                Standardizovaný formulář &quot;Ocenění rodinného domu&quot; • Max 10MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="backdrop-blur-lg bg-white/70 border-2 border-green-500 rounded-xl p-4 fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{preview}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm backdrop-blur-lg bg-red-50/80 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-2">
          <div className="loading-shimmer h-2 rounded"></div>
          <p className="text-sm text-gray-600 mt-2">Načítání PDF...</p>
        </div>
      )}
    </div>
  );
}
