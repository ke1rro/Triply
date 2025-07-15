import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../lib/auth'
import { useAuth } from '../context/AuthContext'
import {
  FiMapPin,
  FiHeart,
  FiClock,
  FiPlus,
  FiSettings,
  FiLogOut,
  FiUser,
  FiArrowLeft,
} from 'react-icons/fi'

const Profile = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/home')
  }

  // Mock user data - in a real app this would come from your database
  const userStats = {
    tripsCompleted: 12,
    likedTrips: 8,
    activeSessions: 2,
    totalDistance: 15420,
  }

  const profileTiles = [
    {
      title: 'Trip History',
      subtitle: `${userStats.tripsCompleted} completed trips`,
      icon: <FiMapPin className="h-6 w-6" />,
      color: 'from-blue-400 to-blue-600',
      onClick: () => console.log('Trip History clicked'),
    },
    {
      title: 'Liked Trips',
      subtitle: `${userStats.likedTrips} saved adventures`,
      icon: <FiHeart className="h-6 w-6" />,
      color: 'from-rose-400 to-rose-600',
      onClick: () => console.log('Liked Trips clicked'),
    },
    {
      title: 'Active Sessions',
      subtitle: `${userStats.activeSessions} ongoing trips`,
      icon: <FiClock className="h-6 w-6" />,
      color: 'from-amber-400 to-amber-600',
      onClick: () => console.log('Active Sessions clicked'),
    },
    {
      title: 'Create Trip',
      subtitle: 'Plan your next adventure',
      icon: <FiPlus className="h-6 w-6" />,
      color: 'from-green-400 to-green-600',
      onClick: () => console.log('Create Trip clicked'),
    },
  ]

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background with same style as login/signup */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <FiArrowLeft
            className="h-8 w-8 cursor-pointer text-white drop-shadow-sm transition-all duration-300 hover:scale-110 hover:text-blue-400 active:scale-95"
            onClick={handleBack}
          />
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            Profile
          </h1>
          <div className="h-8 w-8"></div> {/* Spacer for centering */}
        </div>
        <div className="rounded-2xl bg-black/70 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <FiUser className="h-8 w-8 text-white" />
              )}
            </div>
            {currentUser?.displayName && (
              <h2 className="text-xl font-semibold text-white">
                {currentUser.displayName}
              </h2>
            )}
            <p
              className={`${currentUser?.displayName ? 'text-sm' : 'text-lg font-semibold'} text-gray-300`}
            >
              {currentUser?.email || 'Travel Enthusiast'}
            </p>
            <div className="mt-3 text-xs text-gray-400">
              {userStats.totalDistance.toLocaleString()} km traveled
            </div>
          </div>

          {/* Profile Tiles Grid */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {profileTiles.map((tile, index) => (
              <button
                key={index}
                onClick={tile.onClick}
                className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${tile.color} opacity-0 transition-opacity duration-300 group-hover:opacity-20`}
                ></div>
                <div className="relative">
                  <div className="mb-2 text-white">{tile.icon}</div>
                  <h3 className="text-sm font-medium text-white">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-gray-300">{tile.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Settings and Logout Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => console.log('Settings clicked')}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/10 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-300 ease-in-out hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <FiSettings className="h-5 w-5" />
              Settings
            </button>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-300 ease-in-out hover:bg-red-700/80 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
            >
              <FiLogOut className="h-5 w-5" />
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>

          {/* Footer Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-white/5 p-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {userStats.tripsCompleted}
              </div>
              <div className="text-xs text-gray-400">Trips</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {userStats.likedTrips}
              </div>
              <div className="text-xs text-gray-400">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {userStats.activeSessions}
              </div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
