import React, { useState, useEffect } from 'react';
import { PersonalCalendar, PersonalEvent } from '../types/schedule';
import { PersonalCalendarCard } from './PersonalCalendarCard';
import { MergeCalendarsModal } from './MergeCalendarsModal';
import { Grid, List, Plus, Merge, ArrowLeft, Calendar, Search, SortAsc, SortDesc } from 'lucide-react';

interface PersonalCalendarsViewProps {
  onBack: () => void;
}

export const PersonalCalendarsView: React.FC<PersonalCalendarsViewProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [calendars, setCalendars] = useState<PersonalCalendar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'events'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = () => {
    const stored = localStorage.getItem('personal-calendars');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCalendars(parsed.map((cal: any) => ({
        ...cal,
        createdAt: new Date(cal.createdAt),
        updatedAt: new Date(cal.updatedAt),
      })));
    }
  };

  const saveCalendars = (newCalendars: PersonalCalendar[]) => {
    localStorage.setItem('personal-calendars', JSON.stringify(newCalendars));
    setCalendars(newCalendars);
  };

  const handleCreateCalendar = () => {
    const newCalendar: PersonalCalendar = {
      id: `cal-${Date.now()}`,
      name: `Calendario Personal ${calendars.length + 1}`,
      description: '',
      events: [],
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    saveCalendars([...calendars, newCalendar]);
  };

  const handleDeleteCalendar = (id: string) => {
    saveCalendars(calendars.filter((cal) => cal.id !== id));
    setSelectedCalendars(selectedCalendars.filter((calId) => calId !== id));
  };

  const handleUpdateCalendar = (updated: PersonalCalendar) => {
    saveCalendars(calendars.map((cal) => (cal.id === updated.id ? { ...updated, updatedAt: new Date() } : cal)));
  };

  const handleToggleSelection = (id: string) => {
    setSelectedCalendars((prev) => (prev.includes(id) ? prev.filter((calId) => calId !== id) : [...prev, id]));
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredCalendars = calendars
    .filter((cal) => {
      const matchesSearch = !searchTerm || cal.name.toLowerCase().includes(searchTerm.toLowerCase()) || cal.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'events':
          comparison = a.events.length - b.events.length;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="flex items-center px-3 py-2 space-x-2 text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendarios Personales</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredCalendars.length} {filteredCalendars.length === 1 ? 'calendario' : 'calendarios'}
                {selectedCalendars.length > 0 && ` • ${selectedCalendars.length} seleccionados`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={handleCreateCalendar} className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Nuevo Calendario</span>
            </button>

            {selectedCalendars.length >= 2 && (
              <button onClick={() => setShowMergeModal(true)} className="flex items-center px-4 py-2 space-x-2 text-white bg-green-600 dark:bg-green-700 rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors">
                <Merge className="w-5 h-5" />
                <span>Fusionar ({selectedCalendars.length})</span>
              </button>
            )}

            <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2 transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700" title={`Cambiar a vista ${viewMode === 'grid' ? 'lista' : 'cuadrícula'}`}>
              {viewMode === 'grid' ? <List className="w-5 h-5 dark:text-gray-300" /> : <Grid className="w-5 h-5 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        <div className="p-4 mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Buscar calendarios</label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-2 pl-10 pr-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Buscar..." />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por</label>
              <div className="flex space-x-1">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="name">Nombre</option>
                  <option value="date">Fecha</option>
                  <option value="events">Eventos</option>
                </select>
                <button onClick={toggleSortOrder} className="px-2 py-2 transition-colors bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-500" title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}>
                  {sortOrder === 'desc' ? <SortDesc className="w-4 h-4 dark:text-gray-300" /> : <SortAsc className="w-4 h-4 dark:text-gray-300" />}
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSortBy('date');
                  setSortOrder('desc');
                }}
                className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 transition-colors bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {filteredCalendars.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No hay calendarios personales</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">Crea tu primer calendario personal para comenzar</p>
            <button onClick={handleCreateCalendar} className="inline-flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Crear Calendario</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCalendars.map((calendar) => (
              <PersonalCalendarCard key={calendar.id} calendar={calendar} isSelected={selectedCalendars.includes(calendar.id)} onToggleSelection={handleToggleSelection} onUpdate={handleUpdateCalendar} onDelete={handleDeleteCalendar} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCalendars.map((calendar) => (
              <PersonalCalendarCard key={calendar.id} calendar={calendar} isSelected={selectedCalendars.includes(calendar.id)} onToggleSelection={handleToggleSelection} onUpdate={handleUpdateCalendar} onDelete={handleDeleteCalendar} isListView />
            ))}
          </div>
        )}
      </div>

      {showMergeModal && <MergeCalendarsModal calendars={calendars.filter((cal) => selectedCalendars.includes(cal.id))} onClose={() => setShowMergeModal(false)} onMerge={(merged) => {
        saveCalendars([...calendars, merged]);
        setSelectedCalendars([]);
        setShowMergeModal(false);
      }} />}
    </div>
  );
};
