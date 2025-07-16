import React, { useState } from 'react';

export default function EventAddModal({ open, onClose, onSubmit, day }) {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name, time, location, notes, day });
    setName(''); setTime(''); setLocation(''); setNotes('');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-2xl shadow-lg p-6 animate-slide-up" style={{ position: 'relative', bottom: 0 }} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4 text-center">Add Event (Day {day})</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <input className="w-full rounded border px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Time</label>
            <input className="w-full rounded border px-3 py-2" value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 10:00" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input className="w-full rounded border px-3 py-2" value={location} onChange={e => setLocation(e.target.value)} placeholder="Optional" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="w-full rounded border px-3 py-2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 rounded-full bg-indigo-500 text-white font-semibold py-2 shadow hover:bg-indigo-600 transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              className="flex-1 rounded-full bg-indigo-500 text-white font-semibold py-2 shadow hover:bg-indigo-600 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style>{`.animate-slide-up{animation:slideUp .3s cubic-bezier(.25,.8,.25,1)}@keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}`}</style>
      {/* Modal z-50 ensures it overlaps Save button */}
    </div>
  );
}
