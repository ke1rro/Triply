import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import EventListEditable from '../components/EventListEditable';
import EventDaysDnD from '../components/EventDaysDnD';
import EventAddModal from '../components/EventAddModal';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';


export default function TripDetails() {
  const [isDragging, setIsDragging] = useState(false); // Only declared once at the top
  const [fadeText, setFadeText] = useState(false);
  const [buttonText, setButtonText] = useState('Save & Return');

  useEffect(() => {
    setFadeText(true);
    const timeout = setTimeout(() => {
      setButtonText(isDragging ? 'Drop here to delete' : 'Save & Return');
      setFadeText(false);
    }, 150); // fade out, then switch label, then fade in
    return () => clearTimeout(timeout);
  }, [isDragging]);

  const navigate = useNavigate();
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDay, setAddModalDay] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalDay, setEditModalDay] = useState(1);
  const [editEventIdx, setEditEventIdx] = useState(null);
  const [editEventData, setEditEventData] = useState(null);
  const [draggedEvent, setDraggedEvent] = useState(null); // To track which event is being dragged

  useEffect(() => {
    async function fetchTrip() {
      setLoading(true);
      setError(null);
      try {
        console.log('[TripDetails] tripId:', tripId);
        const ref = doc(db, 'trips', tripId);
        console.log('[TripDetails] Firestore doc ref:', ref.path);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setTrip(snap.data());
        } else {
          setError('Trip not found');
          console.error('[TripDetails] Trip not found:', tripId);
        }
      } catch (err) {
        setError('Failed to fetch trip');
        console.error('[TripDetails] Error fetching trip:', err);
      }
      setLoading(false);
    }
    if (tripId) fetchTrip();
  }, [tripId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!trip) return null;

  async function handleReorderEvents(newEvents) {
    setTrip(prev => ({ ...prev, Events: newEvents }));
    try {
      await updateDoc(doc(db, 'trips', tripId), { Events: newEvents });
    } catch (e) {
      console.error('Failed to save reordered events', e);
    }
  }

  function handleEditEvent(day, idxInDay) {
    // Find the correct event index in the flat Events array
    const eventsForDay = (trip.Events || []).filter(e => (e.day || 1) === day);
    const event = eventsForDay[idxInDay];
    const globalIdx = (trip.Events || []).findIndex((e, i) => {
      if ((e.day || 1) !== day) return false;
      // Count only up to idxInDay
      return eventsForDay.indexOf(e) === idxInDay;
    });
    setEditEventIdx(globalIdx);
    setEditEventData(event);
    setEditModalDay(day);
    setEditModalOpen(true);
  }

  function handleDeleteEvent(idx) {
    if (window.confirm('Delete this event?')) {
      const updated = trip.Events.filter((_, i) => i !== idx);
      handleReorderEvents(updated);
    }
  }

  function handleAddEvent() {
    const name = prompt('New event name:');
    const time = prompt('New event time:');
    if (name) {
      const updated = [...(trip.Events || []), { name, time }];
      handleReorderEvents(updated);
    }
  }

  // Helper: group events by day
  const days = Array.from({ length: trip.days || 1 }, (_, i) => i + 1);
  const eventsByDay = days.reduce((acc, day) => {
    acc[day] = (trip.Events || []).filter(e => (e.day || 1) === day);
    return acc;
  }, {});

  // Handle DnD between days
  async function handleDaysDnD(result) {
    if (!result.destination) return;
    const sourceDay = parseInt(result.source.droppableId.replace('day-', ''));
    const sourceIdx = result.source.index;
    let newEvents = [...(trip.Events || [])];

    // Handle delete
    if (result.destination.droppableId === 'delete-area') {
      // Remove the event from the source day at the correct index
      newEvents = newEvents.filter((e, i) => {
        if ((e.day || 1) !== sourceDay) return true;
        const idxInDay = newEvents.slice(0, i).filter(ev => (ev.day || 1) === sourceDay).length;
        return idxInDay !== sourceIdx;
      });
      setTrip(prev => ({ ...prev, Events: newEvents }));
      try {
        await updateDoc(doc(db, 'trips', tripId), { Events: newEvents });
      } catch (e) {
        console.error('Failed to delete event', e);
      }
      return;
    }

    // Normal move between days
    const destDay = parseInt(result.destination.droppableId.replace('day-', ''));
    const destIdx = result.destination.index;
    // Remove from source
    const moved = newEvents.filter(e => (e.day || 1) === sourceDay)[sourceIdx];
    newEvents = newEvents.filter((e, i) => {
      if ((e.day || 1) !== sourceDay) return true;
      const idxInDay = newEvents.slice(0, i).filter(ev => (ev.day || 1) === sourceDay).length;
      return idxInDay !== sourceIdx;
    });
    // Insert into dest
    const destEvents = newEvents.filter(e => (e.day || 1) === destDay);
    const before = newEvents.findIndex((e, i) => (e.day || 1) === destDay && destEvents.indexOf(e) === destIdx);
    moved.day = destDay;
    if (destEvents.length === 0) {
      // Insert at the first position for that day in the global events array
      // Find the first event after all previous days' events
      let insertIdx = newEvents.findIndex(e => (e.day || 1) > destDay);
      if (insertIdx === -1) insertIdx = newEvents.length;
      newEvents.splice(insertIdx, 0, moved);
    } else if (before === -1) {
      newEvents.push(moved);
    } else {
      newEvents.splice(before, 0, moved);
    }
    setTrip(prev => ({ ...prev, Events: newEvents }));
    try {
      await updateDoc(doc(db, 'trips', tripId), { Events: newEvents });
    } catch (e) {
      console.error('Failed to save reordered events', e);
    }
  }

  function handleAddEvent(day) {
    setAddModalDay(day);
    setAddModalOpen(true);
  }

  function handleEditEventSubmit(eventData) {
    // Update the event at editEventIdx
    const updated = [...(trip.Events || [])];
    updated[editEventIdx] = eventData;
    setTrip(prev => ({ ...prev, Events: updated }));
    setEditModalOpen(false);
    setEditEventIdx(null);
    setEditEventData(null);
    updateDoc(doc(db, 'trips', tripId), { Events: updated }).catch(e => {
      console.error('Failed to update event', e);
    });
  }

  async function handleAddEventSubmit(eventData) {
    const updated = [...(trip.Events || []), eventData];
    setTrip(prev => ({ ...prev, Events: updated }));
    setAddModalOpen(false);
    try {
      await updateDoc(doc(db, 'trips', tripId), { Events: updated });
    } catch (e) {
      console.error('Failed to add event', e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0 w-screen">
      <DragDropContext
  onDragEnd={result => { handleDaysDnD(result); setIsDragging(false); }}
  onDragCancel={() => setIsDragging(false)}
  onDragStart={() => setIsDragging(true)}
  onDragUpdate={() => {}}>
        <div className="w-screen py-12 px-4 sm:px-8">
          <h1 className="text-4xl font-bold mb-8 text-center">{trip.name}</h1>
          <EventDaysDnD
            days={days}
            eventsByDay={eventsByDay}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
          />
        </div>
        {/* Save Button fixed at bottom */}
        {/* Save Button as DnD drop target */}
        <Droppable droppableId="delete-area">
          {(provided, snapshot) => (
            <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-10 py-4 rounded-full shadow-xl text-xl font-bold z-50 transition-colors duration-300 !transform-none flex items-center justify-center ${snapshot.isDraggingOver ? 'bg-red-500 text-white' : isDragging ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'} ${!isDragging && !snapshot.isDraggingOver ? 'hover:bg-indigo-700 cursor-pointer' : ''}`}
            style={{ maxHeight:60, width: 260, transition: 'none', transform: 'none', outline: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', cursor: !isDragging && !snapshot.isDraggingOver ? 'pointer' : 'default' }}
            onClick={() => { if (!isDragging) navigate('/home'); }}
          >
            {/* Crossfade text transition */}
<span
  className={`block transition-opacity duration-300 text-center ${(fadeText || snapshot.isDraggingOver) ? 'opacity-0' : 'opacity-100'}`}
  style={{ minHeight: 24, display: 'inline-block' }}
>
  {buttonText}
</span>
            {provided.placeholder}
          </div>
        )}
        </Droppable>
        {/* Render EventAddModal last so it overlaps Save button */}
        <EventAddModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddEventSubmit}
          day={addModalDay}
          mode="add"
        />
        <EventAddModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditEventSubmit}
          day={editModalDay}
          mode="edit"
          initialEvent={editEventData || {}}
        />
      </DragDropContext>
    </div>
  );
}
