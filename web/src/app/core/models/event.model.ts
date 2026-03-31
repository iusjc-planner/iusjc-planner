export interface Event {
    id?: number;
    roomId?: number;
    startTime?: string;
    endTime?: string;
    reservedByUserId?: number;
    purpose?: string;
    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
}
