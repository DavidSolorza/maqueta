import React, { useState } from 'react';
import { SetupForm } from './components/SetupForm';
import { AllSchedulesView } from './components/AllSchedulesView';
import { ScheduleGenerator } from './utils/scheduleGenerator';
import { Subject, Schedule } from './types/schedule';

function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'results'>('setup');
  const [generatedSchedules, setGeneratedSchedules] = useState<Schedule[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFormSubmit = async (subjects: Subject[]) => {
    setIsGenerating(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Generando todas las combinaciones posibles...
          </h2>
          <p className="text-gray-600">
            Esto puede tomar unos momentos dependiendo del número de materias
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'setup' ? (
        <SetupForm onSubmit={handleFormSubmit} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <AllSchedulesView 
            schedules={generatedSchedules}
            onBack={handleBackToSetup}
          />
        </div>
      )}
    </div>
  );
}

export default App;