export type ReportType =
  | 'OCCUPATION_SALLE'
  | 'CHARGE_ENSEIGNANT'
  | 'STATISTIQUES_ECOLE'
  | 'EVENEMENTS'
  | 'GLOBAL';

export type ReportFormat = 'PDF' | 'EXCEL' | 'JSON';
export type ReportStatus = 'EN_COURS' | 'TERMINE' | 'ERREUR';

export interface Report {
  id: number;
  titre: string;
  type: ReportType;
  dateGeneration: string;
  periodeDebut?: string;
  periodeFin?: string;
  generePar: number;
  format: ReportFormat;
  cheminFichier?: string;
  parametres?: string;
  status: ReportStatus;
}

export interface GenerateReportRequest {
  type: ReportType;
  format: ReportFormat;
  periodeDebut?: string;
  periodeFin?: string;
  salleId?: number;
  teacherId?: number;
  schoolId?: number;
  params?: Record<string, unknown>;
}
