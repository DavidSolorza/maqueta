import React from 'react';
import { Schedule, TimeSlot } from '../types/schedule';

interface WeeklyCalendarProps {
  schedule: Schedule;
  isCompact?: boolean;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  schedule, 
  isCompact = false 
}) => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

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
              startRow: (startHour - 7) * 2 + (startMinute >= 30 ? 1 : 0) + 1,
              endRow: (endHour - 7) * 2 + (endMinute >= 30 ? 1 : 0) + 1
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

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
      isCompact ? 'text-xs' : ''
    }`}>
      {/* Calendar Grid */}
      <div className="grid grid-cols-6 divide-x divide-gray-200">
        {/* Time Column */}
        <div className="bg-gray-50 divide-y divide-gray-200">
          <div className={`${isCompact ? 'p-2 h-8' : 'p-3 h-12'} font-medium text-gray-700 text-center`}>
            Hora
          </div>
          {hours.map(hour => (
            <div key={hour} className={`${isCompact ? 'p-1 h-12' : 'p-2 h-16'} text-center text-gray-600 border-b border-gray-100 flex items-center justify-center`}>
              <span className={isCompact ? 'text-xs' : 'text-sm'}>
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map(day => (
          <div key={day} className="relative divide-y divide-gray-100">
            <div className={`${isCompact ? 'p-2 h-8' : 'p-3 h-12'} font-medium text-gray-700 text-center bg-gray-50`}>
              {isCompact ? day.slice(0, 3) : day}
            </div>
            
            {/* Time Slots */}
            <div className="relative">
              {hours.map(hour => (
                <div key={hour} className={`${isCompact ? 'h-12' : 'h-16'} border-b border-gray-100 relative`}>
                  {/* Render classes that start in this hour */}
                  {getClassesForDayAndHour(day, hour).map((classInfo, index) => {
                    const duration = timeToMinutes(classInfo.slot.endTime) - timeToMinutes(classInfo.slot.startTime);
                    const heightInRem = (duration / 60) * (isCompact ? 3 : 4); // 3rem or 4rem per hour
                    const startMinute = parseInt(classInfo.slot.startTime.split(':')[1]);
                    const topOffset = (startMinute / 60) * (isCompact ? 3 : 4);
                    
                    return (
                      <div
                        key={`${classInfo.subject.id}-${index}`}
                        className="absolute left-0 right-0 mx-1 rounded-md p-2 text-white shadow-sm z-10 overflow-hidden"
                        style={{
                          backgroundColor: classInfo.subject.color,
                          height: `${heightInRem}rem`,
                          top: `${topOffset}rem`
                        }}
                      >
                        <div className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'} leading-tight`}>
                          {classInfo.subject.name}
                        </div>
                        <div className={`${isCompact ? 'text-xs' : 'text-xs'} opacity-90 mt-1`}>
                          {classInfo.slot.startTime} - {classInfo.slot.endTime}
                        </div>
                        {!isCompact && (
                          <div className="text-xs opacity-80 mt-1">
                            {classInfo.subject.code}
                          </div>
                        )}
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