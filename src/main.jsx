import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Fixxo from './Fixxo.jsx'
import WorkerPanel from './WorkerPanel.jsx'
import AdminPanel from './AdminPanel.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Fixxo />} />
        <Route path="/worker" element={<WorkerPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
