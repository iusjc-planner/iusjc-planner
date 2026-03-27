/**
 * Course (Séance) - représente une séance de cours dans l'emploi du temps
 */
export interface Course {
  id?: number;
  matiereId: number;      // Référence à la matière
  type?: CourseType;      // Type de séance
  title?: string;         // Titre spécifique (optionnel)
  description?: string;
  date: string;           // Date de la séance (YYYY-MM-DD)
  startTime: string;      // Heure de début (HH:mm)
  endTime: string;        // Heure de fin (HH:mm)
  roomId?: number;        // Salle assignée
  groupId?: number;       // Groupe assigné
  teacherId?: number;     // Enseignant (si différent de celui de la matière)
  status?: CourseStatus;
  sequenceNumber?: number;// Numéro de la séance
  notes?: string;
  
  // Pour affichage
  matiereName?: string;
  matiereCode?: string;
  roomName?: string;
  groupName?: string;
  teacherName?: string;
}

export enum CourseStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED'
}

export enum CourseType {
  CM = 'CM',    // Cours Magistral
  TD = 'TD',    // Travaux Dirigés
  TP = 'TP',    // Travaux Pratiques
  EXAM = 'EXAM' // Examen
}

export interface CourseFilters {
  matiereId?: number;
  status?: CourseStatus;
  type?: CourseType;
  teacherId?: number;
  roomId?: number;
  groupId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CourseStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

