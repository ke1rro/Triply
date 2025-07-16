import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import EditTripModal from './EditTripModal'
import { useState } from 'react'

export default function TravelModal({ trip, onClose }) {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentData, setCommentData] = useState({
    body: '',
    rating: 5,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [localComments, setLocalComments] = useState(trip.comments || [])
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Lock scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Update local comments when trip prop changes
  useEffect(() => {
    setLocalComments(trip.comments || [])
  }, [trip.comments])

  const handleSelectTrip = () => {
    navigate(`/trip/${trip.id || trip.dataName}`)
  }

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'trips', trip.id))
      onClose()
      window.location.reload() // quick refresh to update UI
    } catch (e) {
      alert('Failed to delete trip. Please try again.')
    }
    setDeleting(false)
  }

  const formatRating = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
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
      const tripRef = doc(db, 'trips', trip.id)
      const newComment = {
        body: commentData.body.trim(),
        rating: commentData.rating,
        name: currentUser?.displayName || currentUser?.email || 'Anonymous',
        createdAt: new Date(),
      }

      // Update Firebase
      await updateDoc(tripRef, {
        comments: arrayUnion(newComment),
      })

      // Update local state immediately to show the comment
      setLocalComments((prev) => [...prev, newComment])

      // Reset form and hide it
      setCommentData({ body: '', rating: 5 })
      setShowCommentForm(false)
    } catch (error) {
      console.error('Error adding comment:', error)
      setError('Failed to add comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
        <div className="mb-6 grid grid-cols-3 gap-4 text-sm">
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
          <div>
            <span className="font-medium text-blue-300">Rating:</span>
            <p className="text-white">
              {trip.averageRating > 0
                ? `★ ${trip.averageRating.toFixed(1)}`
                : 'No ratings'}
            </p>
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
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-blue-300">Comments:</h4>
            {currentUser && (
              <button
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="rounded-md bg-blue-600/60 px-3 py-1 text-xs text-white transition-all duration-200 hover:bg-blue-600/80"
              >
                {showCommentForm ? 'Cancel' : 'Add Comment'}
              </button>
            )}
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <div className="mb-4 rounded-lg border border-blue-400/30 bg-white/5 p-4">
              {error && (
                <div className="mb-3 text-sm text-red-300">{error}</div>
              )}
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                {/* Rating Selection */}
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
                          setCommentData((prev) => ({ ...prev, rating: star }))
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

                {/* Comment Body */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-300">
                    Comment:
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !commentData.body.trim()}
                  className="w-full rounded-lg bg-blue-600/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-blue-700/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            </div>
          )}

          {/* Existing Comments */}
          {localComments && localComments.length > 0 ? (
            <div className="max-h-40 space-y-3 overflow-y-auto">
              {localComments.map((comment, index) => (
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
          ) : (
            <p className="text-sm italic text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>

        {/* Select Trip Button and Edit/Delete for owner */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full rounded-lg bg-blue-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-300 ease-in-out hover:bg-blue-700/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleSelectTrip}
          >
            Select Trip
          </button>
          {currentUser?.uid === trip.userId && (
            <div className="flex w-full gap-2">
              <button
                className="flex-1 rounded-lg bg-yellow-600/80 px-4 py-3 font-medium text-white hover:bg-yellow-700/80"
                onClick={() => setShowEdit(true)}
                type="button"
              >
                Edit
              </button>
              <button
                className="flex-1 rounded-lg bg-red-600/80 px-4 py-3 font-medium text-white hover:bg-red-700/80"
                onClick={handleDeleteTrip}
                disabled={deleting}
                type="button"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              {trip.parent_id === 'original' && (
                <button
                  className={`flex-1 rounded-lg ${trip.published ? 'bg-gray-600/80 hover:bg-gray-700/80' : 'bg-green-600/80 hover:bg-green-700/80'} px-4 py-3 font-medium text-white`}
                  onClick={async () => {
                    console.log('[Publish Debug]', {
                      id: trip.id,
                      parent_id: trip.parent_id,
                      published: trip.published,
                      userId: trip.userId,
                    })
                    try {
                      await updateDoc(doc(db, 'trips', trip.id), {
                        published: !trip.published,
                      })
                      onClose()
                      window.location.reload()
                    } catch (e) {
                      alert(
                        'Failed to update publish state. ' +
                          (e && e.message ? e.message : '')
                      )
                      console.error('[Publish Error]', e)
                    }
                  }}
                  type="button"
                >
                  {trip.published ? 'Unpublish' : 'Publish'}
                </button>
              )}
            </div>
          )}
        </div>
        {showEdit && (
          <EditTripModal
            trip={trip}
            onClose={() => setShowEdit(false)}
            onSuccess={onClose}
          />
        )}
      </div>
    </div>
  )
}
