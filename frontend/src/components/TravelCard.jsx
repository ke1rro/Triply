import { useState } from 'react'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { useNavigate } from 'react-router-dom'
import {
  doc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import {
  addLikedTrip,
  removeLikedTrip,
  getUserDocument,
} from '../lib/userService'

export default function TravelCard({ trip }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [imageError, setImageError] = useState(false)
  const [localLikes, setLocalLikes] = useState(trip.likes || 0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // Check if user has already liked this trip from user document
  useState(() => {
    const checkUserLikedTrips = async () => {
      if (currentUser) {
        try {
          const userData = await getUserDocument(currentUser.uid)
          if (userData && userData.likedTrips) {
            setIsLiked(userData.likedTrips.includes(trip.id))
          }
        } catch (error) {
          console.error('Error fetching user liked trips:', error)
          // Fallback to trip.likedBy if user service fails
          if (trip.likedBy) {
            setIsLiked(trip.likedBy.includes(currentUser.uid))
          }
        }
      }
    }

    checkUserLikedTrips()
  }, [currentUser, trip.id, trip.likedBy])

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

  const handleLike = async (e) => {
    e.stopPropagation() // Prevent opening modal when clicking heart

    if (!currentUser || isLiking) return

    setIsLiking(true)

    try {
      const tripRef = doc(db, 'trips', trip.id)

      if (isLiked) {
        // Unlike: update both trip and user documents
        await updateDoc(tripRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid),
        })
        await removeLikedTrip(currentUser.uid, trip.id)
        setLocalLikes((prev) => prev - 1)
        setIsLiked(false)
      } else {
        // Like: update both trip and user documents
        await updateDoc(tripRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid),
        })
        await addLikedTrip(currentUser.uid, trip.id)
        setLocalLikes((prev) => prev + 1)
        setIsLiked(true)
      }
    } catch (error) {
      console.error('Error updating likes:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleCardClick = () => {
    navigate(`/tripview/${trip.dataName}`)
  }

  // Format locations display
  const formatLocations = (locations) => {
    if (!locations || locations.length === 0) return 'No locations'

    if (locations.length <= 5) {
      return locations.join(', ')
    } else {
      return locations.slice(0, 5).join(', ') + ' ...'
    }
  }

  const backgroundImage =
    imageUrl && !imageError
      ? `url(${imageUrl})`
      : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'

  return (
    <div
      onClick={handleCardClick}
      className="active:scale-98 group relative h-36 w-full cursor-pointer overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
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

        {/* Duration and Likes - bottom */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1 text-sm font-medium drop-shadow-md">
            <span>
              {trip.days} day{trip.days !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              disabled={!currentUser || isLiking}
              className={`flex items-center gap-1 rounded-lg bg-black/20 px-3 py-1 text-sm font-medium drop-shadow-md transition-all duration-200 ${
                currentUser
                  ? 'hover:bg-black/40 active:scale-95'
                  : 'cursor-default'
              } ${isLiked ? 'text-red-400' : 'text-white'}`}
            >
              <span
                className={`transition-all duration-200 ${isLiking ? 'scale-110' : ''}`}
              >
                {isLiked ? '❤️' : '🤍'}
              </span>
              <span>{localLikes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
