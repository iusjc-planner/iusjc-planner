export interface User {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: number;
    login: string;
    password?: string;
    role: string;
    statut?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    ecoles?: string[];
    matieres?: string[];
}

export interface UserFilters {
    search?: string;
    role?: string;
    statut?: string;
    page?: number;
    size?: number;
}
