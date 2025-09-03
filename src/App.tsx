import React, { useState } from 'react';
import { SetupForm } from './components/SetupForm';
import { AllSchedulesView } from './components/AllSchedulesView';
import { ScheduleGenerator } from './utils/scheduleGenerator';
import { Subject, Schedule } from './types/schedule';
import { RotateCcw } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'results'>('setup');
  const [generatedSchedules, setGeneratedSchedules] = useState<Schedule[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFormSubmit = async (subjects: Subject[]) => {
    setIsGenerating(true);
    
    // Simulate processing time for better UX (shorter for better experience)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generator = new ScheduleGenerator(subjects);
    const schedules = generator.generateAllSchedules();
    
    setGeneratedSchedules(schedules);
    setCurrentView('results');
    setIsGenerating(false);
  };

  const handleBackToSetup = () => {
    setCurrentView('setup');
    setGeneratedSchedules([]);
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
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Generando todas las combinaciones posibles...
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Analizando horarios y detectando choques
          </p>
          <p className="text-sm text-gray-500">
            Esto puede tomar unos momentos según la cantidad de materias
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentView === 'setup' ? (
        <SetupForm onSubmit={handleFormSubmit} />
      ) : (
        <AllSchedulesView 
          schedules={generatedSchedules}
          onBack={handleBackToSetup}
        />
      )}
    </div>
  );
}

export default App;