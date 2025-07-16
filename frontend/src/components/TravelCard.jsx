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
        className="relative h-36 w-full cursor-pointer overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl group active:scale-98"
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
        <div className="absolute inset-0 rounded-xl bg-black/30 transition-all duration-300 hover:bg-black/40" />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-4 text-white">
          {/* Title - top left */}
          <div className="flex-shrink-0">
            <h2 className="line-clamp-1 text-xl font-bold drop-shadow-lg">
              {trip.name}
            </h2>
          </div>

          {/* Locations - middle */}
          <div className="flex flex-1 items-center">
            <p className="line-clamp-2 text-base leading-tight drop-shadow-md">
              {formatLocations(trip.locations)}
            </p>
          </div>

          {/* Duration and Rating - bottom right */}
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2 text-sm font-medium drop-shadow-md bg-black/20 rounded-lg px-3 py-1">
              <span>
                {trip.days} day{trip.days !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium drop-shadow-md bg-black/20 rounded-lg px-3 py-1">
              <span>{formatRating(trip.averageRating)}</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <TravelModal trip={trip} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
