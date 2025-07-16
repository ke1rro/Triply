import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { FiArrowLeft, FiClock, FiHeart } from 'react-icons/fi'

const Trip = () => {
  const { tripviewId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState(null)
  const [activeTab, setActiveTab] = useState('details')
  const [localLikes, setLocalLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [localComments, setLocalComments] = useState([])
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentData, setCommentData] = useState({ body: '', rating: 5 })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripRef = doc(db, 'trips', tripviewId)
        const tripSnap = await getDoc(tripRef)

        if (tripSnap.exists()) {
          const data = tripSnap.data()
          const tripData = {
            id: tripSnap.id,
            ...data,
            averageRating:
              data.comments && data.comments.length > 0
                ? data.comments.reduce(
                    (sum, comment) => sum + (comment.rating || 0),
                    0
                  ) / data.comments.length
                : 0,
          }

          setTrip(tripData)
          setLocalLikes(data.likes || 0)
          setLocalComments(data.comments || [])

          if (currentUser && data.likedBy) {
            setIsLiked(data.likedBy.includes(currentUser.uid))
          }

          // Load image
          if (data.fileName) {
            const storage = getStorage()
            const imageRef = ref(storage, data.fileName)
            try {
              const url = await getDownloadURL(imageRef)
              setImageUrl(url)
            } catch (error) {
              console.error('Error loading image:', error)
            }
          }
        } else {
          navigate('/home')
        }
      } catch (error) {
        console.error('Error fetching trip:', error)
        navigate('/home')
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()
  }, [tripviewId, navigate, currentUser])

  const handleLike = async () => {
    if (!currentUser || isLiking) return

    setIsLiking(true)

    try {
      const tripRef = doc(db, 'trips', tripviewId)

      if (isLiked) {
        await updateDoc(tripRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid),
        })
        setLocalLikes((prev) => prev - 1)
        setIsLiked(false)
      } else {
        await updateDoc(tripRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid),
        })
        setLocalLikes((prev) => prev + 1)
        setIsLiked(true)
      }
    } catch (error) {
      console.error('Error updating likes:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!commentData.body.trim()) {
      setError('Comment cannot be empty')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const tripRef = doc(db, 'trips', tripviewId)
      const newComment = {
        body: commentData.body.trim(),
        rating: commentData.rating,
        name: currentUser?.displayName || currentUser?.email || 'Anonymous',
        createdAt: new Date(),
      }

      await updateDoc(tripRef, {
        comments: arrayUnion(newComment),
      })

      setLocalComments((prev) => [...prev, newComment])
      setCommentData({ body: '', rating: 5 })
      setShowCommentForm(false)
    } catch (error) {
      console.error('Error adding comment:', error)
      setError('Failed to add comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatRating = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-white">Trip not found</div>
      </div>
    )
  }

  const backgroundImage = imageUrl
    ? `url(${imageUrl})`
    : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section with Background Image */}
      <div
        className="relative h-80 bg-cover bg-center"
        style={{ backgroundImage }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>

        {/* Trip Info Overlay */}
        <div className="absolute bottom-6 left-6 text-white">
          <div className="mb-2">
            <p className="text-sm opacity-90">
              {trip.Locations?.map((loc) => loc.name).join(' • ') ||
                'No locations'}
            </p>
          </div>
          <h1 className="text-3xl font-bold drop-shadow-lg">{trip.name}</h1>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-300">
            <FiClock className="h-5 w-5" />
            <span>
              {trip.days} day{trip.days !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={handleLike}
            disabled={!currentUser || isLiking}
            className={`flex items-center gap-2 transition-all duration-200 ${
              currentUser ? 'hover:scale-105' : 'cursor-default'
            } ${isLiked ? 'text-red-400' : 'text-gray-300'}`}
          >
            <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{localLikes}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px] bg-gray-900 p-6">
        {activeTab === 'details' ? (
          <div className="space-y-6">
            {/* About Section */}
            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                About the trip
              </h2>
              <p className="leading-relaxed text-gray-300">
                {trip.description || 'No description available.'}
              </p>
            </div>

            {/* Divider */}
            <hr className="border-gray-700" />

            {/* Gallery Section */}
            <div>
              <h2 className="mb-3 text-xl font-semibold text-white">Gallery</h2>
              {imageUrl ? (
                <div className="grid grid-cols-1 gap-4">
                  <img
                    src={imageUrl}
                    alt={trip.name}
                    className="h-48 w-full rounded-lg object-cover"
                  />
                </div>
              ) : (
                <p className="text-gray-400">No images available</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add Comment Button */}
            {currentUser && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-all duration-200 hover:bg-blue-700"
                >
                  {showCommentForm ? 'Cancel' : 'Add Review'}
                </button>
              </div>
            )}

            {/* Comment Form */}
            {showCommentForm && (
              <div className="rounded-lg bg-gray-800 p-4">
                {error && (
                  <div className="mb-3 text-sm text-red-400">{error}</div>
                )}
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Rating:
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setCommentData((prev) => ({
                              ...prev,
                              rating: star,
                            }))
                          }
                          className={`text-xl transition-colors ${
                            star <= commentData.rating
                              ? 'text-yellow-400'
                              : 'text-gray-500'
                          } hover:text-yellow-300`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Review:
                    </label>
                    <textarea
                      value={commentData.body}
                      onChange={(e) =>
                        setCommentData((prev) => ({
                          ...prev,
                          body: e.target.value,
                        }))
                      }
                      placeholder="Share your thoughts about this trip..."
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !commentData.body.trim()}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {localComments.length > 0 ? (
                localComments.map((comment, index) => (
                  <div key={index}>
                    <div className="rounded-lg bg-gray-800 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <span className="font-medium text-white">
                          {comment.name || 'Anonymous'}
                        </span>
                        <span className="text-yellow-400">
                          {formatRating(comment.rating || 0)}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.body}</p>
                    </div>
                    {index < localComments.length - 1 && (
                      <hr className="my-4 border-gray-700" />
                    )}
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-gray-400">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Trip Button - Fixed at bottom center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 transform">
        <button className="rounded-full bg-blue-600 px-8 py-3 font-medium text-white shadow-lg transition duration-200 hover:bg-blue-700 hover:shadow-xl">
          Add this trip
        </button>
      </div>
    </div>
  )
}

export default Trip
