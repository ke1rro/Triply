import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export default function CreateTripModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    locations: '',
    description: '',
    days: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { currentUser } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      setError('')
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file) => {
    const storage = getStorage()
    const fileName = `trip-images/${Date.now()}-${file.name}`
    const storageRef = ref(storage, fileName)
    
    await uploadBytes(storageRef, file)
    return fileName // Return the storage path, not the download URL
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setError('')

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Trip title is required')
      return
    }

    if (!formData.locations.trim()) {
      setError('At least one location is required')
      return
    }

    // Validate that locations contain actual content after parsing
    const locationArray = formData.locations
      .split(',')
      .map(loc => loc.trim())
      .filter(loc => loc.length > 0)

    if (locationArray.length === 0) {
      setError('Please enter valid location names')
      return
    }

    setLoading(true)
    setUploading(selectedFile ? true : false)

    try {
      let fileName = null
      
      // Upload image if selected
      if (selectedFile) {
        fileName = await uploadImage(selectedFile)
      }

      // Parse locations with validation
      const validLocationArray = locationArray.map(loc => ({
        name: loc,
        location: [0, 0], // Default coordinates
      }))

      const tripData = {
        name: formData.title.trim(),
        description: formData.description.trim() || '',
        Locations: validLocationArray,
        Events: [],
        comments: [],
        days: parseInt(formData.days) || 0,
        likes: 0,
        fileName: fileName,
        userId: currentUser?.uid || '',
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, 'trips'), tripData)
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      console.error('Error creating trip:', error)
      setError('Failed to create trip. Please try again.')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  // Check if form is valid for submit button state
  const isFormValid = formData.title.trim().length > 0 && 
                     formData.locations.trim().length > 0 &&
                     formData.locations.split(',').some(loc => loc.trim().length > 0)

  // Create preview trip data for TravelCard
  const previewTrip = {
    name: formData.title || 'Trip Preview',
    locations: formData.locations 
      ? formData.locations.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0)
      : ['Location 1', 'Location 2'],
    days: parseInt(formData.days) || 0,
    averageRating: 0,
    fileName: null // We'll use previewUrl for preview
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-screen max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-black/80 p-6 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="float-right text-xl font-bold text-gray-300 hover:text-white"
        >
          ×
        </button>

        {/* Title */}
        <h3 className="mb-6 text-2xl font-bold text-white drop-shadow-lg">
          Create New Trip
        </h3>

        {/* Preview at the top */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-sm">
            <PreviewTravelCard trip={previewTrip} imageUrl={previewUrl} />
          </div>
        </div>

        {/* Form Section - Single column */}
        <div className="max-w-md mx-auto">
          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/30 px-4 py-2 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Trip Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Trip Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter trip title..."
                className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                required
              />
            </div>

            {/* Locations */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Locations *
              </label>
              <input
                type="text"
                name="locations"
                value={formData.locations}
                onChange={handleInputChange}
                placeholder="Paris, Rome, Barcelona..."
                className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Separate multiple locations with commas
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your trip..."
                rows={3}
                className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
              />
            </div>

            {/* Days */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Duration (Days)
              </label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleInputChange}
                placeholder="Enter number of days..."
                min="0"
                className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
              <p className="mt-1 text-xs text-gray-400">
                How many days will this trip take?
              </p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Trip Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              <p className="mt-1 text-xs text-gray-400">
                Upload an image (max 5MB)
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg bg-gray-600/60 px-4 py-2 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-gray-600/80"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="flex-1 rounded-lg bg-blue-600/80 px-4 py-2 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-blue-700/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (uploading ? 'Uploading...' : 'Creating...') : 'Create Trip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Preview TravelCard Component
function PreviewTravelCard({ trip, imageUrl }) {
  const formatLocations = (locations) => {
    if (!locations || locations.length === 0) return 'No locations'
    if (locations.length <= 5) {
      return locations.join(', ')
    } else {
      return locations.slice(0, 5).join(', ') + ' ...'
    }
  }

  const formatRating = (rating) => {
    if (rating === 0) return 'No ratings'
    return `★ ${rating.toFixed(1)}`
  }

  const backgroundImage = imageUrl 
    ? `url(${imageUrl})`
    : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'

  return (
    <div className="group relative h-36 w-full overflow-hidden rounded-xl shadow-lg">
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 rounded-xl bg-black/30" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-4 text-white">
        {/* Title */}
        <div className="flex-shrink-0">
          <h2 className="line-clamp-1 text-xl font-bold drop-shadow-lg">
            {trip.name}
          </h2>
        </div>

        {/* Locations */}
        <div className="flex flex-1 items-center">
          <p className="line-clamp-2 text-base leading-tight drop-shadow-md">
            {formatLocations(trip.locations)}
          </p>
        </div>

        {/* Duration and Rating */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1 text-sm font-medium drop-shadow-md">
            <span>{trip.days} day{trip.days !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1 text-sm font-medium drop-shadow-md">
            <span>{formatRating(trip.averageRating)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
