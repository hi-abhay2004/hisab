# Carpentry Invoice App 🔨📋

A simple, offline-first React Native (Expo) mobile application designed specifically for carpenters to generate professional invoices. Built with simplicity in mind for users with basic technical skills.

## 🎯 Features

### Core Functionality
- **Bill Management**: Create and save multiple bills with unique names
- **Room-wise Organization**: Add headers for different rooms/sections (e.g., Bedroom-1, Kitchen)
- **Work Item Management**: Add detailed work items with:
  - Work name (e.g., Bed Backrest, Door Frame)
  - Dimensions with flexible units (feet, inch, meter, cm)
  - Rate per square foot
  - Auto-calculated area and total cost
- **Real-time Calculations**: Automatic computation of:
  - Total square footage
  - Individual item costs
  - Overall bill total
  - Balance after advance payment

### User Experience
- **Simple Interface**: Clean, intuitive design suitable for all skill levels
- **Offline Operation**: No internet required - all data stored locally
- **Edit & Delete**: Modify or remove work items and headers easily
- **PDF Export**: Generate professional invoices for sharing
- **Data Persistence**: All bills saved automatically to device storage

## 📱 Screenshots

*Note: Screenshots to be added after app testing*

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI
- Expo Go app on your mobile device (for testing)

### Installation

1. **Clone or download the project**
   ```bash
   cd hisab3.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in terminal/browser
   - Or run `npm run android` / `npm run ios` for emulator

## 📖 How to Use

### Creating a New Invoice

1. **Enter Bill Name**: Add a descriptive name for your invoice
2. **Add Headers**: Create sections for different rooms or areas
3. **Add Work Items**: For each header, add work items with:
   - Work description
   - Width and height with units
   - Rate per square foot
4. **Review Calculations**: Check auto-calculated totals
5. **Add Advance** (optional): Enter any advance payment received
6. **Save & Export**: Save locally and/or export as PDF

### Example Workflow

```
Bill Name: "Mr. Sharma Kitchen Renovation"
├── Header: "Kitchen"
│   ├── Work Item: "Cabinet Doors" (4 ft × 2 ft @ ₹150/sqft)
│   └── Work Item: "Counter Top" (8 ft × 2 ft @ ₹200/sqft)
└── Header: "Dining Area"
    └── Work Item: "Wall Paneling" (12 ft × 8 ft @ ₹100/sqft)

Total: ₹5,400
Advance: ₹2,000
Balance: ₹3,400
```

## 🛠️ Technical Details

### Architecture
- **Frontend**: React Native with Expo
- **Storage**: AsyncStorage for local data persistence
- **PDF Generation**: expo-print with custom HTML templates
- **File Sharing**: expo-sharing for PDF distribution

### Key Components
- `InvoiceScreen`: Main interface for invoice creation
- `WorkForm`: Modal form for adding/editing work items
- `WorkItem`: Display component for individual work items
- `Dropdown`: Custom dropdown for unit selection

### Data Structure
```javascript
{
  id: "unique_id",
  billName: "Customer Bill Name",
  headers: [
    {
      id: "header_id",
      name: "Room Name",
      workItems: [
        {
          id: "item_id",
          workName: "Work Description",
          width: 10,
          widthUnit: "ft",
          height: 8,
          heightUnit: "ft",
          rate: 150,
          totalSqft: 80,
          totalRate: 12000
        }
      ]
    }
  ],
  advanceAmount: 5000,
  createdAt: "2025-08-07T..."
}
```

## 📦 Dependencies

### Core Dependencies
- `expo` - React Native framework
- `react-native` - Mobile app framework
- `@react-native-async-storage/async-storage` - Local storage
- `expo-print` - PDF generation
- `expo-sharing` - File sharing capabilities

### Development Dependencies
- Standard Expo development tools

## 🔧 Customization

### Adding New Units
Edit `utils/helpers.js` to add new measurement units:

```javascript
export const UNITS = [
  { label: 'Feet', value: 'ft' },
  { label: 'Inch', value: 'inch' },
  // Add new units here
];
```

### Modifying PDF Template
Update `services/pdfService.js` to customize invoice appearance:

```javascript
// Modify the generateHTMLContent function
// to change PDF layout and styling
```

## 🐛 Troubleshooting

### Common Issues

1. **App won't start**
   - Ensure all dependencies are installed: `npm install`
   - Clear Expo cache: `expo start -c`

2. **PDF export not working**
   - Check device permissions for file access
   - Ensure expo-print is properly installed

3. **Data not saving**
   - Verify AsyncStorage permissions
   - Check for console errors in development

### Support
For issues or questions, please check the console logs and ensure all required permissions are granted.

## 📄 License

This project is created for personal/educational use. Feel free to modify and adapt for your needs.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

---

**Built with ❤️ for carpenters who need simple, reliable invoicing tools.**
