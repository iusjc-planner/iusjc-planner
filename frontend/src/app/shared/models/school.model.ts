export interface School {
  id?: number;
  name: string;
  code?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
  filieres?: Filiere[];
  
  // UI computed fields
  logo?: string;
  teachersCount?: number;
  studentsCount?: number;
}

export interface Filiere {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  status?: FiliereStatus;
  schoolId?: number;
}

export enum FiliereStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface SchoolStats {
  total: number;
  active: number;
  inactive: number;
}

export interface FiliereStats {
  totalFilieres: number;
  activeFilieres: number;
}