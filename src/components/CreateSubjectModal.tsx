import React, { useState, useEffect } from 'react';
import { Subject, TimeSlot, Professor } from '../types/schedule';
import { X, Save, Palette, BookOpen, Clock, User, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { ScheduleGenerator } from '../utils/scheduleGenerator';
import { toastManager } from '../utils/toast';
import { ConfirmModal } from './ConfirmModal';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Omit<Subject, 'id'>) => void;
  subjectToEdit?: Subject | null;
  existingSubjects?: Subject[];
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

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
  '#06B6D4', // Cyan
];

const SUBJECT_TEMPLATES = [
  {
    name: 'Matemáticas',
    code: 'MAT',
    credits: 4,
    color: '#3B82F6',
    icon: '📐',
  },
  {
    name: 'Programación',
    code: 'CS',
    credits: 3,
    color: '#10B981',
    icon: '💻',
  },
  {
    name: 'Física',
    code: 'FIS',
    credits: 4,
    color: '#F59E0B',
    icon: '⚛️',
  },
  {
    name: 'Química',
    code: 'QUI',
    credits: 3,
    color: '#8B5CF6',
    icon: '🧪',
  },
  {
    name: 'Historia',
    code: 'HIS',
    credits: 2,
    color: '#EF4444',
    icon: '📜',
  },
  {
    name: 'Idiomas',
    code: 'IDI',
    credits: 2,
    color: '#EC4899',
    icon: '🌍',
  },
];

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjectToEdit,
  existingSubjects = [],
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(3);
  const [professorName, setProfessorName] = useState('');
  const [professorRating, setProfessorRating] = useState(0);
  const [color, setColor] = useState('#3B82F6');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code);
      setCredits(subjectToEdit.credits);
      setProfessorName(subjectToEdit.professors[0]?.name || '');
      setProfessorRating(subjectToEdit.professors[0]?.rating || 0);
      setColor(subjectToEdit.color);
      setTimeSlots(subjectToEdit.timeSlots);
      setShowTemplates(false);
    } else {
      setName('');
      setCode('');
      setCredits(3);
      setProfessorName('');
      setProfessorRating(0);
      setColor('#3B82F6');
      setTimeSlots([]);
      setShowTemplates(false);
      setConflicts([]);
      setShowConflictWarning(false);
    }
  }, [subjectToEdit, isOpen]);

  // Check for conflicts when time slots change
  useEffect(() => {
    if (timeSlots.length > 0 && name && code) {
      const tempSubject: Subject = {
        id: 'temp',
        name,
        code,
        credits,
        professors: professorName ? [{ id: 'temp', name: professorName, rating: professorRating }] : [],
        timeSlots,
        color,
      };

      const otherSubjects = subjectToEdit
        ? existingSubjects.filter((s) => s.id !== subjectToEdit.id)
        : existingSubjects;

      const generator = new ScheduleGenerator([]);
      const conflictMessages = generator.checkSubjectConflicts(tempSubject, otherSubjects);
      setConflicts(conflictMessages);
      setShowConflictWarning(conflictMessages.length > 0);
    } else {
      setConflicts([]);
      setShowConflictWarning(false);
    }
  }, [timeSlots, name, code, credits, professorName, professorRating, color, existingSubjects, subjectToEdit]);

  const handleSave = () => {
    if (!name.trim()) {
      toastManager.error('Por favor ingresa un nombre para la materia');
      return;
    }

    if (!code.trim()) {
      toastManager.error('Por favor ingresa un código para la materia');
      return;
    }

    if (timeSlots.length === 0) {
      toastManager.error('Por favor agrega al menos un horario para la materia');
      return;
    }

    // Check for duplicates
    const isDuplicate = existingSubjects.some(
      (s) =>
        (s.code.toLowerCase() === code.toLowerCase().trim() && (!subjectToEdit || s.id !== subjectToEdit.id)) ||
        (s.name.toLowerCase() === name.toLowerCase().trim() && s.code !== code && (!subjectToEdit || s.id !== subjectToEdit.id))
    );

    if (isDuplicate) {
      toastManager.warning(`La materia ${code} - ${name} ya está registrada. Por favor usa un código o nombre diferente.`);
      return;
    }

    if (conflicts.length > 0) {
      setPendingSave(true);
      setShowConfirmModal(true);
      return;
    }

    performSave();
  };

  const performSave = () => {

    const professors: Professor[] = professorName
      ? [{ id: `prof-${Date.now()}`, name: professorName, rating: professorRating || undefined }]
      : [];

    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits,
      professors,
      timeSlots,
      color,
    });

    // Reset form
    setName('');
    setCode('');
    setCredits(3);
    setProfessorName('');
    setProfessorRating(0);
    setColor('#3B82F6');
    setTimeSlots([]);
    setShowTemplates(false);
    setConflicts([]);
    setShowConflictWarning(false);
    setPendingSave(false);
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

  const handleTemplateSelect = (template: typeof SUBJECT_TEMPLATES[0]) => {
    setName(template.name);
    setCode(template.code);
    setCredits(template.credits);
    setColor(template.color);
    setShowTemplates(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {subjectToEdit ? 'Editar Materia' : 'Nueva Materia'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subjectToEdit ? 'Modifica los detalles de la materia' : 'Agrega una nueva materia universitaria'}
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Templates Section */}
          {!subjectToEdit && (
            <div>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-300">
                    Usar una plantilla rápida
                  </span>
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {showTemplates ? 'Ocultar' : 'Mostrar'}
                </span>
              </button>

              {showTemplates && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SUBJECT_TEMPLATES.map((template) => (
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
                        {template.code} • {template.credits} créditos
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conflict Warning */}
          {showConflictWarning && conflicts.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">
                    ⚠️ Conflictos de Horario Detectados
                  </h3>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    {conflicts.map((conflict, index) => (
                      <li key={index}>• {conflict}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                    Esta materia tendrá choques de horarios con otras materias existentes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la materia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Cálculo Diferencial"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: MAT101"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Créditos
                </label>
                <input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color de la materia
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <Palette className="w-4 h-4 text-gray-400 absolute -top-1 -right-1" />
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {SUGGESTED_COLORS.map((suggestedColor) => (
                      <button
                        key={suggestedColor}
                        onClick={() => setColor(suggestedColor)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
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

            {/* Professor Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profesor (opcional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={professorName}
                  onChange={(e) => setProfessorName(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del profesor"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={professorRating}
                    onChange={(e) => setProfessorRating(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="5"
                    step="0.1"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Calificación (0-5)"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">⭐</span>
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
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Vista previa:</p>
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {code || 'CÓDIGO'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                      {credits}c
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {name || 'Nombre de la materia'}
                  </p>
                </div>
              </div>
              {professorName && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <User className="w-4 h-4" />
                  <span>
                    {professorName}
                    {professorRating > 0 && ` ⭐ ${professorRating}`}
                  </span>
                </div>
              )}
              {timeSlots.length > 0 && (
                <div className="space-y-1">
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

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !code.trim() || timeSlots.length === 0}
            className="px-4 py-2 text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{subjectToEdit ? 'Guardar Cambios' : 'Crear Materia'}</span>
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmModal
          isOpen={showConfirmModal}
          title="🚨 Conflicto de Horarios Detectado"
          message={`Esta materia generará choques de horarios con otras materias existentes:\n\n${conflicts.join('\n\n')}\n\n⚠️ ADVERTENCIA: Esto puede limitar las combinaciones válidas de horarios.\n\n¿Deseas agregar la materia de todas formas?`}
          type="warning"
          confirmText="Agregar de todas formas"
          cancelText="Cancelar"
          onConfirm={() => {
            setShowConfirmModal(false);
            performSave();
          }}
          onCancel={() => {
            setShowConfirmModal(false);
            setPendingSave(false);
          }}
        />
      )}
    </div>
  );
};

