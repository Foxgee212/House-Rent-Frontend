import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { HouseProvider } from './context/HouseContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename='/House-Rent-Frontend'>
      <AuthProvider>
        <HouseProvider>
          <App />
        </HouseProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

