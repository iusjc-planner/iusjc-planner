export enum EventType {
    EXAMEN = 'EXAMEN',
    CONFERENCE = 'CONFERENCE',
    REUNION = 'REUNION',
    SOUTENANCE = 'SOUTENANCE',
    CEREMONIE = 'CEREMONIE',
    AUTRE = 'AUTRE'
}

export enum EventStatus {
    PLANIFIE = 'PLANIFIE',
    CONFIRME = 'CONFIRME',
    ANNULE = 'ANNULE',
    TERMINE = 'TERMINE'
}

export interface Event {
    id?: number;
    nom: string;
    description?: string;
    type: EventType | string;
    date: string; // YYYY-MM-DD
    heureDebut: string; // HH:mm or HH:mm:ss
    duree: number; // minutes
    salleId?: number;
    organisateurId: number;
    status: EventStatus | string;
    participantIds?: number[];
}
