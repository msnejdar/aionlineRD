'use client';

import { useState } from 'react';
import { Edit2, Save } from 'lucide-react';
import type { AIResponse, PropertyFormData, FieldValidation } from '@/types';

interface ManualReviewProps {
  results: AIResponse;
  formData: PropertyFormData;
  onSave: (updatedResults: Partial<AIResponse>, bankOfficerNote: string) => void;
}

export default function ManualReview({ results, formData, onSave }: ManualReviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValidation, setEditedValidation] = useState(results.validation);
  const [editedRecommendation, setEditedRecommendation] = useState(results.recommendation);
  const [bankOfficerNote, setBankOfficerNote] = useState('');

  const handleColorChange = (fieldKey: keyof typeof editedValidation, newColor: 'green' | 'red' | 'yellow') => {
    setEditedValidation((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        color: newColor,
        matches: newColor === 'green',
      },
    }));
  };

  const handleNoteChange = (fieldKey: keyof typeof editedValidation, newNote: string) => {
    setEditedValidation((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        note: newNote,
      },
    }));
  };

  const handleSave = () => {
    onSave(
      {
        validation: editedValidation,
        recommendation: editedRecommendation,
      },
      bankOfficerNote
    );
    setIsEditing(false);
  };

  const fields: Array<{ key: keyof typeof editedValidation; label: string }> = [
    { key: 'propertyCondition', label: 'Stav nemovitosti' },
    { key: 'layout', label: 'Dispozice' },
    { key: 'numberOfFloors', label: 'Počet podlaží' },
    { key: 'hasAttic', label: 'Podkroví' },
    { key: 'atticHabitable', label: 'Obytné podkroví' },
    { key: 'hasBasement', label: 'Sklep' },
    { key: 'roofType', label: 'Typ střechy' },
    { key: 'landArea', label: 'Plocha pozemku' },
    { key: 'builtUpArea', label: 'Zastavěná plocha' },
    { key: 'totalFloorArea', label: 'Celková plocha' },
  ];

  if (!isEditing) {
    return (
      <div className="glass-panel">
        <button onClick={() => setIsEditing(true)} className="glass-button-secondary flex items-center gap-2">
          <Edit2 className="w-4 h-4" />
          Upravit výsledky
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel space-y-6 fade-in">
      <h3 className="text-2xl font-bold text-gray-800">✏️  Manuální úprava výsledků</h3>

      {/* EDITACE POLÍ */}
      <div className="space-y-4">
        {fields.map((field) => {
          const validation = editedValidation[field.key];
          return (
            <div key={field.key} className="p-4 rounded-xl backdrop-blur-lg bg-white/50 border border-white/30">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">{field.label}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleColorChange(field.key, 'green')}
                    className={`w-8 h-8 rounded-full ${
                      validation.color === 'green' ? 'bg-success ring-4 ring-success/30' : 'bg-success/30'
                    }`}
                    title="Souhlasí"
                  />
                  <button
                    onClick={() => handleColorChange(field.key, 'yellow')}
                    className={`w-8 h-8 rounded-full ${
                      validation.color === 'yellow' ? 'bg-warning ring-4 ring-warning/30' : 'bg-warning/30'
                    }`}
                    title="Nejisté"
                  />
                  <button
                    onClick={() => handleColorChange(field.key, 'red')}
                    className={`w-8 h-8 rounded-full ${
                      validation.color === 'red' ? 'bg-error ring-4 ring-error/30' : 'bg-error/30'
                    }`}
                    title="Nesouhlasí"
                  />
                </div>
              </div>
              <textarea
                className="glass-input text-sm"
                rows={2}
                value={validation.note}
                onChange={(e) => handleNoteChange(field.key, e.target.value)}
                placeholder="Poznámka k poli..."
              />
            </div>
          );
        })}
      </div>

      {/* EDITACE DOPORUČENÍ */}
      <div>
        <label className="block font-semibold mb-2">Finální doporučení:</label>
        <select
          className="glass-select"
          value={editedRecommendation}
          onChange={(e) => setEditedRecommendation(e.target.value as typeof editedRecommendation)}
        >
          <option value="approved">Schváleno</option>
          <option value="rejected">Zamítnuto</option>
          <option value="manualReview">Manuální kontrola</option>
        </select>
      </div>

      {/* POZNÁMKA BANKÉŘE */}
      <div>
        <label className="block font-semibold mb-2">Poznámka bankéře:</label>
        <textarea
          className="glass-input"
          rows={4}
          value={bankOfficerNote}
          onChange={(e) => setBankOfficerNote(e.target.value)}
          placeholder="Zde můžete přidat vlastní poznámku k výsledkům kontroly..."
        />
      </div>

      {/* AKCE */}
      <div className="flex gap-4 justify-end">
        <button onClick={() => setIsEditing(false)} className="glass-button-secondary">
          Zrušit
        </button>
        <button onClick={handleSave} className="glass-button-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Uložit změny
        </button>
      </div>
    </div>
  );
}
