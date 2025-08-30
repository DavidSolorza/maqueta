import React, { useState } from 'react';
import { Subject, TimeSlot, Professor } from '../types/schedule';
import { Upload, Plus, Trash2, Clock, User, BookOpen } from 'lucide-react';

interface DataUploaderProps {
  onDataSubmit: (subjects: Subject[]) => void;
}

export const DataUploader: React.FC<DataUploaderProps> = ({ onDataSubmit }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState({
    name: '',
    code: '',
    credits: 3,
    professors: [{ name: '', rating: 0 }] as Professor[],
    timeSlots: [{ day: 'Lunes', startTime: '08:00', endTime: '10:00' }] as TimeSlot[]
  });

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316', '#84CC16'];

  const addSubject = () => {
    if (!currentSubject.name || !currentSubject.code) {
      alert('Por favor completa el nombre y código de la materia');
      return;
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: currentSubject.name,
      code: currentSubject.code,
      credits: currentSubject.credits,
      professors: currentSubject.professors.filter(p => p.name.trim() !== '').map((p, index) => ({
        id: `prof-${Date.now()}-${index}`,
        name: p.name,
        rating: p.rating || undefined
      })),
      timeSlots: currentSubject.timeSlots,
      color: colors[subjects.length % colors.length]
    };

    setSubjects([...subjects, newSubject]);
    setCurrentSubject({
      name: '',
      code: '',
      credits: 3,
      professors: [{ name: '', rating: 0 }],
      timeSlots: [{ day: 'Lunes', startTime: '08:00', endTime: '10:00' }]
    });
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const addTimeSlot = () => {
    setCurrentSubject({
      ...currentSubject,
      timeSlots: [...currentSubject.timeSlots, { day: 'Lunes', startTime: '08:00', endTime: '10:00' }]
    });
  };

  const removeTimeSlot = (index: number) => {
    if (currentSubject.timeSlots.length > 1) {
      setCurrentSubject({
        ...currentSubject,
        timeSlots: currentSubject.timeSlots.filter((_, i) => i !== index)
      });
    }
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const newTimeSlots = [...currentSubject.timeSlots];
    newTimeSlots[index] = { ...newTimeSlots[index], [field]: value };
    setCurrentSubject({ ...currentSubject, timeSlots: newTimeSlots });
  };

  const addProfessor = () => {
    setCurrentSubject({
      ...currentSubject,
      professors: [...currentSubject.professors, { name: '', rating: 0 }]
    });
  };

  const removeProfessor = (index: number) => {
    if (currentSubject.professors.length > 1) {
      setCurrentSubject({
        ...currentSubject,
        professors: currentSubject.professors.filter((_, i) => i !== index)
      });
    }
  };

  const updateProfessor = (index: number, field: keyof Professor, value: string | number) => {
    const newProfessors = [...currentSubject.professors];
    newProfessors[index] = { ...newProfessors[index], [field]: value };
    setCurrentSubject({ ...currentSubject, professors: newProfessors });
  };

  const handleJSONUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (Array.isArray(data)) {
            const processedSubjects = data.map((subject, index) => ({
              ...subject,
              id: Date.now().toString() + index,
              color: colors[index % colors.length],
              professors: subject.professors?.map((p: any, pIndex: number) => ({
                id: `prof-${Date.now()}-${index}-${pIndex}`,
                name: p.name || p,
                rating: p.rating
              })) || []
            }));
            setSubjects(processedSubjects);
          }
        } catch (error) {
          alert('Error al leer el archivo JSON. Verifica el formato.');
        }
      };
      reader.readAsText(file);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Carga tus Materias y Horarios
          </h1>
          <p className="text-gray-600">
            Ingresa todas las materias disponibles para generar todas las combinaciones posibles
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Agregar Materia</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJSONUpload}
                  className="hidden"
                  id="json-upload"
                />
                <label
                  htmlFor="json-upload"
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Cargar JSON</span>
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la materia
                  </label>
                  <input
                    type="text"
                    value={currentSubject.name}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ej. Cálculo Diferencial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={currentSubject.code}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ej. MAT101"
                  />
                </div>
              </div>

              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Créditos
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={currentSubject.credits}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, credits: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Professors */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Profesores disponibles
                </label>
                <button
                  type="button"
                  onClick={addProfessor}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>
              
              <div className="space-y-2">
                {currentSubject.professors.map((professor, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={professor.name}
                      onChange={(e) => updateProfessor(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del profesor"
                    />
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={professor.rating}
                      onChange={(e) => updateProfessor(index, 'rating', parseFloat(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4.5"
                    />
                    {currentSubject.professors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProfessor(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Horarios disponibles
                </label>
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar horario</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {currentSubject.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <select
                      value={slot.day}
                      onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    
                    <select
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    
                    <span className="text-gray-500">a</span>
                    
                    <select
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    
                    {currentSubject.timeSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={addSubject}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Materia</span>
            </button>
          </div>

          {/* Subjects List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Materias Cargadas ({subjects.length})
              </h2>
              {subjects.length > 0 && (
                <button
                  onClick={() => onDataSubmit(subjects)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Generar Todos los Horarios</span>
                </button>
              )}
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay materias cargadas aún</p>
                <p className="text-sm mt-1">Agrega materias para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {subjects.map((subject, index) => (
                  <div key={subject.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{subject.name}</h3>
                          <p className="text-sm text-gray-600">{subject.code} • {subject.credits} créditos</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSubject(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Horarios:</strong> {subject.timeSlots.map(slot => 
                        `${slot.day} ${slot.startTime}-${slot.endTime}`
                      ).join(', ')}
                    </div>
                    
                    {subject.professors.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <strong>Profesores:</strong> {subject.professors.map(p => p.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {subjects.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium">
                  ¡Listo para generar horarios!
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Se generarán todas las combinaciones posibles sin choques de horarios
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};