import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'
import TravelCard from '../components/TravelCard'

const Homepage = () => {
  const [travelData, setTravelData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
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
    console.log('Add travel clicked')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="flex min-h-[500px] w-full max-w-md flex-col rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">✈️</div>
            <h1 className="text-3xl font-bold text-indigo-900">Triply</h1>
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
              className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all duration-300 hover:bg-indigo-700 active:scale-95"
              onClick={handleFilterClick}
            >
              🔍
            </button>
            <button
              onClick={handleProfileClick}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-all duration-200 hover:bg-indigo-700"
            >
              👤
            </button>
          </div>
        </div>

        {/* Travel Cards */}
        <div className="mb-6 flex-1 space-y-4 overflow-hidden">
          {loading ? (
            <div className="py-8 text-center text-gray-600">
              Loading trips...
            </div>
          ) : (
            <>
              {filteredTravels.length > 0 ? (
                filteredTravels.map((travel) => (
                  <TravelCard key={travel.id} trip={travel} />
                ))
              ) : (
                <div className="py-8 text-center text-gray-600">
                  {searchQuery
                    ? 'No trips found matching your search.'
                    : 'No trips available.'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Travel Button */}
        <button
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition duration-200 ease-in-out hover:bg-indigo-700"
          onClick={handleAddClick}
        >
          Add New Trip
        </button>
      </div>
    </div>
  )
}

export default Homepage
