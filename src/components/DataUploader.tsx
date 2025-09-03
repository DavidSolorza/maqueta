import React, { useState } from 'react';
import { Subject } from '../types/schedule';
import { Upload, FileText, Plus, Trash2, Calendar, User, Clock, Type, Info } from 'lucide-react';

interface DataUploaderProps {
  onDataSubmit: (subjects: Subject[]) => void;
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
      { day: 'Miércoles', startTime: '08:00', endTime: '10:00' }
    ],
    color: '#3b82f6'
  },
  {
    id: '2',
    name: 'Programación I',
    code: 'CS101',
    credits: 3,
    professors: [{ id: 'p2', name: 'Ing. López', rating: 4.2 }],
    timeSlots: [
      { day: 'Martes', startTime: '10:00', endTime: '12:00' },
      { day: 'Jueves', startTime: '10:00', endTime: '12:00' }
    ],
    color: '#10b981'
  },
  {
    id: '3',
    name: 'Física General',
    code: 'FIS101',
    credits: 4,
    professors: [{ id: 'p3', name: 'Dr. Martínez', rating: 3.8 }],
    timeSlots: [
      { day: 'Lunes', startTime: '14:00', endTime: '16:00' },
      { day: 'Viernes', startTime: '08:00', endTime: '10:00' }
    ],
    color: '#f59e0b'
  },
  {
    id: '4',
    name: 'Química Orgánica',
    code: 'QUI201',
    credits: 3,
    professors: [{ id: 'p4', name: 'Dra. Rodríguez', rating: 4.7 }],
    timeSlots: [
      { day: 'Martes', startTime: '14:00', endTime: '17:00' },
      { day: 'Jueves', startTime: '14:00', endTime: '16:00' }
    ],
    color: '#8b5cf6'
  },
  {
    id: '5',
    name: 'Historia Universal',
    code: 'HIS101',
    credits: 2,
    professors: [{ id: 'p5', name: 'Prof. Hernández', rating: 4.0 }],
    timeSlots: [
      { day: 'Miércoles', startTime: '16:00', endTime: '18:00' }
    ],
    color: '#ef4444'
  }
];

