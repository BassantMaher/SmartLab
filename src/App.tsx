import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { AuthProvider } from './context/AuthContext';
import { initializeDatabase } from './firebase';

async function startApp() {
  try {
    await initializeDatabase();
    console.log("Database initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

startApp();
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;