import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize dark mode from localStorage
const isDarkMode = localStorage.getItem('experiment-store')
    ? JSON.parse(localStorage.getItem('experiment-store') || '{}').state?.isDarkMode ?? true
    : true;

if (isDarkMode) {
    document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
