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
} from 'react-icons/fi'
import CreateTripModal from '../components/CreateTripModal'
import Navbar from '../components/Navbar'

const Profile = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  // Mock user data
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
      onClick: () => setShowCreateModal(true),
    },
  ]

  return (
    <div className="fixed h-screen w-screen overflow-hidden bg-gray-900">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-green-900/30"></div>
      </div>

      {/* Navbar */}
      <Navbar
        showBottomNav
        activeTab="profile"
        onAddClick={() => setShowCreateModal(true)}
      />

      {/* Header - Fixed at top */}
      <div className="scale-z-100 fixed left-0 right-0 top-0 px-4 py-6 backdrop-blur-sm sm:px-6 md:px-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="text-3xl text-white">
              <FiUser className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              Profile
            </h1>
          </div>
        </div>
      </div>

      {/* Content - Fixed in center, positioned lower to add space from title */}
      <div className="top-85 fixed left-1/2 z-10 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform px-4">
        <div className="rounded-2xl bg-black/70 p-5 shadow-2xl backdrop-blur-md">
          {/* Avatar and info */}
          <div className="mb-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400">
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
              <h2 className="text-lg font-semibold text-white">
                {currentUser.displayName}
              </h2>
            )}
            <p
              className={`${
                currentUser?.displayName ? 'text-sm' : 'text-lg font-semibold'
              } text-gray-300`}
            >
              {currentUser?.email || 'Travel Enthusiast'}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              {userStats.totalDistance.toLocaleString()} km traveled
            </div>
          </div>

          {/* Tiles - Fixed grid */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            {profileTiles.map((tile, index) => (
              <button
                key={index}
                onClick={tile.onClick}
                className="group relative overflow-hidden rounded-xl bg-white/10 p-3 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 active:bg-white/15"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${tile.color} opacity-0 transition-opacity duration-300 group-hover:opacity-20`}
                ></div>
                <div className="relative flex flex-col items-start justify-start gap-1 text-left">
                  <div className="mb-1 text-white">{tile.icon}</div>
                  <h3 className="text-sm font-medium text-white">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-gray-300">{tile.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Buttons - Fixed position */}
          <div className="space-y-2">
            <button
              onClick={() => console.log('Settings clicked')}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/10 px-4 py-2 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <FiSettings className="h-5 w-5" />
              Settings
            </button>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600/80 px-4 py-2 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-red-700/80 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
            >
              <FiLogOut className="h-5 w-5" />
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateTripModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

export default Profile
