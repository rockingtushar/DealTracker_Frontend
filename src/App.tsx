import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Deals from './pages/Deals'
import Payments from './pages/Payments'
import Invoices from './pages/Invoices'
import RateCard from './pages/RateCard'
import Settings from './pages/Settings'
import MediaKit from './pages/MediaKit'
import DealDetail from './pages/DealDetail'
import Reports from './pages/Reports'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="deals"     element={<Deals />} />
            <Route path="deals/:id" element={<DealDetail />} />
            <Route path="payments"  element={<Payments />} />
            <Route path="invoices"  element={<Invoices />} />
            <Route path="ratecard"  element={<RateCard />} />
            <Route path="mediakit"  element={<MediaKit />} />
            <Route path="settings"  element={<Settings />} />
            <Route path="reports"   element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
