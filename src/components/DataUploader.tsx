import React, { useState } from 'react';
import { Subject } from '../types/schedule';
import { ScheduleGenerator } from '../utils/scheduleGenerator';
import { CreateSubjectModal } from './CreateSubjectModal';
import { ConfirmModal } from './ConfirmModal';
import { toastManager } from '../utils/toast';
import { Upload, FileText, Plus, Trash2, Edit, Type, Info, AlertTriangle, Eye, EyeOff, Target, BookOpen } from 'lucide-react';

interface DataUploaderProps {
  onDataSubmit: (subjects: Subject[], targetCount?: number) => void;
}

const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: '1',
    name: 'Cálculo Diferencial',
    code: 'MAT101',
    credits: 4,
    professors: [{ id: 'p1', name: 'Dr. García', rating: 4.5 }],
    timeSlots: [
      { day: 'Lunes', startTime: '08:00', endTime: '10:00' },
      { day: 'Miércoles', startTime: '08:00', endTime: '10:00' },
    ],
    color: '#3b82f6',
  },
  {
    id: '2',
    name: 'Programación I',
    code: 'CS101',
    credits: 3,
    professors: [{ id: 'p2', name: 'Ing. López', rating: 4.2 }],
    timeSlots: [
      { day: 'Martes', startTime: '10:00', endTime: '12:00' },
      { day: 'Jueves', startTime: '10:00', endTime: '12:00' },
    ],
    color: '#10b981',
  },
  {
    id: '3',
    name: 'Física General',
    code: 'FIS101',
    credits: 4,
    professors: [{ id: 'p3', name: 'Dr. Martínez', rating: 3.8 }],
    timeSlots: [
      { day: 'Lunes', startTime: '14:00', endTime: '16:00' },
      { day: 'Viernes', startTime: '08:00', endTime: '10:00' },
    ],
    color: '#f59e0b',
  },
  {
    id: '4',
    name: 'Química Orgánica',
    code: 'QUI201',
    credits: 3,
    professors: [{ id: 'p4', name: 'Dra. Rodríguez', rating: 4.7 }],
    timeSlots: [
      { day: 'Martes', startTime: '14:00', endTime: '17:00' },
      { day: 'Jueves', startTime: '14:00', endTime: '16:00' },
    ],
    color: '#8b5cf6',
  },
  {
    id: '5',
    name: 'Historia Universal',
    code: 'HIS101',
    credits: 2,
    professors: [{ id: 'p5', name: 'Prof. Hernández', rating: 4.0 }],
    timeSlots: [{ day: 'Miércoles', startTime: '16:00', endTime: '18:00' }],
    color: '#ef4444',
  },
  {
    id: '6',
    name: 'Inglés Técnico',
    code: 'ENG201',
    credits: 2,
    professors: [{ id: 'p6', name: 'Prof. Smith', rating: 4.3 }],
    timeSlots: [{ day: 'Viernes', startTime: '10:00', endTime: '12:00' }],
    color: '#06b6d4',
  },
];

