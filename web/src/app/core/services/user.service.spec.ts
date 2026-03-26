import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UserService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('creates a user with valid payload', () => {
        service
            .create({ nom: 'Admin', prenom: 'IUSJC', email: 'admin@iusjc.cm', login: 'admin', role: 'Administrateur', statut: 'Actif' })
            .subscribe((user) => {
                expect(user.id).toBe(1);
            });

        const req = httpMock.expectOne('/api/users');
        expect(req.request.method).toBe('POST');
        req.flush({ id: 1, nom: 'Admin', prenom: 'IUSJC', email: 'admin@iusjc.cm', login: 'admin', role: 'Administrateur', statut: 'Actif' });
    });

    it('rejects invalid user payload before HTTP call', () => {
        service.create({ nom: '', prenom: 'IUSJC', email: 'bad-email', login: '', role: '', statut: 'Actif' }).subscribe({
            next: () => fail('Expected validation error'),
            error: (error) => {
                expect(error.message).toContain('nom');
            }
        });

        httpMock.expectNone('/api/users');
    });
});
