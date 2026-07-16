import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

// StrictMode is intentionally omitted in development so weather effects are not requested twice.
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider><AppProvider><App /></AppProvider></ThemeProvider>
  </BrowserRouter>,
)
