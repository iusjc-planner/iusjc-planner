export interface ScheduleEntry {
    id?: number;
    courseId?: number;
    teacherId?: number;
    roomId?: number;
    groupId?: number;
    day: string;
    startTime: string;
    endTime: string;
    statut?: string;
}
