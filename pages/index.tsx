import { db } from '../firebase';  // Adjust path if needed
import { doc, setDoc } from "firebase/firestore";
import { useState } from 'react';

type MeasurementUnit = 'cm' | 'inch';
type Measurements = Record<string, string>;
type Gender = 'men' | 'women';
type Category = 'tops' | 'trousers' | 'dresses';

interface MeasurementGuide {
  title: string;
  description: string;
  video?: string;
}

const sizeCharts = {
  men: {
    tops: {
      XS: { shoulder: 42.5, chest: 90, waist: 78, neck: 37 },
      S: { shoulder: 44, chest: 94, waist: 82, neck: 39 },
      M: { shoulder: 45.5, chest: 98, waist: 86, neck: 41 },
      L: { shoulder: 47, chest: 103, waist: 91, neck: 43 },
      XL: { shoulder: 49, chest: 109, waist: 97, neck: 45 },
      XXL: { shoulder: 51, chest: 115, waist: 103, neck: 46.5 }
    },
    trousers: {
      XS: { waist: 72.5, hips: 88.5, thigh: 48, inseam: 79 },
      S: { waist: 77.5, hips: 93.5, thigh: 52, inseam: 81 },
      M: { waist: 82.5, hips: 98.5, thigh: 56, inseam: 83 },
      L: { waist: 87.5, hips: 103.5, thigh: 60, inseam: 85 },
      XL: { waist: 93.5, hips: 109.5, thigh: 64, inseam: 87 },
      XXL: { waist: 98.5, hips: 114.5, thigh: 66, inseam: 89 }
    }
  },
  women: {
    tops: {
      XXS: { shoulder: 35.5, bust: 77.5, waist: 60.5, neck: 33 },
      XS: { shoulder: 37, bust: 82.5, waist: 65.5, neck: 35 },
      S: { shoulder: 38.5, bust: 87.5, waist: 70.5, neck: 37 },
      M: { shoulder: 40, bust: 93, waist: 76, neck: 39 },
      L: { shoulder: 41.5, bust: 99, waist: 82, neck: 41 },
      XL: { shoulder: 43, bust: 105, waist: 88, neck: 43 }
    },
    dresses: {
      XXS: { bust: 77.5, waist: 60.5, hips: 86.5, length: 92.5 },
      XS: { bust: 82.5, waist: 65.5, hips: 91.5, length: 97.5 },
      S: { bust: 87.5, waist: 70.5, hips: 96.5, length: 102.5 },
      M: { bust: 93, waist: 76, hips: 102, length: 107.5 },
      L: { bust: 99, waist: 82, hips: 108, length: 112.5 },
      XL: { bust: 105, waist: 88, hips: 114, length: 117.5 }
    },
    trousers: {
      XXS: { waist: 61.5, hips: 87.5, thigh: 50.5, inseam: 76 },
      XS: { waist: 64, hips: 90, thigh: 51.5, inseam: 78 },
      S: { waist: 66.5, hips: 92.5, thigh: 52.5, inseam: 80 },
      M: { waist: 69, hips: 95, thigh: 53.5, inseam: 82 },
      L: { waist: 71.5, hips: 97.5, thigh: 54.5, inseam: 84 },
      XL: { waist: 74, hips: 100, thigh: 55.5, inseam: 86 }
    }
  }
};

const measurementGuides: Record<string, MeasurementGuide> = {
  shoulder: {
    title: "Shoulder Width",
    description: "Measure across your back from shoulder bone to shoulder bone"
  },
  chest: {
    title: "Chest",
    description: "Measure around the fullest part of your chest, under your arms"
  },
  bust: {
    title: "Bust",
    description: "Measure around the fullest part of your bust"
  },
  waist: {
    title: "Waist",
    description: "Measure around your natural waistline"
  },
  neck: {
    title: "Neck",
    description: "Measure around the base of your neck"
  },
  hips: {
    title: "Hips",
    description: "Measure around the fullest part of your hips"
  },
  thigh: {
    title: "Thigh",
    description: "Measure around the fullest part of your thigh"
  },
  inseam: {
    title: "Inseam",
    description: "Measure from your crotch to the bottom of your ankle"
  },
  length: {
    title: "Length",
    description: "Measure from the shoulder to the desired hemline"
  }
};

