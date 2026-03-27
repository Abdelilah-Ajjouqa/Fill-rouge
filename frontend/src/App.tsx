import { Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<AuthPage />} />


        {/* protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>

      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#f8fafc',
          },
        }}
      />
    </>
  )
}

export default App
