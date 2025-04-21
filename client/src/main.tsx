import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from 'wouter';
import App from './App';
import './index.css';

// Get the base path from Vite's import.meta.env
const base = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router base={base}>
      <App />
    </Router>
  </React.StrictMode>
);
