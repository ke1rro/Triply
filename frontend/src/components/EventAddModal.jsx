import React, { useState } from 'react'

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

  // Only reset fields when opening in add mode
  React.useEffect(() => {
    if (mode === 'add' && open) {
      setName('')
      setTime('')
      setLocation('')
      setNotes('')
    }
  }, [mode, open])

  // For edit mode, update fields when initialEvent changes
  React.useEffect(() => {
    if (mode === 'edit' && open) {
      setName(initialEvent.name || '')
      setTime(initialEvent.time || '')
      setLocation(initialEvent.location || '')
      setNotes(initialEvent.notes || '')
    }
  }, [mode, open, initialEvent])

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ ...initialEvent, name, time, location, notes, day })
    if (mode === 'add') {
      setName('')
      setTime('')
      setLocation('')
      setNotes('')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="animate-slide-up w-full max-w-md rounded-t-2xl bg-white p-6 shadow-lg"
        style={{ position: 'relative', bottom: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h2 className="mb-4 text-center text-xl font-bold">
            {mode === 'edit'
              ? `Edit Event (Day ${day})`
              : `Add Event (Day ${day})`}
          </h2>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium">Event Name</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium">Time</label>
            <input
              type="time"
              className="w-full rounded border px-3 py-2"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium">Location</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              className="w-full rounded border px-3 py-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
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
      {/* Modal z-50 ensures it overlaps Save button */}
    </div>
  )
}
