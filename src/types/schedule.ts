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