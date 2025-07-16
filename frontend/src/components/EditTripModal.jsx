import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      await updateDoc(doc(db, 'trips', trip.id), {
        name: formData.title.trim(),
        description: formData.description.trim(),
        Locations: locationArray.map((name) => ({ name, location: [0, 0] })),
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
            className="w-full rounded-lg p-3"
          />
          <input
            name="locations"
            value={formData.locations}
            onChange={handleInputChange}
            placeholder="Locations (comma separated)"
            className="w-full rounded-lg p-3"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full rounded-lg p-3"
          />
          <input
            name="days"
            type="number"
            min="1"
            value={formData.days}
            onChange={handleInputChange}
            placeholder="Days"
            className="w-full rounded-lg p-3"
          />
          {error && <div className="text-red-400">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600/80 px-4 py-3 font-medium text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
