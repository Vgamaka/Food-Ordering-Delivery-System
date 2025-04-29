import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from "./context/AuthContext";
import { LoadScript } from "@react-google-maps/api";


const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
    <App />
  </AuthProvider>
)
