import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export default function CreateTripModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    locations: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { currentUser } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
      .map((loc) => loc.trim())
      .filter((loc) => loc.length > 0)

    if (locationArray.length === 0) {
      setError('Please enter valid location names')
      return
    }

    setLoading(true)

    try {
      // Parse locations with validation
      const validLocationArray = locationArray.map((loc) => ({
        name: loc,
        location: [0, 0], // Default coordinates
      }))

      const tripData = {
        name: formData.title.trim(),
        description: formData.description.trim() || '',
        Locations: validLocationArray,
        Events: [],
        comments: [],
        days: 0,
        likes: 0,
        fileName: null,
        userId: currentUser?.uid || '',
        createdAt: serverTimestamp(),
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
    }
  }

  // Check if form is valid for submit button state
  const isFormValid =
    formData.title.trim().length > 0 &&
    formData.locations.trim().length > 0 &&
    formData.locations.split(',').some((loc) => loc.trim().length > 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-black/80 p-6 shadow-2xl backdrop-blur-md"
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
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