export default function DataUploader({ onDataSubmit }: DataUploaderProps) {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('university-schedule-subjects');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [targetSubjectCount, setTargetSubjectCount] = useState<number | undefined>(undefined);
  const [showAllSubjects, setShowAllSubjects] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [showTextInputConfirm, setShowTextInputConfirm] = useState(false);
  const [pendingTextInput, setPendingTextInput] = useState<string>('');

  React.useEffect(() => {
    localStorage.setItem('university-schedule-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const validateAndAddSubject = (newSubject: Subject) => {
    // Check for duplicates
    const isDuplicate = subjects.some((s) => s.code.toLowerCase() === newSubject.code.toLowerCase() || (s.name.toLowerCase() === newSubject.name.toLowerCase() && s.code !== newSubject.code));

    if (isDuplicate) {
      toastManager.warning(`La materia ${newSubject.code} - ${newSubject.name} ya está registrada. No se agregará para evitar duplicados.`);
      return false;
    }

    // Check for conflicts
    const generator = new ScheduleGenerator([]);
    const conflictMessages = generator.checkSubjectConflicts(newSubject, subjects);

    if (conflictMessages.length > 0) {
      setConflicts(conflictMessages);
      // Note: Conflicts are now handled in CreateSubjectModal
      return true; // Allow adding with conflicts, user will be warned in modal
    }

    setConflicts([]);
    return true;
  };

  const handleUseSampleData = () => {
    // Remove duplicates and validate each subject
    const validSubjects: Subject[] = [];

    SAMPLE_SUBJECTS.forEach((sampleSubject) => {
      if (validateAndAddSubject(sampleSubject)) {
        validSubjects.push(sampleSubject);
      }
    });

    setSubjects([...subjects, ...validSubjects]);
  };

  const handleSubmit = () => {
    if (subjects.length === 0) {
      toastManager.warning('Por favor agrega al menos una materia');
      return;
    }

    if (targetSubjectCount && targetSubjectCount > subjects.length) {
      toastManager.error(`No puedes generar horarios con ${targetSubjectCount} materias cuando solo tienes ${subjects.length} registradas.`);
      return;
    }

    onDataSubmit(subjects, targetSubjectCount);
  };

  const handleCreateSubject = () => {
    setSubjectToEdit(null);
    setShowSubjectModal(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSubjectToEdit(subject);
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (subjectData: Omit<Subject, 'id'>) => {
    if (subjectToEdit) {
      // Edit existing subject
      const updated: Subject = {
        ...subjectToEdit,
        ...subjectData,
      };
      setSubjects(subjects.map((s) => (s.id === subjectToEdit.id ? updated : s)));
    } else {
      // Create new subject
      const newSubject: Subject = {
        id: Date.now().toString(),
        ...subjectData,
      };
      setSubjects([...subjects, newSubject]);
    }
    setShowSubjectModal(false);
    setSubjectToEdit(null);
    setConflicts([]);
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjectToDelete(subjectId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSubject = () => {
    if (subjectToDelete) {
      setSubjects(subjects.filter((s) => s.id !== subjectToDelete));
      setConflicts([]);
      toastManager.success('Materia eliminada correctamente');
      setSubjectToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const parseTextInput = () => {
    try {
      const lines = textInput
        .trim()
        .split('\n')
        .filter((line) => line.trim());
      const parsedSubjects: Subject[] = [];
      const duplicateSubjects: string[] = [];
      const conflictSubjects: string[] = [];
      const generator = new ScheduleGenerator([]);

      lines.forEach((line, index) => {
        const parts = line.split('|').map((part) => part.trim());

        if (parts.length < 4) {
          throw new Error(`Línea ${index + 1}: Formato incorrecto. Se requieren al menos 4 campos separados por |`);
        }

        const [code, name, creditsStr, ...schedulesParts] = parts;
        const credits = parseInt(creditsStr);

        if (isNaN(credits)) {
          throw new Error(`Línea ${index + 1}: Los créditos deben ser un número`);
        }

        const timeSlots = schedulesParts.map((schedulePart) => {
          const scheduleMatch = schedulePart.match(/(\w+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
          if (!scheduleMatch) {
            throw new Error(`Línea ${index + 1}: Formato de horario incorrecto en "${schedulePart}". Use: Día HH:MM-HH:MM`);
          }

          const [, day, startTime, endTime] = scheduleMatch;
          return { day, startTime, endTime };
        });

        const subject: Subject = {
          id: `text-${Date.now()}-${index}`,
          name,
          code,
          credits,
          professors: [{ id: 'prof1', name: 'Profesor', rating: 0 }],
          timeSlots,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        };

        // Check for duplicates in current subjects
        const isDuplicate = subjects.some((s) => s.code.toLowerCase() === code.toLowerCase());

        if (isDuplicate) {
          duplicateSubjects.push(`${code} - ${name}`);
          return;
        }

        // Check for conflicts
        const conflictMessages = generator.checkSubjectConflicts(subject, [...subjects, ...parsedSubjects]);
        if (conflictMessages.length > 0) {
          conflictSubjects.push(`${code} - ${name}: ${conflictMessages[0]}`);
          return;
        }

        parsedSubjects.push(subject);
      });

      // Show summary of processing
      if (parsedSubjects.length > 0) {
        let message = `✅ ${parsedSubjects.length} materia${parsedSubjects.length !== 1 ? 's' : ''} agregada${parsedSubjects.length !== 1 ? 's' : ''} exitosamente`;
        
        if (duplicateSubjects.length > 0 || conflictSubjects.length > 0) {
          message += `\n\n⚠️ ${duplicateSubjects.length + conflictSubjects.length} materia${duplicateSubjects.length + conflictSubjects.length !== 1 ? 's' : ''} omitida${duplicateSubjects.length + conflictSubjects.length !== 1 ? 's' : ''}`;
        }
        
        toastManager.success(message);
      } else {
        toastManager.warning('No se agregaron materias. Verifica el formato y que no haya duplicados.');
      }

      if (duplicateSubjects.length > 0 || conflictSubjects.length > 0) {
        const details = [];
        if (duplicateSubjects.length > 0) {
          details.push(`${duplicateSubjects.length} duplicada${duplicateSubjects.length !== 1 ? 's' : ''}`);
        }
        if (conflictSubjects.length > 0) {
          details.push(`${conflictSubjects.length} con conflicto${conflictSubjects.length !== 1 ? 's' : ''}`);
        }
        toastManager.info(`Las materias omitidas (${details.join(', ')}) no afectarán la generación de horarios.`);
      }

      setSubjects([...subjects, ...parsedSubjects]);
      setTextInput('');
      setShowTextInput(false);
      setConflicts([]);
    } catch (error) {
      toastManager.error(`Error al procesar texto: ${(error as Error).message}\n\nPor favor revisa el formato y vuelve a intentar.`);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Optimizador de Horarios Universitarios</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Crea horarios universitarios optimizados sin choques y con mínimos huecos</p>
      </div>

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">⚠️ Conflictos de Horario Detectados</h3>
              <ul className="text-sm text-red-800 space-y-1">
                {conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Configurar Materias</h2>
          <div className="flex space-x-3">
            <button onClick={handleUseSampleData} className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors shadow-sm hover:shadow-md">
              <FileText className="w-4 h-4" />
              <span>Usar datos de ejemplo</span>
            </button>
            <button onClick={handleCreateSubject} className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors shadow-sm hover:shadow-md">
              <Plus className="w-4 h-4" />
              <span>Agregar materia</span>
            </button>
            <button onClick={() => setShowTextInput(!showTextInput)} className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors shadow-sm hover:shadow-md">
              <Type className="w-4 h-4" />
              <span>Escribir por texto</span>
            </button>
          </div>
        </div>

        {/* Target Subject Count */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3 mb-3">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-medium text-blue-900 dark:text-blue-300">Número específico de materias (opcional)</h3>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={targetSubjectCount !== undefined} onChange={(e) => setTargetSubjectCount(e.target.checked ? 4 : undefined)} className="rounded border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 bg-white dark:bg-gray-700" />
              <span className="text-blue-800 dark:text-blue-200">Generar horarios con exactamente</span>
            </label>
            {targetSubjectCount !== undefined && <input type="number" value={targetSubjectCount} onChange={(e) => setTargetSubjectCount(parseInt(e.target.value) || 1)} min="1" max={subjects.length} className="w-20 px-2 py-1 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />}
            <span className="text-blue-800 dark:text-blue-200">materias</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">Si no seleccionas esta opción, se generarán horarios con todas las combinaciones posibles (excluyendo horarios de una sola materia).</p>
        </div>

        {showTextInput && (
          <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start space-x-3 mb-4">
              <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Formato de entrada de texto</h3>
                <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                  <p>
                    <strong>Formato:</strong> Código | Nombre | Créditos | Horario1 | Horario2 | ...
                  </p>
                  <p>
                    <strong>Horario:</strong> Día HH:MM-HH:MM
                  </p>
                  <p>
                    <strong>Días válidos:</strong> Lunes, Martes, Miércoles, Jueves, Viernes
                  </p>
                  <p>
                    <strong>Nota:</strong> Se detectarán automáticamente duplicados y conflictos
                  </p>
                </div>
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-purple-200 dark:border-purple-700">
                  <p className="text-xs font-medium text-purple-900 dark:text-purple-300 mb-1">Ejemplo:</p>
                  <code className="text-xs text-purple-800 dark:text-purple-200 block">
                    MAT101 | Cálculo Diferencial | 4 | Lunes 08:00-10:00 | Miércoles 08:00-10:00
                    <br />
                    CS101 | Programación I | 3 | Martes 10:00-12:00 | Jueves 10:00-12:00
                  </code>
                </div>
              </div>
            </div>

            <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} className="w-full h-32 px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm" placeholder="Escribe las materias aquí siguiendo el formato especificado..." />

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setTextInput('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button onClick={parseTextInput} disabled={!textInput.trim()} className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-md hover:bg-purple-700 dark:hover:bg-purple-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                Procesar texto
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Materias registradas ({subjects.length})</h3>
          {subjects.length > 5 && (
            <button onClick={() => setShowAllSubjects(!showAllSubjects)} className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
              {showAllSubjects ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAllSubjects ? 'Ocultar algunas' : 'Mostrar todas'}</span>
            </button>
          )}
        </div>
        {/* All Subjects Display */}
        <div className="mb-6">
          {subjects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-5">
              {(showAllSubjects ? subjects : subjects.slice(0, 6)).map((subject) => (
                <div
                  key={subject.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer"
                  onClick={() => handleEditSubject(subject)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-md flex-shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {subject.code || 'Sin código'}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                            {subject.credits}c
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1" title={subject.name}>
                          {subject.name || 'Sin nombre'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubject(subject);
                        }}
                        className="p-1.5 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar materia"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(subject.id);
                        }}
                        className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar materia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Stats */}
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{subject.credits} créditos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>
                        {subject.timeSlots.length} horario
                        {subject.timeSlots.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Professor Info */}
                  {subject.professors[0]?.name && (
                    <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Prof:</span> {subject.professors[0].name}
                      {subject.professors[0].rating && (
                        <span className="ml-1">⭐ {subject.professors[0].rating}</span>
                      )}
                    </div>
                  )}

                  {/* Time Slots */}
                  <div>
                    <div className="space-y-2">
                      {subject.timeSlots.slice(0, 3).map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {slot.day.slice(0, 3)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      ))}
                      {subject.timeSlots.length > 3 && (
                        <div className="text-xs text-center text-gray-500 dark:text-gray-400 py-1">
                          +{subject.timeSlots.length - 3} horario{subject.timeSlots.length - 3 !== 1 ? 's' : ''} más
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {!showAllSubjects && subjects.length > 6 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:shadow-md transition-all duration-200">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">+{subjects.length - 6} materias más</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Upload className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay materias registradas</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Usa los datos de ejemplo o agrega materias manualmente</p>
            </div>
          )}
        </div>

        {subjects.length > 0 && (
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleCreateSubject}
              className="w-full max-w-md flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar otra materia</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={conflicts.length > 0}
              className="px-8 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Generar Horarios Optimizados
              {targetSubjectCount && ` (${targetSubjectCount} materias)`}
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Subject Modal */}
      {showSubjectModal && (
        <CreateSubjectModal
          isOpen={showSubjectModal}
          onClose={() => {
            setShowSubjectModal(false);
            setSubjectToEdit(null);
          }}
          onSave={handleSaveSubject}
          subjectToEdit={subjectToEdit}
          existingSubjects={subjects}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Eliminar Materia"
          message="¿Estás seguro de que deseas eliminar esta materia? Esta acción no se puede deshacer."
          type="danger"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteSubject}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSubjectToDelete(null);
          }}
        />
      )}
    </div>
  );
}
