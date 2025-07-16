import { useState } from 'react'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import TravelModal from './TravelModal.jsx'

export default function TravelCard({ trip }) {
  const [showModal, setShowModal] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [imageError, setImageError] = useState(false)

  // Load image from Firebase Storage when component mounts
  useState(() => {
    const loadImage = async () => {
      if (trip.fileName) {
        try {
          const storage = getStorage()
          const imageRef = ref(storage, trip.fileName)
          const url = await getDownloadURL(imageRef)
          setImageUrl(url)
        } catch (error) {
          console.error('Error loading image:', error)
          setImageError(true)
        }
      } else {
        setImageError(true)
      }
    }

    loadImage()
  }, [trip.fileName])

  // Format locations display
  const formatLocations = (locations) => {
    if (!locations || locations.length === 0) return 'No locations'

    if (locations.length <= 5) {
      return locations.join(', ')
    } else {
      return locations.slice(0, 5).join(', ') + ' ...'
    }
  }

  // Format rating display
  const formatRating = (rating) => {
    if (rating === 0) return 'No ratings'
    return `★ ${rating.toFixed(1)}`
  }

  const backgroundImage =
    imageUrl && !imageError
      ? `url(${imageUrl})`
      : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="relative h-32 w-full cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg group"
      >
        {/* Background image that scales on hover */}
        <div
          className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: backgroundImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 rounded-lg bg-black/30 transition-all duration-300 hover:bg-black/40" />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-3 text-white transform transition-transform duration-300 group-hover:scale-105">
          {/* Title - top left */}
          <div className="flex-shrink-0">
            <h2 className="line-clamp-1 text-lg font-bold drop-shadow-lg">
              {trip.name}
            </h2>
          </div>

          {/* Locations - middle */}
          <div className="flex flex-1 items-center">
            <p className="line-clamp-2 text-sm leading-tight drop-shadow-md">
              {formatLocations(trip.locations)}
            </p>
          </div>

          {/* Duration and Rating - bottom right */}
          <div className="flex items-end justify-end gap-3 text-sm font-medium drop-shadow-md">
            <span>
              {trip.days} day{trip.days !== 1 ? 's' : ''}
            </span>
            <span>{formatRating(trip.averageRating)}</span>
          </div>
        </div>
      </div>

      {showModal && (
        <TravelModal trip={trip} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