export default function AutoSizeFinder() {
  const [gender, setGender] = useState<Gender | ''>('');
  const [category, setCategory] = useState<Category | ''>('');
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [recommendedSize, setRecommendedSize] = useState('');
  const [unit, setUnit] = useState<MeasurementUnit>('cm');
  const [activeHelp, setActiveHelp] = useState('');
  const [productUrl, setProductUrl] = useState('');

  // Extract gender & category from URL
  const analyzeUrl = () => {
    const url = productUrl.toLowerCase();

    if (url.includes('/men/') || url.includes('/mens/')) {
      setGender('men');
    } else if (url.includes('/women/') || url.includes('/womens/')) {
      setGender('women');
    } else {
      alert("Could not detect gender. URL should contain '/men/' or '/women/'.");
      return;
    }

    if (url.includes('/tops/') || url.includes('/shirts/') || url.includes('/blouses/')) {
      setCategory('tops');
    } else if (url.includes('/jeans/') || url.includes('/trousers/') || url.includes('/pants/')) {
      setCategory('trousers');
    } else if (url.includes('/dresses/') || url.includes('/jumpsuits/')) {
      setCategory('dresses');
    } else {
      alert("Could not detect category. URL should contain '/tops/', '/dresses/', or '/pants/'.");
      return;
    }
  };

  // Get measurement fields for current category
  const getMeasurementFields = () => {
    if (!gender || !category) return [];
    
    return gender === 'men' 
      ? category === 'tops'
        ? ['shoulder', 'chest', 'waist', 'neck']
        : ['waist', 'hips', 'thigh', 'inseam']
      : category === 'tops'
        ? ['shoulder', 'bust', 'waist', 'neck']
        : category === 'dresses'
          ? ['bust', 'waist', 'hips', 'length']
          : ['waist', 'hips', 'thigh', 'inseam'];
  };

  // Convert units (inch → cm)
  const convertToCm = (value: string): number => {
    const numValue = parseFloat(value);
    return unit === 'inch' ? numValue * 2.54 : numValue;
  };

  // Calculate recommended size
  const findSize = () => {
    if (!gender || !category) return;

    const chart = sizeCharts[gender][category];
    let bestMatch = '';
    let smallestDiff = Infinity;

    Object.entries(chart).forEach(([size, sizeData]) => {
      let totalDiff = 0;
      let measuredParams = 0;

      Object.entries(sizeData).forEach(([key, idealValue]) => {
        if (measurements[key]) {
          const userValue = convertToCm(measurements[key]);
          totalDiff += Math.abs(userValue - idealValue);
          measuredParams++;
        }
      });

      if (measuredParams > 0) {
        const avgDiff = totalDiff / measuredParams;
        if (avgDiff < smallestDiff) {
          smallestDiff = avgDiff;
          bestMatch = size;
        }
      }
    });

    setRecommendedSize(bestMatch || 'Size not found');
  };

  // Handle measurement input changes
  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  // Initial screen: URL input
  if (!gender || !category) {
    return (
      <div className="size-finder bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Test Size Finder with a Product URL</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Enter Product URL (e.g., https://guess.in/women/dresses/red-dress)
            </label>
            <input
              type="text"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Paste a Guess product URL here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <button
            onClick={analyzeUrl}
            disabled={!productUrl}
            className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Detect Gender & Category
          </button>
        </div>
      </div>
    );
  }

  // Main size finder interface
  return (
    <div className="size-finder bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {gender === 'men' ? "Men's" : "Women's"} {category} Size Finder
        </h2>
        <div className="unit-toggle flex border border-gray-300 rounded-md">
          <button
            onClick={() => setUnit('cm')}
            className={`px-3 py-1 text-sm ${unit === 'cm' ? 'bg-black text-white' : 'bg-white'}`}
          >
            cm
          </button>
          <button
            onClick={() => setUnit('inch')}
            className={`px-3 py-1 text-sm ${unit === 'inch' ? 'bg-black text-white' : 'bg-white'}`}
          >
            in
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {getMeasurementFields().map((field) => (
          <div key={field} className="measurement-group">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-900 capitalize">
                {field.replace('_', ' ')}
              </label>
              <button 
                onClick={() => setActiveHelp(activeHelp === field ? '' : field)}
                className="text-blue-600 text-xs hover:underline"
              >
                How to measure?
              </button>
            </div>

            {activeHelp === field && (
              <div className="mb-2 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">{measurementGuides[field]?.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{measurementGuides[field]?.description}</p>
              </div>
            )}

            <div className="relative">
              <input
                type="number"
                value={measurements[field] || ''}
                onChange={(e) => handleMeasurementChange(field, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder={`${field} (${unit})`}
                min="0"
                step="0.1"
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-sm">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={findSize}
        disabled={Object.keys(measurements).length === 0}
        className="mt-6 w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Find My Size
      </button>

      {recommendedSize && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800">Recommended Size</h3>
          <div className="text-3xl font-bold text-green-900 my-2">{recommendedSize}</div>
          <p className="text-sm text-green-700">
            For {gender}'s {category} based on your measurements
          </p>
        </div>
      )}
    </div>
  );
}
