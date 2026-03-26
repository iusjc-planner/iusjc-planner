import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationApiService } from './notification-api.service';

describe('NotificationApiService', () => {
    let service: NotificationApiService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NotificationApiService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(NotificationApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('loads notifications list', () => {
        service.getAll().subscribe((items) => {
            expect(items.length).toBe(1);
            expect(items[0].titre).toBe('Alerte');
        });

        const req = httpMock.expectOne('/api/notifications');
        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, titre: 'Alerte', message: 'Conflit detecte', lu: false }]);
    });

    it('marks one notification as read', () => {
        service.markAsRead(3).subscribe((item) => {
            expect(item.id).toBe(3);
            expect(item.lu).toBeTrue();
        });

        const req = httpMock.expectOne('/api/notifications/3/read');
        expect(req.request.method).toBe('PATCH');
        req.flush({ id: 3, titre: 'Alerte', message: 'Conflit detecte', lu: true });
    });

    it('deletes a notification', () => {
        service.delete(5).subscribe((result) => {
            expect(result).toBeNull();
        });

        const req = httpMock.expectOne('/api/notifications/5');
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
