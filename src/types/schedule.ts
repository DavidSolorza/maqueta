export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Professor {
  id: string;
  name: string;
  rating?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  professors: Professor[];
  timeSlots: TimeSlot[];
  color: string;
}

export interface UserPreferences {
  avoidEarlyClasses: boolean;
  earliestTime: string;
  minimizeGaps: boolean;
  groupClasses: boolean;
  preferredProfessors: string[];
}

export interface Schedule {
  id: string;
  subjects: Subject[];
  score: number;
  ranking: string[];
  gaps: number;
  totalHours: number;
}

export interface FormData {
  subjects: Subject[];
  preferences: UserPreferences;
}

export interface PersonalEvent {
  id: string;
  title: string;
  description?: string;
  timeSlots: TimeSlot[];
  color: string;
  category?: string;
}

export interface PersonalCalendar {
  id: string;
  name: string;
  description?: string;
  events: PersonalEvent[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MergedCalendar {
  id: string;
  name: string;
  academicSchedule?: Schedule;
  personalCalendars: PersonalCalendar[];
  createdAt: Date;
}

export interface Review {
  id: string;
  type: 'professor' | 'subject' | 'general';
  targetName: string; // Nombre del profesor, materia o título general
  targetCode?: string; // Código de la materia (si aplica)
  rating: number; // 1-5
  title: string;
  content: string;
  author?: string; // Nombre del autor (opcional)
  createdAt: Date;
  updatedAt: Date;
  helpful?: number; // Contador de "útil"
}