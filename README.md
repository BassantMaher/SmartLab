# SmartLab 🔬

A modern IoT-based laboratory management system built with React, TypeScript, and Firebase. SmartLab helps educational institutions manage their laboratory resources, monitor environmental conditions, and track equipment usage efficiently.

## Features 🚀

- **Real-time Monitoring**
  - Door state tracking (open/closed)
  - People counting system
  - Environmental metrics (temperature, humidity, etc.)

- **Inventory Management**
  - Equipment tracking
  - Borrowing system
  - Low stock alerts

- **User Management**
  - Role-based access control (Admin/Student)
  - Google authentication
  - Profile management

- **Request System**
  - Equipment borrowing requests
  - Request status tracking
  - Approval/rejection workflow

- **Notifications**
  - Real-time alerts
  - System status updates
  - Request status notifications

## Tech Stack 💻

- **Frontend**
  - React
  - TypeScript
  - Tailwind CSS
  - Vite

- **Backend**
  - Firebase Realtime Database
  - Firebase Authentication

## Getting Started 🏁

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/SmartLab.git
   cd SmartLab
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Project Structure 📁

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── pages/          # Application pages
├── routes/          # route functions
├── utils/          # Utility functions
├── firebase.ts     # Firebase configuration
└── App.tsx         # Main application component
```

## Contributing 🤝

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## Acknowledgments 🙏

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)