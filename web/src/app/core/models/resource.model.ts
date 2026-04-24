export interface Resource {
    id?: number;
    nom: string;
    type: 'PROJECTEUR' | 'ORDINATEUR' | 'MATERIEL' | 'AUTRE';
    quantite: number;
    localisation: string;
    statut?: 'DISPONIBLE' | 'RESERVE' | 'MAINTENANCE';
    createdAt?: string;
    updatedAt?: string;
}
