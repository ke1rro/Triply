import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'
import TravelCard from '../components/TravelCard'
import CreateTripModal from '../components/CreateTripModal'
import {
  FiSearch,
  FiUser,
  FiNavigation,
  FiHome,
  FiPlus,
  FiHeart,
} from 'react-icons/fi'

const Homepage = () => {
  const [travelData, setTravelData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const navigate = useNavigate()

  const fetchTravelData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'trips'))
      const trips = querySnapshot.docs.map((doc) => {
        const data = doc.data()

        // Calculate average rating from comments
        const averageRating =
          data.comments && data.comments.length > 0
            ? data.comments.reduce(
                (sum, comment) => sum + (comment.rating || 0),
                0
              ) / data.comments.length
            : 0

        // Get location names (limit to 5)
        const locationNames = data.Locations
          ? data.Locations.map((loc) => loc.name).slice(0, 5)
          : []

        return {
          id: doc.id,
          dataName: doc.id, // Use document ID as data name
          name: data.name || 'Untitled Trip',
          description: data.description || '',
          days: data.days || 0,
          likes: data.likes || 0,
          fileName: data.fileName || null,
          locations: locationNames,
          events: data.Events || [],
          comments: data.comments || [],
          averageRating: averageRating,
          createdAt: data.createdAt,
          userId: data.userId,
        }
      })

      setTravelData(trips)
    } catch (error) {
      console.error('Error fetching travel data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTravelData()
  }, [])

  const filteredTravels = travelData.filter(
    (travel) =>
      travel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      travel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      travel.locations?.some((location) =>
        location.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  const handleFilterClick = () => {
    console.log('Filter clicked')
  }

  const handleProfileClick = () => {
    setActiveTab('profile')
    navigate('/profile')
  }

  const handleAddClick = () => {
    setShowCreateModal(true)
  }

  const handleCreateSuccess = () => {
    // Refresh the travel data after successful creation
    fetchTravelData()
  }

  const handleHomeClick = () => {
    setActiveTab('home')
  }

  const handleLikesClick = () => {
    setActiveTab('likes')
    console.log('Likes clicked')
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background image with overlay - full screen */}
      <div
        className="inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        {/* Main Card */}
        <div className="w-full rounded-2xl bg-black/70 p-8 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl text-white">
                <FiNavigation className="h-8 w-8" />
              </div>
              <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold text-white drop-shadow-lg">
                Triply
              </h1>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 px-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full flex-1 rounded-lg border border-gray-300/30 bg-white/10 px-4 py-3 text-white placeholder-gray-300 backdrop-blur-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FiSearch
              className="h-6 w-6 cursor-pointer text-white drop-shadow-sm transition-all duration-300 hover:scale-110 hover:text-blue-400 active:scale-95"
              onClick={handleFilterClick}
            />
          </div>
        </div>

        {/* Travel Cards - Scrollable Area */}
        <div className="flex-1 overflow-hidden px-6 pb-24">
          <div className="h-full space-y-4 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-gray-300">
                Loading trips...
              </div>
            ) : (
              <>
                {filteredTravels.length > 0 ? (
                  <div className="flex w-full flex-col items-center space-y-4">
                    {filteredTravels.map((travel) => (
                      <div key={travel.id} className="w-full max-w-sm">
                        <TravelCard trip={travel} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-300">
                    {searchQuery
                      ? 'No trips found matching your search.'
                      : 'No trips available.'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="border-t border-white/10 bg-black/80 backdrop-blur-lg">
          <div className="safe-area-bottom px-4 py-3">
            <div className="flex items-center justify-around">
              {/* Home */}
              <button
                onClick={handleHomeClick}
                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all duration-300 ${
                  activeTab === 'home'
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiHome className="h-6 w-6" />
                <span className="text-xs font-medium">Home</span>
              </button>

              {/* Likes */}
              <button
                onClick={handleLikesClick}
                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all duration-300 ${
                  activeTab === 'likes'
                    ? 'bg-rose-600/30 text-rose-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiHeart className="h-6 w-6" />
                <span className="text-xs font-medium">Saved</span>
              </button>

              {/* Add Trip */}
              <button
                onClick={handleAddClick}
                className="flex flex-col items-center gap-1 rounded-lg bg-blue-600/20 px-4 py-2 text-blue-400 transition-all duration-300 hover:bg-blue-600/30 active:scale-95"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <FiPlus className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium">Create</span>
              </button>

              {/* Profile */}
              <button
                onClick={handleProfileClick}
                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all duration-300 ${
                  activeTab === 'profile'
                    ? 'bg-purple-600/30 text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiUser className="h-6 w-6" />
                <span className="text-xs font-medium">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <CreateTripModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}

export default Homepage
