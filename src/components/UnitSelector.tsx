'use client';

import React from 'react';
import { UnitSystem } from '@/types/recipe';
import { UNIT_SYSTEMS } from '@/utils/unitUtils';

interface UnitSelectorProps {
  selectedUnit: UnitSystem;
  onUnitChange: (unit: UnitSystem) => void;
  className?: string;
}

export default function UnitSelector({ selectedUnit, onUnitChange, className = '' }: UnitSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Preferred Units
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {UNIT_SYSTEMS.map((system) => (
          <div
            key={system.system}
            className={`relative rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors ${
              selectedUnit === system.system
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-300 bg-white'
            }`}
            onClick={() => onUnitChange(system.system)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={selectedUnit === system.system}
                onChange={() => onUnitChange(system.system)}
                aria-describedby={`${system.system}-description`}
              />
              <div className="ml-3">
                <label className="block text-sm font-medium text-gray-900 cursor-pointer">
                  {system.label}
                </label>
                <p id={`${system.system}-description`} className="text-xs text-gray-500 mt-1">
                  {system.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
