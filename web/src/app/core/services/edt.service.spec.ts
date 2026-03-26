import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EdtService } from './edt.service';

describe('EdtService', () => {
    let service: EdtService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EdtService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(EdtService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('lists EDT with query params', () => {
        service
            .listEdt({
                semaine: 12,
                annee: 2026,
                vue: 'GROUPE',
                targetId: 5,
                status: 'DRAFT',
                periode: 'SEMESTRE2'
            })
            .subscribe((items) => {
                expect(items.length).toBe(1);
                expect(items[0].id).toBe(1);
            });

        const req = httpMock.expectOne((request) => {
            return (
                request.url === '/api/edt' &&
                request.params.get('semaine') === '12' &&
                request.params.get('annee') === '2026' &&
                request.params.get('vue') === 'GROUPE' &&
                request.params.get('targetId') === '5' &&
                request.params.get('status') === 'DRAFT' &&
                request.params.get('periode') === 'SEMESTRE2'
            );
        });

        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, semaine: 12, annee: 2026, periode: 'SEMESTRE2', vue: 'GROUPE', targetId: 5, status: 'DRAFT' }]);
    });

    it('gets EDT by group and week', () => {
        service.getByGroupe(7, 14, 2026).subscribe((edt) => {
            expect(edt.targetId).toBe(7);
        });

        const req = httpMock.expectOne((request) => {
            return request.url === '/api/edt/groupe/7' && request.params.get('semaine') === '14' && request.params.get('annee') === '2026';
        });

        expect(req.request.method).toBe('GET');
        req.flush({ id: 10, semaine: 14, annee: 2026, periode: 'SEMESTRE2', vue: 'GROUPE', targetId: 7, status: 'DRAFT' });
    });

    it('calls suggestions with optional params and repeated equipments', () => {
        service
            .suggestions({
                teacherId: 11,
                date: '2026-03-23',
                groupId: 4,
                matiereId: 8,
                effectif: 35,
                equipments: ['PROJECTOR', 'BOARD']
            })
            .subscribe((slots) => {
                expect(slots.length).toBe(1);
            });

        const req = httpMock.expectOne((request) => {
            return (
                request.url === '/api/edt/suggestions' &&
                request.params.get('teacherId') === '11' &&
                request.params.get('date') === '2026-03-23' &&
                request.params.get('groupId') === '4' &&
                request.params.get('matiereId') === '8' &&
                request.params.get('effectif') === '35' &&
                request.params.getAll('equipments')?.join(',') === 'PROJECTOR,BOARD'
            );
        });

        expect(req.request.method).toBe('GET');
        req.flush([{ startTime: '2026-03-23T08:00:00', endTime: '2026-03-23T10:00:00', roomId: 3, reason: 'Libre' }]);
    });

    it('exports by view with blob response', () => {
        service.exportByView('ENSEIGNANT', 55, 12, 2026, 'pdf').subscribe((blob) => {
            expect(blob).toBeTruthy();
        });

        const req = httpMock.expectOne((request) => {
            return (
                request.url === '/api/edt/enseignant/55/export' &&
                request.params.get('semaine') === '12' &&
                request.params.get('annee') === '2026' &&
                request.params.get('format') === 'pdf'
            );
        });

        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('blob');
        req.flush(new Blob(['file'], { type: 'application/pdf' }));
    });
});
