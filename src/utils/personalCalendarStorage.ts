import { PersonalCalendar, PersonalEvent } from '../types/schedule';

const STORAGE_KEY = 'personal-calendars';

export const saveCalendarsToLocal = (calendars: PersonalCalendar[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calendars));
  } catch (error) {
    console.error('Error saving calendars to localStorage:', error);
  }
};

export const loadCalendarsFromLocal = (): PersonalCalendar[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((cal: any) => ({
      ...cal,
      createdAt: new Date(cal.createdAt),
      updatedAt: new Date(cal.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading calendars from localStorage:', error);
    return [];
  }
};

export const generateCalendarId = (): string => {
  return `cal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateEventId = (): string => {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateRandomColor = (): string => {
  const colors = [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#F97316',
    '#84CC16',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const detectTimeConflicts = (events: PersonalEvent[]): string[] => {
  const conflicts: string[] = [];
  const timeSlotMap: { [key: string]: string[] } = {};

  events.forEach((event) => {
    event.timeSlots.forEach((slot) => {
      const startMinutes = timeToMinutes(slot.startTime);
      const endMinutes = timeToMinutes(slot.endTime);

      for (let time = startMinutes; time < endMinutes; time += 30) {
        const key = `${slot.day}-${time}`;
        if (!timeSlotMap[key]) {
          timeSlotMap[key] = [];
        }
        timeSlotMap[key].push(event.title);
      }
    });
  });

  Object.entries(timeSlotMap).forEach(([key, eventTitles]) => {
    if (eventTitles.length > 1) {
      const [day] = key.split('-');
      const uniqueTitles = Array.from(new Set(eventTitles));
      conflicts.push(`${day}: ${uniqueTitles.join(' y ')}`);
    }
  });

  return Array.from(new Set(conflicts));
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const exportCalendarToJSON = (calendar: PersonalCalendar): void => {
  const dataStr = JSON.stringify(calendar, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${calendar.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importCalendarFromJSON = (jsonString: string): PersonalCalendar | null => {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed.name || !Array.isArray(parsed.events)) {
      throw new Error('Invalid calendar format');
    }

    return {
      ...parsed,
      id: generateCalendarId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      events: parsed.events.map((event: any) => ({
        ...event,
        id: generateEventId(),
      })),
    };
  } catch (error) {
    console.error('Error importing calendar:', error);
    return null;
  }
};
