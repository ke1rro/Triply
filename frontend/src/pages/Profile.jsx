import React, { useState, useEffect } from 'react'
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
import { getUserDocument } from '../lib/userService'

const Profile = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userData, setUserData] = useState(null)

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const data = await getUserDocument(currentUser.uid)
          setUserData(data)
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }

    fetchUserData()
  }, [currentUser])

  // Update user stats to use real data
  const userStats = {
    tripsCompleted: 12, // This could be calculated from user's trips
    likedTrips: userData?.likedTrips?.length || 0,
    activeSessions: 2, // This could be calculated from active trips
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
      subtitle: `${userStats.likedTrips} liked adventures`,
      icon: <FiHeart className="h-6 w-6" />,
      color: 'from-rose-400 to-rose-600',
      onClick: () => navigate('/liked'),
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
    <div className="min-h-screen bg-gray-900">
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

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header Section */}
        <div className="flex-shrink-0 px-4 pb-6 pt-12 backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-blue-400 drop-shadow-2xl">
              Triply
            </h1>
            <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-blue-400 to-teal-400"></div>
          </div>

          {/* Profile Title and Description */}
          <div className="text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <p className="text-xl font-bold text-white drop-shadow-md">
                Profile
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 pb-20">
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl bg-black/70 p-6 shadow-2xl backdrop-blur-md">
              {/* Avatar and User Info */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="h-10 w-10 text-white" />
                  )}
                </div>

                {currentUser?.displayName && (
                  <h2 className="mb-1 text-lg font-semibold text-white">
                    {currentUser.displayName}
                  </h2>
                )}

                <p
                  className={`${currentUser?.displayName ? 'text-sm' : 'text-lg font-semibold'} mb-2 text-gray-300`}
                >
                  {currentUser?.email || 'Travel Enthusiast'}
                </p>

                <div className="text-xs text-gray-400">
                  {userStats.totalDistance.toLocaleString()} km traveled
                </div>
              </div>

              {/* Profile Tiles Grid */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                {profileTiles.map((tile, index) => (
                  <button
                    key={index}
                    onClick={tile.onClick}
                    className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 active:bg-white/15"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${tile.color} opacity-0 transition-opacity duration-300 group-hover:opacity-20`}
                    ></div>
                    <div className="relative flex flex-col items-start justify-start gap-2 text-left">
                      <div className="text-white">{tile.icon}</div>
                      <h3 className="text-sm font-medium leading-tight text-white">
                        {tile.title}
                      </h3>
                      <p className="text-xs leading-tight text-gray-300">
                        {tile.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => console.log('Settings clicked')}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/10 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <FiSettings className="h-5 w-5" />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-red-700/80 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                >
                  <FiLogOut className="h-5 w-5" />
                  {loading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <Navbar
        showBottomNav
        activeTab="profile"
        onAddClick={() => setShowCreateModal(true)}
      />

      {/* Create Trip Modal */}
      {showCreateModal && (
        <CreateTripModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

export default Profile
