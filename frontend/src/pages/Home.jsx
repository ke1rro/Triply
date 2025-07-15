import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { logout } from '../lib/auth'
import { useNavigate } from 'react-router-dom'
import TravelCard from '../components/TravelCard'

const exampleTrip = {
  id: 'example-1',
  start: 'New York',
  end: 'Paris',
  title: 'European Adventure',
  distance: 5850,
  duration: '8h 30m',
  likes: 127,
  image: 'https://picsum.photos/400/300?random=1',
  description:
    'A wonderful journey from the Big Apple to the City of Light. Experience the culture, cuisine, and history.',
  comments: [
    'Amazing flight experience!',
    'Great views over the Atlantic',
    'Perfect timing for arrival',
  ],
}

const Homepage = () => {
  const [travelData, setTravelData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTravelData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'travels'))
        const travels = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTravelData(travels)
      } catch (error) {
        console.error('Error fetching travel data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTravelData()
  }, [])

  // Combine example trip with Firebase data
  const allTravels = [exampleTrip, ...travelData]

  const filteredTravels = allTravels.filter(
    (travel) =>
      travel.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      travel.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      travel.start?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      travel.end?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFilterClick = () => {
    console.log('Filter clicked')
  }

  const handleProfileClick = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleAddClick = () => {
    console.log('Add travel clicked')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-lg">
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
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all duration-300 hover:bg-indigo-700 active:scale-95"
              onClick={handleFilterClick}
            >
              🔍
            </button>
            <button
              onClick={handleProfileClick}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition-all duration-200 hover:bg-indigo-700"
            >
              👤
            </button>
          </div>
        </div>

        {/* Travel Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-8 text-center text-gray-600">
              Loading travels...
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
                    ? 'No travels found matching your search.'
                    : 'No travels available.'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Travel Button */}
        <button
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition duration-200 ease-in-out hover:bg-indigo-700"
          onClick={handleAddClick}
        >
          Add New Travel
        </button>
      </div>
    </div>
  )
}

export default Homepage
