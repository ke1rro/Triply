import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TravelCard from '../components/TravelCard'
import Navbar from '../components/Navbar'
import PageHeader from '../components/PageHeader'
import { FiSearch, FiHeart } from 'react-icons/fi'
import { getUserDocument } from '../lib/userService'

const LikedTrips = () => {
  const [travelData, setTravelData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchLikedTrips = async () => {
      if (!currentUser) return

      try {
        // First get user's liked trip IDs
        const userData = await getUserDocument(currentUser.uid)
        const likedTripIds = userData?.likedTrips || []

        if (likedTripIds.length === 0) {
          setTravelData([])
          setLoading(false)
          return
        }

        // Then fetch all trips and filter by liked IDs
        const querySnapshot = await getDocs(collection(db, 'trips'))
        const trips = querySnapshot.docs
          .map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              name: data.name || 'Untitled Trip',
              description: data.description || '',
              days: data.days || 0,
              likes: data.likes || 0,
              fileName: data.fileName || null,
              locations: data.Locations
                ? data.Locations.map((loc) => loc.name).slice(0, 5)
                : [],
              Events: data.Events || data.events || [],
              comments: data.comments || [],
              averageRating:
                data.comments && data.comments.length > 0
                  ? data.comments.reduce(
                      (sum, comment) => sum + (comment.rating || 0),
                      0
                    ) / data.comments.length
                  : 0,
              createdAt: data.createdAt,
              userId: data.userId,
              parent_id: data.parent_id,
              published: data.published,
            }
          })
          .filter((trip) => likedTripIds.includes(trip.id))

        setTravelData(trips)
      } catch (err) {
        console.error('Error fetching liked trips:', err)
        setTravelData([])
      }
      setLoading(false)
    }

    fetchLikedTrips()
  }, [currentUser])

  const handleSelectTrip = (tripId) => {
    navigate(`/tripview/${tripId}`)
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
      <div className="relative z-10 flex h-screen w-full flex-col px-4 pt-4 sm:px-6 md:px-8">
        {/* Header */}
        <PageHeader title="Liked Trips" />

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search liked trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full flex-1 rounded-xl border border-gray-300/30 bg-white/10 px-5 py-4 text-lg text-white placeholder-gray-300 backdrop-blur-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FiSearch className="h-7 w-7 cursor-pointer text-white drop-shadow-sm transition-all duration-300 hover:scale-110 hover:text-blue-400 active:scale-95" />
          </div>
        </div>

        {/* Travel Cards - Scrollable Area */}
        <div className="flex-1 pb-32">
          <div className="h-full space-y-4">
            {loading ? (
              <div className="py-8 text-center text-gray-300">
                Loading liked trips...
              </div>
            ) : (
              <>
                {travelData.length > 0 ? (
                  <div className="flex w-full flex-col items-center space-y-6">
                    {travelData
                      .filter((trip) =>
                        trip.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((trip) => (
                        <div key={trip.id} className="w-full max-w-md">
                          <TravelCard
                            trip={trip}
                            onSelect={() => handleSelectTrip(trip.id)}
                            ModalComponent={undefined}
                            showLike={true}
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-300">
                    {searchQuery
                      ? 'No liked trips found matching your search.'
                      : 'No liked trips yet. Start exploring and like trips you love!'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navbar
        activeTab="liked"
        onAddClick={() => {}}
        showBottomNav={true}
        showHeaderNav={false}
      />
    </div>
  )
}

export default LikedTrips
