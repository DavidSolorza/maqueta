import React, { useState } from 'react';
import { PersonalCalendar, PersonalEvent } from '../types/schedule';
import { Calendar, Clock, Edit, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { CreateEventModal } from './CreateEventModal';
import { generateEventId } from '../utils/personalCalendarStorage';
import { ConfirmModal } from './ConfirmModal';
import { toastManager } from '../utils/toast';

interface PersonalCalendarCardProps {
  calendar: PersonalCalendar;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onUpdate: (calendar: PersonalCalendar) => void;
  onDelete: (id: string) => void;
  onEdit?: (calendar: PersonalCalendar) => void;
  isListView?: boolean;
}

export const PersonalCalendarCard: React.FC<PersonalCalendarCardProps> = ({
  calendar,
  isSelected,
  onToggleSelection,
  onUpdate,
  onDelete,
  onEdit,
  isListView = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<PersonalEvent | null>(null);
  const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(false);
  const [showDeleteCalendarConfirm, setShowDeleteCalendarConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const handleEditCalendar = () => {
    if (onEdit) {
      onEdit(calendar);
    }
  };

  const handleAddEvent = () => {
    setEventToEdit(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: PersonalEvent) => {
    setEventToEdit(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = (eventData: Omit<PersonalEvent, 'id'>) => {
    if (eventToEdit) {
      // Edit existing event
      const updated: PersonalEvent = {
        ...eventToEdit,
        ...eventData,
      };
      onUpdate({
        ...calendar,
        events: calendar.events.map((e) => (e.id === eventToEdit.id ? updated : e)),
      });
      toastManager.success(`Evento "${updated.title}" actualizado correctamente`);
    } else {
      // Create new event
      const newEvent: PersonalEvent = {
        id: generateEventId(),
        ...eventData,
      };
      onUpdate({
        ...calendar,
        events: [...calendar.events, newEvent],
      });
      toastManager.success(`Evento "${newEvent.title}" agregado al calendario`);
    }
    setShowEventModal(false);
    setEventToEdit(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteEventConfirm(true);
  };

  const confirmDeleteEvent = () => {
    if (eventToDelete) {
      const eventToDeleteObj = calendar.events.find((e) => e.id === eventToDelete);
      onUpdate({
        ...calendar,
        events: calendar.events.filter((e) => e.id !== eventToDelete),
      });
      if (eventToDeleteObj) {
        toastManager.success(`Evento "${eventToDeleteObj.title}" eliminado correctamente`);
      }
      setEventToDelete(null);
    }
    setShowDeleteEventConfirm(false);
  };

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(calendar.id)}
            className="mt-1 w-5 h-5 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700"
          />

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{calendar.name}</h3>
            {calendar.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{calendar.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleEditCalendar}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            title="Editar calendario"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDeleteCalendarConfirm(true)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Eliminar calendario"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{calendar.events.length} eventos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" style={{ backgroundColor: calendar.color }} />
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
              <div
                key={event.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => handleEditEvent(event)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                      <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                    )}
                    {event.category && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                        {event.category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(event.id);
                    }}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                    title="Eliminar evento"
                  >
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

          <button
            onClick={handleAddEvent}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-blue-600 dark:text-blue-400 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Evento</span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {isListView ? (
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          {cardContent}
        </div>
      ) : (
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          {cardContent}
        </div>
      )}

      {showEventModal && (
        <CreateEventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setEventToEdit(null);
          }}
          onSave={handleSaveEvent}
          eventToEdit={eventToEdit}
          calendarColor={calendar.color}
        />
      )}

      {showDeleteEventConfirm && (
        <ConfirmModal
          isOpen={showDeleteEventConfirm}
          title="Eliminar Evento"
          message="¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer."
          type="danger"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteEvent}
          onCancel={() => {
            setShowDeleteEventConfirm(false);
            setEventToDelete(null);
          }}
        />
      )}

      {showDeleteCalendarConfirm && (
        <ConfirmModal
          isOpen={showDeleteCalendarConfirm}
          title="Eliminar Calendario"
          message={`¿Estás seguro de que deseas eliminar el calendario "${calendar.name}"? Todos los eventos asociados también se eliminarán. Esta acción no se puede deshacer.`}
          type="danger"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={() => {
            onDelete(calendar.id);
            setShowDeleteCalendarConfirm(false);
          }}
          onCancel={() => setShowDeleteCalendarConfirm(false)}
        />
      )}
    </>
  );
};
