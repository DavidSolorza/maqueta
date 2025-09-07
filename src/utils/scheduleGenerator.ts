import { Subject, Schedule, UserPreferences, TimeSlot } from '../types/schedule';

export class ScheduleGenerator {
  private subjects: Subject[] = [];
  private targetSubjectCount?: number;

  constructor(subjects: Subject[], targetSubjectCount?: number) {
    this.subjects = subjects;
    this.targetSubjectCount = targetSubjectCount;
  }

  generateAllSchedules(): Schedule[] {
    const validSchedules: Schedule[] = [];
    
    // If target count is specified, only generate combinations with that exact count
    const combinations = this.targetSubjectCount 
      ? this.generateCombinationsWithExactCount(this.targetSubjectCount)
      : this.generateOptimizedCombinations();

    combinations.forEach((combination, index) => {
      // Always skip single-subject schedules
      if (combination.length === 1) {
        return;
      }

      if (this.isValidSchedule(combination)) {
        const schedule: Schedule = {
          id: `schedule-${index}`,
          subjects: combination,
          score: this.calculateAdvancedScore(combination),
          ranking: this.getRanking(combination),
          gaps: this.calculateGaps(combination),
          totalHours: this.calculateTotalHours(combination)
        };
        validSchedules.push(schedule);
      }
    });

    // Sort by subject count (descending), then by score (descending)
    return validSchedules.sort((a, b) => {
      if (a.subjects.length !== b.subjects.length) {
        return b.subjects.length - a.subjects.length;
      }
      return b.score - a.score;
    });
  }

  private generateCombinationsWithExactCount(count: number): Subject[][] {
    const combinations: Subject[][] = [];
    const n = this.subjects.length;
    
    if (count > n) return combinations;

    // Generate all combinations with exactly 'count' subjects
    const generateCombinations = (start: number, current: Subject[]): void => {
      if (current.length === count) {
        combinations.push([...current]);
        return;
      }
      
      for (let i = start; i < n; i++) {
        current.push(this.subjects[i]);
        generateCombinations(i + 1, current);
        current.pop();
      }
    };

    generateCombinations(0, []);
    return combinations;
  }

  private generateOptimizedCombinations(): Subject[][] {
    const combinations: Subject[][] = [];
    const n = this.subjects.length;
    
    // For large datasets, generate strategic combinations
    if (n > 20) {
      // Generate combinations of different sizes (2 to min(8, n))
      for (let size = 2; size <= Math.min(8, n); size++) {
        const sampleSize = Math.min(100, this.calculateCombinations(n, size));
        
        for (let attempt = 0; attempt < sampleSize; attempt++) {
          const combination = this.generateRandomCombination(size);
          if (combination.length === size) {
            combinations.push(combination);
          }
        }
      }
    } else {
      // For smaller datasets, generate more combinations
      for (let i = 1; i < (1 << n); i++) {
        const combination: Subject[] = [];
        for (let j = 0; j < n; j++) {
          if (i & (1 << j)) {
            combination.push(this.subjects[j]);
          }
        }
        combinations.push(combination);
      }
    }
    
    return combinations;
  }

  private generateRandomCombination(size: number): Subject[] {
    const combination: Subject[] = [];
    const usedIndices = new Set<number>();
    
    while (combination.length < size && usedIndices.size < this.subjects.length) {
      const randomIndex = Math.floor(Math.random() * this.subjects.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        combination.push(this.subjects[randomIndex]);
      }
    }
    
    return combination;
  }

  private calculateCombinations(n: number, r: number): number {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;
    
    let result = 1;
    for (let i = 0; i < r; i++) {
      result = result * (n - i) / (i + 1);
    }
    return Math.floor(result);
  }

