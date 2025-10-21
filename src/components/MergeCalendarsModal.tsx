import React, { useState } from 'react';
import { PersonalCalendar, PersonalEvent, Schedule, TimeSlot } from '../types/schedule';
import { X, Merge, Calendar, AlertCircle } from 'lucide-react';
import { WeeklyCalendar } from './WeeklyCalendar';

interface MergeCalendarsModalProps {
  calendars: PersonalCalendar[];
  onClose: () => void;
  onMerge: (merged: PersonalCalendar) => void;
  academicSchedule?: Schedule;
}

export const MergeCalendarsModal: React.FC<MergeCalendarsModalProps> = ({ calendars, onClose, onMerge, academicSchedule }) => {
  const [mergedName, setMergedName] = useState(`Calendario Fusionado ${new Date().toLocaleDateString()}`);
  const [mergedDescription, setMergedDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4F46E5');
  const [conflicts, setConflicts] = useState<string[]>([]);

  const checkTimeConflicts = (events: PersonalEvent[]): string[] => {
    const conflictList: string[] = [];
    const timeSlotMap: { [key: string]: string[] } = {};

    events.forEach((event) => {
      event.timeSlots.forEach((slot) => {
        const key = `${slot.day}-${slot.startTime}-${slot.endTime}`;
        if (!timeSlotMap[key]) {
          timeSlotMap[key] = [];
        }
        timeSlotMap[key].push(event.title);
      });
    });

    Object.entries(timeSlotMap).forEach(([key, eventTitles]) => {
      if (eventTitles.length > 1) {
        const [day, start, end] = key.split('-');
        conflictList.push(`${day} ${start}-${end}: ${eventTitles.join(', ')}`);
      }
    });

    return conflictList;
  };

  const handleMerge = () => {
    const allEvents: PersonalEvent[] = [];

    calendars.forEach((cal) => {
      cal.events.forEach((event) => {
        allEvents.push({
          ...event,
          id: `merged-${event.id}`,
        });
      });
    });

    const detectedConflicts = checkTimeConflicts(allEvents);

    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      return;
    }

    const merged: PersonalCalendar = {
      id: `merged-${Date.now()}`,
      name: mergedName,
      description: mergedDescription,
      events: allEvents,
      color: selectedColor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onMerge(merged);
  };

  const totalEvents = calendars.reduce((sum, cal) => sum + cal.events.length, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center space-x-3">
            <Merge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fusionar Calendarios</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Calendarios a fusionar</h3>
            <div className="space-y-2">
              {calendars.map((cal) => (
                <div key={cal.id} className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: cal.color }} />
                  <span className="text-blue-800 dark:text-blue-200 font-medium">{cal.name}</span>
                  <span className="text-blue-600 dark:text-blue-400 text-sm">({cal.events.length} eventos)</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Total: <span className="font-bold">{totalEvents} eventos</span> de {calendars.length} calendarios
              </p>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Conflictos de horario detectados</h3>
                  <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                    {conflicts.map((conflict, idx) => (
                      <li key={idx}>• {conflict}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-red-700 dark:text-red-300">Por favor, edita los calendarios para resolver estos conflictos antes de fusionar.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del calendario fusionado</label>
              <input type="text" value={mergedName} onChange={(e) => setMergedName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nombre del calendario" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción (opcional)</label>
              <textarea value={mergedDescription} onChange={(e) => setMergedDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Descripción del calendario fusionado" rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color del calendario</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-12 h-12 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{selectedColor}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Vista previa de eventos</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {calendars.map((cal) =>
                cal.events.map((event) => (
                  <div key={event.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                      <span className="font-medium text-gray-900 dark:text-white">{event.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({cal.name})</span>
                    </div>
                    <div className="ml-5 space-y-1">
                      {event.timeSlots.map((slot, idx) => (
                        <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                          {slot.day}: {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900/50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button onClick={handleMerge} disabled={conflicts.length > 0 || !mergedName} className="px-4 py-2 text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
            <Merge className="w-4 h-4" />
            <span>Fusionar Calendarios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
