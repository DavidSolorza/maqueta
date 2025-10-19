import React, { useState, useEffect } from 'react';
import { SetupForm } from './components/SetupForm';
import { AllSchedulesView } from './components/AllSchedulesView';
import { ScheduleGenerator } from './utils/scheduleGenerator';
import { Subject, Schedule } from './types/schedule';
import { RotateCcw, Sun, Moon } from 'lucide-react';
import { getInitialTheme, toggleTheme } from './utils/theme';

function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'results'>('setup');
  const [generatedSchedules, setGeneratedSchedules] = useState<Schedule[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetSubjectCount, setTargetSubjectCount] = useState<number | undefined>(undefined);
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleFormSubmit = async (subjects: Subject[], targetCount?: number) => {
    setIsGenerating(true);
    setTargetSubjectCount(targetCount);

    // Simulate processing time for better UX (shorter for better experience)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const generator = new ScheduleGenerator(subjects, targetCount);
    const schedules = generator.generateAllSchedules();

    setGeneratedSchedules(schedules);
    setCurrentView('results');
    setIsGenerating(false);
  };

  const handleBackToSetup = () => {
    setCurrentView('setup');
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <RotateCcw className="w-8 h-8 text-blue-600 absolute top-6 left-6 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Generando todas las combinaciones posibles...</h2>
          <p className="text-lg text-gray-600 mb-2">Analizando horarios y detectando choques</p>
          <p className="text-sm text-gray-500">Esto puede tomar unos momentos según la cantidad de materias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="fixed top-4 right-4 z-50">
        <button onClick={() => setTheme(toggleTheme(theme))} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200" aria-label="Toggle dark mode">
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>
      </div>
      {currentView === 'setup' ? <SetupForm onSubmit={handleFormSubmit} /> : <AllSchedulesView schedules={generatedSchedules} allSubjects={JSON.parse(localStorage.getItem('university-schedule-subjects') || '[]')} targetSubjectCount={targetSubjectCount} onBack={handleBackToSetup} />}
    </div>
  );
}

export default App;
