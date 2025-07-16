import React, { useState, useEffect } from 'react'
import MapPicker from './MapPicker'

export default function EventAddModal({
  open,
  onClose,
  onSubmit,
  day,
  mode = 'add',
  initialEvent = {},
}) {
  const [name, setName] = useState(initialEvent.name || '')
  const [time, setTime] = useState(initialEvent.time || '')
  const [location, setLocation] = useState(initialEvent.location || '')
  const [notes, setNotes] = useState(initialEvent.notes || '')
  const [selectedPlace, setSelectedPlace] = useState(null)

  useEffect(() => {
    if (mode === 'add' && open) {
      setName('')
      setTime('')
      setLocation('')
      setNotes('')
      setSelectedPlace(null)
    }
  }, [mode, open])

  useEffect(() => {
    if (mode === 'edit' && open) {
      setName(initialEvent.name || '')
      setTime(initialEvent.time || '')
      setLocation(initialEvent.location || '')
      setNotes(initialEvent.notes || '')
      setSelectedPlace(initialEvent.place || null)
    }
  }, [mode, open, initialEvent])

  function handleSubmit(e) {
    e.preventDefault()
    const eventData = {
      ...initialEvent,
      name,
      time,
      location: selectedPlace ? selectedPlace.name : location,
      place: selectedPlace,
      notes,
      day,
    }
    onSubmit(eventData)

    if (mode === 'add') {
      setName('')
      setTime('')
      setLocation('')
      setNotes('')
      setSelectedPlace(null)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-screen max-w-md overflow-y-auto rounded-2xl bg-black/80 p-6 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with title and close button */}
        <div className="mb-6 flex items-start justify-between">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            {mode === 'edit'
              ? `Edit Event (Day ${day})`
              : `Add Event (Day ${day})`}
          </h3>
          <button
            onClick={onClose}
            className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600/50 text-xl font-bold text-gray-300 transition-all duration-200 hover:bg-gray-600/70 hover:text-white"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Event Name
            </label>
            <input
              className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Time
            </label>
            <input
              type="time"
              className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Pick Location
            </label>
            <MapPicker
              onSelect={(place) => {
                setSelectedPlace(place)
                if (place) setLocation(place.name)
              }}
              selectedPlace={selectedPlace}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-full bg-indigo-500 py-2 font-semibold text-white shadow transition-colors hover:bg-indigo-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-indigo-500 py-2 font-semibold text-white shadow transition-colors hover:bg-indigo-600"
            >
              {mode === 'edit' ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
      <style>{`.animate-slide-up{animation:slideUp .3s cubic-bezier(.25,.8,.25,1)}@keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}`}</style>
    </div>
  )
}
