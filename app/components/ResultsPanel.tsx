'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { AIResponse, PropertyFormData } from '@/types';

interface ResultsPanelProps {
  results: AIResponse;
  formData: PropertyFormData;
}

export default function ResultsPanel({ results, formData }: ResultsPanelProps) {
  const getIcon = (color: string) => {
    switch (color) {
      case 'green':
        return <CheckCircle className="w-5 h-5 text-success inline mr-2" />;
      case 'red':
        return <XCircle className="w-5 h-5 text-error inline mr-2" />;
      case 'yellow':
        return <AlertCircle className="w-5 h-5 text-warning inline mr-2" />;
      default:
        return null;
    }
  };

  const getRecommendationBadge = () => {
    const badgeStyle = {
      padding: '16px 24px',
      borderRadius: 'var(--radius-md)',
      fontWeight: 700,
      fontSize: '1.125rem',
      boxShadow: 'var(--shadow-elevation-2)',
      border: '2px solid'
    };

    switch (results.recommendation) {
      case 'approved':
        return (
          <div
            style={{
              ...badgeStyle,
              background: 'var(--color-success-lighter)',
              borderColor: 'var(--color-success)',
              color: 'var(--color-success)'
            }}
          >
            ✅ SCHVÁLENO
          </div>
        );
      case 'rejected':
        return (
          <div
            style={{
              ...badgeStyle,
              background: 'var(--color-error-lighter)',
              borderColor: 'var(--color-error)',
              color: 'var(--color-error)'
            }}
          >
            ❌ ZAMÍTNUTO
          </div>
        );
      case 'manualReview':
        return (
          <div
            style={{
              ...badgeStyle,
              background: 'var(--color-warning-lighter)',
              borderColor: 'var(--color-warning)',
              color: 'var(--color-warning)'
            }}
          >
            ⚠️ MANUÁLNÍ KONTROLA
          </div>
        );
    }
  };

  const fields: Array<{ key: keyof typeof results.validation; label: string; value: string }> = [
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

  return (
    <div className="space-y-6 fade-in">
      {/* DOPORUČENÍ */}
      <div className="card text-center">{getRecommendationBadge()}</div>

      {/* VALIDACE POLÍ */}
      <div className="card">
        <h3 className="mb-6" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          📋 Výsledky kontroly polí
        </h3>
        <div className="space-y-4">
          {fields.map((field) => {
            const validation = results.validation[field.key];
            return (
              <div
                key={field.key}
                className={`p-4 rounded-xl border-2 ${
                  validation.color === 'green'
                    ? 'bg-success/10 border-success'
                    : validation.color === 'red'
                    ? 'bg-error/10 border-error'
                    : 'bg-warning/10 border-warning'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    {getIcon(validation.color)}
                    <span className="font-semibold">{field.label}:</span>
                    <span className="ml-2">{field.value}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-white/50 rounded-lg">
                    {validation.confidence === 'high' ? 'Vysoká jistota' : validation.confidence === 'medium' ? 'Střední jistota' : 'Nízká jistota'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2 ml-7">{validation.note}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* VÝPOČET PODLAHOVÉ PLOCHY */}
      <div className="glass-panel">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">📏 Výpočet podlahové plochy</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Klient uvedl:</span>
            <span className="font-bold">{formData.totalFloorArea} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">AI vypočítala:</span>
            <span className="font-bold text-primary">{results.floorAreaEstimate.calculated} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Jistota:</span>
            <span className="font-bold">{results.floorAreaEstimate.confidence}%</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Metoda:</span>
            <span className="text-sm">
              {results.floorAreaEstimate.method === 'projectDocumentation'
                ? 'Projektová dokumentace'
                : results.floorAreaEstimate.method === 'interiorPhotos'
                ? 'Fotografie interiéru'
                : 'Odhad z exteriéru'}
            </span>
          </div>
          {!results.floorAreaEstimate.matchesClientData && (
            <div className="bg-warning/20 border border-warning rounded-lg p-3">
              <p className="text-sm font-medium">
                ⚠️  Rozdíl: {Math.abs(results.floorAreaEstimate.difference || 0).toFixed(1)} m²
              </p>
            </div>
          )}
          <p className="text-sm text-gray-600 mt-4">{results.floorAreaEstimate.details}</p>
        </div>
      </div>

      {/* NALEZENÉ PROBLÉMY */}
      {(results.issues.underConstruction ||
        results.issues.severelyDamaged ||
        results.issues.visibleCracks ||
        results.issues.facadeDamagePercent > 0 ||
        results.issues.missingPhotos.length > 0 ||
        results.issues.photosOutdated) && (
        <div className="glass-panel bg-error/10 border-2 border-error">
          <h3 className="text-2xl font-bold mb-4 text-error">⚠️  Nalezené problémy</h3>
          <ul className="space-y-2">
            {results.issues.underConstruction && (
              <li className="flex items-start">
                <XCircle className="w-5 h-5 text-error mt-0.5 mr-2 flex-shrink-0" />
                <span>Nemovitost je v aktivní rekonstrukci</span>
              </li>
            )}
            {results.issues.severelyDamaged && (
              <li className="flex items-start">
                <XCircle className="w-5 h-5 text-error mt-0.5 mr-2 flex-shrink-0" />
                <span>Výrazné poškození nemovitosti</span>
              </li>
            )}
            {results.issues.visibleCracks && (
              <li className="flex items-start">
                <XCircle className="w-5 h-5 text-error mt-0.5 mr-2 flex-shrink-0" />
                <span>Viditelné praskliny v konstrukci</span>
              </li>
            )}
            {results.issues.facadeDamagePercent > 0 && (
              <li className="flex items-start">
                <XCircle className="w-5 h-5 text-error mt-0.5 mr-2 flex-shrink-0" />
                <span>Poškození fasády: {results.issues.facadeDamagePercent}%</span>
              </li>
            )}
            {results.issues.photosOutdated && (
              <li className="flex items-start">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5 mr-2 flex-shrink-0" />
                <span>Fotografie mohou být zastaralé (jiné roční období)</span>
              </li>
            )}
            {results.issues.missingPhotos.length > 0 && (
              <li>
                <AlertCircle className="w-5 h-5 text-warning inline mr-2" />
                <span className="font-medium">Chybějící fotografie:</span>
                <ul className="ml-7 mt-2 space-y-1">
                  {results.issues.missingPhotos.map((missing, idx) => (
                    <li key={idx} className="text-sm">
                      • {missing}
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* SHRNUTÍ */}
      <div className="glass-panel">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">📝 Shrnutí</h3>
        <p className="text-gray-700 leading-relaxed">{results.summary}</p>
      </div>
    </div>
  );
}
