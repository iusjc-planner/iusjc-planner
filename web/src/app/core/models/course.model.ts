export interface Course {
    id?: number;
    code?: string;
    nom: string;
    description?: string;
    volumeHoraire?: number;
    credits?: number;
    matiereId?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
    type?: 'CM' | 'TD' | 'TP' | 'EXAM';
    roomId?: number;
    groupId?: number;
    teacherId?: number;
    title?: string;
    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
}
