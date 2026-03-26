export interface SchoolFiliere {
    id?: number;
    code: string;
    nom: string;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface School {
    id?: number;
    nom: string;
    code?: string;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    filieres?: SchoolFiliere[];
}