export const DataUploader: React.FC<DataUploaderProps> = ({ onDataSubmit }) => {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    // Load subjects from localStorage on component mount
    const saved = localStorage.getItem('university-schedule-subjects');
    return saved ? JSON.parse(saved) : [];
  });
  const [showManualForm, setShowManualForm] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Save subjects to localStorage whenever subjects change
  React.useEffect(() => {
    localStorage.setItem('university-schedule-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const handleUseSampleData = () => {
    setSubjects(SAMPLE_SUBJECTS);
  };

  const handleSubmit = () => {
    if (subjects.length === 0) {
      alert('Por favor agrega al menos una materia');
      return;
    }
    onDataSubmit(subjects);
  };

  const addNewSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      code: '',
      credits: 3,
      professors: [{ id: 'prof1', name: '', rating: 0 }],
      timeSlots: [{ day: 'Lunes', startTime: '08:00', endTime: '10:00' }],
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    setSubjects([...subjects, newSubject]);
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const updated = [...subjects];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'professors') {
        updated[index].professors[0] = { ...updated[index].professors[0], [child]: value };
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setSubjects(updated);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const parseTextInput = () => {
    try {
      const lines = textInput.trim().split('\n').filter(line => line.trim());
      const parsedSubjects: Subject[] = [];

      lines.forEach((line, index) => {
        const parts = line.split('|').map(part => part.trim());
        
        if (parts.length < 4) {
          throw new Error(`Línea ${index + 1}: Formato incorrecto. Se requieren al menos 4 campos separados por |`);
        }

        const [code, name, creditsStr, ...schedulesParts] = parts;
        const credits = parseInt(creditsStr);
        
        if (isNaN(credits)) {
          throw new Error(`Línea ${index + 1}: Los créditos deben ser un número`);
        }

        const timeSlots = schedulesParts.map(schedulePart => {
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
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };

        parsedSubjects.push(subject);
      });

      setSubjects([...subjects, ...parsedSubjects]);
      setTextInput('');
      setShowTextInput(false);
    } catch (error) {
      alert(`Error al procesar el texto: ${(error as Error).message}`);
    }
  };

  const addTimeSlot = (subjectIndex: number) => {
    const updated = [...subjects];
    updated[subjectIndex].timeSlots.push({
      day: 'Lunes',
      startTime: '08:00',
      endTime: '10:00'
    });
    setSubjects(updated);
  };

  const updateTimeSlot = (subjectIndex: number, slotIndex: number, field: string, value: string) => {
    const updated = [...subjects];
    (updated[subjectIndex].timeSlots[slotIndex] as any)[field] = value;
    setSubjects(updated);
  };

  const removeTimeSlot = (subjectIndex: number, slotIndex: number) => {
    const updated = [...subjects];
    updated[subjectIndex].timeSlots = updated[subjectIndex].timeSlots.filter((_, i) => i !== slotIndex);
    setSubjects(updated);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Optimizador de Horarios Universitarios
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Crea horarios universitarios optimizados sin choques y con mínimos huecos
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Configurar Materias
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={handleUseSampleData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Usar datos de ejemplo</span>
            </button>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar materia</span>
            </button>
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Type className="w-4 h-4" />
              <span>Escribir por texto</span>
            </button>
          </div>
        </div>

        {showTextInput && (
          <div className="mb-6 bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-start space-x-3 mb-4">
              <Info className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-purple-900 mb-2">
                  Formato de entrada de texto
                </h3>
                <div className="text-sm text-purple-800 space-y-1">
                  <p><strong>Formato:</strong> Código | Nombre | Créditos | Horario1 | Horario2 | ...</p>
                  <p><strong>Horario:</strong> Día HH:MM-HH:MM</p>
                  <p><strong>Días válidos:</strong> Lunes, Martes, Miércoles, Jueves, Viernes</p>
                </div>
                <div className="mt-3 p-3 bg-white rounded border border-purple-200">
                  <p className="text-xs font-medium text-purple-900 mb-1">Ejemplo:</p>
                  <code className="text-xs text-purple-800 block">
                    MAT101 | Cálculo Diferencial | 4 | Lunes 08:00-10:00 | Miércoles 08:00-10:00<br/>
                    CS101 | Programación I | 3 | Martes 10:00-12:00 | Jueves 10:00-12:00
                  </code>
                </div>
              </div>
            </div>
            
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              placeholder="Escribe las materias aquí siguiendo el formato especificado..."
            />
            
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
              <button
                onClick={parseTextInput}
                disabled={!textInput.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Procesar texto
              </button>
            </div>
          </div>
        )}

        {subjects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Materias agregadas ({subjects.length})
            </h3>
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {subject.code || 'Nueva materia'} - {subject.name || 'Sin nombre'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSubject(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {showManualForm && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código
                        </label>
                        <input
                          type="text"
                          value={subject.code}
                          onChange={(e) => updateSubject(index, 'code', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: MAT101"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: Cálculo Diferencial"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Créditos
                        </label>
                        <input
                          type="number"
                          value={subject.credits}
                          onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          max="6"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Profesor
                        </label>
                        <input
                          type="text"
                          value={subject.professors[0]?.name || ''}
                          onChange={(e) => updateSubject(index, 'professors.name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre del profesor"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Horarios
                      </label>
                      {showManualForm && (
                        <button
                          onClick={() => addTimeSlot(index)}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          + Agregar horario
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {subject.timeSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center space-x-2 text-sm">
                          {showManualForm ? (
                            <>
                              <select
                                value={slot.day}
                                onChange={(e) => updateTimeSlot(index, slotIndex, 'day', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs"
                              >
                                <option value="Lunes">Lunes</option>
                                <option value="Martes">Martes</option>
                                <option value="Miércoles">Miércoles</option>
                                <option value="Jueves">Jueves</option>
                                <option value="Viernes">Viernes</option>
                              </select>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(index, slotIndex, 'startTime', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                              <span>-</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(index, slotIndex, 'endTime', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                              <button
                                onClick={() => removeTimeSlot(index, slotIndex)}
                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {slot.day}: {slot.startTime} - {slot.endTime}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showManualForm && (
          <div className="mb-6">
            <button
              onClick={addNewSubject}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5 mx-auto mb-1" />
              Agregar nueva materia
            </button>
          </div>
        )}

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay materias agregadas
            </h3>
            <p className="text-gray-600 mb-6">
              Usa los datos de ejemplo o agrega materias manualmente
            </p>
          </div>
        )}

        {subjects.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Generar Horarios Optimizados
            </button>
          </div>
        )}
      </div>
    </div>
  );
};