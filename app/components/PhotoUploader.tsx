'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImageFile, optimizeAndConvertToBase64 } from '@/lib/imageOptimization';

interface PhotoUploaderProps {
  onFilesChange: (files: File[], base64s: string[]) => void;
}

export default function PhotoUploader({ onFilesChange }: PhotoUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError('');
      setLoading(true);

      try {
        // Validate files
        const validFiles: File[] = [];
        for (const file of acceptedFiles) {
          const validation = validateImageFile(file);
          if (!validation.valid) {
            setError(validation.error || 'Neplatný soubor');
            continue;
          }
          validFiles.push(file);
        }

        if (validFiles.length === 0) {
          setLoading(false);
          return;
        }

        // Check max files (30 total)
        if (files.length + validFiles.length > 30) {
          setError('Maximální počet souborů je 30');
          setLoading(false);
          return;
        }

        // Generate previews
        const newPreviews: string[] = [];
        for (const file of validFiles) {
          const reader = new FileReader();
          const preview = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newPreviews.push(preview);
        }

        // Update state
        const updatedFiles = [...files, ...validFiles];
        const updatedPreviews = [...previews, ...newPreviews];

        setFiles(updatedFiles);
        setPreviews(updatedPreviews);

        // Convert to base64 for API
        const base64s: string[] = [];
        for (const file of updatedFiles) {
          const base64 = await optimizeAndConvertToBase64(file);
          base64s.push(base64);
        }

        onFilesChange(updatedFiles, base64s);
      } catch (err) {
        setError('Chyba při nahrávání souborů');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [files, previews, onFilesChange]
  );

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);

    // Update parent with base64s
    Promise.all(updatedFiles.map((file) => optimizeAndConvertToBase64(file))).then((base64s) => {
      onFilesChange(updatedFiles, base64s);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 30,
  });

  return (
    <div className="space-y-4">
      <label className="block font-semibold text-gray-800">
        📸 Fotodokumentace nemovitosti
        <span className="text-red-500 ml-1">*</span>
        <span className="text-sm font-normal text-gray-600 ml-2">(Maximálně 30 fotografií)</span>
      </label>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-600" />
        {isDragActive ? (
          <p className="text-gray-700 font-medium">Pusťte fotografie zde...</p>
        ) : (
          <div>
            <p className="text-gray-700 font-medium">Přetáhněte fotografie sem</p>
            <p className="text-gray-500 text-sm mt-2">nebo klikněte pro výběr</p>
            <p className="text-gray-400 text-xs mt-2">
              JPG, PNG • Max 30 fotek • Max 10MB per foto
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm backdrop-blur-lg bg-red-50/80 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="loading-shimmer h-2 rounded"></div>
          <p className="text-sm text-gray-600 mt-2">Nahrávání a optimalizace fotografií...</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Nahráno: {files.length} / 30
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg backdrop-blur-lg border border-white/30"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {(files[index].size / 1024).toFixed(0)} KB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