  isValidSchedule(subjects: Subject[]): boolean {
    const timeSlots: { day: string; start: number; end: number; subject: string }[] = [];

    for (const subject of subjects) {
      for (const slot of subject.timeSlots) {
        const start = this.timeToMinutes(slot.startTime);
        const end = this.timeToMinutes(slot.endTime);
        
        // Check for conflicts with existing slots
        for (const existingSlot of timeSlots) {
          if (existingSlot.day === slot.day) {
            // Check for overlap: (start1 < end2) && (start2 < end1)
            if (start < existingSlot.end && existingSlot.start < end) {
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

  // Public method to check for conflicts when adding subjects
  checkSubjectConflicts(newSubject: Subject, existingSubjects: Subject[]): string[] {
    const conflicts: string[] = [];
    
    for (const existing of existingSubjects) {
      if (existing.id === newSubject.id) continue;
      
      for (const newSlot of newSubject.timeSlots) {
        for (const existingSlot of existing.timeSlots) {
          if (newSlot.day === existingSlot.day) {
            const newStart = this.timeToMinutes(newSlot.startTime);
            const newEnd = this.timeToMinutes(newSlot.endTime);
            const existingStart = this.timeToMinutes(existingSlot.startTime);
            const existingEnd = this.timeToMinutes(existingSlot.endTime);
            
            if (newStart < existingEnd && existingStart < newEnd) {
              conflicts.push(
                `${newSubject.name} (${newSlot.day} ${newSlot.startTime}-${newSlot.endTime}) se solapa con ${existing.name} (${existingSlot.day} ${existingSlot.startTime}-${existingSlot.endTime})`
              );
            }
          }
        }
      }
    }
    
    return conflicts;
  }

  private calculateAdvancedScore(subjects: Subject[]): number {
    let score = 100;
    
    // Penalize gaps more heavily
    const gaps = this.calculateGaps(subjects);
    score -= gaps * 8;
    
    // Reward more subjects
    score += subjects.length * 15;
    
    // Reward balanced distribution
    score += this.calculateDistributionBonus(subjects);
    
    // Reward reasonable course load
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    if (totalCredits >= 12 && totalCredits <= 18) {
      score += 25;
    } else if (totalCredits >= 18) {
      score += 10; // Still reward heavy loads but less
    }
    
    // Penalize very early or very late classes
    const hasVeryEarlyClasses = subjects.some(s => 
      s.timeSlots.some(slot => this.timeToMinutes(slot.startTime) < this.timeToMinutes('07:30'))
    );
    const hasVeryLateClasses = subjects.some(s => 
      s.timeSlots.some(slot => this.timeToMinutes(slot.endTime) > this.timeToMinutes('19:00'))
    );
    
    if (hasVeryEarlyClasses) score -= 15;
    if (hasVeryLateClasses) score -= 10;
    
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
    const classCounts = Object.values(daySchedules);
    const maxClasses = Math.max(...classCounts);
    const minClasses = Math.min(...classCounts);
    
    if (maxClasses - minClasses <= 1) {
      bonus += 20; // Very balanced
    } else if (maxClasses - minClasses <= 2) {
      bonus += 10; // Somewhat balanced
    }

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
    return Math.round(totalMinutes / 60 * 10) / 10;
  }

  private getRanking(subjects: Subject[]): string[] {
    const rankings: string[] = [];
    const gaps = this.calculateGaps(subjects);
    const totalHours = this.calculateTotalHours(subjects);
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    
    // Gap-based rankings
    if (gaps === 0) rankings.push('Sin huecos');
    else if (gaps <= 1) rankings.push('Muy compacto');
    else if (gaps <= 3) rankings.push('Compacto');
    else if (gaps >= 6) rankings.push('Muchos huecos');
    
    // Credit load rankings
    if (totalCredits <= 10) rankings.push('Carga muy ligera');
    else if (totalCredits <= 15) rankings.push('Carga ligera');
    else if (totalCredits <= 20) rankings.push('Carga normal');
    else rankings.push('Carga pesada');
    
    // Subject count rankings
    if (subjects.length >= 6) rankings.push('Muchas materias');
    else if (subjects.length >= 4) rankings.push('Carga completa');
    else if (subjects.length >= 2) rankings.push('Carga parcial');
    
    // Time-based rankings
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
        this.timeToMinutes(slot.startTime) <= this.timeToMinutes('07:30')
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
    if (classCounts.length === 0) return false;
    
    const maxClasses = Math.max(...classCounts);
    const minClasses = Math.min(...classCounts);
    
    return (maxClasses - minClasses) <= 2;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTimeToAMPM(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}