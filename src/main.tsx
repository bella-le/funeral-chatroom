import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'

// Add font preloading
const fontLink = document.createElement('link')
fontLink.rel = 'stylesheet'
fontLink.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap'
document.head.appendChild(fontLink)

// React bootstrapping
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
