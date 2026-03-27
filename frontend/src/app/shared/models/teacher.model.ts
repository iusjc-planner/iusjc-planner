export interface Teacher {
  id?: number;
  userId?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  specialite?: string;
  grade?: TeacherGrade;
  status?: TeacherStatus;
  photo?: string;
  subjects?: string[];
  coursesCount?: number;
  weeklyAvailability?: WeeklyAvailability;
  unavailablePeriods?: UnavailablePeriod[];
}

export enum TeacherGrade {
  ASSISTANT = 'ASSISTANT',
  CHEF_TRAVAUX = 'CHEF_TRAVAUX',
  PROFESSEUR = 'PROFESSEUR'
}

export enum TeacherStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EN_CONGE = 'EN_CONGE'
}

export interface WeeklyAvailability {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface UnavailablePeriod {
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface TeacherStats {
  totalTeachers: number;
  totalCourses: number;
}

export interface TeacherFilters {
  searchTerm?: string;
  status?: TeacherStatus;
  grade?: TeacherGrade;
  subject?: string;
}

// === Types pour la gestion des disponibilités ===

export enum AvailabilityType {
  WEEKLY_RECURRING = 'WEEKLY_RECURRING',
  SPECIFIC_DATE = 'SPECIFIC_DATE',
  DATE_RANGE = 'DATE_RANGE'
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  PREFERRED = 'PREFERRED'
}

export interface TeacherAvailability {
  id?: number;
  teacherId: number;
  availabilityType: AvailabilityType;
  status: AvailabilityStatus;
  dayOfWeek?: number; // 1=Lundi, 7=Dimanche
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
  specificDate?: string; // Format "YYYY-MM-DD"
  endDate?: string;      // Format "YYYY-MM-DD"
  reason?: string;
  icsEventUid?: string;
  fromIcsImport?: boolean;
}

/**
 * Grille de disponibilités hebdomadaires
 * Format: { dayOfWeek: { "HH:mm-HH:mm": "available|unavailable|scheduled|break" } }
 */
export type AvailabilityGrid = {
  [dayOfWeek: number]: {
    [timeSlot: string]: string;
  };
};

/**
 * Résultat de l'import d'un fichier ICS
 */
export interface IcsImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  totalParsed?: number;
  skippedDuplicates?: number;
}