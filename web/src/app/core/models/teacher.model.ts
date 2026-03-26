export interface Teacher {
    id?: number;
    userId?: number;
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    login?: string;
    ecoles?: string[];
    matieres?: string[];
    statut?: string;
    specialities?: string[];
}
