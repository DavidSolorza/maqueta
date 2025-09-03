import { Subject, Schedule, UserPreferences, TimeSlot } from '../types/schedule';

export class ScheduleGenerator {
  private subjects: Subject[] = [];

  constructor(subjects: Subject[]) {
    this.subjects = subjects;
  }

  generateAllSchedules(): Schedule[] {
    const validSchedules: Schedule[] = [];
    const combinations = this.generateAllCombinations();

    combinations.forEach((combination, index) => {
      if (this.isValidSchedule(combination)) {
        const schedule: Schedule = {
          id: `schedule-${index}`,
          subjects: combination,
          score: this.calculateBasicScore(combination),
          ranking: this.getRanking(combination),
          gaps: this.calculateGaps(combination),
          totalHours: this.calculateTotalHours(combination)
        };
        validSchedules.push(schedule);
      }
    });

    return validSchedules.sort((a, b) => b.score - a.score); // All valid schedules
  }

  private generateAllCombinations(): Subject[][] {
    const combinations: Subject[][] = [];
    const n = this.subjects.length;
    
    // Generate all possible combinations using bit manipulation
    // 2^n - 1 combinations (excluding empty set)
    for (let i = 1; i < (1 << n); i++) {
      const combination: Subject[] = [];
      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          combination.push(this.subjects[j]);
        }
      }
      combinations.push(combination);
    }
    
    return combinations;
  }

  private isValidSchedule(subjects: Subject[]): boolean {
    const timeSlots: { day: string; start: number; end: number; subject: string }[] = [];

    for (const subject of subjects) {
      for (const slot of subject.timeSlots) {
        const start = this.timeToMinutes(slot.startTime);
        const end = this.timeToMinutes(slot.endTime);
        
        // Check for conflicts
        for (const existingSlot of timeSlots) {
          if (existingSlot.day === slot.day) {
            if ((start < existingSlot.end && end > existingSlot.start)) {
              return false; // Conflict found
            }
          }
        }
        
        timeSlots.push({
          day: slot.day,
          start,
          end,
          subject: subject.name
        });
      }
    }

    return true;
  }

  private calculateBasicScore(subjects: Subject[]): number {
    let score = 100;
    
    // Basic scoring based on gaps and distribution
    const gaps = this.calculateGaps(subjects);
    score -= gaps * 5; // Penalize gaps
    
    // Reward balanced distribution
    score += this.calculateDistributionBonus(subjects);
    
    // Reward reasonable course load
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    if (totalCredits >= 12 && totalCredits <= 18) {
      score += 20;
    }
    
    return Math.max(0, score);
  }

  private calculateGaps(subjects: Subject[]): number {
    const daySchedules: { [day: string]: { start: number; end: number }[] } = {};
    
    subjects.forEach(subject => {
      subject.timeSlots.forEach(slot => {
        if (!daySchedules[slot.day]) {
          daySchedules[slot.day] = [];
        }
        daySchedules[slot.day].push({
          start: this.timeToMinutes(slot.startTime),
          end: this.timeToMinutes(slot.endTime)
        });
      });
    });

    let totalGaps = 0;
    Object.values(daySchedules).forEach(daySlots => {
      daySlots.sort((a, b) => a.start - b.start);
      for (let i = 0; i < daySlots.length - 1; i++) {
        const gap = daySlots[i + 1].start - daySlots[i].end;
        if (gap > 0) {
          totalGaps += Math.floor(gap / 60); // Convert to hours
        }
      }
    });

    return totalGaps;
  }

  private calculateDistributionBonus(subjects: Subject[]): number {
    let bonus = 0;
    const daySchedules: { [day: string]: number } = {};
    
    subjects.forEach(subject => {
      subject.timeSlots.forEach(slot => {
        daySchedules[slot.day] = (daySchedules[slot.day] || 0) + 1;
      });
    });

    // Reward balanced distribution
    Object.values(daySchedules).forEach(classCount => {
      if (classCount >= 2 && classCount <= 4) {
        bonus += classCount * 3;
      }
    });

    return bonus;
  }

  private calculateTotalHours(subjects: Subject[]): number {
    let totalMinutes = 0;
    subjects.forEach(subject => {
      subject.timeSlots.forEach(slot => {
        const start = this.timeToMinutes(slot.startTime);
        const end = this.timeToMinutes(slot.endTime);
        totalMinutes += (end - start);
      });
    });
    return Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal
  }

  private getRanking(subjects: Subject[]): string[] {
    const rankings: string[] = [];
    const gaps = this.calculateGaps(subjects);
    const totalHours = this.calculateTotalHours(subjects);
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    
    if (gaps === 0) rankings.push('Sin huecos');
    else if (gaps <= 2) rankings.push('Compacto');
    else if (gaps >= 6) rankings.push('Muchos huecos');
    
    if (totalCredits <= 12) rankings.push('Carga ligera');
    else if (totalCredits >= 18) rankings.push('Carga pesada');
    else rankings.push('Carga normal');
    
    const hasAfternoonFree = this.hasAfternoonFree(subjects);
    if (hasAfternoonFree) rankings.push('Tardes libres');
    
    const hasMorningFree = this.hasMorningFree(subjects);
    if (hasMorningFree) rankings.push('Mañanas libres');
    
    const hasEarlyClasses = this.hasEarlyClasses(subjects);
    if (hasEarlyClasses) rankings.push('Clases temprano');
    
    const isBalanced = this.isBalancedWeek(subjects);
    if (isBalanced) rankings.push('Bien distribuido');

    return rankings.length > 0 ? rankings : ['Horario estándar'];
  }

  private hasAfternoonFree(subjects: Subject[]): boolean {
    const afternoonSlots = subjects.some(subject =>
      subject.timeSlots.some(slot => 
        this.timeToMinutes(slot.startTime) >= this.timeToMinutes('14:00')
      )
    );
    return !afternoonSlots;
  }

  private hasMorningFree(subjects: Subject[]): boolean {
    const morningSlots = subjects.some(subject =>
      subject.timeSlots.some(slot => 
        this.timeToMinutes(slot.startTime) < this.timeToMinutes('12:00')
      )
    );
    return !morningSlots;
  }

  private hasEarlyClasses(subjects: Subject[]): boolean {
    return subjects.some(subject =>
      subject.timeSlots.some(slot => 
        this.timeToMinutes(slot.startTime) <= this.timeToMinutes('08:00')
      )
    );
  }

  private isBalancedWeek(subjects: Subject[]): boolean {
    const daySchedules: { [day: string]: number } = {};
    
    subjects.forEach(subject => {
      subject.timeSlots.forEach(slot => {
        daySchedules[slot.day] = (daySchedules[slot.day] || 0) + 1;
      });
    });

    const classCounts = Object.values(daySchedules);
    const maxClasses = Math.max(...classCounts);
    const minClasses = Math.min(...classCounts);
    
    return (maxClasses - minClasses) <= 2; // Balanced if difference is 2 or less
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}