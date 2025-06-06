// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { HashRouter as Router } from 'react-router-dom'; // ✅ 添加这行

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>        {/* ✅ 将 Router 提到最外层 */}
      <App />
    </Router>
  </React.StrictMode>
);
