'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImageFile, optimizeAndConvertToBase64 } from '@/lib/imageOptimization';

interface CadastralMapUploaderProps {
  onFileChange: (file: File | null, base64: string) => void;
}

export default function CadastralMapUploader({ onFileChange }: CadastralMapUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError('');
      setLoading(true);

      try {
        const imageFile = acceptedFiles[0];

        // Validate image
        const validation = validateImageFile(imageFile);
        if (!validation.valid) {
          setError(validation.error || 'Neplatný soubor');
          setLoading(false);
          return;
        }

        // Generate preview
        const reader = new FileReader();
        const previewUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });

        // Convert to base64 for API
        const base64 = await optimizeAndConvertToBase64(imageFile);

        setFile(imageFile);
        setPreview(previewUrl);
        onFileChange(imageFile, base64);
      } catch (err) {
        setError('Chyba při nahrávání souboru');
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
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <label className="block font-semibold text-gray-800">
        🗺️ Katastrální mapa
        <span className="text-sm font-normal text-gray-600 ml-2">(nepovinné)</span>
      </label>

      {!file ? (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-gray-600" />
          {isDragActive ? (
            <p className="text-gray-700 font-medium">Pusťte snímek zde...</p>
          ) : (
            <div>
              <p className="text-gray-700 font-medium">Přetáhněte snímek katastrální mapy</p>
              <p className="text-gray-500 text-sm mt-2">nebo klikněte pro výběr</p>
              <p className="text-gray-400 text-xs mt-2">
                JPG, PNG • Max 10MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="backdrop-blur-lg bg-white/70 border-2 border-green-500 rounded-xl p-4 fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <img
                src={preview}
                alt="Katastrální mapa"
                className="w-full h-48 object-contain rounded-lg border border-white/30 mb-3"
              />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
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
          <p className="text-sm text-gray-600 mt-2">Nahrávání snímku...</p>
        </div>
      )}
    </div>
  );
}
