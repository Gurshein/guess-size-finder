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

interface Step {
  number: number;
  isActive: boolean;
  isCompleted: boolean;
}

// Step indicator component
const StepIndicator = ({ steps }: { steps: Step[] }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step) => (
        <div key={step.number} className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step.isCompleted
                ? "bg-black text-white"
                : step.isActive
                ? 'border-2 border-current text-gray-600'
                : 'border border-gray-300 text-gray-400'
            }`}
          >
            {step.number}
          </div>
          <div className="text-xs mt-1 text-gray-800">Step {step.number}</div>
        </div>
      ))}
    </div>
  );
};

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
      XS: { waist: 72.5, hips: 88.5, thigh: 48 },
      S: { waist: 77.5, hips: 93.5, thigh: 52 },
      M: { waist: 82.5, hips: 98.5, thigh: 56 },
      L: { waist: 87.5, hips: 103.5, thigh: 60},
      XL: { waist: 93.5, hips: 109.5, thigh: 64 },
      XXL: { waist: 98.5, hips: 114.5, thigh: 66 }
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
      XXS: { waist: 61.5, hips: 87.5, thigh: 50.5 },
      XS: { waist: 64, hips: 90, thigh: 51.5,},
      S: { waist: 66.5, hips: 92.5, thigh: 52.5 },
      M: { waist: 69, hips: 95, thigh: 53.5},
      L: { waist: 71.5, hips: 97.5, thigh: 54.5 },
      XL: { waist: 74, hips: 100, thigh: 55.5 }
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
  length: {
    title: "Length",
    description: "Measure from the shoulder to the desired hemline"
  }
};

export default function AutoSizeFinder() {
  const [currentStep, setCurrentStep] = useState(0); // Start with 0 for intro screen
  const [gender, setGender] = useState<Gender | ''>('');
  const [category, setCategory] = useState<Category | ''>('');
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [recommendedSize, setRecommendedSize] = useState('');
  const [unit, setUnit] = useState<MeasurementUnit>('cm');
  const [activeHelp, setActiveHelp] = useState('');
  const [productUrl, setProductUrl] = useState('');

  // Define steps for the wizard
  const steps: Step[] = [
    { number: 1, isActive: currentStep === 1, isCompleted: currentStep > 1 },
    { number: 2, isActive: currentStep === 2, isCompleted: currentStep > 2 },
    { number: 3, isActive: currentStep === 3, isCompleted: currentStep > 3 }
  ];

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
    
    // Move to next step after analysis
    setCurrentStep(2);
  };

  // Get measurement fields for current category
  const getMeasurementFields = () => {
    if (!gender || !category) return [];
    
    return gender === 'men' 
      ? category === 'tops'
        ? ['shoulder', 'chest', 'waist', 'neck']
        : ['waist', 'hips', 'thigh']
      : category === 'tops'
        ? ['shoulder', 'bust', 'waist', 'neck']
        : category === 'dresses'
          ? ['bust', 'waist', 'hips', 'length']
          : ['waist', 'hips', 'thigh'];
  };

  // Convert units (inch → cm)
  const convertToCm = (value: string): number => {
    const numValue = parseFloat(value);
    return unit === 'inch' ? numValue * 2.54 : numValue;
  };

  // Calculate recommended size
  const findSize = () => {
    if (!gender || !category) return;

    const chart = sizeCharts[gender][category as keyof typeof sizeCharts[Gender]];
    let bestMatch = '';
    let smallestDiff = Infinity;

    Object.entries(chart).forEach(([size, sizeData]: [string, Record<string, number>]) => {
      let totalDiff = 0;
      let measuredParams = 0;

      Object.entries(sizeData).forEach(([key, idealValue]) => {
        if (measurements[key]) {
          const userValue = convertToCm(measurements[key]);
          totalDiff += Math.abs(userValue - (idealValue as number));
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
    setCurrentStep(3);
  };

  // Handle measurement input changes
  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      analyzeUrl();
    } else if (currentStep === 2) {
      findSize();
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setGender('');
    setCategory('');
    setProductUrl('');
    setMeasurements({});
    setRecommendedSize('');
  };

  // Render current step content
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Intro screen
        return (
          <div className="flex flex-col items-center justify-center space-y-8 py-16">
            <h1 className="text-4xl font-serif text-center text-black">Find Your Perfect Size</h1>
            <p className="text-center text-gray-600">Get personalized size recommendations in just 3 steps</p>
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-md bg-black text-white font-medium text-lg"
            >
              Start Now
            </button>
          </div>
        );
        
      case 1: // URL Input Step
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-center text-black">Product Identification</h2>
            <p className="text-center text-gray-700">
              Enter Product URL (e.g., https://guess.in/women/dresses/red-dress)
            </p>
            <input
              type="text"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Enter URL here"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-opacity-50 focus:ring-black text-black"
            />
          </div>
        );
        
        case 2: // Measurements Step
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-center text-black">
              Enter Your Measurements
            </h2>
            <div className="flex justify-end space-x-2 mb-4">
              <button 
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded ${unit === 'cm' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                cm
              </button>
              <button 
                onClick={() => setUnit('inch')}
                className={`px-3 py-1 rounded ${unit === 'inch' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                in
              </button>
            </div>
            <div className="space-y-4">
              {getMeasurementFields().map((field) => (
                <div key={field} className="flex items-center justify-between">
                  <label className="capitalize text-gray-900">{measurementGuides[field]?.title || field}</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        className="w-32 p-2 border rounded-md text-black" // Added text-black here
                        placeholder={field}
                        value={measurements[field] || ''}
                        min="0"
                        step="0.1"
                        onChange={(e) => handleMeasurementChange(field, e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-gray-800 text-sm">{unit}</span>
                    </div>
                    <button 
                      onClick={() => setActiveHelp(activeHelp === field ? '' : field)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      How to measure?
                    </button>
                  </div>
                </div>
              ))}
              
              {activeHelp && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{measurementGuides[activeHelp]?.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{measurementGuides[activeHelp]?.description}</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 3: // Results Step
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-serif text-black">Your Recommended Size</h2>
            <div className="text-6xl font-bold my-8 text-black">{recommendedSize}</div>
            <p className="text-gray-600">
              For {gender === 'men' ? "Men's" : "Women's"} {category}
            </p>
            <button
              onClick={handleStartOver}
              className="mt-8 px-6 py-2 rounded-md bg-black text-white"
            >
              Start Over
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      <div className="w-full h-16 bg-yellow-800" />
      
      <div className="max-w-2xl mx-auto p-8">
        {currentStep > 0 && currentStep <= 3 && (
          <StepIndicator steps={steps} />
        )}

        <div className="bg-white p-8 rounded-lg shadow-sm border">
          {renderStep()}
          
          {currentStep > 0 && currentStep < 3 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-6 py-2 rounded-md bg-gray-200 text-gray-800"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-md bg-black text-white"
                disabled={currentStep === 1 ? !productUrl : Object.keys(measurements).length === 0}
              >
                {currentStep === 2 ? 'Find My Size' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
