import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function EventDaysDnD({ days, eventsByDay, onAddEvent }) {
  return (
    <div className="w-full bg-gray-50 p-2 sm:p-6">
      <div className="flex w-full flex-row flex-wrap gap-6">
        {days.map((day, dayIdx) => (
          <Droppable droppableId={`day-${day}`} key={day}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[120px] min-w-[250px] max-w-full flex-1 rounded-xl bg-white p-4 shadow transition ${snapshot.isDraggingOver ? 'ring-2 ring-indigo-400' : ''}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-lg font-bold">Day {day}</div>
                  <button
                    className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-600"
                    type="button"
                    onClick={() => onAddEvent(day)}
                  >
                    + Add Event
                  </button>
                </div>
                {eventsByDay[day] && eventsByDay[day].length > 0 ? (
                  eventsByDay[day].map((event, idx) => (
                    <Draggable
                      key={event.id || idx}
                      draggableId={String(event.id || `${day}-${idx}`)}
                      index={idx}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-3 flex items-center justify-between rounded bg-indigo-50 p-3 shadow-sm ${snapshot.isDragging ? 'ring-2 ring-indigo-300' : ''}`}
                        >
                          <div>
                            <div className="font-semibold">{event.name}</div>
                            <div className="text-xs text-gray-500">
                              {event.time}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <div className="text-sm italic text-gray-400">No events</div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </div>
  )
}
