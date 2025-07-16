import React, { useState } from 'react'
import EventDaysDnD from '../components/EventDaysDnD'
import { DragDropContext } from '@hello-pangea/dnd'
import EventAddModal from '../components/EventAddModal'

const EventDaysDnDPage = () => {
  // Sample data for demonstration
  const [days] = useState([1, 2, 3])
  const [eventsByDay, setEventsByDay] = useState({
    1: [
      { id: '1-1', name: 'Visit Museum', time: '10:00 AM' },
      { id: '1-2', name: 'Lunch at Restaurant', time: '1:00 PM' },
    ],
    2: [
      { id: '2-1', name: 'City Tour', time: '9:00 AM' },
      { id: '2-2', name: 'Shopping', time: '3:00 PM' },
    ],
    3: [{ id: '3-1', name: 'Beach Day', time: '11:00 AM' }],
  })

  const [showEventModal, setShowEventModal] = useState(false)
  const [currentDay, setCurrentDay] = useState(null)
  const [editMode, setEditMode] = useState('add')
  const [editingEventIdx, setEditingEventIdx] = useState(null)
  const [currentEvent, setCurrentEvent] = useState({})

  const handleDragEnd = (result) => {
    const { source, destination } = result

    // Dropped outside the list
    if (!destination) return

    const sourceDay = source.droppableId.split('-')[1]
    const destinationDay = destination.droppableId.split('-')[1]

    // If dropped in the same day, just reorder
    if (sourceDay === destinationDay) {
      const newEvents = [...eventsByDay[sourceDay]]
      const [movedEvent] = newEvents.splice(source.index, 1)
      newEvents.splice(destination.index, 0, movedEvent)

      setEventsByDay({
        ...eventsByDay,
        [sourceDay]: newEvents,
      })
    } else {
      // If dropped in a different day
      const sourceEvents = [...eventsByDay[sourceDay]]
      const destEvents = [...eventsByDay[destinationDay]]
      const [movedEvent] = sourceEvents.splice(source.index, 1)

      destEvents.splice(destination.index, 0, movedEvent)

      setEventsByDay({
        ...eventsByDay,
        [sourceDay]: sourceEvents,
        [destinationDay]: destEvents,
      })
    }
  }

  const handleAddEvent = (day) => {
    setCurrentDay(day)
    setEditMode('add')
    setCurrentEvent({})
    setShowEventModal(true)
  }

  const handleEditEvent = (day, index) => {
    setCurrentDay(day)
    setEditMode('edit')
    setEditingEventIdx(index)
    setCurrentEvent(eventsByDay[day][index])
    setShowEventModal(true)
  }

  const handleEventSubmit = (eventData) => {
    if (editMode === 'add') {
      const newEvent = {
        id: `${currentDay}-${Date.now()}`,
        ...eventData,
      }

      setEventsByDay({
        ...eventsByDay,
        [currentDay]: [...(eventsByDay[currentDay] || []), newEvent],
      })
    } else {
      // Edit mode
      const updatedEvents = [...eventsByDay[currentDay]]
      updatedEvents[editingEventIdx] = {
        ...updatedEvents[editingEventIdx],
        ...eventData,
      }

      setEventsByDay({
        ...eventsByDay,
        [currentDay]: updatedEvents,
      })
    }

    setShowEventModal(false)
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
      <div className="relative z-10 flex h-full w-full flex-col px-4 pt-8 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-5xl font-bold text-blue-400 drop-shadow-lg">
              Triply
            </h1>
            <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-blue-400 to-teal-400"></div>
          </div>
        </div>

        <div className="container mx-auto pb-16">
          <h1 className="mb-6 text-center text-3xl font-semibold italic text-white drop-shadow-lg">
            Manage Your Trip Events
          </h1>
          <DragDropContext onDragEnd={handleDragEnd}>
            <EventDaysDnD
              days={days}
              eventsByDay={eventsByDay}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
            />
          </DragDropContext>
        </div>
      </div>

      {showEventModal && (
        <EventAddModal
          open={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSubmit={handleEventSubmit}
          day={currentDay}
          mode={editMode}
          initialEvent={currentEvent}
        />
      )}
    </div>
  )
}

export default EventDaysDnDPage
