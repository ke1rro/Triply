import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'
import TravelCard from '../components/TravelCard'
import { FiSearch, FiUser, FiNavigation } from 'react-icons/fi'
import CreateTripModal from '../components/CreateTripModal'

const Homepage = () => {
  const [travelData, setTravelData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
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
    navigate('/profile')
  }

  const handleAddClick = () => {
    setShowCreateModal(true)
  }

  const handleCreateSuccess = () => {
    // Refresh the travel data after successful creation
    fetchTravelData()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
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
        <div className="rounded-2xl bg-black/70 p-8 shadow-2xl backdrop-blur-md w-full">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl text-white">
                <FiNavigation className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Triply
              </h1>
            </div>
          </div>

          {/* Search Bar Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full flex-1 rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-300 backdrop-blur-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <FiSearch
                className="h-6 w-6 cursor-pointer text-white drop-shadow-sm transition-all duration-300 hover:scale-110 hover:text-blue-400 active:scale-95"
                onClick={handleFilterClick}
              />
              <FiUser
                className="h-6 w-6 cursor-pointer text-white drop-shadow-sm transition-all duration-300 hover:scale-110 hover:text-blue-400 active:scale-95"
                onClick={handleProfileClick}
              />
            </div>
          </div>

          {/* Travel Cards */}
          <div className="mb-6 max-h-80 flex-1 space-y-4 overflow-hidden overflow-y-auto pr-2">
            {loading ? (
              <div className="py-8 text-center text-gray-300">
                Loading trips...
              </div>
            ) : (
              <>
                {filteredTravels.length > 0 ? (
                  <div className="space-y-4 flex flex-col items-center w-full">
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

          {/* Create Travel Button */}
          <button
            className="w-full rounded-lg bg-blue-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-300 ease-in-out hover:bg-blue-700/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleAddClick}
          >
            Create New Trip
          </button>
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
