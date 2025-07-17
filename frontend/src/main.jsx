import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import TripDetails from './pages/TripDetails'
import Trip from './pages/Trip'
import Profile from './pages/Profile'
import MyTrips from './pages/MyTrips'
import EventDaysDnDPage from './pages/EventDaysDnDPage'
import LikedTrips from './pages/LikedTrips'
import TripInvite from './pages/TripInvite'
import './index.css'

// Make sure the root element is properly targeted
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:tripId"
            element={
              <ProtectedRoute>
                <TripDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tripview/:tripviewId"
            element={
              <ProtectedRoute>
                <Trip />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invite/:tripId"
            element={<TripInvite />}
          />
          <Route
            path="/mytrips"
            element={
              <ProtectedRoute>
                <MyTrips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/liked"
            element={
              <ProtectedRoute>
                <LikedTrips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
)
