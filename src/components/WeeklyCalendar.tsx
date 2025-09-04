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
  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM
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
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
      isCompact ? 'text-xs' : ''
    }`}>
      {/* Calendar Grid */}
      <div className="grid grid-cols-6 divide-x divide-gray-200">
        {/* Time Column */}
        <div className="bg-gray-50 divide-y divide-gray-200">
          <div className={`${isCompact ? 'p-2 h-8' : 'p-3 h-12'} font-medium text-gray-700 text-center bg-gray-100`}>
            Hora
          </div>
          {hours.map(hour => (
            <div key={hour} className={`${isCompact ? 'p-1 h-12' : 'p-2 h-16'} text-center text-gray-600 border-b border-gray-100 flex items-center justify-center bg-gray-50`}>
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>
                {formatTimeAMPM(hour)}
              </span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map(day => (
          <div key={day} className="relative divide-y divide-gray-100">
            <div className={`${isCompact ? 'p-2 h-8' : 'p-3 h-12'} font-medium text-gray-700 text-center bg-gray-100 border-b-2 border-gray-200`}>
              {isCompact ? day.slice(0, 3) : day}
            </div>
            
            {/* Time Slots */}
            <div className="relative">
              {hours.map(hour => (
                <div key={hour} className={`${isCompact ? 'h-12' : 'h-16'} border-b border-gray-100 relative hover:bg-gray-50 transition-colors`}>
                  {/* Render classes that start in this hour */}
                  {getClassesForDayAndHour(day, hour).map((classInfo, index) => {
                    const duration = timeToMinutes(classInfo.slot.endTime) - timeToMinutes(classInfo.slot.startTime);
                    const heightInRem = (duration / 60) * (isCompact ? 3 : 4);
                    const startMinute = parseInt(classInfo.slot.startTime.split(':')[1]);
                    const topOffset = (startMinute / 60) * (isCompact ? 3 : 4);
                    
                    return (
                      <div
                        key={`${classInfo.subject.id}-${index}`}
                        className="absolute left-1 right-1 rounded-lg p-2 text-white shadow-md z-10 overflow-hidden border-l-4 hover:shadow-lg transition-shadow"
                        style={{
                          backgroundColor: classInfo.subject.color,
                          borderLeftColor: classInfo.subject.color,
                          height: `${heightInRem}rem`,
                          top: `${topOffset}rem`,
                          filter: 'brightness(0.95)'
                        }}
                      >
                        <div className={`font-semibold ${isCompact ? 'text-xs' : 'text-sm'} leading-tight mb-1`}>
                          {classInfo.subject.code}
                        </div>
                        <div className={`${isCompact ? 'text-xs' : 'text-xs'} opacity-90 leading-tight`}>
                          {classInfo.subject.name}
                        </div>
                        <div className={`${isCompact ? 'text-xs' : 'text-xs'} opacity-80 mt-1 font-medium`}>
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