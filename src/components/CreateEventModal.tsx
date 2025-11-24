import React, { useState, useEffect } from 'react';
import { PersonalEvent, TimeSlot } from '../types/schedule';
import { X, Save, Clock, Plus, Trash2, Palette } from 'lucide-react';
import { toastManager } from '../utils/toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<PersonalEvent, 'id'>) => void;
  eventToEdit?: PersonalEvent | null;
  calendarColor?: string;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const SUGGESTED_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

const EVENT_TEMPLATES = [
  { title: 'Reunión', color: '#3B82F6', icon: '👥' },
  { title: 'Clase', color: '#10B981', icon: '📚' },
  { title: 'Ejercicio', color: '#EF4444', icon: '🏋️' },
  { title: 'Descanso', color: '#8B5CF6', icon: '😴' },
  { title: 'Comida', color: '#F59E0B', icon: '🍽️' },
  { title: 'Trabajo', color: '#6366F1', icon: '💼' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eventToEdit,
  calendarColor = '#3B82F6',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState(calendarColor);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setCategory(eventToEdit.category || '');
      setColor(eventToEdit.color);
      setTimeSlots(eventToEdit.timeSlots);
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setColor(calendarColor);
      setTimeSlots([]);
      setShowTemplates(false);
    }
  }, [eventToEdit, calendarColor, isOpen]);

  const handleSave = () => {
    if (!title.trim()) {
      toastManager.error('Por favor ingresa un título para el evento');
      return;
    }

    if (timeSlots.length === 0) {
      toastManager.error('Por favor agrega al menos un horario para el evento');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      color,
      timeSlots,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('');
    setColor(calendarColor);
    setTimeSlots([]);
    setShowTemplates(false);
    onClose();
  };

  const handleAddTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      {
        day: 'Lunes',
        startTime: '09:00',
        endTime: '10:00',
      },
    ]);
  };

  const handleUpdateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (template: typeof EVENT_TEMPLATES[0]) => {
    setTitle(template.title);
    setColor(template.color);
    setShowTemplates(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center z-[9999] p-4 pt-32"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative z-[10000]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {eventToEdit ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {eventToEdit ? 'Modifica los detalles del evento' : 'Agrega un nuevo evento a tu calendario'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Templates Section */}
          {!eventToEdit && (
            <div>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-300">
                    Usar una plantilla rápida
                  </span>
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {showTemplates ? 'Ocultar' : 'Mostrar'}
                </span>
              </button>

              {showTemplates && (
                <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-3">
                  {EVENT_TEMPLATES.map((template) => (
                    <button
                      key={template.title}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all bg-white dark:bg-gray-800 text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-2xl">{template.icon}</span>
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                          style={{ backgroundColor: template.color }}
                        />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {template.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título del evento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Reunión de equipo, Clase de matemáticas..."
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agrega detalles adicionales sobre el evento..."
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría (opcional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Trabajo, Personal, Estudio..."
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Color del evento
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <Palette className="w-5 h-5 text-gray-400 absolute -top-1 -right-1" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_COLORS.map((suggestedColor) => (
                      <button
                        key={suggestedColor}
                        onClick={() => setColor(suggestedColor)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          color === suggestedColor
                            ? 'border-gray-900 dark:border-white scale-110 shadow-lg'
                            : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        }`}
                        style={{ backgroundColor: suggestedColor }}
                        title={suggestedColor}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Horarios <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={handleAddTimeSlot}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar horario</span>
                </button>
              </div>

              {timeSlots.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                  <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No hay horarios agregados. Haz clic en "Agregar horario" para comenzar.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <select
                        value={slot.day}
                        onChange={(e) => handleUpdateTimeSlot(index, 'day', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleUpdateTimeSlot(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500 dark:text-gray-400 font-medium">-</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleUpdateTimeSlot(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleRemoveTimeSlot(index)}
                        className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar horario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista previa:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {title || 'Título del evento'}
                  </h3>
                </div>
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">{description}</p>
                )}
                {timeSlots.length > 0 && (
                  <div className="ml-7 space-y-1">
                    {timeSlots.map((slot, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {slot.day}: {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || timeSlots.length === 0}
            className="px-4 py-2 text-white bg-brand-blue-900 dark:bg-brand-blue-800 rounded-lg hover:bg-brand-blue-800 dark:hover:bg-brand-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{eventToEdit ? 'Guardar Cambios' : 'Crear Evento'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

