import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function EventListEditable({ events, onReorder, onEdit, onDelete, onAdd }) {
  const [localEvents, setLocalEvents] = useState(events);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);

  function handleDragEnd(result) {
    console.log('[DnD] Drag end:', result);
    setIsDragging(false);
    setDraggedIdx(null);
    // If dropped in delete area
    if (result.destination && result.destination.droppableId === 'delete-area') {
      console.log('[DnD] Dropped in delete-area! Index:', result.source.index);
      const idx = result.source.index;
      const updated = localEvents.filter((_, i) => i !== idx);
      setLocalEvents(updated);
      if (onDelete) onDelete(idx);
      if (onReorder) onReorder(updated);
      return;
    }
    if (!result.destination) return;
    const reordered = Array.from(localEvents);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setLocalEvents(reordered);
    if (onReorder) onReorder(reordered);
  }

  function handleDragStart(start) {
    console.log('[DnD] Drag start:', start);
    setIsDragging(true);
    setDraggedIdx(start.source.index);
  }

  function handleAdd() {
    if (onAdd) onAdd();
  }

  // Helper: handle click for edit if not dragging
  function handleTileClick(idx) {
    if (!isDragging && onEdit) onEdit(idx);
  }

  return (
    <div>
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <Droppable droppableId="event-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {localEvents.map((event, idx) => (
                <Draggable key={idx} draggableId={String(idx)} index={idx}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-4 rounded-xl bg-white p-4 shadow flex justify-between items-center"
                      onClick={() => handleTileClick(idx)}
                    >
                      {/* 6-dot drag handle icon */}
                      <span
                        {...provided.dragHandleProps}
                        className="mr-4 cursor-grab flex items-center justify-center"
                        tabIndex={-1}
                        aria-label="Drag handle"
                      >
                        <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="5" cy="6" r="1.5" fill="#888" />
                          <circle cx="5" cy="12" r="1.5" fill="#888" />
                          <circle cx="5" cy="18" r="1.5" fill="#888" />
                          <circle cx="15" cy="6" r="1.5" fill="#888" />
                          <circle cx="15" cy="12" r="1.5" fill="#888" />
                          <circle cx="15" cy="18" r="1.5" fill="#888" />
                        </svg>
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="text-lg font-bold">{event.name}</div>
                        <div className="text-sm text-gray-600">{event.time || event.location}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onEdit && onEdit(idx)} className="text-blue-500">Edit</button>
                        <button onClick={() => onDelete && onDelete(idx)} className="text-red-500">Delete</button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {/* Drag-to-delete area, only visible when dragging */}
        {isDragging && (
          <Droppable droppableId="delete-area">
            {(provided, snapshot) => {
              console.log('[DnD] Delete area rendered. isDraggingOver:', snapshot.isDraggingOver);
              return (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`transition-all duration-300 transform flex flex-col items-center justify-center mt-8 rounded-2xl shadow-xl border-4 border-red-700 bg-red-500/90 text-white font-bold ${snapshot.isDraggingOver ? 'scale-105 bg-red-600' : 'scale-100'}`}
                  style={{ minHeight: 96, height: 96, opacity: 1 }}
                >
                  <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  <span className="text-lg">Drop here to delete</span>
                  <span className="text-xs mt-1 opacity-80">isDraggingOver: {String(snapshot.isDraggingOver)}</span>
                  {provided.placeholder}
                </div>
              );
            }}
          </Droppable>
        )}
      </DragDropContext>
      <button
        onClick={handleAdd}
        className="mt-4 w-full rounded-full bg-indigo-500 text-white font-semibold py-2 shadow hover:bg-indigo-600 transition-colors"
      >
        + Add Event
      </button>
    </div>
  );
}
