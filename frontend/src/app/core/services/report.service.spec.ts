import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ReportService } from './report.service';
import { ApiEndpoints } from '../config/api-endpoints';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportService]
    });

    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list reports with optional type filter', () => {
    service.list('GLOBAL').subscribe();

    const req = httpMock.expectOne(request => request.url === ApiEndpoints.reports && request.method === 'GET');
    expect(req.request.params.get('type')).toBe('GLOBAL');
    req.flush([]);
  });

  it('should call report generation endpoint', () => {
    service.generate({ type: 'GLOBAL', format: 'PDF' }).subscribe();

    const req = httpMock.expectOne(`${ApiEndpoints.reports}/generate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.type).toBe('GLOBAL');
    req.flush({ id: 1, titre: 'Global', type: 'GLOBAL', format: 'PDF', status: 'TERMINE', dateGeneration: new Date().toISOString(), generePar: 1 });
  });

  it('should download report as blob', () => {
    service.download(99).subscribe(blob => {
      expect(blob instanceof Blob).toBeTrue();
    });

    const req = httpMock.expectOne(`${ApiEndpoints.reports}/99/download`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['sample']));
  });
});
