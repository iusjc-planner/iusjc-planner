import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TeacherService } from './teacher.service';

describe('TeacherService', () => {
    let service: TeacherService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TeacherService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(TeacherService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('creates a teacher with valid payload', () => {
        service
            .create({ nom: 'Dupont', prenom: 'Jean', email: 'dupont@iusjc.cm', login: 'dupont', statut: 'Actif' })
            .subscribe((teacher) => {
                expect(teacher.id).toBe(1);
            });

        const req = httpMock.expectOne('/api/teachers');
        expect(req.request.method).toBe('POST');
        req.flush({ id: 1, nom: 'Dupont', prenom: 'Jean', email: 'dupont@iusjc.cm', login: 'dupont', statut: 'Actif' });
    });

    it('rejects invalid teacher payload before HTTP call', () => {
        service.create({ nom: 'Dupont', prenom: '', email: 'invalid', login: '', statut: 'Actif' }).subscribe({
            next: () => fail('Expected validation error'),
            error: (error) => {
                expect(error.message.length).toBeGreaterThan(0);
            }
        });

        httpMock.expectNone('/api/teachers');
    });
});
