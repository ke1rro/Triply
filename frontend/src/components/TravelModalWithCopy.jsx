import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'
import React, { useState } from 'react'

export default function TravelModalWithCopy({ trip, onClose, onCopied }) {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [copying, setCopying] = useState(false)

  const handleSelectTrip = async () => {
    if (trip.userId === currentUser?.uid) {
      navigate(`/trip/${trip.dataName || trip.id}`)
      return
    }
    setCopying(true)
    try {
      // Check if user already has a copy of this trip
      const tripsRef = collection(db, 'trips')
      let existingCopyId = null
      const querySnapshot = await getDocs(tripsRef)
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (
          data.userId === currentUser?.uid &&
          (data.parent_id === trip.id || data.parent_id === trip.dataName)
        ) {
          existingCopyId = doc.id
        }
      })
      if (existingCopyId) {
        navigate(`/trip/${existingCopyId}`)
        return
      }
      const newTrip = {
        ...trip,
        name: trip.name + ' (My Copy)',
        userId: currentUser?.uid || '',
        createdAt: serverTimestamp(),
        likes: 0,
        comments: [],
        Events: Array.isArray(trip.Events)
          ? JSON.parse(JSON.stringify(trip.Events))
          : Array.isArray(trip.events)
          ? JSON.parse(JSON.stringify(trip.events))
          : [],
        published: false,
        parent_id: trip.id || trip.dataName || 'original',
      }
      delete newTrip.id
      delete newTrip.dataName
      const docRef = await addDoc(collection(db, 'trips'), newTrip)
      if (onCopied) onCopied(docRef.id)
      navigate(`/trip/${docRef.id}`)
    } catch (e) {
      alert('Failed to copy trip. Please try again.')
    } finally {
      setCopying(false)
    }
  }

  const formatRating = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-black/80 p-6 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with title and close button */}
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            {trip.name}
          </h3>
          <button
            onClick={onClose}
            className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600/50 text-xl font-bold text-gray-300 transition-all duration-200 hover:bg-gray-600/70 hover:text-white"
          >
            ×
          </button>
        </div>
        {/* Description */}
        <p className="mb-6 leading-relaxed text-gray-300">
          {trip.description || 'No description available.'}
        </p>
        {/* Trip Info */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-300">Duration:</span>
            <p className="text-white">
              {trip.days} day{trip.days !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-300">Likes:</span>
            <p className="text-white">❤️ {trip.likes}</p>
          </div>
        </div>
        {/* Locations */}
        {trip.locations && trip.locations.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-2 font-medium text-blue-300">Locations:</h4>
            <div className="flex flex-wrap gap-2">
              {trip.locations.map((location, index) => (
                <span
                  key={index}
                  className="rounded-md bg-blue-600/30 px-3 py-1 text-sm text-blue-200 backdrop-blur-sm"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Comments */}
        {trip.comments && trip.comments.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-blue-300">Comments:</h4>
            <div className="max-h-40 space-y-3 overflow-y-auto">
              {trip.comments.map((comment, index) => (
                <div
                  key={index}
                  className="rounded-r-lg border-l-4 border-blue-400/50 bg-white/5 p-3 pl-3"
                >
                  <div className="mb-1 flex items-start justify-between">
                    <span className="text-sm font-medium text-white">
                      {comment.name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-yellow-400">
                      {formatRating(comment.rating || 0)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{comment.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Select Trip Button */}
        <button
          className="w-full rounded-lg bg-blue-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-300 ease-in-out hover:bg-blue-700/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          onClick={handleSelectTrip}
          disabled={copying}
        >
          {trip.userId === currentUser?.uid ? 'Open Trip' : copying ? 'Copying...' : 'Select Trip'}
        </button>
      </div>
    </div>
  )
}
