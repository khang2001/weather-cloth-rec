/**
 * Application Entry Point
 * 
 * This is the main entry point for the React application.
 * It renders the root App component into the DOM and enables
 * React StrictMode for development warnings.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import App from './App.jsx'
import './styles/index.css'

// Render the application into the root DOM element
// StrictMode enables additional checks and warnings in development
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HeroUIProvider>
      <main className="text-foreground bg-background h-screen">
        <App />
      </main>
    </HeroUIProvider>
  </React.StrictMode>,
)


