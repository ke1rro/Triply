import React, { useState, useEffect } from 'react'
import EventDaysDnD from '../components/EventDaysDnD'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import EventAddModal from '../components/EventAddModal'
import RouteMap from '../components/RouteMap'
import PageHeader from '../components/PageHeader'

const EventDaysDnDPage = () => {
  // Drag state management
  const [isDragging, setIsDragging] = useState(false)
  const [fadeText, setFadeText] = useState(false)
  const [buttonText, setButtonText] = useState('Save Changes')

  useEffect(() => {
    setFadeText(true)
    const timeout = setTimeout(() => {
      setButtonText(isDragging ? 'Drop here to delete' : 'Save Changes')
      setFadeText(false)
    }, 150) // fade out, then switch label, then fade in
    return () => clearTimeout(timeout)
  }, [isDragging])

  // Sample data for demonstration with coordinates
  const [days] = useState([1, 2, 3])
  const [eventsByDay, setEventsByDay] = useState({
    1: [
      {
        id: '1-1',
        name: 'Visit Museum of Modern Art',
        time: '09:00',
        coordinates: { lat: 37.7857, lng: -122.4011 }, // San Francisco MoMA
        place: {
          id: 'moma-sf',
          name: 'Museum of Modern Art',
          latitude: 37.7857,
          longitude: -122.4011,
          categories: ['museum'],
          isCustom: false,
        },
      },
      {
        id: '1-2',
        name: 'Lunch at Ferry Building',
        time: '11:00',
        coordinates: { lat: 37.7955, lng: -122.3937 }, // SF Ferry Building
        place: {
          id: 'ferry-building',
          name: 'Ferry Building',
          latitude: 37.7955,
          longitude: -122.3937,
          categories: ['restaurant'],
          isCustom: false,
        },
      },
    ],
    2: [
      {
        id: '2-1',
        name: 'Golden Gate Park',
        time: '09:00',
        coordinates: { lat: 37.7694, lng: -122.4862 }, // Golden Gate Park
        place: {
          id: 'golden-gate-park',
          name: 'Golden Gate Park',
          latitude: 37.7694,
          longitude: -122.4862,
          categories: ['park'],
          isCustom: false,
        },
      },
      {
        id: '2-2',
        name: 'Shopping at Union Square',
        time: '11:00',
        coordinates: { lat: 37.7881, lng: -122.4075 }, // Union Square
        place: {
          id: 'union-square',
          name: 'Union Square',
          latitude: 37.7881,
          longitude: -122.4075,
          categories: ['shopping'],
          isCustom: false,
        },
      },
    ],
    3: [
      {
        id: '3-1',
        name: 'Alcatraz Island Tour',
        time: '09:00',
        coordinates: { lat: 37.827, lng: -122.423 }, // Alcatraz Island
        place: {
          id: 'alcatraz',
          name: 'Alcatraz Island',
          latitude: 37.827,
          longitude: -122.423,
          categories: ['tourist-attraction'],
          isCustom: false,
        },
      },
    ],
  })

  const [showEventModal, setShowEventModal] = useState(false)
  const [currentDay, setCurrentDay] = useState(null)
  const [editMode, setEditMode] = useState('add')
  const [editingEventIdx, setEditingEventIdx] = useState(null)
  const [currentEvent, setCurrentEvent] = useState({})

  // Helper function to automatically update event times based on their position
  const updateEventTimes = (events) => {
    if (events.length === 0) return events

    return events.map((event, index) => {
      // Calculate time based on position: start at 9:00 AM, add 2 hours between events
      const startHour = 9
      const hoursBetweenEvents = 2
      const totalHours = startHour + index * hoursBetweenEvents

      // Handle hours > 24 by wrapping to next day
      const hours = totalHours % 24
      const formattedHours = hours.toString().padStart(2, '0')
      const newTime = `${formattedHours}:00`

      return {
        ...event,
        time: newTime,
      }
    })
  }

  const handleDragEnd = (result) => {
    const { source, destination } = result

    // Dropped outside the list
    if (!destination) return

    // Handle delete - if dropped on delete area
    if (destination.droppableId === 'delete-area') {
      const sourceDay = source.droppableId.split('-')[1]
      const sourceIndex = source.index

      // Remove the event from the source day
      const updatedSourceEvents = [...eventsByDay[sourceDay]]
      updatedSourceEvents.splice(sourceIndex, 1)

      // Update times for the modified day
      const updatedEventsWithTimes = updateEventTimes(updatedSourceEvents)

      setEventsByDay({
        ...eventsByDay,
        [sourceDay]: updatedEventsWithTimes,
      })
      return
    }

    const sourceDay = source.droppableId.split('-')[1]
    const destinationDay = destination.droppableId.split('-')[1]

    // If dropped in the same day, just reorder
    if (sourceDay === destinationDay) {
      const newEvents = [...eventsByDay[sourceDay]]
      const [movedEvent] = newEvents.splice(source.index, 1)
      newEvents.splice(destination.index, 0, movedEvent)

      // Update times based on new order
      const updatedEvents = updateEventTimes(newEvents)

      setEventsByDay({
        ...eventsByDay,
        [sourceDay]: updatedEvents,
      })
    } else {
      // If dropped in a different day
      const sourceEvents = [...eventsByDay[sourceDay]]
      const destEvents = [...eventsByDay[destinationDay]]
      const [movedEvent] = sourceEvents.splice(source.index, 1)

      destEvents.splice(destination.index, 0, movedEvent)

      // Update times for both days
      const updatedSourceEvents = updateEventTimes(sourceEvents)
      const updatedDestEvents = updateEventTimes(destEvents)

      setEventsByDay({
        ...eventsByDay,
        [sourceDay]: updatedSourceEvents,
        [destinationDay]: updatedDestEvents,
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
      // Extract coordinates from place data if available
      const coordinates = eventData.place
        ? { lat: eventData.place.latitude, lng: eventData.place.longitude }
        : null

      // Auto-generate time if not provided
      let eventTime = eventData.time
      if (!eventTime) {
        const existingEvents = eventsByDay[currentDay] || []
        const startHour = 9
        const hoursBetweenEvents = 2
        const newEventIndex = existingEvents.length
        const totalHours = startHour + newEventIndex * hoursBetweenEvents
        const hours = totalHours % 24
        eventTime = `${hours.toString().padStart(2, '0')}:00`
      }

      const newEvent = {
        id: `${currentDay}-${Date.now()}`,
        ...eventData,
        time: eventTime,
        coordinates,
      }

      const updatedEvents = [...(eventsByDay[currentDay] || []), newEvent]

      setEventsByDay({
        ...eventsByDay,
        [currentDay]: updatedEvents,
      })
    } else {
      // Edit mode - also update coordinates
      const coordinates = eventData.place
        ? { lat: eventData.place.latitude, lng: eventData.place.longitude }
        : eventsByDay[currentDay][editingEventIdx].coordinates

      const updatedEvents = [...eventsByDay[currentDay]]
      updatedEvents[editingEventIdx] = {
        ...updatedEvents[editingEventIdx],
        ...eventData,
        coordinates,
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
      <div className="relative z-10 flex h-full w-full flex-col px-4 pt-4 sm:px-6 md:px-8">
        {/* Header */}
        <PageHeader title="Manage Your Trip Events" />

        <DragDropContext
          onDragEnd={(result) => {
            handleDragEnd(result)
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
            />

            {/* Route Map showing all locations */}
            <div className="animate-fadeIn mx-auto mt-12 max-w-4xl px-2">
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-bold text-blue-300 drop-shadow-lg">
                  Your Trip Route
                </h2>
                <p className="text-gray-300">
                  View and explore your planned journey
                </p>
              </div>
              <RouteMap
                events={Object.entries(eventsByDay).flatMap(([day, events]) =>
                  events
                    .filter(
                      (event) =>
                        event.coordinates ||
                        (event.place &&
                          event.place.latitude &&
                          event.place.longitude)
                    )
                    .map((event) => ({
                      ...event,
                      currentDay: parseInt(day), // Add current day info
                    }))
                )}
              />
            </div>
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
                  if (!isDragging) {
                    // Save functionality will be implemented later
                    console.log('Save changes clicked')
                  }
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
