# ShifaMart+ Frontend

A comprehensive healthcare platform frontend built with React, Vite, and Tailwind CSS. Features role-based dashboards for Patients, Pharmacies, Doctors, and Admins, along with AI-powered symptom checking, prescription OCR, and medicine price comparison.

## Features

### 🏥 Patient Module
- **AI Symptom Checker**: Analyze symptoms and get health recommendations
- **Prescription Upload**: OCR-powered prescription scanning and digitization
- **Medicine Comparison**: Compare prices and availability across pharmacies
- **First Aid Guide**: Emergency instructions and ambulance trigger

### 💊 Pharmacy Module
- **Inventory Management**: Track stock, prices, and expiry
- **Order Processing**: Manage incoming orders and prescriptions
- **Analytics**: Revenue tracking and sales insights

### 👨‍⚕️ Doctor Module
- **Patient Queue**: Manage appointments and consultations
- **Digital Prescriptions**: Issue structured prescriptions easily
- **Patient History**: View medical records and past visits

### 🛡️ Admin Module
- **Platform Analytics**: Monitor user growth and system health
- **Pharmacy Approvals**: Review and approve new pharmacy registrations
- **User Management**: Manage platform users and roles

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Mocking**: MSW (Mock Service Worker)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`.

### Mock API

This project uses MSW (Mock Service Worker) to simulate backend APIs. You can login with the following credentials to test different roles:

| Role | Email | Password |
|------|-------|----------|
| **Patient** | (Any valid email) | (Any password > 6 chars) |
| **Doctor** | doctor@shifamart.com | doctor123 |
| **Pharmacy** | pharmacy@shifamart.com | pharmacy123 |
| **Admin** | admin@shifamart.com | admin123 |

## Project Structure

```
src/
├── app/              # App entry and routing
├── components/       # Reusable UI components
│   ├── ui/           # Base components (Button, Input, etc.)
│   ├── layout/       # Layout components (Nav, Shell)
│   ├── charts/       # Chart wrappers
│   └── ai/           # AI chat components
├── pages/            # Page components by module
│   ├── auth/         # Login/Register
│   ├── patient/      # Patient dashboard & features
│   ├── pharmacy/     # Pharmacy dashboard & features
│   ├── doctor/       # Doctor dashboard & features
│   └── admin/        # Admin dashboard & features
├── services/         # API service layer
├── stores/           # Zustand state stores
├── utils/            # Helper functions
└── mocks/            # MSW handlers and fixtures
```

## Building for Production

```bash
npm run build
```

## Testing

Run unit tests:
```bash
npm run test
```
