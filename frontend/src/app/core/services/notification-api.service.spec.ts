import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiEndpoints } from '../config/api-endpoints';
import { NotificationApiService } from './notification-api.service';

describe('NotificationApiService', () => {
  let service: NotificationApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationApiService]
    });

    service = TestBed.inject(NotificationApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request notifications with filters', () => {
    service.getAll({ userId: 12, read: false, type: 'INFO' }).subscribe();

    const req = httpMock.expectOne(
      request => request.url === ApiEndpoints.notifications && request.method === 'GET'
    );

    expect(req.request.params.get('userId')).toBe('12');
    expect(req.request.params.get('read')).toBe('false');
    expect(req.request.params.get('type')).toBe('INFO');
    req.flush([]);
  });

  it('should fail client-side when creating invalid payload', (done) => {
    service.create({ userId: 0, title: '', message: '', type: 'INFO' }).subscribe({
      next: () => fail('Expected validation error'),
      error: (error: Error) => {
        expect(error.message).toContain('userId');
        done();
      }
    });
  });

  it('should call markAsRead endpoint', () => {
    service.markAsRead(9).subscribe();

    const req = httpMock.expectOne(`${ApiEndpoints.notifications}/9/read`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 9, userId: 1, title: 'ok', message: 'ok', type: 'INFO', read: true });
  });
});
