import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initAnalytics } from './utils/track'
import ApplyPage from './pages/ApplyPage.jsx'

initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApplyPage />
  </StrictMode>,
)
