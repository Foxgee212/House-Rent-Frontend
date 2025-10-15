import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import "react-phone-input-2/lib/style.css";
import App from './App.jsx'
import { HouseProvider } from './context/HouseContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter >
      <AuthProvider>
        <HouseProvider>
          <App />
          <Toaster position="top-center" reverseOrder={false} />
        </HouseProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

