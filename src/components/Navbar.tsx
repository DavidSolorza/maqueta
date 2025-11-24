import React, { useState } from 'react';
import { Calendar, Star, GraduationCap } from 'lucide-react';
import { SchedulerPlanLogo } from './SchedulerPlanLogo';

interface NavbarProps {
  currentView: 'setup' | 'results' | 'personal' | 'reviews';
  onNavigate: (view: 'setup' | 'results' | 'personal' | 'reviews') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-4 cursor-pointer group" onClick={() => onNavigate('setup')}>
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <SchedulerPlanLogo />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-brand-blue-900 via-brand-blue-700 to-brand-orange-500 bg-clip-text text-transparent animate-gradient">
                SchedulerPlan
              </span>
              <span className="text-xs font-medium text-gray-600 hidden sm:block">
                Optimiza tu tiempo académico
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => onNavigate('setup')}
              className={`flex items-center space-x-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all duration-300 transform ${
                currentView === 'setup' || currentView === 'results'
                  ? 'bg-gradient-to-r from-brand-blue-900 to-brand-blue-800 text-white shadow-lg shadow-brand-blue-900/30 scale-105'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:scale-105'
              }`}
            >
              <GraduationCap className={`w-4 h-4 sm:w-5 sm:h-5 ${currentView === 'setup' || currentView === 'results' ? 'animate-pulse' : ''}`} />
              <span className="font-semibold text-sm sm:text-base">Horarios Universitarios</span>
            </button>
            <button
              onClick={() => onNavigate('personal')}
              className={`flex items-center space-x-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all duration-300 transform ${
                currentView === 'personal'
                  ? 'bg-gradient-to-r from-brand-blue-900 to-brand-blue-800 text-white shadow-lg shadow-brand-blue-900/30 scale-105'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:scale-105'
              }`}
            >
              <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${currentView === 'personal' ? 'animate-pulse' : ''}`} />
              <span className="font-semibold text-sm sm:text-base">Calendarios Personales</span>
            </button>
            <button
              onClick={() => onNavigate('reviews')}
              className={`flex items-center space-x-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all duration-300 transform ${
                currentView === 'reviews'
                  ? 'bg-gradient-to-r from-brand-blue-900 to-brand-blue-800 text-white shadow-lg shadow-brand-blue-900/30 scale-105'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:scale-105'
              }`}
            >
              <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${currentView === 'reviews' ? 'animate-pulse' : ''}`} />
              <span className="font-semibold text-sm sm:text-base">Reseñas</span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden relative">
            <button
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    onNavigate('setup');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                    currentView === 'setup' || currentView === 'results'
                      ? 'bg-brand-blue-900 text-white'
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Horarios Universitarios</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('personal');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                    currentView === 'personal'
                      ? 'bg-brand-blue-900 text-white'
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendarios Personales</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('reviews');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                    currentView === 'reviews'
                      ? 'bg-brand-blue-900 text-white'
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span>Reseñas</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

