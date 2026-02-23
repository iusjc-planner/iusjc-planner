/**
 * Matière - représente une matière enseignée
 */
export interface Matiere {
  id?: number;
  code: string;           // Identifiant unique (e.g., ISI4177)
  nom: string;            // Nom complet de la matière
  description?: string;
  schoolId: number;       // École
  filiereId: number;      // Filière
  teacherId?: number;     // Enseignant responsable
  credits: number;        // Nombre de crédits (>0)
  hoursTotal: number;     // Volume horaire total
  status?: MatiereStatus;
  supports?: string[];    // URLs des supports de cours

  // Pour affichage
  schoolName?: string;
  filiereName?: string;
  teacherName?: string;
}

export enum MatiereStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface MatiereFilters {
  code?: string;
  nom?: string;
  status?: MatiereStatus;
  schoolId?: number;
  filiereId?: number;
  teacherId?: number;
}

export interface MatiereStats {
  total: number;
  active: number;
  inactive: number;
  totalCredits: number;
  totalHours: number;
}
