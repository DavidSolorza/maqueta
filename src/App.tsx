import React, { useState, useEffect } from 'react';
import { SetupForm } from './components/SetupForm';
import { AllSchedulesView } from './components/AllSchedulesView';
import { PersonalCalendarsView } from './components/PersonalCalendarsView';
import { ReviewsView } from './components/ReviewsView';
import { Navbar } from './components/Navbar';
import { ScheduleGenerator } from './utils/scheduleGenerator';
import { Subject, Schedule } from './types/schedule';
import { RotateCcw } from 'lucide-react';
import SchedulerChatbot from './components/SchedulerChatbot.tsx';
import { ToastContainer } from './components/Toast';
import { toastManager, Toast } from './utils/toast';

function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'results' | 'personal' | 'reviews'>('setup');
  const [generatedSchedules, setGeneratedSchedules] = useState<Schedule[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetSubjectCount, setTargetSubjectCount] = useState<number | undefined>(undefined);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Asegurar que siempre esté en modo claro
    document.documentElement.classList.remove('dark');
  }, []);

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

  const handleNavigate = (view: 'setup' | 'results' | 'personal' | 'reviews') => {
    setCurrentView(view);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-brand-blue-900 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <RotateCcw className="w-8 h-8 text-brand-blue-900 absolute top-6 left-6 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Generando todas las combinaciones posibles...</h2>
          <p className="text-lg text-gray-600 mb-2">Analizando horarios y detectando choques</p>
          <p className="text-sm text-gray-500">Esto puede tomar unos momentos según la cantidad de materias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/30 transition-colors duration-200 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-blue-900/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-orange-500/5 rounded-full blur-3xl"></div>
      </div>
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
      />
      
      <main className="relative pt-8 pb-12 z-10">
        {currentView === 'setup' ? (
          <SetupForm onSubmit={handleFormSubmit} />
        ) : currentView === 'results' ? (
          <AllSchedulesView schedules={generatedSchedules} allSubjects={JSON.parse(localStorage.getItem('university-schedule-subjects') || '[]')} targetSubjectCount={targetSubjectCount} onBack={handleBackToSetup} />
        ) : currentView === 'personal' ? (
          <PersonalCalendarsView onBack={handleBackToSetup} onNavigateToReviews={() => setCurrentView('reviews')} />
        ) : (
          <ReviewsView onBack={handleBackToSetup} />
        )}
      </main>

      <div id="chatbot">
        <SchedulerChatbot/>
      </div>

      <ToastContainer
        toasts={toasts}
        onRemove={(id) => toastManager.remove(id)}
      />
    </div>
  );
}

export default App;
