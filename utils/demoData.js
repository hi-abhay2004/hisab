// Example data for demonstration purposes
export const DEMO_BILL = {
  id: 'demo_bill_001',
  billName: 'Mr. Sharma Kitchen Renovation',
  headers: [
    {
      id: 'header_kitchen',
      name: 'Kitchen',
      workItems: [
        {
          id: 'item_001',
          workName: 'Cabinet Doors',
          width: 4,
          widthUnit: 'ft',
          height: 2,
          heightUnit: 'ft',
          rate: 150,
          totalSqft: 8,
          totalRate: 1200
        },
        {
          id: 'item_002',
          workName: 'Counter Top',
          width: 8,
          widthUnit: 'ft',
          height: 2,
          heightUnit: 'ft',
          rate: 200,
          totalSqft: 16,
          totalRate: 3200
        }
      ]
    },
    {
      id: 'header_dining',
      name: 'Dining Area',
      workItems: [
        {
          id: 'item_003',
          workName: 'Wall Paneling',
          width: 12,
          widthUnit: 'ft',
          height: 8,
          heightUnit: 'ft',
          rate: 100,
          totalSqft: 96,
          totalRate: 9600
        }
      ]
    }
  ],
  advanceAmount: 5000,
  createdAt: '2025-08-07T00:00:00.000Z'
};

// Common work item templates for quick selection
export const WORK_TEMPLATES = [
  { name: 'Cabinet Doors', rate: 150 },
  { name: 'Counter Top', rate: 200 },
  { name: 'Wall Paneling', rate: 100 },
  { name: 'Bed Backrest', rate: 120 },
  { name: 'Wardrobe', rate: 180 },
  { name: 'Door Frame', rate: 80 },
  { name: 'Window Frame', rate: 90 },
  { name: 'Ceiling Work', rate: 60 },
  { name: 'Floor Work', rate: 70 },
  { name: 'Shelving', rate: 110 }
];

// Common room templates
export const ROOM_TEMPLATES = [
  'Bedroom-1',
  'Bedroom-2', 
  'Kitchen',
  'Living Room',
  'Dining Room',
  'Bathroom',
  'Study Room',
  'Store Room',
  'Balcony',
  'Hall'
];
