import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { measurePageLoad } from './utils/performance'

// Measure page load performance in development
if (import.meta.env.DEV) {
  measurePageLoad();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
