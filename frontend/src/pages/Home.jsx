import React, { useRef } from 'react'
import { logout } from '../lib/auth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AboutUs from '../components/AboutUs'

const Home = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const aboutRef = useRef(null)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  const scrollToAbout = () => {
    aboutRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero section */}
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white/70 p-8 shadow-lg backdrop-blur-lg">
          <h1 className="mb-2 text-3xl font-bold text-indigo-900">
            Travel AI Assistant
          </h1>
          <p className="mb-6 text-gray-600">
            Welcome back, {currentUser?.email || 'Traveler'}
          </p>

          <div className="mb-6 rounded-xl bg-indigo-100/70 p-4">
            <h2 className="mb-2 text-lg font-semibold text-indigo-800">
              Your AI Travel Agent
            </h2>
            <p className="text-sm text-gray-700">
              Ready to plan your next adventure? I'm here to help with
              personalized trip planning, budget calculations, and expert
              recommendations.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <button className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition duration-200 ease-in-out hover:bg-indigo-700">
              Start Planning
            </button>

            <button
              onClick={scrollToAbout}
              className="rounded-lg bg-indigo-100 px-4 py-2 font-medium text-indigo-700 transition duration-200 ease-in-out hover:bg-indigo-200"
            >
              About Us
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-transparent px-4 py-2 font-medium text-gray-700 transition duration-200 ease-in-out hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* About Us section */}
      <div ref={aboutRef}>
        <AboutUs />
      </div>
    </div>
  )
}

export default Home
