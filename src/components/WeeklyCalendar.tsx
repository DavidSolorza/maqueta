import React from 'react';
import { Schedule, TimeSlot } from '../types/schedule';
import { ScheduleGenerator } from '../utils/scheduleGenerator';

interface WeeklyCalendarProps {
  schedule: Schedule;
  isCompact?: boolean;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  schedule, 
  isCompact = false 
}) => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM
  const generator = new ScheduleGenerator([]);

  const getClassesForDayAndHour = (day: string, hour: number) => {
    const classes: Array<{
      subject: any;
      slot: TimeSlot;
      startRow: number;
      endRow: number;
    }> = [];

    schedule.subjects.forEach(subject => {
      subject.timeSlots.forEach(slot => {
        if (slot.day === day) {
          const startHour = parseInt(slot.startTime.split(':')[0]);
          const startMinute = parseInt(slot.startTime.split(':')[1]);
          const endHour = parseInt(slot.endTime.split(':')[0]);
          const endMinute = parseInt(slot.endTime.split(':')[1]);
          
          if (hour >= startHour && hour < endHour) {
            classes.push({
              subject,
              slot,
              startRow: (startHour - 6) * 2 + (startMinute >= 30 ? 1 : 0) + 1,
              endRow: (endHour - 6) * 2 + (endMinute >= 30 ? 1 : 0) + 1
            });
          }
        }
      });
    });

    return classes;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTimeAMPM = (hour: number): string => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${
      isCompact ? 'text-xs' : ''
    }`}>
      {/* Calendar Grid */}
      <div className="grid grid-cols-6 divide-x divide-gray-300">
        {/* Time Column */}
        <div className="bg-gradient-to-b from-gray-100 to-gray-50 divide-y divide-gray-300">
          <div className={`${isCompact ? 'p-2 h-8' : 'p-3 h-12'} font-semibold text-gray-800 text-center bg-gradient-to-r from-blue-100 to-indigo-100 border-b-2 border-blue-200`}>
            🕐 Hora
          </div>
          {hours.map(hour => (
            <div key={hour} className={`${isCompact ? 'p-1 h-12' : 'p-2 h-16'} text-center text-gray-700 border-b border-gray-200 flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-colors`}>
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-semibold`}>
                {formatTimeAMPM(hour)}
              </span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map(day => (
          <div key={day} className="relative divide-y divide-gray-200">
            <div className={`${isCompact ? 'p-2 h-8' : 'p-3 h-12'} font-semibold text-gray-800 text-center bg-gradient-to-r from-blue-100 to-indigo-100 border-b-2 border-blue-200`}>
              {isCompact ? day.slice(0, 3).toUpperCase() : day}
            </div>
            
            {/* Time Slots */}
            <div className="relative">
              {hours.map(hour => (
                <div key={hour} className={`${isCompact ? 'h-12' : 'h-16'} border-b border-gray-200 relative hover:bg-blue-50 transition-colors`}>
                  {/* Render classes that start in this hour */}
                  {getClassesForDayAndHour(day, hour).map((classInfo, index) => {
                    const duration = timeToMinutes(classInfo.slot.endTime) - timeToMinutes(classInfo.slot.startTime);
                    const heightInRem = (duration / 60) * (isCompact ? 3 : 4);
                    const startMinute = parseInt(classInfo.slot.startTime.split(':')[1]);
                    const topOffset = (startMinute / 60) * (isCompact ? 3 : 4);
                    
                    return (
                      <div
                        key={`${classInfo.subject.id}-${index}`}
                        className="absolute left-1 right-1 rounded-lg p-2 text-white shadow-lg z-10 overflow-hidden border-l-4 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        style={{
                          backgroundColor: classInfo.subject.color,
                          borderLeftColor: classInfo.subject.color,
                          height: `${heightInRem}rem`,
                          top: `${topOffset}rem`,
                          filter: 'brightness(0.95)',
                          boxShadow: `0 4px 12px ${classInfo.subject.color}40`
                        }}
                      >
                        <div className={`font-semibold ${isCompact ? 'text-xs' : 'text-sm'} leading-tight mb-1`}>
                          {classInfo.subject.code}
                        </div>
                        {!isCompact && (
                          <div className="text-xs opacity-90 leading-tight mb-1">
                            {classInfo.subject.name.length > 20 
                              ? classInfo.subject.name.substring(0, 20) + '...' 
                              : classInfo.subject.name}
                          </div>
                        )}
                        <div className={`${isCompact ? 'text-xs' : 'text-xs'} opacity-90 font-medium bg-black bg-opacity-20 rounded px-1`}>
                          {generator.formatTimeToAMPM(classInfo.slot.startTime)} - {generator.formatTimeToAMPM(classInfo.slot.endTime)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};