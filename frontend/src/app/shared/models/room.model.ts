export interface Room {
  id?: number;
  name: string;
  capacity: number;
  type: RoomType;
  status: RoomStatus;
  location?: string;
  description?: string;
  equipments?: string[];
}

export enum RoomType {
  CLASSROOM = 'CLASSROOM',
  LAB = 'LAB',
  AUDITORIUM = 'AUDITORIUM'
}

export enum RoomStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE'
}
