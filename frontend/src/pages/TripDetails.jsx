import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import EventDaysDnD from '../components/EventDaysDnD'
import EventAddModal from '../components/EventAddModal'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

export default function TripDetails() {
  const { currentUser } = useAuth();
  const [isDragging, setIsDragging] = useState(false) // Only declared once at the top
  const [fadeText, setFadeText] = useState(false)
  const [buttonText, setButtonText] = useState('Save & Return')

  useEffect(() => {
    setFadeText(true)
    const timeout = setTimeout(() => {
      setButtonText(isDragging ? 'Drop here to delete' : 'Save & Return')
      setFadeText(false)
    }, 150) // fade out, then switch label, then fade in
    return () => clearTimeout(timeout)
  }, [isDragging])

  const navigate = useNavigate()
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalDay, setAddModalDay] = useState(1)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editModalDay, setEditModalDay] = useState(1)
  const [editEventIdx, setEditEventIdx] = useState(null)
  const [editEventData, setEditEventData] = useState(null)

  useEffect(() => {
    async function fetchTrip() {
      setLoading(true)
      setError(null)
      try {
        console.log('[TripDetails] tripId:', tripId)
        const ref = doc(db, 'trips', tripId)
        console.log('[TripDetails] Firestore doc ref:', ref.path)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setTrip(snap.data())
        } else {
          setError('Trip not found')
          console.error('[TripDetails] Trip not found:', tripId)
        }
      } catch (err) {
        setError('Failed to fetch trip')
        console.error('[TripDetails] Error fetching trip:', err)
      }
      setLoading(false)
    }
    if (tripId) fetchTrip()
  }, [tripId])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!trip) return null

  // Read-only mode for visitors (not owner)
  const isOwner = trip.userId === currentUser?.uid;
  const isVisitor = !isOwner && trip.visitors && trip.visitors.includes(currentUser?.uid);
  const readOnly = isVisitor;

  function handleEditEvent(day, idxInDay) {
    if (readOnly) return;
    // Find the correct event index in the flat Events array
    const eventsForDay = (trip.Events || []).filter((e) => (e.day || 1) === day)
    const event = eventsForDay[idxInDay]
    const globalIdx = (trip.Events || []).findIndex((e) => {
      if ((e.day || 1) !== day) return false
      // Count only up to idxInDay
      return eventsForDay.indexOf(e) === idxInDay
    })
    setEditEventIdx(globalIdx)
    setEditEventData(event)
    setEditModalDay(day)
    setEditModalOpen(true)
  }

  // Helper: group events by day
  const days = Array.from({ length: trip.days || 1 }, (_, i) => i + 1)
  const eventsByDay = days.reduce((acc, day) => {
    acc[day] = (trip.Events || []).filter((e) => (e.day || 1) === day)
    return acc
  }, {})

  // Handle DnD between days
  async function handleDaysDnD(result) {
    if (readOnly) return;
    if (!result.destination) return
    const sourceDay = parseInt(result.source.droppableId.replace('day-', ''))
    const sourceIdx = result.source.index
    let newEvents = [...(trip.Events || [])]

    // Handle delete
    if (result.destination.droppableId === 'delete-area') {
      // Remove the event from the source day at the correct index
      newEvents = newEvents.filter((e, i) => {
        if ((e.day || 1) !== sourceDay) return true
        const idxInDay = newEvents
          .slice(0, i)
          .filter((ev) => (ev.day || 1) === sourceDay).length
        return idxInDay !== sourceIdx
      })
      setTrip((prev) => ({ ...prev, Events: newEvents }))
      try {
        await updateDoc(doc(db, 'trips', tripId), { Events: newEvents })
      } catch (e) {
        console.error('Failed to delete event', e)
      }
      return
    }

    // Normal move between days
    const destDay = parseInt(result.destination.droppableId.replace('day-', ''))
    const destIdx = result.destination.index
    // Remove from source
    const moved = newEvents.filter((e) => (e.day || 1) === sourceDay)[sourceIdx]
    newEvents = newEvents.filter((e, i) => {
      if ((e.day || 1) !== sourceDay) return true
      const idxInDay = newEvents
        .slice(0, i)
        .filter((ev) => (ev.day || 1) === sourceDay).length
      return idxInDay !== sourceIdx
    })
    // Insert into dest
    const destEvents = newEvents.filter((e) => (e.day || 1) === destDay)
    const before = newEvents.findIndex(
      (e) => (e.day || 1) === destDay && destEvents.indexOf(e) === destIdx
    )
    moved.day = destDay
    if (destEvents.length === 0) {
      // Insert at the first position for that day in the global events array
      // Find the first event after all previous days' events
      let insertIdx = newEvents.findIndex((e) => (e.day || 1) > destDay)
      if (insertIdx === -1) insertIdx = newEvents.length
      newEvents.splice(insertIdx, 0, moved)
    } else if (before === -1) {
      newEvents.push(moved)
    } else {
      newEvents.splice(before, 0, moved)
    }
    // Auto-sort only sourceDay and destDay by time
    const groupByDay = (evts) => {
      const grouped = {};
      for (const e of evts) {
        const day = e.day || 1;
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(e);
      }
      return grouped;
    };
    const grouped = groupByDay(newEvents);
    [sourceDay, destDay].forEach((day) => {
      if (grouped[day]) {
        grouped[day].sort((a, b) => {
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        });
      }
    });
    // Flatten back to array, preserving order for other days
    const days = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));
    const reordered = [];
    for (const day of days) {
      reordered.push(...grouped[day]);
    }
    setTrip((prev) => ({ ...prev, Events: reordered }));
    try {
      await updateDoc(doc(db, 'trips', tripId), { Events: reordered });
    } catch (e) {
      console.error('Failed to save reordered events', e);
    }
  }

  // Helper: sort events by day, then by time within each day
  function sortEventsByDayAndTime(events) {
    // Group by day
    const grouped = {}
    for (const e of events) {
      const day = e.day || 1
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(e)
    }
    // Sort each day by time
    const sorted = []
    const days = Object.keys(grouped).sort((a, b) => Number(a) - Number(b))
    for (const day of days) {
      grouped[day].sort((a, b) => {
        if (!a.time) return 1
        if (!b.time) return -1
        return a.time.localeCompare(b.time)
      })
      sorted.push(...grouped[day])
    }
    return sorted
  }

  function handleAddEvent(day) {
    if (readOnly) return;
    setAddModalDay(day)
    setAddModalOpen(true)
  }

  function handleEditEventSubmit(eventData) {
    // Update the event at editEventIdx
    const updated = [...(trip.Events || [])]
    updated[editEventIdx] = eventData
    const sorted = sortEventsByDayAndTime(updated)
    setTrip((prev) => ({ ...prev, Events: sorted }))
    setEditModalOpen(false)
    setEditEventIdx(null)
    setEditEventData(null)
    updateDoc(doc(db, 'trips', tripId), { Events: sorted }).catch((e) => {
      console.error('Failed to update event', e)
    })
  }

  async function handleAddEventSubmit(eventData) {
    const updated = [...(trip.Events || []), eventData]
    const sorted = sortEventsByDayAndTime(updated)
    setTrip((prev) => ({ ...prev, Events: sorted }))
    setAddModalOpen(false)
    try {
      await updateDoc(doc(db, 'trips', tripId), { Events: sorted })
    } catch (e) {
      console.error('Failed to add event', e)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Background image with overlay - full screen */}
      <div
        className="fixed inset-0 h-lvh bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col px-4 pt-4 sm:px-6 md:px-8">
        {/* Header */}
        <PageHeader title={trip.name || 'Trip Details'} />
        {readOnly ? (
          <div className="container mx-auto pb-16">
            <EventDaysDnD
              days={days}
              eventsByDay={eventsByDay}
              readOnly={true}
            />
          </div>
        ) : (
          <DragDropContext
            onDragEnd={(result) => {
              handleDaysDnD(result)
              setIsDragging(false)
            }}
            onDragCancel={() => setIsDragging(false)}
            onDragStart={() => setIsDragging(true)}
            onDragUpdate={() => {}}
          >
            <div className="container mx-auto pb-16">
              <EventDaysDnD
                days={days}
                eventsByDay={eventsByDay}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                readOnly={false}
              />
            </div>
            {/* Save Button as DnD drop target */}
            <Droppable droppableId="delete-area">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 !transform-none items-center justify-center rounded-full px-10 py-4 text-xl font-bold shadow-xl transition-colors duration-300 ${snapshot.isDraggingOver ? 'bg-red-500 text-white' : isDragging ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'} ${!isDragging && !snapshot.isDraggingOver ? 'cursor-pointer hover:bg-indigo-700' : ''}`}
                  style={{
                    maxHeight: 60,
                    width: 260,
                    transition: 'none',
                    transform: 'none',
                    outline: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    cursor:
                      !isDragging && !snapshot.isDraggingOver
                        ? 'pointer'
                        : 'default',
                  }}
                  onClick={() => {
                    if (!isDragging) navigate('/mytrips')
                  }}
                >
                  {/* Crossfade text transition */}
                  <span
                    className={`block text-center transition-opacity duration-300 ${fadeText || snapshot.isDraggingOver ? 'opacity-0' : 'opacity-100'}`}
                    style={{ minHeight: 24, display: 'inline-block' }}
                  >
                    {buttonText}
                  </span>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Add Event Modal */}
        <EventAddModal
          open={addModalOpen && !readOnly}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddEventSubmit}
          day={addModalDay}
          initialEvent={{}}
          readOnly={readOnly}
        />
        {/* Edit Event Modal */}
        <EventAddModal
          open={editModalOpen && !readOnly}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditEventSubmit}
          day={editModalDay}
          mode="edit"
          initialEvent={editEventData || {}}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}
