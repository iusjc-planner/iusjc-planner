export interface Group {
  id?: number;
  name: string;
  description?: string;
  level?: string;
  schoolId: number;
  size?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface GroupStats {
  total: number;
  active: number;
  inactive: number;
}
