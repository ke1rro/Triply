import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'
import TravelCard from '../components/TravelCard'
import TravelModalWithCopy from '../components/TravelModalWithCopy'
import CreateTripModal from '../components/CreateTripModal'
import Navbar from '../components/Navbar'
import { FiSearch, FiNavigation } from 'react-icons/fi'

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

      const trips = querySnapshot.docs
        .map((doc) => {
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
            likedBy: data.likedBy || [], // Array of user IDs who liked this trip
            fileName: data.fileName || null,
            locations: locationNames,
            events: data.Events || [],
            comments: data.comments || [],
            averageRating: averageRating,
            createdAt: data.createdAt,
            userId: data.userId,
            published: data.published || false,
          }
        })
        .filter((trip) => trip.published === true && trip.parent_id === 'original') // Only show published trips

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

  const handleAddClick = () => {
    setShowCreateModal(true)
  }

  const handleCreateSuccess = () => {
    // Refresh the travel data after successful creation
    fetchTravelData()
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Background image with overlay - full screen */}
      <div
        className="fixed inset-0 h-lvh bg-cover bg-center bg-no-repeat"
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
      <div className="relative z-10 flex h-screen w-full flex-col px-4 pt-8 sm:px-6 md:px-8">
        {/* Header - No black box */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="text-4xl text-white">
              <FiNavigation className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Triply
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full flex-1 rounded-xl border border-gray-300/30 bg-white/10 px-5 py-4 text-lg text-white placeholder-gray-300 backdrop-blur-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FiSearch
              className="h-7 w-7 cursor-pointer text-white drop-shadow-sm transition-all duration-300 hover:scale-110 hover:text-blue-400 active:scale-95"
              onClick={handleFilterClick}
            />
          </div>
        </div>

        {/* Travel Cards - Scrollable Area */}
        <div className="flex-1 pb-32">
          <div className="h-full space-y-4">
            {loading ? (
              <div className="py-8 text-center text-gray-300">
                Loading trips...
              </div>
            ) : (
              <>
                {filteredTravels.length > 0 ? (
                  <div className="flex w-full flex-col items-center space-y-6">
                    {filteredTravels.map((travel) => (
                      <div key={travel.id} className="w-full max-w-md">
                        <TravelCard trip={travel} ModalComponent={TravelModalWithCopy} />
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

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onAddClick={handleAddClick}
        showBottomNav={true}
        showHeaderNav={false}
      />

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
