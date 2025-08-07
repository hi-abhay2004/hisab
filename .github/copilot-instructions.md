<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Carpentry Invoice App - Copilot Instructions

This is a React Native (Expo) mobile application for generating carpentry invoices.

## Project Structure
- `/components` - Reusable React Native components (Dropdown, WorkForm, WorkItem)
- `/screens` - Main screen components (InvoiceScreen)
- `/services` - Business logic and external service integrations (storage, PDF)
- `/utils` - Utility functions and helpers

## Key Technologies
- React Native with Expo
- AsyncStorage for local data persistence
- expo-print for PDF generation
- expo-sharing for sharing generated PDFs

## App Features
- Create carpentry invoices with bill names
- Add room/section headers (e.g., Bedroom-1, Kitchen)
- Add work items with dimensions, rates, and auto-calculations
- Real-time calculations for area (sqft) and total rates
- Support for multiple units (feet, inch, meter, cm)
- Edit and delete work items
- Advance amount handling
- Local storage of bills
- PDF export with formatted invoice

## Design Principles
- Simple and clean UI suitable for barely educated users
- Large touch targets and clear visual hierarchy
- Minimal text input with validation
- Auto-calculations to reduce manual errors
- Offline-first approach with local storage

## Code Style
- Use functional components with hooks
- Follow React Native best practices
- Use StyleSheet for consistent styling
- Implement proper error handling and user feedback
- Use descriptive variable and function names
