import { UnitSystem } from '@/types/recipe';

export interface UnitPreference {
  system: UnitSystem;
  label: string;
  description: string;
}

export const UNIT_SYSTEMS: UnitPreference[] = [
  {
    system: 'metric',
    label: 'Metric',
    description: 'Celsius, grams, liters, centimeters'
  },
  {
    system: 'imperial',
    label: 'Imperial (US)',
    description: 'Fahrenheit, ounces, cups, inches'
  }
];

// Common unit mappings for recipe generation prompts
export const UNIT_EXAMPLES = {
  metric: {
    volume: ['ml', 'liters', 'L'],
    weight: ['grams', 'g', 'kilograms', 'kg'],
    temperature: ['Celsius', '°C'],
    small_volume: ['ml', 'tablespoons', 'teaspoons']
  },
  imperial: {
    volume: ['cups', 'fl oz', 'pints', 'quarts'],
    weight: ['ounces', 'oz', 'pounds', 'lbs'],
    temperature: ['Fahrenheit', '°F'],
    small_volume: ['tablespoons', 'tbsp', 'teaspoons', 'tsp']
  }
};

export function getUnitSystemPrompt(unitSystem: UnitSystem): string {
  if (unitSystem === 'metric') {
    return `Use METRIC units only:
- Weights: grams (g), kilograms (kg)
- Volumes: milliliters (ml), liters (L), tablespoons, teaspoons
- Temperature: Celsius (°C)
- Example: "250g flour", "500ml milk", "2 tablespoons olive oil", "180°C"`;
  } else {
    return `Use IMPERIAL (US) units only:
- Weights: ounces (oz), pounds (lbs)
- Volumes: cups, fluid ounces (fl oz), tablespoons (tbsp), teaspoons (tsp)
- Temperature: Fahrenheit (°F)
- Example: "2 cups flour", "1 cup milk", "2 tablespoons olive oil", "350°F"`;
  }
}

export function detectUserUnitSystem(): UnitSystem {
  // Try to detect user's preferred unit system based on locale
  if (typeof window !== 'undefined') {
    const locale = navigator.language || 'en-US';
    
    // Countries that primarily use metric system
    const metricCountries = ['en-GB', 'en-AU', 'en-CA', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'se', 'no', 'dk', 'fi'];
    
    // Check if the locale matches any metric countries
    const isMetricCountry = metricCountries.some(country => 
      locale.toLowerCase().startsWith(country.toLowerCase())
    );
    
    return isMetricCountry ? 'metric' : 'imperial';
  }
  
  // Default to imperial for US-based users if detection fails
  return 'imperial';
}
