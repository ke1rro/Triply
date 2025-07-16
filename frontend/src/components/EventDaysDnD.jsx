import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function EventDaysDnD({ days, eventsByDay, onAddEvent, onEditEvent }) {
  const isSingleDay = days.length === 1;
  return (
    <div className="bg-gray-50 w-full p-2 sm:p-6">
      <div className={isSingleDay ? 'flex justify-center w-full' : 'flex flex-row flex-wrap gap-6 w-full'}>
          {days.map((day, dayIdx) => (
            <Droppable droppableId={`day-${day}`} key={day}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={
                    isSingleDay
                      ? `bg-white w-full max-w-2xl mx-auto rounded-xl p-4 shadow transition min-h-[120px] ${snapshot.isDraggingOver ? 'ring-2 ring-indigo-400' : ''}`
                      : `bg-white flex-1 min-w-[250px] max-w-full rounded-xl p-4 shadow transition min-h-[120px] ${snapshot.isDraggingOver ? 'ring-2 ring-indigo-400' : ''}`
                  }
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-lg">Day {day}</div>
                    <button
                      className="bg-indigo-500 text-white font-semibold rounded-full px-4 py-2 text-sm shadow hover:bg-indigo-600 transition-colors"
                      type="button"
                      onClick={() => onAddEvent(day)}
                    >
                      + Add Event
                    </button>
                  </div>
                  <>
                  {eventsByDay[day] && eventsByDay[day].length > 0 ? (
                    eventsByDay[day].map((event, idx) => (
                      <Draggable key={event.id || idx} draggableId={String(event.id || `${day}-${idx}`)} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 rounded bg-indigo-50 p-3 shadow-sm flex justify-between items-center ${snapshot.isDragging ? 'ring-2 ring-indigo-300' : ''}`}
                            onClick={() => onEditEvent && onEditEvent(day, idx)}
                          >
                            <div>
                              <div className="font-semibold">{event.name}</div>
                              <div className="text-xs text-gray-500">{event.time}</div>

                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="text-sm italic text-gray-400">No events</div>
                  )}
                  {provided.placeholder}
                  </>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </div>
  )
}
