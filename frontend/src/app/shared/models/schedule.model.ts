export interface ScheduleEntry {
  id?: number;
  courseId: string;
  teacherId: string;
  roomId: string;
  groupId: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  createdAt?: string;
  updatedAt?: string;
  // Joined data (for display)
  courseName?: string;
  teacherName?: string;
  roomName?: string;
  groupName?: string;
}

export enum ScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ScheduleFilters {
  courseId?: string;
  teacherId?: string;
  roomId?: string;
  groupId?: string;
  status?: ScheduleStatus;
  startFrom?: string;
  endTo?: string;
}

export interface ScheduleStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export interface ScheduleGenerateRequest {
  startDate: string;
  endDate: string;
  groupIds?: string[];
  teacherIds?: string[];
  roomIds?: string[];
}

/**
 * Configuration pour la génération automatique de l'emploi du temps
 */
export interface GenerationConfig {
  startDate: string;
  endDate: string;
  schoolId?: number;
  filiereId?: number;
  groupIds?: number[];
  excludeWeekends?: boolean;
  dailyStartTime?: string;
  dailyEndTime?: string;
  sessionDuration?: number;
  breakDuration?: number;
}

/**
 * Résultat de la génération automatique
 */
export interface GenerationResult {
  success: boolean;
  message: string;
  sessionsCreated: number;
  conflicts: number;
  noRoomAvailable?: number;
  details?: GenerationDetail[];
}

export interface GenerationDetail {
  matiere: string;
  teacher: string;
  group: string;
  room: string;
  date: string;
  time: string;
  status: 'created' | 'conflict' | 'no_room';
  errorMessage?: string;
}
