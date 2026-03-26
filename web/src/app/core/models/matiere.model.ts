export type MatiereStatus = 'ACTIVE' | 'INACTIVE';

export interface Matiere {
    id?: number;
    code: string;
    nom: string;
    description?: string;
    schoolId: number;
    filiereId: number;
    teacherId?: number;
    credits: number;
    hoursTotal: number;
    status?: MatiereStatus;
}

export interface MatiereStats {
    total: number;
    active: number;
    inactive: number;
    totalCredits: number;
    totalHours: number;
}
