import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
    let service: ScheduleService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ScheduleService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(ScheduleService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('loads schedule entries with query params', () => {
        service
            .getAll({
                fromDate: '2026-03-26',
                toDate: '2026-03-26',
                teacherId: 4,
                roomId: 2,
                groupId: 8
            })
            .subscribe((entries) => {
                expect(entries.length).toBe(1);
                expect(entries[0].courseId).toBe(11);
            });

        const req = httpMock.expectOne((request) => {
            return (
                request.url === '/api/schedule' &&
                request.params.get('fromDate') === '2026-03-26' &&
                request.params.get('toDate') === '2026-03-26' &&
                request.params.get('teacherId') === '4' &&
                request.params.get('roomId') === '2' &&
                request.params.get('groupId') === '8'
            );
        });

        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, courseId: 11, teacherId: 4, roomId: 2, groupId: 8, day: 'MONDAY', startTime: '08:00', endTime: '10:00' }]);
    });

    it('creates a schedule entry', () => {
        service
            .create({ courseId: 11, teacherId: 4, roomId: 2, groupId: 8, day: 'MONDAY', startTime: '08:00', endTime: '10:00' })
            .subscribe((entry) => {
                expect(entry.id).toBe(99);
            });

        const req = httpMock.expectOne('/api/schedule');
        expect(req.request.method).toBe('POST');
        req.flush({ id: 99, courseId: 11, teacherId: 4, roomId: 2, groupId: 8, day: 'MONDAY', startTime: '08:00', endTime: '10:00' });
    });
});
