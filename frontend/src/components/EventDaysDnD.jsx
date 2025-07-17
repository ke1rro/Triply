import { Droppable, Draggable } from '@hello-pangea/dnd'

export default function EventDaysDnD({
  days,
  eventsByDay,
  onAddEvent,
  onEditEvent,
  readOnly = false,
}) {
  const isSingleDay = days.length === 1

  return (
    <div className="w-full p-2 sm:p-6">
      <div
        className={
          isSingleDay
            ? 'flex w-full justify-center'
            : 'flex w-full flex-row flex-wrap gap-6'
        }
      >
        {days.map((day) => {
          if (readOnly) {
            return (
              <div
                key={day}
                className={
                  isSingleDay
                    ? 'mx-auto min-h-[120px] w-full max-w-2xl rounded-xl bg-white p-4 shadow'
                    : 'min-h-[120px] min-w-[250px] max-w-full flex-1 rounded-xl bg-white p-4 shadow'
                }
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-lg font-bold">Day {day}</div>
                </div>
                <div className="min-h-[80px] rounded-md p-1">
                  {eventsByDay[day] && eventsByDay[day].length > 0 ? (
                    eventsByDay[day].map((event, idx) => (
                      <div
                        key={event.id || idx}
                        className="mb-3 rounded-lg bg-indigo-50 px-4 py-3 shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-indigo-900">
                            {event.title || event.name || 'Event'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {event.time}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          {event.location || event.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm italic text-gray-400">No events</div>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <Droppable key={day} droppableId={`day-${day}`}>
                {(provided, snapshot) => {
                  const isDraggingOver = snapshot.isDraggingOver;
                  return (
                    <div
                      className={
                        isSingleDay
                          ? `mx-auto min-h-[120px] w-full max-w-2xl rounded-xl bg-white p-4 shadow ${
                              isDraggingOver ? 'ring-2 ring-indigo-400' : ''
                            }`
                          : `min-h-[120px] min-w-[250px] max-w-full flex-1 rounded-xl bg-white p-4 shadow ${
                              isDraggingOver ? 'ring-2 ring-indigo-400' : ''
                            }`
                      }
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-lg font-bold">Day {day}</div>
                        <button
                          className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
                          type="button"
                          onClick={() => onAddEvent(day)}
                        >
                          + Add Event
                        </button>
                      </div>
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[80px] rounded-md p-1"
                      >
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
                                  className={`mb-3 rounded-lg bg-indigo-50 px-4 py-3 shadow cursor-pointer ${snapshot.isDragging ? 'ring-2 ring-indigo-400' : ''}`}
                                  onClick={() => onEditEvent(day, idx)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="font-semibold text-indigo-900">
                                      {event.title || event.name || 'Event'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {event.time}
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    {event.location || event.description}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-sm italic text-gray-400">
                            No events
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  );
                }}
              </Droppable>
            );
          }
        })}
      </div>
    </div>
  )
}
