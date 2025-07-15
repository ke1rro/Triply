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
        className="w-full cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      >
        {/* Title at the top */}
        <div className="p-3 pb-2">
          <h2 className="text-left text-sm font-semibold text-gray-800">
            {trip.title || `${trip.start} → ${trip.end}`}
          </h2>
        </div>

        {/* Horizontal layout for image and info */}
        <div className="flex gap-2 px-3 pb-3">
          {/* Image on the left */}
          <div className="flex-shrink-0">
            {!imageError ? (
              <img
                src={trip.image}
                alt={trip.title}
                className="h-16 w-20 rounded-lg object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500">
                <span className="text-sm text-white">🏞️</span>
              </div>
            )}
          </div>

          {/* Info on the right */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-xs font-medium text-gray-800">
              {trip.start} → {trip.end}
            </p>
            <p className="text-xs text-gray-600">
              {trip.distance} km • {trip.duration}
            </p>
            <p className="text-xs text-gray-500">❤️ {trip.likes} likes</p>
          </div>
        </div>
      </div>

      {showModal && (
        <TravelModal trip={trip} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
