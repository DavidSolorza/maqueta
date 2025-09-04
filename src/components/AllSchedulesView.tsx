import React, { useState } from 'react';
import { Schedule } from '../types/schedule';
import { WeeklyCalendar } from './WeeklyCalendar';
import { 
  Grid, 
  List, 
  Filter, 
  Download, 
  Share2, 
  ArrowLeft,
  Clock,
  BookOpen,
  Star,
  Search,
  SortAsc,
  SortDesc,
  AlertCircle
} from 'lucide-react';

interface AllSchedulesViewProps {
  schedules: Schedule[];
  onBack: () => void;
  allSubjects: any[];
}

export const AllSchedulesView: React.FC<AllSchedulesViewProps> = ({
  schedules,
  onBack,
  allSubjects
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterRanking, setFilterRanking] = useState<string>('');
  const [sortBy, setSortBy] = useState<'subjects' | 'score' | 'gaps' | 'hours'>('subjects');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [minSubjects, setMinSubjects] = useState<number>(2);

  // Get all unique rankings for filter (always available from all subjects)
  const allPossibleRankings = [
    'Sin huecos', 'Muy compacto', 'Compacto', 'Muchos huecos',
    'Carga muy ligera', 'Carga ligera', 'Carga normal', 'Carga pesada',
    'Muchas materias', 'Carga completa', 'Carga parcial',
    'Tardes libres', 'Mañanas libres', 'Clases temprano', 'Bien distribuido'
  ];

  // Filter and sort schedules
  const filteredSchedules = schedules
    .filter(schedule => {
      const matchesRanking = !filterRanking || schedule.ranking.includes(filterRanking);
      const matchesSearch = !searchTerm || 
        schedule.subjects.some(s => 
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesMinSubjects = schedule.subjects.length >= minSubjects;
      return matchesRanking && matchesSearch && matchesMinSubjects;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'subjects':
          comparison = a.subjects.length - b.subjects.length;
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'gaps':
          comparison = a.gaps - b.gaps;
          break;
        case 'hours':
          comparison = a.totalHours - b.totalHours;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleExportSchedule = (schedule: Schedule) => {
    const calendarData = {
      title: 'Mi Horario Universitario',
      subjects: schedule.subjects.map(subject => ({
        name: subject.name,
        code: subject.code,
        timeSlots: subject.timeSlots,
        professor: subject.professors[0]?.name || 'Sin profesor'
      })),
      stats: {
        totalSubjects: schedule.subjects.length,
        totalHours: schedule.totalHours,
        gaps: schedule.gaps,
        totalCredits: schedule.subjects.reduce((sum, s) => sum + s.credits, 0)
      }
    };
    
    const dataStr = JSON.stringify(calendarData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `horario-${schedule.subjects.length}-materias.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (schedules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No se encontraron horarios válidos
          </h2>
          <p className="text-gray-600 mb-6">
            Las materias seleccionadas tienen choques de horarios que impiden crear combinaciones válidas, o el número específico de materias solicitado no es posible.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a configurar materias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Horarios Optimizados
              </h1>
              <p className="text-gray-600">
                {filteredSchedules.length} de {schedules.length} horarios válidos • {allSubjects.length} materias registradas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title={`Cambiar a vista ${viewMode === 'grid' ? 'lista' : 'cuadrícula'}`}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* All Subjects Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">
            Todas las materias registradas ({allSubjects.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {allSubjects.map(subject => (
              <div
                key={subject.id}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-sm font-medium text-gray-900">{subject.code}</span>
                <span className="text-sm text-gray-600">{subject.name}</span>
                <span className="text-xs text-gray-500">({subject.credits} créditos)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar materias
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mínimo de materias
              </label>
              <input
                type="number"
                value={minSubjects}
                onChange={(e) => setMinSubjects(parseInt(e.target.value) || 1)}
                min="1"
                max={allSubjects.length}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por característica
              </label>
              <select
                value={filterRanking}
                onChange={(e) => setFilterRanking(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {allPossibleRankings.map(ranking => (
                  <option key={ranking} value={ranking}>{ranking}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <div className="flex space-x-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="subjects">Materias</option>
                  <option value="score">Puntuación</option>
                  <option value="gaps">Huecos</option>
                  <option value="hours">Horas</option>
                </select>
                <button
                  onClick={toggleSortOrder}
                  className="px-2 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
                  title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
                >
                  {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterRanking('');
                  setSearchTerm('');
                  setSortBy('subjects');
                  setSortOrder('desc');
                  setMinSubjects(2);
                }}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSchedules.map((schedule, index) => (
              <div key={schedule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {schedule.subjects.length} materias
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{schedule.score}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {schedule.ranking.slice(0, 3).map((rank, rankIndex) => (
                      <span
                        key={rankIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {rank}
                      </span>
                    ))}
                    {schedule.ranking.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{schedule.ranking.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{schedule.subjects.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{schedule.totalHours}h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Filter className="w-3 h-3" />
                      <span>{schedule.gaps}h huecos</span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <WeeklyCalendar schedule={schedule} isCompact={true} />
                </div>

                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 flex-1 mr-2">
                      <div className="flex flex-wrap gap-1">
                        {schedule.subjects.map(s => (
                          <span 
                            key={s.id}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: s.color + '20',
                              color: s.color,
                              border: `1px solid ${s.color}40`
                            }}
                          >
                            {s.code}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExportSchedule(schedule)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Exportar horario"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(schedule, null, 2));
                          alert('Horario copiado al portapapeles');
                        }}
                        className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                        title="Copiar datos"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSchedules.map((schedule, index) => (
              <div key={schedule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Horario con {schedule.subjects.length} materias
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{schedule.score}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExportSchedule(schedule)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <WeeklyCalendar schedule={schedule} />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Características</h4>
                      <div className="flex flex-wrap gap-1">
                        {schedule.ranking.map((rank, rankIndex) => (
                          <span
                            key={rankIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {rank}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Estadísticas</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Materias:</span>
                          <span className="font-medium">{schedule.subjects.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Horas totales:</span>
                          <span className="font-medium">{schedule.totalHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Huecos:</span>
                          <span className="font-medium">{schedule.gaps}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Créditos:</span>
                          <span className="font-medium">
                            {schedule.subjects.reduce((sum, s) => sum + s.credits, 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Materias incluidas</h4>
                      <div className="space-y-2">
                        {schedule.subjects.map(subject => (
                          <div key={subject.id} className="flex items-center space-x-2 text-sm">
                            <div 
                              className="w-3 h-3 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: subject.color }}
                            />
                            <span className="font-medium text-gray-900">{subject.code}</span>
                            <span className="text-gray-600 flex-1">{subject.name}</span>
                            <span className="text-xs text-gray-500">{subject.credits}c</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredSchedules.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron horarios con estos filtros
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda o reducir el número mínimo de materias
            </p>
          </div>
        )}
      </div>
    </div>
  );
};