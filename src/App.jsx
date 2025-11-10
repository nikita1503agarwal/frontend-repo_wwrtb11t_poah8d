import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Spline from '@splinetool/react-spline'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Hero() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/O-AdlP9lTPNz-i8a/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black pointer-events-none" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">TravelSplit AI</h1>
            <p className="mt-3 text-white/80 md:text-lg">AI-powered group travel expense splitter with live sync, OCR, currency conversion, and test-mode payments.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => nav('/login')} className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-white/90">Get Started</button>
              <a href="#features" className="px-5 py-2.5 rounded-lg border border-white/30 hover:bg-white/10">Learn more</a>
            </div>
          </div>
        </div>
      </div>
      <section id="features" className="px-6 py-12 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          {t:'Live Sync',d:'See expenses appear instantly across the group.'},
          {t:'OCR + AI',d:'Scan receipts with Tesseract.js and auto-fill details.'},
          {t:'Multi-currency',d:'Convert with live exchange rates worldwide.'},
        ].map((f,i)=> (
          <div key={i} className="rounded-xl border border-white/10 p-6 bg-white/[0.02]">
            <h3 className="text-xl font-semibold">{f.t}</h3>
            <p className="text-white/70 mt-2">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

function AppRoutes() {
  const [token] = useState(localStorage.getItem('ts_token'))
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/login" element={<Login backendURL={backendURL} />} />
      <Route path="/dashboard" element={token ? <Dashboard backendURL={backendURL} /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
