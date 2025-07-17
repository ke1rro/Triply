import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { addVisitingTrip } from '../lib/userService'
import PageHeader from '../components/PageHeader'

const TripInvite = () => {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripRef = doc(db, 'trips', tripId)
        const tripSnap = await getDoc(tripRef)

        if (tripSnap.exists()) {
          const data = tripSnap.data()
          setTrip({ id: tripSnap.id, ...data })
        } else {
          setError('Trip not found')
        }
      } catch (error) {
        console.error('Error fetching trip:', error)
        setError('Failed to load trip')
      } finally {
        setLoading(false)
      }
    }

    if (tripId) {
      fetchTrip()
    }
  }, [tripId])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !currentUser) {
      navigate('/login')
    }
  }, [currentUser, loading, navigate])

  const handleJoinTrip = async () => {
    if (!currentUser || !trip) return

    // Check if user is already a visitor
    if (trip.visitors?.includes(currentUser.uid)) {
      navigate('/mytrips')
      return
    }

    setJoining(true)
    try {
      // Add user to trip visitors
      await updateDoc(doc(db, 'trips', trip.id), {
        visitors: arrayUnion(currentUser.uid)
      })

      // Add trip to user's visiting list
      await addVisitingTrip(currentUser.uid, trip.id)

      navigate('/mytrips')
    } catch (error) {
      console.error('Error joining trip:', error)
      setError('Failed to join trip. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <div
          className="fixed inset-0 h-lvh bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20"></div>
        </div>
        
        <div className="relative z-10 flex h-screen w-full flex-col items-center justify-center px-4">
          <div className="rounded-2xl bg-black/70 p-8 shadow-2xl backdrop-blur-md text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="rounded-lg bg-blue-600/80 px-6 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-blue-700/80"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) return null

  const isAlreadyMember = trip.visitors?.includes(currentUser?.uid)
  const isOwner = trip.userId === currentUser?.uid

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="fixed inset-0 h-lvh bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20"></div>
      </div>

      <div className="relative z-10 flex h-screen w-full flex-col px-4 pt-4 sm:px-6 md:px-8">
        <PageHeader title="Trip Invitation" />

        <div className="flex-1 flex items-center justify-center pb-32">
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl bg-black/70 p-6 shadow-2xl backdrop-blur-md text-center">
              <h2 className="text-2xl font-bold text-white mb-4">{trip.name}</h2>
              
              <p className="text-gray-300 mb-2">
                {trip.description || 'Join this amazing trip!'}
              </p>
              
              <div className="mb-6 text-sm text-gray-400">
                Duration: {trip.days} day{trip.days !== 1 ? 's' : ''}
              </div>

              {isOwner ? (
                <div className="space-y-4">
                  <p className="text-blue-400">This is your trip!</p>
                  <button
                    onClick={() => navigate('/mytrips')}
                    className="w-full rounded-lg bg-blue-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-blue-700/80"
                  >
                    Go to My Trips
                  </button>
                </div>
              ) : isAlreadyMember ? (
                <div className="space-y-4">
                  <p className="text-green-400">You're already a member of this trip!</p>
                  <button
                    onClick={() => navigate('/mytrips')}
                    className="w-full rounded-lg bg-green-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-green-700/80"
                  >
                    View in My Trips
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-white">You've been invited to join this trip!</p>
                  <button
                    onClick={handleJoinTrip}
                    disabled={joining}
                    className="w-full rounded-lg bg-green-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-green-700/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {joining ? 'Joining...' : 'Join Trip'}
                  </button>
                  <button
                    onClick={() => navigate('/home')}
                    className="w-full rounded-lg bg-gray-600/60 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-gray-600/80"
                  >
                    Maybe Later
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripInvite
