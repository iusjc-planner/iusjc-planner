import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatiereService } from './matiere.service';

describe('MatiereService', () => {
    let service: MatiereService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MatiereService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(MatiereService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('loads matieres from endpoint', () => {
        service.getAll().subscribe((matieres) => {
            expect(matieres.length).toBe(1);
            expect(matieres[0].code).toBe('INF101');
        });

        const req = httpMock.expectOne('/api/matieres');
        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, code: 'INF101', nom: 'Algorithmique', schoolId: 1, filiereId: 2, credits: 4, hoursTotal: 36, status: 'ACTIVE' }]);
    });

    it('creates a matiere with default status', () => {
        service
            .create({
                code: 'MAT201',
                nom: 'Statistiques',
                schoolId: 1,
                filiereId: 3,
                credits: 5,
                hoursTotal: 48
            })
            .subscribe((matiere) => {
                expect(matiere.code).toBe('MAT201');
                expect(matiere.status).toBe('ACTIVE');
            });

        const req = httpMock.expectOne('/api/matieres');
        expect(req.request.method).toBe('POST');
        expect(req.request.body.status).toBe('ACTIVE');
        req.flush({ id: 9, ...req.request.body });
    });
});
