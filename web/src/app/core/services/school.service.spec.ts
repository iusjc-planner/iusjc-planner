import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SchoolService } from './school.service';

describe('SchoolService', () => {
    let service: SchoolService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SchoolService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(SchoolService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('creates a school with valid payload', () => {
        service.create({ nom: 'Ecole Informatique', code: 'INF' }).subscribe((school) => {
            expect(school.id).toBe(1);
            expect(school.nom).toBe('Ecole Informatique');
        });

        const req = httpMock.expectOne('/api/schools');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(jasmine.objectContaining({ name: 'Ecole Informatique', code: 'INF' }));
        req.flush({ id: 1, name: 'Ecole Informatique', code: 'INF', status: 'ACTIVE' });
    });

    it('rejects invalid school payload before HTTP call', () => {
        service.create({ nom: '   ' }).subscribe({
            next: () => fail('Expected validation error'),
            error: (error) => {
                expect(error.message).toContain('obligatoire');
            }
        });

        httpMock.expectNone('/api/schools');
    });
});
