import React, { useState, useEffect } from 'react';
import { PersonalCalendar } from '../types/schedule';
import { X, Save, Palette, Sparkles } from 'lucide-react';
import { toastManager } from '../utils/toast';

interface CreateCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (calendar: Omit<PersonalCalendar, 'id' | 'createdAt' | 'updatedAt'>) => void;
  calendarToEdit?: PersonalCalendar | null;
}

const SUGGESTED_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

const CALENDAR_TEMPLATES = [
  {
    name: 'Trabajo',
    description: 'Horarios de trabajo y reuniones',
    color: '#3B82F6',
    icon: '💼',
  },
  {
    name: 'Estudio',
    description: 'Horarios de estudio y tareas',
    color: '#10B981',
    icon: '📚',
  },
  {
    name: 'Ejercicio',
    description: 'Rutinas de ejercicio y deportes',
    color: '#EF4444',
    icon: '🏋️',
  },
  {
    name: 'Personal',
    description: 'Actividades personales y tiempo libre',
    color: '#8B5CF6',
    icon: '⭐',
  },
  {
    name: 'Social',
    description: 'Eventos sociales y reuniones',
    color: '#EC4899',
    icon: '🎉',
  },
];

export const CreateCalendarModal: React.FC<CreateCalendarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  calendarToEdit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
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
    if (calendarToEdit) {
      setName(calendarToEdit.name);
      setDescription(calendarToEdit.description || '');
      setColor(calendarToEdit.color);
    } else {
      setName('');
      setDescription('');
      setColor('#3B82F6');
      setShowTemplates(false);
    }
  }, [calendarToEdit, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      toastManager.error('Por favor ingresa un nombre para el calendario');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      events: calendarToEdit?.events || [],
    });

    // Reset form
    setName('');
    setDescription('');
    setColor('#3B82F6');
    setShowTemplates(false);
    onClose();
  };

  const handleTemplateSelect = (template: typeof CALENDAR_TEMPLATES[0]) => {
    setName(template.name);
    setDescription(template.description);
    setColor(template.color);
    setShowTemplates(false);
  };

  if (!isOpen) return null;

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
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col relative z-[10000] m-2 sm:m-0">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {calendarToEdit ? 'Editar Calendario' : 'Nuevo Calendario'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {calendarToEdit ? 'Modifica los detalles del calendario' : 'Crea un nuevo calendario personal'}
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
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Templates Section */}
          {!calendarToEdit && (
            <div>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-300">
                    Usar una plantilla
                  </span>
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {showTemplates ? 'Ocultar' : 'Mostrar'}
                </span>
              </button>

              {showTemplates && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {CALENDAR_TEMPLATES.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all text-left bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{template.icon}</span>
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                          style={{ backgroundColor: template.color }}
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del calendario <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Trabajo, Estudio, Personal..."
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
                placeholder="Describe el propósito de este calendario..."
                rows={3}
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Color del calendario
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
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Color seleccionado:</span>
                    <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{color}</span>
                  </div>
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

            {/* Preview */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista previa:</p>
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {name || 'Nombre del calendario'}
                  </h3>
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 bg-gray-50 rounded-b-xl sm:rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 text-white bg-brand-blue-900 dark:bg-brand-blue-800 rounded-lg hover:bg-brand-blue-800 dark:hover:bg-brand-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{calendarToEdit ? 'Guardar Cambios' : 'Crear Calendario'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

