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
import { FiArrowLeft, FiClock, FiHeart, FiStar } from 'react-icons/fi'
import {
  addLikedTrip,
  removeLikedTrip,
  getUserDocument,
} from '../lib/userService'
import EditTripModal from '../components/EditTripModal'
import PageHeader from '../components/PageHeader'
import Navbar from '../components/Navbar'

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
  const [userLikedTrips, setUserLikedTrips] = useState([])
  const [copying, setCopying] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Handler for Add this trip
  const handleAddThisTrip = async () => {
    if (!trip || !currentUser) return
    // If user owns the trip, go to trip details
    if (trip.userId === currentUser.uid) {
      navigate(`/trip/${trip.id || tripviewId}`)
      return
    }
    setCopying(true)
    try {
      // Check if user already has a copy
      const tripsRef =
        window.firebase && window.firebase.firestore
          ? window.firebase.firestore().collection('trips')
          : null
      // But we use Firestore v9 modular API:
      const { collection, getDocs, addDoc, serverTimestamp } = await import(
        'firebase/firestore'
      )
      let existingCopyId = null
      const querySnapshot = await getDocs(collection(db, 'trips'))
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (
          data.userId === currentUser.uid &&
          (data.parent_id === trip.id || data.parent_id === trip.dataName)
        ) {
          existingCopyId = doc.id
        }
      })
      if (existingCopyId) {
        navigate(`/trip/${existingCopyId}`)
        return
      }
      // Prepare new trip data
      const newTrip = {
        ...trip,
        name: trip.name + ' (My Copy)',
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
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
      navigate('/mytrips')
    } catch (e) {
      alert('Failed to copy trip. Please try again.')
    } finally {
      setCopying(false)
    }
  }

  // Delete trip handler
  const handleDeleteTrip = async () => {
    if (!trip || !currentUser) return
    if (!window.confirm('Are you sure you want to delete this trip?')) return
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      await deleteDoc(doc(db, 'trips', trip.id))
      alert('Trip deleted successfully.')
      navigate('/mytrips')
    } catch (e) {
      alert('Failed to delete trip. Please try again.')
    }
  }

  // Edit trip handler
  const handleEditTrip = () => {
    setShowEditModal(true);
  }

  // Publish trip handler
  const handlePublishTrip = async () => {
    if (!trip || !currentUser) return
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      await updateDoc(doc(db, 'trips', trip.id), { published: true })
      alert('Trip published!')
    } catch (e) {
      alert('Failed to publish trip. Please try again.')
    }
  }

  // Unpublish trip handler
  const handleUnpublishTrip = async () => {
    if (!trip || !currentUser) return
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      await updateDoc(doc(db, 'trips', trip.id), { published: false })
      alert('Trip unpublished!')
    } catch (e) {
      alert('Failed to unpublish trip. Please try again.')
    }
  }

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userData = await getUserDocument(currentUser.uid)
          if (userData && userData.likedTrips) {
            setUserLikedTrips(userData.likedTrips)
            setIsLiked(userData.likedTrips.includes(tripviewId))
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }

    fetchUserData()
  }, [currentUser, tripviewId])

  const handleLike = async () => {
    if (!currentUser || isLiking) return

    setIsLiking(true)

    try {
      const tripRef = doc(db, 'trips', tripviewId)

      if (isLiked) {
        // Unlike: update both trip and user documents
        await updateDoc(tripRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid),
        })
        await removeLikedTrip(currentUser.uid, tripviewId)
        setLocalLikes((prev) => prev - 1)
        setIsLiked(false)
        setUserLikedTrips((prev) => prev.filter((id) => id !== tripviewId))
      } else {
        // Like: update both trip and user documents
        await updateDoc(tripRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid),
        })
        await addLikedTrip(currentUser.uid, tripviewId)
        setLocalLikes((prev) => prev + 1)
        setIsLiked(true)
        setUserLikedTrips((prev) => [...prev, tripviewId])
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

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Edit Modal */}
      {showEditModal && (
        <EditTripModal
          trip={trip}
          onClose={() => setShowEditModal(false)}
          onSuccess={updatedTrip => {
            setTrip(updatedTrip)
            setShowEditModal(false)
            // Optionally, reload image if changed
            if (updatedTrip.fileName !== trip.fileName) {
              const storage = getStorage()
              const imageRef = ref(storage, updatedTrip.fileName)
              getDownloadURL(imageRef)
                .then(url => setImageUrl(url))
                .catch(() => setImageUrl(null))
            }
          }}
        />
      )}

      {/* Background image with overlay - full screen */}
      <div
        className="fixed inset-0 h-lvh bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-screen w-full flex-col px-4 pt-4 sm:px-6 md:px-8">
        {/* Back Button - Fixed at top left */}
        <button
          onClick={() => navigate('/home')}
          className="absolute left-4 top-4 z-20 text-white transition-colors duration-200 hover:text-gray-300"
        >
          <FiArrowLeft className="h-6 w-6" />
        </button>

        {/* Edit Button (if owner) - Fixed at top right */}
        {currentUser && trip.userId === currentUser.uid && (
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute right-4 top-4 z-20 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
          >
            Edit
          </button>
        )}

        {/* Header */}
        <PageHeader title={trip.name} />

        {/* Main Content */}
        <div className="flex-1 pb-32">
          <div className="mx-auto max-w-md">
            <div className="overflow-hidden rounded-2xl bg-black/70 shadow-2xl backdrop-blur-md">
              {/* Trip Image Header */}
              <div
                className="h-32 bg-cover bg-center"
                style={{
                  backgroundImage: imageUrl
                    ? `url(${imageUrl})`
                    : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                }}
              >
                <div className="flex h-full items-end bg-black/30 p-4">
                  <div className="text-white">
                    <p className="text-sm opacity-90">
                      {trip.Locations?.map((loc) => loc.name).join(' • ') ||
                        'No locations'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Stats Section */}
                <div className="mb-6 grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <FiClock className="mb-1 h-5 w-5 text-blue-400" />
                    <span className="text-sm font-semibold text-white">
                      {trip.days} day{trip.days !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">Duration</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FiStar className="mb-1 h-5 w-5 text-blue-400" />
                    <span className="text-sm font-semibold text-white">
                      {localComments.length}
                    </span>
                    <span className="text-xs text-gray-400">Reviews</span>
                  </div>
                  <div 
                    className="flex flex-col items-center cursor-pointer"
                    onClick={handleLike}
                  >
                    <FiHeart className={`mb-1 h-5 w-5 ${isLiked ? 'fill-current text-red-500' : 'text-blue-400'}`} />
                    <span className={`text-sm font-semibold ${isLiked ? 'text-red-500' : 'text-white'}`}>
                      {localLikes}
                    </span>
                    <span className="text-xs text-gray-400">Likes</span>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 flex justify-center">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        activeTab === 'details'
                          ? 'border-blue-400 bg-blue-600/20 text-blue-400'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        activeTab === 'reviews'
                          ? 'border-blue-400 bg-blue-600/20 text-blue-400'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Reviews
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="min-h-[200px]">
                  {activeTab === 'details' ? (
                    <div className="space-y-4">
                      {/* About Section */}
                      <div>
                        <h3 className="mb-2 text-lg font-semibold text-blue-400">About</h3>
                        <p className="text-sm leading-relaxed text-gray-300">
                          {trip.description || 'No description available.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Add Comment Button */}
                      {currentUser && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowCommentForm(!showCommentForm)}
                            className="rounded-lg bg-blue-600/80 px-4 py-2 text-sm text-white backdrop-blur-sm transition duration-200 hover:bg-blue-700/80"
                          >
                            {showCommentForm ? 'Cancel' : 'Add Review'}
                          </button>
                        </div>
                      )}

                      {/* Comment Form */}
                      {showCommentForm && (
                        <div className="rounded-lg border border-blue-400/30 bg-white/5 p-4">
                          {error && (
                            <div className="mb-3 text-sm text-red-300">{error}</div>
                          )}
                          <form onSubmit={handleCommentSubmit} className="space-y-3">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-blue-300">
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
                                        ? 'text-white'
                                        : 'text-gray-500'
                                    } hover:text-gray-300`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium text-blue-300">
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
                                className="w-full resize-none rounded-lg border border-gray-300/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={submitting || !commentData.body.trim()}
                              className="w-full rounded-lg bg-blue-600/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-blue-700/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {submitting ? 'Posting...' : 'Post Review'}
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Reviews List */}
                      <div className="max-h-60 space-y-3 overflow-y-auto">
                        {localComments.length > 0 ? (
                          localComments.map((comment, index) => (
                            <div
                              key={index}
                              className="rounded-lg border-l-4 border-blue-400/50 bg-white/5 p-3"
                            >
                              <div className="mb-1 flex items-start justify-between">
                                <span className="text-sm font-medium text-white">
                                  {comment.name || 'Anonymous'}
                                </span>
                                <span className="text-sm text-white">
                                  {formatRating(comment.rating || 0)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">{comment.body}</p>
                            </div>
                          ))
                        ) : (
                          <p className="py-4 text-center text-sm italic text-gray-400">
                            No reviews yet. Be the first to share your thoughts!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {trip.userId === currentUser?.uid ? (
                    <div className="flex gap-2">
                      <button
                        className="flex-1 rounded-lg bg-blue-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-blue-700/80"
                        onClick={() => navigate(`/trip/${trip.id}`)}
                      >
                        Manage
                      </button>
                      <button
                        className="flex-1 rounded-lg bg-red-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-red-700/80"
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to delete this trip?')) return
                          try {
                            const { doc, deleteDoc } = await import('firebase/firestore')
                            await deleteDoc(doc(db, 'trips', trip.id))
                            navigate('/mytrips')
                          } catch (e) {
                            alert('Failed to delete trip. Please try again.')
                          }
                        }}
                      >
                        Delete
                      </button>
                      {(!trip.parent_id || trip.parent_id === 'original') && (
                        <button
                          className={`flex-1 rounded-lg px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 ${
                            trip.published
                              ? 'bg-gray-600/80 hover:bg-gray-700/80'
                              : 'bg-green-600/80 hover:bg-green-700/80'
                          }`}
                          onClick={async () => {
                            try {
                              const { doc, updateDoc } = await import('firebase/firestore')
                              await updateDoc(doc(db, 'trips', trip.id), { published: !trip.published })
                              setTrip(prev => ({ ...prev, published: !prev.published }))
                            } catch (e) {
                              alert('Failed to update publish state.')
                            }
                          }}
                        >
                          {trip.published ? 'Unpublish' : 'Publish'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      className="w-full rounded-lg bg-blue-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-blue-700/80 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={async () => {
                        if (!trip || !currentUser) return
                        // If user owns the trip, go to trip details
                        if (trip.userId === currentUser.uid) {
                          navigate(`/trip/${trip.id || tripviewId}`)
                          return
                        }
                        setCopying(true)
                        try {
                          // Check if user already has a copy
                          const tripsRef =
                            window.firebase && window.firebase.firestore
                              ? window.firebase.firestore().collection('trips')
                              : null
                          // But we use Firestore v9 modular API:
                          const { collection, getDocs, addDoc, serverTimestamp } = await import(
                            'firebase/firestore'
                          )
                          let existingCopyId = null
                          const querySnapshot = await getDocs(collection(db, 'trips'))
                          querySnapshot.forEach((doc) => {
                            const data = doc.data()
                            if (
                              data.userId === currentUser.uid &&
                              (data.parent_id === trip.id || data.parent_id === trip.dataName)
                            ) {
                              existingCopyId = doc.id
                            }
                          })
                          if (existingCopyId) {
                            navigate(`/trip/${existingCopyId}`)
                            return
                          }
                          // Prepare new trip data
                          const newTrip = {
                            ...trip,
                            name: trip.name + ' (My Copy)',
                            userId: currentUser.uid,
                            createdAt: serverTimestamp(),
                            likes: 0,
                            likedBy: [],
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
                          navigate('/mytrips')
                        } catch (e) {
                          alert('Failed to copy trip. Please try again.')
                        } finally {
                          setCopying(false)
                        }
                      }}
                      disabled={copying}
                    >
                      {copying ? 'Copying...' : 'Copy this trip'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <Navbar
        activeTab="home"
        onAddClick={() => {}}
        showBottomNav={true}
        showHeaderNav={false}
      />
    </div>
  )
}

export default Trip
