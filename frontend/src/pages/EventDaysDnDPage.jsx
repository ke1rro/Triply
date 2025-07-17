import React, { useState } from 'react'
import EventDaysDnD from '../components/EventDaysDnD'
import { DragDropContext } from '@hello-pangea/dnd'
import EventAddModal from '../components/EventAddModal'
import RouteMap from '../components/RouteMap'
import PageHeader from '../components/PageHeader'

const EventDaysDnDPage = () => {
  // Sample data for demonstration with coordinates
  const [days] = useState([1, 2, 3])
  const [eventsByDay, setEventsByDay] = useState({
    1: [
      {
        id: '1-1',
        name: 'Visit Museum of Modern Art',
        time: '10:00 AM',
        coordinates: { lat: 37.7857, lng: -122.4011 }, // San Francisco MoMA
      },
      {
        id: '1-2',
        name: 'Lunch at Ferry Building',
        time: '1:00 PM',
        coordinates: { lat: 37.7955, lng: -122.3937 }, // SF Ferry Building
      },
    ],
    2: [
      {
        id: '2-1',
        name: 'Golden Gate Park',
        time: '9:00 AM',
        coordinates: { lat: 37.7694, lng: -122.4862 }, // Golden Gate Park
      },
      {
        id: '2-2',
        name: 'Shopping at Union Square',
        time: '3:00 PM',
        coordinates: { lat: 37.7881, lng: -122.4075 }, // Union Square
      },
    ],
    3: [
      {
        id: '3-1',
        name: 'Alcatraz Island Tour',
        time: '11:00 AM',
        coordinates: { lat: 37.827, lng: -122.423 }, // Alcatraz Island
      },
    ],
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
      <div className="relative z-10 flex h-full w-full flex-col px-4 pt-4 sm:px-6 md:px-8">
        {/* Header */}
        <PageHeader title="Manage Your Trip Events" />

        <div className="container mx-auto pb-16">
          <DragDropContext onDragEnd={handleDragEnd}>
            <EventDaysDnD
              days={days}
              eventsByDay={eventsByDay}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
            />
          </DragDropContext>

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
              events={Object.values(eventsByDay)
                .flat()
                .filter((event) => event.coordinates)}
            />
          </div>
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
