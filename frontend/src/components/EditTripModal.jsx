import React, { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '../lib/firebase'
import MapPicker from './MapPicker'
import TravelCard from './TravelCard'

export default function EditTripModal({ trip, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: trip.name || '',
    locations: trip.Locations ? trip.Locations.map(l => l.name).join(', ') : '',
    description: trip.description || '',
    days: trip.days || '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (trip.fileName && !selectedFile) {
      const fetchImage = async () => {
        try {
          const storage = getStorage()
          const imageRef = ref(storage, trip.fileName)
          const url = await getDownloadURL(imageRef)
          setPreviewUrl(url)
        } catch {
          setPreviewUrl(null)
        }
      }
      fetchImage()
    }
  }, [trip.fileName, selectedFile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      setError('')
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const isFormValid =
    formData.title.trim().length > 0 &&
    formData.locations.trim().length > 0 &&
    formData.locations.split(',').some(loc => loc.trim().length > 0) &&
    String(formData.days).trim().length > 0 &&
    Number.isInteger(Number(formData.days)) &&
    Number(formData.days) > 0

  const previewTrip = {
    name: formData.title || 'Trip Preview',
    locations: formData.locations
      ? formData.locations.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0)
      : ['Location 1', 'Location 2'],
    days: parseInt(formData.days) || 0,
    averageRating: trip.averageRating || 0,
    fileName: trip.fileName || null,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    // Validation
    if (!formData.title.trim()) {
      setError('Trip title is required')
      return
    }
    if (!formData.locations.trim()) {
      setError('At least one location is required')
      return
    }
    if (!String(formData.days).trim() || !Number.isInteger(Number(formData.days)) || Number(formData.days) <= 0) {
      setError('Please enter a valid number of days (must be at least 1)')
      return
    }
    const locationArray = formData.locations
      .split(',')
      .map(l => l.trim())
      .filter(l => l)
    if (locationArray.length === 0) {
      setError('Please enter valid location names')
      return
    }
    setLoading(true)
    try {
      // Prepare locations array (keep existing coordinates if possible)
      const locationsWithCoordinates = locationArray.map((name) => {
        const existingLocation = trip.Locations?.find((l) => l.name === name)
        if (existingLocation && existingLocation.location && existingLocation.location.length === 2) {
          return {
            name,
            location: existingLocation.location,
            notes: existingLocation.notes || '',
          }
        }
        return { name, location: [0, 0], notes: '' }
      })
      let fileName = trip.fileName || null
      if (selectedFile) {
        // Upload new image
        const storage = getStorage()
        fileName = `trip-images/${Date.now()}-${selectedFile.name}`
        const storageRef = ref(storage, fileName)
        await uploadBytes(storageRef, selectedFile)
      }
      const updatedTripData = {
        name: formData.title.trim(),
        description: formData.description.trim(),
        Locations: locationsWithCoordinates,
        days: parseInt(formData.days) || 0,
        fileName,
      }
      await updateDoc(doc(db, 'trips', trip.id), updatedTripData)
      if (onSuccess) onSuccess({ ...trip, ...updatedTripData })
      onClose()
    } catch (err) {
      setError('Failed to update trip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-screen max-w-4xl overflow-y-auto rounded-2xl bg-black/80 p-6 shadow-2xl backdrop-blur-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with title and close button */}
        <div className="mb-6 flex items-start justify-between">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            Edit Trip
          </h3>
          <button
            onClick={onClose}
            className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600/50 text-xl font-bold text-gray-300 transition-all duration-200 hover:bg-gray-600/70 hover:text-white"
          >
            ×
          </button>
        </div>
        {/* Preview at the top */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-sm">
            <TravelCard trip={previewTrip} imageUrl={previewUrl} />
          </div>
        </div>
        {/* Form Section - Single column */}
        <div className="mx-auto max-w-md">
          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/20 px-4 py-2 text-sm text-red-300">
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
            {/* Days */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Duration (Days) *
              </label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleInputChange}
                placeholder="Enter number of days..."
                min="1"
                required
                className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
              <p className="mt-1 text-xs text-gray-400">
                How many days will this trip take?
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
                className="w-full resize-none rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
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
                className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white backdrop-blur-sm file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-2 file:py-1 file:text-sm file:text-white hover:file:bg-blue-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
                className="flex-1 rounded-lg bg-blue-600/80 px-4 py-2 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-blue-700/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
