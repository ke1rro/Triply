import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import TravelCard from '../components/TravelCard'

// Example travel card data
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
    // TODO: Implement filter functionality
    console.log('Filter clicked')
  }

  const handleProfileClick = () => {
    // TODO: Implement profile navigation
    console.log('Profile clicked')
  }

  const handleAddClick = () => {
    // TODO: Implement add new travel functionality
    console.log('Add travel clicked')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <div className="text-3xl">✈️</div>
          <h1 className="m-0 font-sans text-2xl font-bold md:text-3xl">
            Tripply
          </h1>
        </div>
      </header>

      {/* Search Bar Section */}
      <div className="flex items-center gap-2 bg-white p-4 shadow-md md:p-3">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-full border-2 border-gray-300 p-3 text-base outline-none transition-colors duration-300 focus:border-indigo-500 md:p-2.5"
          />
          <button
            className="flex h-11 w-11 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-indigo-500 text-xl text-white transition-all duration-300 hover:bg-indigo-600 active:scale-95 md:h-10 md:w-10 md:text-base"
            onClick={handleFilterClick}
          >
            🔍
          </button>
        </div>
        <button
          className="flex h-11 w-11 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-indigo-500 text-xl text-white transition-all duration-300 hover:bg-indigo-600 active:scale-95 md:h-10 md:w-10 md:text-base"
          onClick={handleProfileClick}
        >
          👤
        </button>
      </div>

      {/* Travel Cards */}
      <main className="p-4 md:p-3">
        {loading ? (
          <div className="py-8 text-center text-base text-gray-600">
            Loading travels...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {filteredTravels.length > 0 ? (
              filteredTravels.map((travel) => (
                <TravelCard key={travel.id} trip={travel} />
              ))
            ) : (
              <div className="py-8 text-center text-base text-gray-600">
                {searchQuery
                  ? 'No travels found matching your search.'
                  : 'No travels available.'}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        className="md:w-13 md:h-13 fixed bottom-5 right-5 z-50 h-14 w-14 cursor-pointer touch-manipulation rounded-2xl border-none bg-indigo-500 text-3xl font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-xl active:translate-y-0 active:scale-95 md:bottom-4 md:right-4 md:text-2xl"
        onClick={handleAddClick}
        style={{
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
        }}
      >
        +
      </button>
    </div>
  )
}

export default Homepage
