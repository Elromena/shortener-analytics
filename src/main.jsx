import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createDemoData } from './data/demoData';
import './index.css';

createDemoData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
