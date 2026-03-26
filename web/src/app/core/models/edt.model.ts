import { ScheduleEntry } from './schedule.model';

export type EdtPeriodeType = 'SEMESTRE1' | 'SEMESTRE2' | 'ANNUEL';
export type EdtVueType = 'GROUPE' | 'ENSEIGNANT' | 'SALLE';
export type EdtStatus = 'DRAFT' | 'VALIDATED' | 'PUBLISHED' | 'ARCHIVED';

export interface Edt {
    id?: number;
    semaine: number;
    annee: number;
    periode: EdtPeriodeType;
    vue: EdtVueType;
    targetId: number;
    status: EdtStatus;
    creePar?: number;
    dateCreation?: string;
    datePublication?: string;
    entries?: ScheduleEntry[];
}

export interface GenerationCourseInput {
    id?: number;
    courseId: number;
    teacherId: number;
    groupId: number;
    preferredRoomId?: number;
    groupSize?: number;
    roomCapacity?: number;
    fixedStartTime?: string;
    fixedEndTime?: string;
    courseType?: string;
    courseTitle?: string;
    subjectName?: string;
}

export interface EdtGenerationRequest {
    semaine?: number;
    annee: number;
    periode: EdtPeriodeType;
    groupIds?: number[];
    entries?: GenerationCourseInput[];
    dryRun?: boolean;
    creePar?: number;
    defaultGroupSize?: number;
    defaultRoomCapacity?: number;
    algorithmType?: string;
    teacherAvailabilityRequired?: boolean;
    useRoomStatus?: boolean;
    maxRunTimeSeconds?: number;
}

export interface EdtGenerationResult {
    edtIds: number[];
    requested: number;
    placed: number;
    unplaced: number;
    conflicts: string[];
    algorithmUsed?: string;
    optimizationMetrics?: Record<string, unknown>;
}

export interface SlotSuggestion {
    startTime: string;
    endTime: string;
    roomId?: number;
    reason?: string;
}

export interface ValidationRequest {
    courseId: number;
    teacherId: number;
    roomId: number;
    groupId: number;
    startTime: string;
    endTime: string;
    groupSize?: number;
    roomCapacity?: number;
    excludeEntryId?: number;
}

export interface ValidationResult {
    valid: boolean;
    conflicts: string[];
    warnings: string[];
}

export type ValidationReportStatus = 'VALID' | 'INVALID';

export interface ValidationIssue {
    type: string;
    message: string;
    entries: number[];
}

export interface ValidationReport {
    edtId: number;
    status: ValidationReportStatus;
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    validatedAt?: string;
}

export type WeeklyViewResult = Record<string, ScheduleEntry[]>;
