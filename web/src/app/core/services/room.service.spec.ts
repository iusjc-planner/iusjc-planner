import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RoomService } from './room.service';

describe('RoomService', () => {
    let service: RoomService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RoomService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(RoomService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('loads room list from rooms endpoint', () => {
        service.getAll().subscribe((rooms) => {
            expect(rooms.length).toBe(1);
            expect(rooms[0].code).toBe('A101');
        });

        const req = httpMock.expectOne('/api/rooms');
        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, code: 'A101', nom: 'Salle A101', capacite: 45 }]);
    });

    it('deletes a room by id', () => {
        service.delete(12).subscribe((result) => {
            expect(result).toBeNull();
        });

        const req = httpMock.expectOne('/api/rooms/12');
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
