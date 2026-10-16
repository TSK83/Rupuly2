import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ColorPaletteProvider } from './contexts/ColorPaletteContext'
import './index.css'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <ColorPaletteProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ColorPaletteProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
