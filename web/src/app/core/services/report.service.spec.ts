import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportService } from './report.service';

describe('ReportService', () => {
    let service: ReportService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ReportService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(ReportService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('generates report with valid payload', () => {
        service.generate({ type: 'room-usage', format: 'pdf' }).subscribe((report) => {
            expect(report.id).toBe('r-1');
        });

        const req = httpMock.expectOne('/api/reports/generate');
        expect(req.request.method).toBe('POST');
        req.flush({ id: 'r-1', type: 'room-usage', format: 'pdf' });
    });

    it('rejects invalid date range before HTTP call', () => {
        service.generate({ type: 'room-usage', format: 'pdf', fromDate: '2026-03-30', toDate: '2026-03-01' }).subscribe({
            next: () => fail('Expected validation error'),
            error: (error) => {
                expect(error.message).toContain('date de debut');
            }
        });

        httpMock.expectNone('/api/reports/generate');
    });

    it('downloads report blob', () => {
        service.download('r-1').subscribe((blob) => {
            expect(blob).toBeTruthy();
        });

        const req = httpMock.expectOne('/api/reports/r-1/download');
        expect(req.request.method).toBe('GET');
        req.flush(new Blob(['csv-data'], { type: 'text/csv' }));
    });
});
