/* === Imports, React core + StrictMode for highlighting potential issues, createRoot to render the app, App component (main app) Global CSS styles === */
import React from "react"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App";
import './index.css'

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
