import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

// Set base URL for production
if (import.meta.env.PROD) {
  axios.defaults.baseURL = 'https://fundamental-konstanze-timberzee-0438c2f6.koyeb.app';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
