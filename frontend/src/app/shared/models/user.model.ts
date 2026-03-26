export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  login: string;
  password?: string;
  telephone: number;
  schoolId?: number;
  schoolName?: string;
  status: UserStatus;
  role: UserRole;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  ENSEIGNANT = 'ENSEIGNANT'
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthUser {
  login: string;
  role: string;
  exp: number;
}