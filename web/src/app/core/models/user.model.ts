export interface User {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    login: string;
    role: string;
    statut: string;
}

export interface UserFilters {
    search?: string;
    role?: string;
    statut?: string;
    page?: number;
    size?: number;
}
