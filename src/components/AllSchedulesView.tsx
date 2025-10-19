import React, { useState } from 'react';
import { Schedule } from '../types/schedule';
import { WeeklyCalendar } from './WeeklyCalendar';
import { Grid, List, Filter, Download, Share2, ArrowLeft, Clock, BookOpen, Star, Search, SortAsc, SortDesc, AlertCircle } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface AllSchedulesViewProps {
  schedules: Schedule[];
  onBack: () => void;
  allSubjects: any[];
  targetSubjectCount?: number;
}

export const AllSchedulesView: React.FC<AllSchedulesViewProps> = ({ schedules, onBack, allSubjects, targetSubjectCount }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterRanking, setFilterRanking] = useState<string>('');
  const [sortBy, setSortBy] = useState<'subjects' | 'score' | 'gaps' | 'hours'>('subjects');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [minSubjects, setMinSubjects] = useState<number>(targetSubjectCount || 2);

  // Get all unique rankings for filter (always available from all subjects)
  const allPossibleRankings = React.useMemo(() => ['Sin huecos', 'Muy compacto', 'Compacto', 'Muchos huecos', 'Carga muy ligera', 'Carga ligera', 'Carga normal', 'Carga pesada', 'Muchas materias', 'Carga completa', 'Carga parcial', 'Tardes libres', 'Mañanas libres', 'Clases temprano', 'Bien distribuido'], []);

  // Filter and sort schedules
  const filteredSchedules = schedules
    .filter((schedule) => {
      const matchesRanking = !filterRanking || schedule.ranking.includes(filterRanking);
      const matchesSearch = !searchTerm || schedule.subjects.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()));
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

  // Download as PNG
  const handleExportPNG = (schedule: Schedule) => {
    const exportToPng = async (filename = `${schedule.id}.png`) => {
      const container = document.querySelector<HTMLElement>(`#${schedule.id}`);
      if (!container) throw new Error('Elemento no encontrado');

      // Buscar el contenedor interno con scroll
      const scrollContainer = container.querySelector<HTMLElement>('.overflow-x-auto');
      const innerContent = scrollContainer?.querySelector<HTMLElement>('.inline-flex');

      if (!innerContent) throw new Error('Contenido interno no encontrado');

      // Guardar estilos originales
      const original = {
        container: {
          overflow: container.style.overflow,
          maxWidth: container.style.maxWidth,
        },
        scroll: scrollContainer
          ? {
              overflow: scrollContainer.style.overflow,
              maxWidth: scrollContainer.style.maxWidth,
            }
          : null,
      };

      // Forzar que se vea todo el contenido
      container.style.overflow = 'visible';
      container.style.maxWidth = 'none';

      if (scrollContainer) {
        scrollContainer.style.overflow = 'visible';
        scrollContainer.style.maxWidth = 'none';
      }

      try {
        // Capturar el elemento completo
        const dataUrl = await htmlToImage.toPng(innerContent || container, {
          cacheBust: true,
          pixelRatio: 2,
          skipAutoScale: true,
          skipFonts: true,
          width: innerContent?.scrollWidth,
          height: innerContent?.scrollHeight,
          backgroundColor: '#ffffff',
        });

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        // Restaurar estilos
        container.style.overflow = original.container.overflow;
        container.style.maxWidth = original.container.maxWidth;

        if (scrollContainer && original.scroll) {
          scrollContainer.style.overflow = original.scroll.overflow;
          scrollContainer.style.maxWidth = original.scroll.maxWidth;
        }
      }
    };

    exportToPng();
  };

  const handleExportJSON = (schedule: Schedule) => {
    const calendarData = {
      title: 'Mi Horario Universitario',
      subjects: schedule.subjects.map((subject) => ({
        name: subject.name,
        code: subject.code,
        timeSlots: subject.timeSlots,
        professor: subject.professors[0]?.name || 'Sin profesor',
      })),
      stats: {
        totalSubjects: schedule.subjects.length,
        totalHours: schedule.totalHours,
        gaps: schedule.gaps,
        totalCredits: schedule.subjects.reduce((sum, s) => sum + s.credits, 0),
      },
    };
    const dataStr = JSON.stringify(calendarData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schedule.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (schedules.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500 dark:text-red-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">No se encontraron horarios válidos</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{targetSubjectCount ? `No es posible crear horarios con exactamente ${targetSubjectCount} materias sin conflictos.` : 'Las materias seleccionadas tienen choques de horarios que impiden crear combinaciones válidas.'}</p>
          <button onClick={onBack} className="px-6 py-3 text-white transition-colors bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800">
            Volver a configurar materias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="flex items-center px-3 py-2 space-x-2 text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Horarios Optimizados</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredSchedules.length} de {schedules.length} horarios válidos • {allSubjects.length} materias registradas
                {targetSubjectCount && ` • Mostrando horarios con ${targetSubjectCount} materias`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2 transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700" title={`Cambiar a vista ${viewMode === 'grid' ? 'lista' : 'cuadrícula'}`}>
              {viewMode === 'grid' ? <List className="w-5 h-5 dark:text-gray-300" /> : <Grid className="w-5 h-5 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* All Subjects Display */}
        <div className="p-6 mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h3 className="mb-3 font-medium text-gray-900 dark:text-white">📚 Todas las materias disponibles ({allSubjects.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allSubjects.map((subject) => (
              <div key={subject.id} className="flex items-center px-4 py-3 space-x-3 transition-all duration-200 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md">
                <div className="flex-shrink-0 w-4 h-4 border-2 border-white rounded-full shadow-sm" style={{ backgroundColor: subject.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{subject.code}</span>
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{subject.credits}c</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate" title={subject.name}>
                    {subject.name}
                  </p>
                  <div className="flex items-center mt-1 space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {subject.timeSlots.length} horario
                      {subject.timeSlots.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Buscar materias</label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Buscar..." />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">{targetSubjectCount ? 'Materias exactas' : 'Mínimo de materias'}</label>
              <input type="number" value={minSubjects} onChange={(e) => setMinSubjects(parseInt(e.target.value) || 1)} min="1" max={allSubjects.length} disabled={!!targetSubjectCount} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
              {targetSubjectCount && <p className="mt-1 text-xs text-gray-500">Fijo en {targetSubjectCount} materias</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Filtrar por característica</label>
              <select value={filterRanking} onChange={(e) => setFilterRanking(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todas</option>
                {allPossibleRankings.map((ranking) => (
                  <option key={ranking} value={ranking}>
                    {ranking}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Ordenar por</label>
              <div className="flex space-x-1">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="subjects">Materias</option>
                  <option value="score">Puntuación</option>
                  <option value="gaps">Huecos</option>
                  <option value="hours">Horas</option>
                </select>
                <button onClick={toggleSortOrder} className="px-2 py-2 transition-colors bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200" title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}>
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
                  setMinSubjects(targetSubjectCount || 2);
                }}
                className="w-full px-3 py-2 text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'grid' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredSchedules.map((schedule, index) => (
              <div key={schedule.id} className="overflow-x-scroll transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{schedule.subjects.length} materias</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{schedule.score}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {schedule.ranking.slice(0, 3).map((rank, rankIndex) => (
                      <span key={rankIndex} className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                        {rank}
                      </span>
                    ))}
                    {schedule.ranking.length > 3 && <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">+{schedule.ranking.length - 3}</span>}
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

                <div className="p-2 weekly-table">
                  <WeeklyCalendar schedule={schedule} isCompact={true} />
                </div>

                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-2 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {schedule.subjects.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded"
                            style={{
                              backgroundColor: s.color + '20',
                              color: s.color,
                              border: `1px solid ${s.color}40`,
                            }}
                          >
                            {s.code}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Download As PNG */}
                      <button onClick={() => handleExportPNG(schedule)} className="p-1 text-gray-500 transition-colors hover:text-blue-600" title="Exportar horario">
                        <Download className="w-6 h-4" />
                        <span className="text-xs">PNG</span>
                      </button>
                      {/* Download As JSON */}
                      <button onClick={() => handleExportJSON(schedule)} className="p-1 text-gray-500 transition-colors hover:text-blue-600" title="Exportar horario">
                        <Download className="w-6 h-4" />
                        <span className="text-xs">JSON</span>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(schedule, null, 2));
                          alert('Horario copiado al portapapeles');
                        }}
                        className="p-1 text-gray-500 transition-colors hover:text-green-600"
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
              <div key={schedule.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">Horario con {schedule.subjects.length} materias</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{schedule.score}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleExportPNG(schedule)} className="flex items-center px-3 py-2 space-x-1 text-blue-700 transition-colors bg-blue-100 rounded-md hover:bg-blue-200">
                      <Download className="w-4 h-4" />
                      <span>PNG</span>
                    </button>
                    <button onClick={() => handleExportJSON(schedule)} className="flex items-center px-3 py-2 space-x-1 text-blue-700 transition-colors bg-blue-100 rounded-md hover:bg-blue-200">
                      <Download className="w-4 h-4" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <WeeklyCalendar schedule={schedule} />
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-900">Características</h4>
                      <div className="flex flex-wrap gap-1">
                        {schedule.ranking.map((rank, rankIndex) => (
                          <span key={rankIndex} className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                            {rank}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-900">Estadísticas</h4>
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
                          <span className="font-medium">{schedule.subjects.reduce((sum, s) => sum + s.credits, 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-900">Materias incluidas</h4>
                      <div className="space-y-2">
                        {schedule.subjects.map((subject) => (
                          <div key={subject.id} className="flex items-center space-x-2 text-sm">
                            <div className="w-3 h-3 border border-white rounded-full shadow-sm" style={{ backgroundColor: subject.color }} />
                            <span className="font-medium text-gray-900">{subject.code}</span>
                            <span className="flex-1 text-gray-600">{subject.name}</span>
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
          <div className="py-12 text-center">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No se encontraron horarios con estos filtros</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda o reducir el número mínimo de materias</p>
          </div>
        )}
      </div>
    </div>
  );
};
