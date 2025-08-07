// Generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Unit conversion utilities
export const UNITS = [
  { label: 'Feet', value: 'ft' },
  { label: 'Inch', value: 'inch' },
  { label: 'Meter', value: 'm' },
  { label: 'CM', value: 'cm' },
];

// Convert to square feet for consistent calculation
export const convertToSqft = (width, widthUnit, height, heightUnit) => {
  const conversionFactors = {
    'ft': 1,
    'inch': 1/12,
    'm': 3.28084,
    'cm': 0.0328084,
  };

  const widthInFt = width * conversionFactors[widthUnit];
  const heightInFt = height * conversionFactors[heightUnit];
  
  return widthInFt * heightInFt;
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Validate work item inputs
export const validateWorkItem = (workItem) => {
  const errors = {};

  if (!workItem.workName || workItem.workName.trim() === '') {
    errors.workName = 'Work name is required';
  }

  if (!workItem.width || workItem.width <= 0) {
    errors.width = 'Width must be greater than 0';
  }

  if (!workItem.height || workItem.height <= 0) {
    errors.height = 'Height must be greater than 0';
  }

  if (!workItem.rate || workItem.rate <= 0) {
    errors.rate = 'Rate must be greater than 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
