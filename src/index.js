import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Ou './App.js'
import './index.css'; // Importa seu CSS global

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);