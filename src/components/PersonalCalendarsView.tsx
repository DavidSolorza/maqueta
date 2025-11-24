import React, { useState, useEffect } from 'react';
import { PersonalCalendar, PersonalEvent } from '../types/schedule';
import { MergeCalendarsModal } from './MergeCalendarsModal';
import { CreateCalendarModal } from './CreateCalendarModal';
import { CreateEventModal } from './CreateEventModal';
import { ConfirmModal } from './ConfirmModal';
import { toastManager } from '../utils/toast';
import { Plus, Merge, Calendar, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { generateCalendarId, generateEventId } from '../utils/personalCalendarStorage';

interface PersonalCalendarsViewProps {
  onBack: () => void;
  onNavigateToReviews?: () => void;
}

export const PersonalCalendarsView: React.FC<PersonalCalendarsViewProps> = ({ onBack, onNavigateToReviews }) => {
  const [calendars, setCalendars] = useState<PersonalCalendar[]>([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [calendarToEdit, setCalendarToEdit] = useState<PersonalCalendar | null>(null);
  const [eventToEdit, setEventToEdit] = useState<PersonalEvent | null>(null);
  const [selectedCalendarForEvent, setSelectedCalendarForEvent] = useState<PersonalCalendar | null>(null);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState<string | null>(null);
  const [showAllCalendars, setShowAllCalendars] = useState(true);

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = () => {
    const stored = localStorage.getItem('personal-calendars');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCalendars(parsed.map((cal: any) => ({
        ...cal,
        createdAt: new Date(cal.createdAt),
        updatedAt: new Date(cal.updatedAt),
      })));
    }
  };

  const saveCalendars = (newCalendars: PersonalCalendar[]) => {
    localStorage.setItem('personal-calendars', JSON.stringify(newCalendars));
    setCalendars(newCalendars);
  };

  const handleCreateCalendar = () => {
    setCalendarToEdit(null);
    setShowCreateModal(true);
  };

  const handleEditCalendar = (calendar: PersonalCalendar) => {
    setCalendarToEdit(calendar);
    setShowCreateModal(true);
  };

  const handleSaveCalendar = (calendarData: Omit<PersonalCalendar, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (calendarToEdit) {
      // Edit existing calendar
      const updated: PersonalCalendar = {
        ...calendarToEdit,
        ...calendarData,
        updatedAt: new Date(),
      };
      saveCalendars(calendars.map((cal) => (cal.id === calendarToEdit.id ? updated : cal)));
      toastManager.success(`Calendario "${updated.name}" actualizado correctamente`);
    } else {
      // Create new calendar
      const newCalendar: PersonalCalendar = {
        id: generateCalendarId(),
        ...calendarData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      saveCalendars([...calendars, newCalendar]);
      toastManager.success(`Calendario "${newCalendar.name}" creado correctamente`);
    }
    setShowCreateModal(false);
    setCalendarToEdit(null);
  };

  const handleDeleteCalendar = (id: string) => {
    setCalendarToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCalendar = () => {
    if (calendarToDelete) {
      const calendarToDeleteObj = calendars.find((cal) => cal.id === calendarToDelete);
      saveCalendars(calendars.filter((cal) => cal.id !== calendarToDelete));
      setSelectedCalendars(selectedCalendars.filter((calId) => calId !== calendarToDelete));
      if (calendarToDeleteObj) {
        toastManager.success(`Calendario "${calendarToDeleteObj.name}" eliminado correctamente`);
      }
      setCalendarToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const handleAddEventToCalendar = (calendar: PersonalCalendar) => {
    setSelectedCalendarForEvent(calendar);
    setEventToEdit(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (calendar: PersonalCalendar, event: PersonalEvent) => {
    setSelectedCalendarForEvent(calendar);
    setEventToEdit(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = (eventData: Omit<PersonalEvent, 'id'>) => {
    if (!selectedCalendarForEvent) return;

    if (eventToEdit) {
      // Edit existing event
      const updated: PersonalEvent = {
        ...eventToEdit,
        ...eventData,
      };
      const updatedCalendar: PersonalCalendar = {
        ...selectedCalendarForEvent,
        events: selectedCalendarForEvent.events.map((e) => (e.id === eventToEdit.id ? updated : e)),
        updatedAt: new Date(),
      };
      saveCalendars(calendars.map((cal) => (cal.id === selectedCalendarForEvent.id ? updatedCalendar : cal)));
      toastManager.success(`Evento "${updated.title}" actualizado correctamente`);
    } else {
      // Create new event
      const newEvent: PersonalEvent = {
        id: generateEventId(),
        ...eventData,
      };
      const updatedCalendar: PersonalCalendar = {
        ...selectedCalendarForEvent,
        events: [...selectedCalendarForEvent.events, newEvent],
        updatedAt: new Date(),
      };
      saveCalendars(calendars.map((cal) => (cal.id === selectedCalendarForEvent.id ? updatedCalendar : cal)));
      toastManager.success(`Evento "${newEvent.title}" agregado al calendario`);
    }
    setShowEventModal(false);
    setEventToEdit(null);
    setSelectedCalendarForEvent(null);
  };

  const handleDeleteEvent = (calendarId: string, eventId: string) => {
    const calendar = calendars.find((c) => c.id === calendarId);
    if (!calendar) return;

    const event = calendar.events.find((e) => e.id === eventId);
    if (!event) return;

    const updatedCalendar: PersonalCalendar = {
      ...calendar,
      events: calendar.events.filter((e) => e.id !== eventId),
      updatedAt: new Date(),
    };
    saveCalendars(calendars.map((cal) => (cal.id === calendarId ? updatedCalendar : cal)));
    toastManager.success(`Evento "${event.title}" eliminado correctamente`);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedCalendars((prev) => (prev.includes(id) ? prev.filter((calId) => calId !== id) : [...prev, id]));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8 sm:mb-12 animate-fade-in px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-brand-blue-900 via-brand-blue-700 to-brand-orange-500 bg-clip-text text-transparent animate-gradient">
          Calendarios Personales
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
          Organiza tus eventos personales y crea calendarios personalizados.
          <span className="block mt-2 text-brand-orange-500 font-semibold">Gestiona tu tiempo de forma inteligente</span>
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Configurar Calendarios</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={handleCreateCalendar} className="flex items-center justify-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-brand-blue-900 to-brand-blue-800 text-white rounded-xl hover:from-brand-blue-800 hover:to-brand-blue-700 transition-all duration-300 shadow-lg shadow-brand-blue-900/30 hover:shadow-xl hover:shadow-brand-blue-900/40 transform hover:scale-105 text-sm sm:text-base">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold">Agregar calendario</span>
            </button>
            {selectedCalendars.length >= 2 && (
              <button onClick={() => setShowMergeModal(true)} className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors shadow-sm hover:shadow-md text-sm sm:text-base">
                <Merge className="w-4 h-4" />
                <span>Fusionar ({selectedCalendars.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Calendarios registrados ({calendars.length})</h3>
          {calendars.length > 5 && (
            <button onClick={() => setShowAllCalendars(!showAllCalendars)} className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
              {showAllCalendars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAllCalendars ? 'Ocultar algunas' : 'Mostrar todas'}</span>
            </button>
          )}
        </div>

        {/* All Calendars Display */}
        <div className="mb-6">
          {calendars.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-2 sm:p-5">
              {(showAllCalendars ? calendars : calendars.slice(0, 6)).map((calendar) => (
                <div
                  key={calendar.id}
                  className="border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 cursor-pointer card-hover group"
                  onClick={() => handleEditCalendar(calendar)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedCalendars.includes(calendar.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelection(calendar.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700 cursor-pointer"
                        title="Seleccionar para fusionar"
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-md flex-shrink-0"
                        style={{ backgroundColor: calendar.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {calendar.name}
                          </span>
                          {selectedCalendars.includes(calendar.id) && (
                            <span className="px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                              Seleccionado
                            </span>
                          )}
                        </div>
                        {calendar.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1" title={calendar.description}>
                            {calendar.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCalendar(calendar);
                        }}
                        className="p-1.5 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar calendario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCalendar(calendar.id);
                        }}
                        className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar calendario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Stats */}
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {calendar.events.length} evento
                        {calendar.events.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>
                        Creado: {new Date(calendar.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Events Preview */}
                  {calendar.events.length > 0 && (
                    <div className="mb-3">
                      <div className="space-y-2">
                        {calendar.events.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(calendar, event);
                            }}
                          >
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: event.color }}
                              />
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                {event.title}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(calendar.id, event.id);
                              }}
                              className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ml-2"
                              title="Eliminar evento"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {calendar.events.length > 3 && (
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400 py-1">
                            +{calendar.events.length - 3} evento{calendar.events.length - 3 !== 1 ? 's' : ''} más
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add Event Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddEventToCalendar(calendar);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-blue-600 dark:text-blue-400 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar evento</span>
                  </button>
                </div>
              ))}

              {!showAllCalendars && calendars.length > 6 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:shadow-md transition-all duration-200">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">+{calendars.length - 6} calendarios más</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay calendarios registrados</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Crea tu primer calendario personal para comenzar</p>
            </div>
          )}
        </div>

        {calendars.length > 0 && (
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleCreateCalendar}
              className="w-full max-w-md flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar otro calendario</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCalendarModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setCalendarToEdit(null);
          }}
          onSave={handleSaveCalendar}
          calendarToEdit={calendarToEdit}
        />
      )}

      {showEventModal && selectedCalendarForEvent && (
        <CreateEventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setEventToEdit(null);
            setSelectedCalendarForEvent(null);
          }}
          onSave={handleSaveEvent}
          eventToEdit={eventToEdit}
          calendarColor={selectedCalendarForEvent.color}
        />
      )}

      {showMergeModal && (
        <MergeCalendarsModal
          calendars={calendars.filter((cal) => selectedCalendars.includes(cal.id))}
          onClose={() => setShowMergeModal(false)}
          onMerge={(merged) => {
            saveCalendars([...calendars, merged]);
            setSelectedCalendars([]);
            setShowMergeModal(false);
            toastManager.success(`Calendario fusionado "${merged.name}" creado correctamente`);
          }}
        />
      )}

      {showDeleteConfirm && calendarToDelete && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Eliminar Calendario"
          message={`¿Estás seguro de que deseas eliminar el calendario "${calendars.find((c) => c.id === calendarToDelete)?.name}"? Todos los eventos asociados también se eliminarán. Esta acción no se puede deshacer.`}
          type="danger"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteCalendar}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setCalendarToDelete(null);
          }}
        />
      )}
    </div>
  );
};
