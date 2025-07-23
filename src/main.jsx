import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MovieProvider } from './contexts/MovieContext'
import './css/index.css'
import App from './App.jsx'
import { FireproofProvider } from './contexts/FireproofContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MovieProvider>
      <FireproofProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FireproofProvider>
    </MovieProvider>
  </StrictMode>,
)
