import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'

import startTranslationObserver from '../../module/frontend/translator.js'

startTranslationObserver("http://127.0.0.1:8000", "Bottom-Left", ["en", "fr"]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
