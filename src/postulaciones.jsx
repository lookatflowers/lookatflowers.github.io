import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ApplyPage from './pages/ApplyPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApplyPage />
  </StrictMode>,
)
