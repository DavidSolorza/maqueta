import React, { useState } from 'react';
import { PersonalCalendar, PersonalEvent, TimeSlot } from '../types/schedule';
import { Calendar, Clock, Edit, Trash2, Plus, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface PersonalCalendarCardProps {
  calendar: PersonalCalendar;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onUpdate: (calendar: PersonalCalendar) => void;
  onDelete: (id: string) => void;
  isListView?: boolean;
}

export const PersonalCalendarCard: React.FC<PersonalCalendarCardProps> = ({ calendar, isSelected, onToggleSelection, onUpdate, onDelete, isListView = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(calendar.name);
  const [editedDescription, setEditedDescription] = useState(calendar.description || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<PersonalEvent>>({
    title: '',
    description: '',
    timeSlots: [],
    color: calendar.color,
    category: '',
  });

  const handleSave = () => {
    onUpdate({
      ...calendar,
      name: editedName,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.timeSlots || newEvent.timeSlots.length === 0) {
      alert('Por favor completa el título y al menos un horario');
      return;
    }

    const event: PersonalEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title!,
      description: newEvent.description,
      timeSlots: newEvent.timeSlots,
      color: newEvent.color || calendar.color,
      category: newEvent.category,
    };

    onUpdate({
      ...calendar,
      events: [...calendar.events, event],
    });

    setNewEvent({
      title: '',
      description: '',
      timeSlots: [],
      color: calendar.color,
      category: '',
    });
    setShowAddEvent(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    onUpdate({
      ...calendar,
      events: calendar.events.filter((e) => e.id !== eventId),
    });
  };

  const handleAddTimeSlot = () => {
    setNewEvent({
      ...newEvent,
      timeSlots: [
        ...(newEvent.timeSlots || []),
        {
          day: 'Lunes',
          startTime: '09:00',
          endTime: '10:00',
        },
      ],
    });
  };

  const handleUpdateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...(newEvent.timeSlots || [])];
    updated[index] = { ...updated[index], [field]: value };
    setNewEvent({ ...newEvent, timeSlots: updated });
  };

  const handleRemoveTimeSlot = (index: number) => {
    setNewEvent({
      ...newEvent,
      timeSlots: newEvent.timeSlots?.filter((_, i) => i !== index) || [],
    });
  };

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <input type="checkbox" checked={isSelected} onChange={() => onToggleSelection(calendar.id)} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nombre del calendario" />
                <textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Descripción (opcional)" rows={2} />
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{calendar.name}</h3>
                {calendar.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{calendar.description}</p>}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors" title="Guardar">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => setIsEditing(false)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Cancelar">
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Editar">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(calendar.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Eliminar">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{calendar.events.length} eventos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: calendar.color }} />
          </div>
        </div>

        <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1">
          <span>{isExpanded ? 'Ocultar' : 'Ver'} eventos</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {calendar.events.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay eventos en este calendario</p>
          ) : (
            calendar.events.map((event) => (
              <div key={event.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                      <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                    </div>
                    {event.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>}
                    {event.category && <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">{event.category}</span>}
                  </div>
                  <button onClick={() => handleDeleteEvent(event.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400" title="Eliminar evento">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {event.timeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        {slot.day}: {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <button onClick={() => setShowAddEvent(!showAddEvent)} className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Plus className="w-4 h-4" />
            <span>{showAddEvent ? 'Cancelar' : 'Agregar Evento'}</span>
          </button>

          {showAddEvent && (
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 space-y-3">
              <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Título del evento" />

              <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Descripción (opcional)" rows={2} />

              <input type="text" value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Categoría (opcional)" />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horarios</label>
                {newEvent.timeSlots?.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select value={slot.day} onChange={(e) => handleUpdateTimeSlot(index, 'day', e.target.value)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <input type="time" value={slot.startTime} onChange={(e) => handleUpdateTimeSlot(index, 'startTime', e.target.value)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                    <span className="text-gray-500">-</span>
                    <input type="time" value={slot.endTime} onChange={(e) => handleUpdateTimeSlot(index, 'endTime', e.target.value)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                    <button onClick={() => handleRemoveTimeSlot(index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={handleAddTimeSlot} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1">
                  <Plus className="w-4 h-4" />
                  <span>Agregar horario</span>
                </button>
              </div>

              <button onClick={handleAddEvent} className="w-full px-4 py-2 text-white bg-green-600 dark:bg-green-700 rounded-md hover:bg-green-700 dark:hover:bg-green-800 transition-colors">
                Guardar Evento
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (isListView) {
    return <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">{cardContent}</div>;
  }

  return <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">{cardContent}</div>;
};
