import { Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { GymAdminsPage } from './components/dashboard/SuperAdminDashboard/GymAdminsPage'
import { ActivitiesPage } from './components/dashboard/AdminDashboard/ActivitiesPage'
import { MembersPage } from './components/dashboard/AdminDashboard/MembersPage'
import { CoachMembersPage } from './components/dashboard/Coach/CoachMembersPage'
import { SchedulePage } from './components/dashboard/AdminDashboard/SchedulePage'
import { CoachSchedulePage } from './components/dashboard/Coach/CoachSchedulePage'
import { SuperAdminAnalyticsPage } from './components/dashboard/SuperAdminDashboard/SuperAdminAnalyticsPage'
import { SuperAdminSettingsPage } from './components/dashboard/SuperAdminDashboard/SuperAdminSettingsPage'
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
            <Route path="/dashboard/gyms/:gymId/admins" element={<GymAdminsPage />} />
            <Route path="/dashboard/activities" element={<ActivitiesPage />} />
            <Route path="/dashboard/members" element={<MembersPage />} />
            <Route path="/dashboard/my-members" element={<CoachMembersPage />} />
            <Route path="/dashboard/schedule" element={<SchedulePage />} />
            <Route path="/dashboard/schedules" element={<CoachSchedulePage />} />
            <Route path="/dashboard/analytics" element={<SuperAdminAnalyticsPage />} />
            <Route path="/dashboard/settings" element={<SuperAdminSettingsPage />} />
          </Route>

        </Route>

      </Routes>

      {/* Toaster for notifications */}
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
