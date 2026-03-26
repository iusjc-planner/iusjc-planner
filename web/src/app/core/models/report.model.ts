export interface ReportRequest {
    type: string;
    format: 'pdf' | 'xlsx' | 'csv';
    fromDate?: string;
    toDate?: string;
}

export interface ReportMetadata {
    id?: string;
    type: string;
    format: string;
    generatedAt?: string;
    downloadUrl?: string;
}
