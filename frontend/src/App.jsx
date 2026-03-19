import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PlannerWorkspace from './pages/PlannerWorkspace'
import ItineraryView from './pages/ItineraryView'
import MemoryStudio from './pages/MemoryStudio'
import Profile from './pages/Profile'
import Recommendations from './pages/Recommendations'
import BookingPage from './pages/BookingPage'
import Contact from './pages/Contact'
import LoadingSpinner from './components/LoadingSpinner'

function App ()
{
  const { user, loading } = useAuth()

  const location = useLocation()

  if ( loading )
  {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={ location } key={ location.pathname }>
        {/* Public routes */ }
        <Route path="/" element={ <Home /> } />
        <Route path="/contact" element={ <Contact /> } />
        <Route
          path="/login"
          element={ user ? <Navigate to="/dashboard" /> : <Login /> }
        />
        <Route
          path="/register"
          element={ user ? <Navigate to="/dashboard" /> : <Register /> }
        />

        {/* Protected routes */ }
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/planner"
          element={
            user ? (
              <PlannerWorkspace />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/booking"
          element={
            user ? (
              <Layout>
                <BookingPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/itinerary/:id"
          element={
            user ? (
              <Layout>
                <ItineraryView />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/memories"
          element={
            user ? (
              <Layout>
                <MemoryStudio />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            user ? (
              <Layout>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/recommendations"
          element={
            user ? (
              <Layout>
                <Recommendations />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch all route */ }
        <Route path="*" element={ <Navigate to="/" /> } />
      </Routes>
    </AnimatePresence>
  )
}

export default App