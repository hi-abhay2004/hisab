import { storageService } from '../services/storageService';
import { generateId } from '../utils/helpers';

export const createDemoBills = async () => {
  const demoBills = [
    {
      id: generateId(),
      billName: 'Mr. Sharma Kitchen Renovation',
      headers: [
        {
          id: generateId(),
          name: 'Kitchen',
          workItems: [
            {
              id: generateId(),
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
              id: generateId(),
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
          id: generateId(),
          name: 'Dining Area',
          workItems: [
            {
              id: generateId(),
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
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      billName: 'Mrs. Verma Bedroom Work',
      headers: [
        {
          id: generateId(),
          name: 'Master Bedroom',
          workItems: [
            {
              id: generateId(),
              workName: 'Wardrobe',
              width: 6,
              widthUnit: 'ft',
              height: 8,
              heightUnit: 'ft',
              rate: 180,
              totalSqft: 48,
              totalRate: 8640
            },
            {
              id: generateId(),
              workName: 'Bed Backrest',
              width: 5,
              widthUnit: 'ft',
              height: 4,
              heightUnit: 'ft',
              rate: 120,
              totalSqft: 20,
              totalRate: 2400
            }
          ]
        }
      ],
      advanceAmount: 3000,
      createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: generateId(),
      billName: 'Office Cabin Project',
      headers: [
        {
          id: generateId(),
          name: 'Manager Cabin',
          workItems: [
            {
              id: generateId(),
              workName: 'Office Table',
              width: 4,
              widthUnit: 'ft',
              height: 2.5,
              heightUnit: 'ft',
              rate: 160,
              totalSqft: 10,
              totalRate: 1600
            }
          ]
        },
        {
          id: generateId(),
          name: 'Meeting Room',
          workItems: [
            {
              id: generateId(),
              workName: 'Conference Table',
              width: 8,
              widthUnit: 'ft',
              height: 3,
              heightUnit: 'ft',
              rate: 140,
              totalSqft: 24,
              totalRate: 3360
            },
            {
              id: generateId(),
              workName: 'Wall Shelves',
              width: 10,
              widthUnit: 'ft',
              height: 1.5,
              heightUnit: 'ft',
              rate: 110,
              totalSqft: 15,
              totalRate: 1650
            }
          ]
        }
      ],
      advanceAmount: 2000,
      createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    }
  ];

  // Save each demo bill
  for (const bill of demoBills) {
    await storageService.saveBill(bill);
  }

  return demoBills.length;
};
