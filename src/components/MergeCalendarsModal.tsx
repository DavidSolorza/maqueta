import React, { useState, useEffect } from 'react';
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

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const checkTimeConflicts = (events: PersonalEvent[]): string[] => {
    const conflictList: string[] = [];
    const processedPairs = new Set<string>();

    // Check each pair of events for overlaps
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        // Check all time slots of event1 against all time slots of event2
        event1.timeSlots.forEach((slot1) => {
          event2.timeSlots.forEach((slot2) => {
            // Only check if they're on the same day
            if (slot1.day === slot2.day) {
              const start1 = timeToMinutes(slot1.startTime);
              const end1 = timeToMinutes(slot1.endTime);
              const start2 = timeToMinutes(slot2.startTime);
              const end2 = timeToMinutes(slot2.endTime);

              // Check for overlap: (start1 < end2) && (start2 < end1)
              if (start1 < end2 && start2 < end1) {
                const pairKey = [event1.title, event2.title].sort().join('|');
                if (!processedPairs.has(pairKey)) {
                  processedPairs.add(pairKey);
                  
                  // Determine overlap details
                  const overlapStart = Math.max(start1, start2);
                  const overlapEnd = Math.min(end1, end2);
                  const overlapStartStr = `${Math.floor(overlapStart / 60).toString().padStart(2, '0')}:${(overlapStart % 60).toString().padStart(2, '0')}`;
                  const overlapEndStr = `${Math.floor(overlapEnd / 60).toString().padStart(2, '0')}:${(overlapEnd % 60).toString().padStart(2, '0')}`;
                  
                  conflictList.push(
                    `${slot1.day}: "${event1.title}" (${slot1.startTime}-${slot1.endTime}) se cruza con "${event2.title}" (${slot2.startTime}-${slot2.endTime}) → Solapamiento: ${overlapStartStr}-${overlapEndStr}`
                  );
                }
              }
            }
          });
        });
      }
    }

    return conflictList;
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    // Check for conflicts whenever calendars change
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
    setConflicts(detectedConflicts);
  }, [calendars]);

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
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center z-[9999] p-2 sm:p-4 pt-20 sm:pt-[100px]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col relative z-[10000] m-2 sm:m-0">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Merge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fusionar Calendarios</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Calendarios a fusionar</h3>
            <div className="space-y-2">
              {calendars.map((cal) => (
                <div key={cal.id} className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" style={{ backgroundColor: cal.color }} />
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

          {conflicts.length > 0 ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">⚠️ Conflictos de horario detectados</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    Se encontraron {conflicts.length} conflicto{conflicts.length !== 1 ? 's' : ''} de horario entre los eventos de los calendarios seleccionados.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-red-200 dark:border-red-700 max-h-60 overflow-y-auto">
                    <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                      {conflicts.map((conflict, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-red-500 dark:text-red-400 mt-0.5">•</span>
                          <span className="flex-1">{conflict}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-3 text-sm text-red-700 dark:text-red-300 font-medium">
                    Puedes fusionar de todas formas, pero los eventos con conflictos aparecerán superpuestos en el calendario.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-900 dark:text-green-300 mb-1">✅ Sin conflictos de horario</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    No se detectaron conflictos de horario entre los eventos de los calendarios seleccionados. Puedes fusionar sin problemas.
                  </p>
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

        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 bg-gray-50 rounded-b-xl sm:rounded-b-2xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleMerge} 
            disabled={!mergedName} 
            className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
              conflicts.length > 0 
                ? 'bg-yellow-600 dark:bg-yellow-700 hover:bg-yellow-700 dark:hover:bg-yellow-800' 
                : 'bg-brand-blue-900 dark:bg-brand-blue-800 hover:bg-brand-blue-800 dark:hover:bg-brand-blue-700'
            }`}
          >
            <Merge className="w-4 h-4" />
            <span>{conflicts.length > 0 ? 'Fusionar de todas formas' : 'Fusionar Calendarios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
