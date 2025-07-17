import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import MapPicker from './MapPicker'

export default function EditTripModal({ trip, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: trip.name || '',
    locations: trip.Locations
      ? trip.Locations.map((l) => l.name).join(', ')
      : '',
    description: trip.description || '',
    days: trip.days || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationSelect = (place) => {
    setSelectedLocation(place)
    if (place) {
      // Add the selected place to the locations
      const locationName = place.name
      const currentLocations = formData.locations.trim()
        ? formData.locations.split(',').map((l) => l.trim())
        : []

      // Only add if it's not already in the list
      if (!currentLocations.includes(locationName)) {
        const newLocations = [...currentLocations, locationName]
        setFormData((prev) => ({
          ...prev,
          locations: newLocations.join(', '),
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.title.trim()) {
      setError('Trip title is required')
      return
    }
    if (!formData.locations.trim()) {
      setError('At least one location is required')
      return
    }
    const locationArray = formData.locations
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l)
    if (locationArray.length === 0) {
      setError('Please enter valid location names')
      return
    }
    setLoading(true)
    try {
      // Create the locations array with proper coordinates if we have them from the map selection
      const locationsWithCoordinates = locationArray.map((name) => {
        // If this is our selected location and it has coordinates, use those
        if (selectedLocation && selectedLocation.name.includes(name)) {
          return {
            name,
            location: [selectedLocation.latitude, selectedLocation.longitude],
            notes: selectedLocation.notes || '',
          }
        }
        // For existing locations, preserve their coordinates if available
        const existingLocation = trip.Locations?.find((l) => l.name === name)
        if (
          existingLocation &&
          existingLocation.location &&
          existingLocation.location.length === 2
        ) {
          return {
            name,
            location: existingLocation.location,
            notes: existingLocation.notes || '',
          }
        }
        // Default to [0,0] if no coordinates available
        return { name, location: [0, 0], notes: '' }
      })

      await updateDoc(doc(db, 'trips', trip.id), {
        name: formData.title.trim(),
        description: formData.description.trim(),
        Locations: locationsWithCoordinates,
        days: parseInt(formData.days) || 0,
      })
      if (onSuccess) onSuccess()
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
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-black/80 p-6 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600/50 text-xl font-bold text-gray-300 transition-all duration-200 hover:bg-gray-600/70 hover:text-white"
        >
          ×
        </button>
        <h3 className="mb-6 text-2xl font-bold text-white drop-shadow-lg">
          Edit Trip
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="w-full rounded-lg p-3 text-black"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Add location by clicking on the map
            </label>
            <MapPicker
              onSelect={handleLocationSelect}
              selectedPlace={selectedLocation}
            />
          </div>

          <input
            name="locations"
            value={formData.locations}
            onChange={handleInputChange}
            placeholder="Locations (comma separated)"
            className="w-full rounded-lg p-3 text-black"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full rounded-lg p-3 text-black"
            rows={4}
          />

          <input
            name="days"
            type="number"
            min="1"
            value={formData.days}
            onChange={handleInputChange}
            placeholder="Days"
            className="w-full rounded-lg p-3 text-black"
          />

          {error && <div className="text-red-400">{error}</div>}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600/80 px-4 py-3 font-medium text-white hover:bg-blue-700/80"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
