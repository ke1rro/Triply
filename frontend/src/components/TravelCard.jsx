import { useState } from 'react'
import TravelModal from './TravelModal.jsx'

export default function TravelCard({ trip }) {
  const [showModal, setShowModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="w-80 cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg"
      >
        {/* Title at the top */}
        <div className="p-4 pb-2">
          <h2 className="text-left text-xl font-semibold">
            {trip.title || `${trip.start} → ${trip.end}`}
          </h2>
        </div>

        {/* Horizontal layout for image and info */}
        <div className="flex gap-3 px-4 pb-4">
          {/* Image on the left */}
          <div className="flex-shrink-0">
            {!imageError ? (
              <img
                src={trip.image}
                alt={trip.title}
                className="h-20 w-24 rounded-lg object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="flex h-20 w-24 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500">
                <span className="text-lg text-white">🏞️</span>
              </div>
            )}
          </div>

          {/* Info on the right */}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-800">
              {trip.start} → {trip.end}
            </p>
            <p className="text-sm text-gray-600">
              {trip.distance} km • {trip.duration}
            </p>
            <p className="text-sm text-gray-500">❤️ {trip.likes} likes</p>
          </div>
        </div>
      </div>

      {showModal && (
        <TravelModal trip={trip} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
