import React, { useState } from 'react';
import { Subject } from '../types/schedule';
import { ScheduleGenerator } from '../utils/scheduleGenerator';
import { Upload, FileText, Plus, Trash2, Calendar, User, Clock, Type, Info, AlertTriangle, Eye, EyeOff, Target, BookOpen } from 'lucide-react';

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
  const [showManualForm, setShowManualForm] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [targetSubjectCount, setTargetSubjectCount] = useState<number | undefined>(undefined);
  const [showAllSubjects, setShowAllSubjects] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);

  React.useEffect(() => {
    localStorage.setItem('university-schedule-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const validateAndAddSubject = (newSubject: Subject) => {
    // Check for duplicates
    const isDuplicate = subjects.some((s) => s.code.toLowerCase() === newSubject.code.toLowerCase() || (s.name.toLowerCase() === newSubject.name.toLowerCase() && s.code !== newSubject.code));

    if (isDuplicate) {
      alert(`⚠️ MATERIA DUPLICADA\n\nLa materia ${newSubject.code} - ${newSubject.name} ya está registrada.\n\nNo se agregará para evitar duplicados.`);
      return false;
    }

    // Check for conflicts
    const generator = new ScheduleGenerator([]);
    const conflictMessages = generator.checkSubjectConflicts(newSubject, subjects);

    if (conflictMessages.length > 0) {
      setConflicts(conflictMessages);
      const proceed = window.confirm(`🚨 CONFLICTO DE HORARIOS DETECTADO\n\n${conflictMessages.join('\n\n')}\n\n⚠️ ADVERTENCIA: Esta materia generará choques de horarios y puede limitar las combinaciones válidas.\n\n¿Deseas agregar la materia de todas formas?`);
      if (!proceed) {
        return false;
      }
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
      alert('Por favor agrega al menos una materia');
      return;
    }

    if (targetSubjectCount && targetSubjectCount > subjects.length) {
      alert(`No puedes generar horarios con ${targetSubjectCount} materias cuando solo tienes ${subjects.length} registradas.`);
      return;
    }

    onDataSubmit(subjects, targetSubjectCount);
  };

  const addNewSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      code: '',
      credits: 3,
      professors: [{ id: 'prof1', name: '', rating: 0 }],
      timeSlots: [{ day: 'Lunes', startTime: '08:00', endTime: '10:00' }],
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };
    setSubjects([...subjects, newSubject]);
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const updated = [...subjects];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'professors') {
        updated[index].professors[0] = {
          ...updated[index].professors[0],
          [child]: value,
        };
      }
    } else {
      (updated[index] as any)[field] = value;
    }

    // Validate on update
    if (field === 'code' || field === 'name') {
      const otherSubjects = updated.filter((_, i) => i !== index);
      const generator = new ScheduleGenerator([]);
      const conflictMessages = generator.checkSubjectConflicts(updated[index], otherSubjects);
      setConflicts(conflictMessages);
    }

    setSubjects(updated);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
    setConflicts([]); // Clear conflicts when removing subjects
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
      let message = `✅ PROCESAMIENTO COMPLETADO\n\n`;
      message += `• ${parsedSubjects.length} materias agregadas exitosamente\n`;

      if (duplicateSubjects.length > 0) {
        message += `• ${duplicateSubjects.length} materias duplicadas omitidas:\n`;
        duplicateSubjects.forEach((dup) => (message += `  - ${dup}\n`));
      }

      if (conflictSubjects.length > 0) {
        message += `• ${conflictSubjects.length} materias con conflictos omitidas:\n`;
        conflictSubjects.forEach((conf) => (message += `  - ${conf}\n`));
      }

      if (duplicateSubjects.length > 0 || conflictSubjects.length > 0) {
        message += `\n⚠️ Las materias omitidas no afectarán la generación de horarios.`;
      }

      alert(message);
      setSubjects([...subjects, ...parsedSubjects]);
      setTextInput('');
      setShowTextInput(false);
      setConflicts([]);
    } catch (error) {
      alert(`🚨 ERROR AL PROCESAR TEXTO\n\n${(error as Error).message}\n\nPor favor revisa el formato y vuelve a intentar.`);
    }
  };

  const addTimeSlot = (subjectIndex: number) => {
    const updated = [...subjects];
    updated[subjectIndex].timeSlots.push({
      day: 'Lunes',
      startTime: '08:00',
      endTime: '10:00',
    });
    setSubjects(updated);
  };

  const updateTimeSlot = (subjectIndex: number, slotIndex: number, field: string, value: string) => {
    const updated = [...subjects];
    (updated[subjectIndex].timeSlots[slotIndex] as any)[field] = value;

    // Validate time slot changes
    const generator = new ScheduleGenerator([]);
    const otherSubjects = updated.filter((_, i) => i !== subjectIndex);
    const conflictMessages = generator.checkSubjectConflicts(updated[subjectIndex], otherSubjects);
    setConflicts(conflictMessages);

    setSubjects(updated);
  };

  const removeTimeSlot = (subjectIndex: number, slotIndex: number) => {
    const updated = [...subjects];
    updated[subjectIndex].timeSlots = updated[subjectIndex].timeSlots.filter((_, i) => i !== slotIndex);
    setSubjects(updated);
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

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Configurar Materias</h2>
          <div className="flex space-x-3">
            <button onClick={handleUseSampleData} className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              <FileText className="w-4 h-4" />
              <span>Usar datos de ejemplo</span>
            </button>
            <button onClick={() => setShowManualForm(!showManualForm)} className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Agregar materia</span>
            </button>
            <button onClick={() => setShowTextInput(!showTextInput)} className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              <Type className="w-4 h-4" />
              <span>Escribir por texto</span>
            </button>
          </div>
        </div>

        {/* Target Subject Count */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Número específico de materias (opcional)</h3>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={targetSubjectCount !== undefined} onChange={(e) => setTargetSubjectCount(e.target.checked ? 4 : undefined)} className="rounded border-blue-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-blue-800">Generar horarios con exactamente</span>
            </label>
            {targetSubjectCount !== undefined && <input type="number" value={targetSubjectCount} onChange={(e) => setTargetSubjectCount(parseInt(e.target.value) || 1)} min="1" max={subjects.length} className="w-20 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />}
            <span className="text-blue-800">materias</span>
          </div>
          <p className="text-sm text-blue-700 mt-2">Si no seleccionas esta opción, se generarán horarios con todas las combinaciones posibles (excluyendo horarios de una sola materia).</p>
        </div>

        {showTextInput && (
          <div className="mb-6 bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-start space-x-3 mb-4">
              <Info className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-purple-900 mb-2">Formato de entrada de texto</h3>
                <div className="text-sm text-purple-800 space-y-1">
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
                <div className="mt-3 p-3 bg-white rounded border border-purple-200">
                  <p className="text-xs font-medium text-purple-900 mb-1">Ejemplo:</p>
                  <code className="text-xs text-purple-800 block">
                    MAT101 | Cálculo Diferencial | 4 | Lunes 08:00-10:00 | Miércoles 08:00-10:00
                    <br />
                    CS101 | Programación I | 3 | Martes 10:00-12:00 | Jueves 10:00-12:00
                  </code>
                </div>
              </div>
            </div>

            <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} className="w-full h-32 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm" placeholder="Escribe las materias aquí siguiendo el formato especificado..." />

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setTextInput('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button onClick={parseTextInput} disabled={!textInput.trim()} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                Procesar texto
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Materias registradas ({subjects.length})</h3>
          {subjects.length > 5 && (
            <button onClick={() => setShowAllSubjects(!showAllSubjects)} className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              {showAllSubjects ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAllSubjects ? 'Ocultar algunas' : 'Mostrar todas'}</span>
            </button>
          )}
        </div>
        {/* All Subjects Display */}
        <div className="mb-6">
          {subjects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-5">
              {(showAllSubjects ? subjects : subjects.slice(0, 6)).map((subject, index) => (
                <div key={subject.id} className="border border-gray-200 rounded-xl p-2 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow-md flex-shrink-0" style={{ backgroundColor: subject.color }} />
                      <div>
                        <span className="font-medium text-gray-900 block">{subject.code || 'Sin código'}</span>
                        <span className="text-sm text-gray-600 line-clamp-1" title={subject.name}>
                          {subject.name || 'Sin nombre'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => removeSubject(index)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors" title="Eliminar materia">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subject Stats */}
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{subject.credits} créditos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {subject.timeSlots.length} horario
                        {subject.timeSlots.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {showManualForm && (
                    <div className="space-y-3 mb-4">
                      <div className="grid gap-2 grid-cols-2">
                        <input type="text" value={subject.code} onChange={(e) => updateSubject(index, 'code', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Código" />
                        <input type="number" value={subject.credits} onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value) || 0)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="1" max="6" placeholder="Créditos" />
                      </div>
                      <input type="text" value={subject.name} onChange={(e) => updateSubject(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nombre de la materia" />
                      <input type="text" value={subject.professors[0]?.name || ''} onChange={(e) => updateSubject(index, 'professors.name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Profesor" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Horarios</span>
                      </span>
                      {showManualForm && (
                        <button onClick={() => addTimeSlot(index)} className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium">
                          + Agregar
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {subject.timeSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="text-xs">
                          {showManualForm ? (
                            <div className="flex items-center space-x-2">
                              <select value={slot.day} onChange={(e) => updateTimeSlot(index, slotIndex, 'day', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option value="Lunes">Lun</option>
                                <option value="Martes">Mar</option>
                                <option value="Miércoles">Mié</option>
                                <option value="Jueves">Jue</option>
                                <option value="Viernes">Vie</option>
                              </select>
                              <input type="time" value={slot.startTime} onChange={(e) => updateTimeSlot(index, slotIndex, 'startTime', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              <span>-</span>
                              <input type="time" value={slot.endTime} onChange={(e) => updateTimeSlot(index, slotIndex, 'endTime', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              <button onClick={() => removeTimeSlot(index, slotIndex)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                                <span className="text-gray-700 font-medium">{slot.day.slice(0, 3)}</span>
                              </div>
                              <span className="text-gray-600 font-mono text-xs">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {!showAllSubjects && subjects.length > 6 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:shadow-md transition-all duration-200">
                  <span className="text-gray-600 font-medium">+{subjects.length - 6} materias más</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materias registradas</h3>
              <p className="text-gray-600 mb-6">Usa los datos de ejemplo o agrega materias manualmente</p>
            </div>
          )}
        </div>

        {showManualForm && (
          <div className="mb-6">
            <button onClick={addNewSubject} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
              <Plus className="w-5 h-5 mx-auto mb-1" />
              Agregar nueva materia
            </button>
          </div>
        )}

        {subjects.length > 0 && (
          <div className="flex justify-center">
            <button onClick={handleSubmit} disabled={conflicts.length > 0} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium">
              Generar Horarios Optimizados
              {targetSubjectCount && ` (${targetSubjectCount} materias)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
