'use client';

import { useState } from 'react';
import type { PropertyFormData } from '@/types';

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData) => void;
}

export default function PropertyForm({ onSubmit }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    address: {
      street: '',
      houseNumber: '',
      city: '',
      zipCode: '',
    },
    cadastral: {
      region: '',
      district: '',
      municipality: '',
      cadastralArea: '',
      landRegistryNumber: '',
    },
    propertyCondition: 'dobře udržovaný',
    layout: '3+1',
    numberOfFloors: 1,
    hasAttic: false,
    atticHabitable: false,
    hasBasement: false,
    roofType: 'valbová',
    landArea: 0,
    builtUpArea: 0,
    totalFloorArea: 0,
    constructionYear: 2000,
    constructionType: '',
    garageCount: 0,
    utilities: {
      water: 'síť',
      electricity: 'síť',
      sewage: 'spádová kanalizace',
      gas: false,
      heating: '',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split('.');
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev[keys[0] as keyof PropertyFormData] as any),
            [keys[1]]: value,
          },
        };
      }
      return prev;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ZÁKLADNÍ IDENTIFIKACE */}
      <div className="glass-panel fade-in">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Základní identifikace</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ulice *</label>
            <input
              type="text"
              required
              className="glass-input"
              value={formData.address.street}
              onChange={(e) => updateField('address.street', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Číslo popisné *</label>
            <input
              type="text"
              required
              className="glass-input"
              value={formData.address.houseNumber}
              onChange={(e) => updateField('address.houseNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Město *</label>
            <input
              type="text"
              required
              className="glass-input"
              value={formData.address.city}
              onChange={(e) => updateField('address.city', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">PSČ *</label>
            <input
              type="text"
              required
              pattern="\d{5}"
              placeholder="12345"
              className="glass-input"
              value={formData.address.zipCode}
              onChange={(e) => updateField('address.zipCode', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KATASTRÁLNÍ ÚDAJE */}
      <div className="glass-panel fade-in">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Katastrální údaje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kraj *</label>
            <input
              type="text"
              required
              className="glass-input"
              value={formData.cadastral.region}
              onChange={(e) => updateField('cadastral.region', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Okres *</label>
            <input
              type="text"
              required
              className="glass-input"
              value={formData.cadastral.district}
              onChange={(e) => updateField('cadastral.district', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Obec *</label>
            <input
              type="text"
              required
              className="glass-input"
              value={formData.cadastral.municipality}
              onChange={(e) => updateField('cadastral.municipality', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Katastrální území *</label>
            <input
              type="text"
              required
              className="glass-input"
              value={formData.cadastral.cadastralArea}
              onChange={(e) => updateField('cadastral.cadastralArea', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Číslo LV *</label>
            <input
              type="text"
              required
              className="glass-input"
              value={formData.cadastral.landRegistryNumber}
              onChange={(e) => updateField('cadastral.landRegistryNumber', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ÚDAJE O NEMOVITOSTI */}
      <div className="glass-panel fade-in">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Údaje o nemovitosti</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Stav nemovitosti *</label>
            <select
              required
              className="glass-select"
              value={formData.propertyCondition}
              onChange={(e) =>
                updateField('propertyCondition', e.target.value as PropertyFormData['propertyCondition'])
              }
            >
              <option value="novostavba">Novostavba</option>
              <option value="výborně udržovaný">Výborně udržovaný</option>
              <option value="dobře udržovaný">Dobře udržovaný</option>
              <option value="neudržovaný k celkové rekonstrukci">Neudržovaný k celkové rekonstrukci</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Dispozice *</label>
            <select
              required
              className="glass-select"
              value={formData.layout}
              onChange={(e) => updateField('layout', e.target.value as PropertyFormData['layout'])}
            >
              <option value="1kk">1kk</option>
              <option value="1+1">1+1</option>
              <option value="2+1">2+1</option>
              <option value="3+1">3+1</option>
              <option value="4+1">4+1</option>
              <option value="5+1">5+1</option>
              <option value="6+1">6+1</option>
              <option value="7+1">7+1</option>
              <option value="jiný">Jiný</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Počet plnohodnotných podlaží *</label>
            <select
              required
              className="glass-select"
              value={formData.numberOfFloors}
              onChange={(e) => updateField('numberOfFloors', Number(e.target.value) as 1 | 2)}
            >
              <option value={1}>1 podlaží</option>
              <option value={2}>2 podlaží</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Typ střechy *</label>
            <select
              required
              className="glass-select"
              value={formData.roofType}
              onChange={(e) => updateField('roofType', e.target.value as PropertyFormData['roofType'])}
            >
              <option value="valbová">Valbová</option>
              <option value="mansardová">Mansardová</option>
              <option value="plochá">Plochá</option>
              <option value="pultová">Pultová</option>
              <option value="stanová">Stanová</option>
              <option value="věžová">Věžová</option>
              <option value="polovalbová">Polovalbová</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.hasAttic}
                onChange={(e) => updateField('hasAttic', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Má podkroví</span>
            </label>
          </div>
          {formData.hasAttic && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.atticHabitable}
                  onChange={(e) => updateField('atticHabitable', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Obytné podkroví</span>
              </label>
            </div>
          )}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.hasBasement}
                onChange={(e) => updateField('hasBasement', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Má sklep</span>
            </label>
          </div>
        </div>
      </div>

      {/* PLOCHY */}
      <div className="glass-panel fade-in">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Plochy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Plocha pozemku (m²) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="glass-input"
              value={formData.landArea || ''}
              onChange={(e) => updateField('landArea', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Zastavěná plocha (m²) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="glass-input"
              value={formData.builtUpArea || ''}
              onChange={(e) => updateField('builtUpArea', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Celková podlahová plocha (m²) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="glass-input"
              value={formData.totalFloorArea || ''}
              onChange={(e) => updateField('totalFloorArea', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* DALŠÍ ÚDAJE */}
      <div className="glass-panel fade-in">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Další údaje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rok výstavby *</label>
            <input
              type="number"
              required
              min="1800"
              max={new Date().getFullYear() + 2}
              className="glass-input"
              value={formData.constructionYear || ''}
              onChange={(e) => updateField('constructionYear', parseInt(e.target.value) || 2000)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Typ konstrukce *</label>
            <input
              type="text"
              required
              placeholder="např. zděná, panelová, dřevostavba..."
              className="glass-input"
              value={formData.constructionType}
              onChange={(e) => updateField('constructionType', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Počet garáží</label>
            <input
              type="number"
              min="0"
              className="glass-input"
              value={formData.garageCount || 0}
              onChange={(e) => updateField('garageCount', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* INŽENÝRSKÉ SÍTĚ */}
      <div className="glass-panel fade-in">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Inženýrské sítě</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Voda *</label>
            <select
              required
              className="glass-select"
              value={formData.utilities.water}
              onChange={(e) => updateField('utilities.water', e.target.value)}
            >
              <option value="síť">Síť</option>
              <option value="studna">Studna</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Elektřina *</label>
            <select
              required
              className="glass-select"
              value={formData.utilities.electricity}
              onChange={(e) => updateField('utilities.electricity', e.target.value)}
            >
              <option value="síť">Síť</option>
              <option value="ostrovní">Ostrovní</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kanalizace *</label>
            <select
              required
              className="glass-select"
              value={formData.utilities.sewage}
              onChange={(e) => updateField('utilities.sewage', e.target.value)}
            >
              <option value="tlaková kanalizace">Tlaková kanalizace</option>
              <option value="spádová kanalizace">Spádová kanalizace</option>
              <option value="ČOV (čistička odpadních vod)">ČOV (čistička odpadních vod)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Vytápění *</label>
            <input
              type="text"
              required
              placeholder="např. kotel na plyn, tepelné čerpadlo..."
              className="glass-input"
              value={formData.utilities.heating}
              onChange={(e) => updateField('utilities.heating', e.target.value)}
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.utilities.gas}
                onChange={(e) => updateField('utilities.gas', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Plyn</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="glass-button-primary">
          Pokračovat k nahrání dokumentace →
        </button>
      </div>
    </form>
  );
}
