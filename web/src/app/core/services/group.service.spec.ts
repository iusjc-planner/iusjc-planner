import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GroupService } from './group.service';

describe('GroupService', () => {
    let service: GroupService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GroupService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(GroupService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('creates a group', () => {
        service.create({ nom: 'L1-INFO-A', filiere: 'Informatique', niveau: 'L1', effectif: 45 }).subscribe((group) => {
            expect(group.id).toBe(12);
            expect(group.nom).toBe('L1-INFO-A');
        });

        const req = httpMock.expectOne('/api/groups');
        expect(req.request.method).toBe('POST');
        req.flush({ id: 12, nom: 'L1-INFO-A', filiere: 'Informatique', niveau: 'L1', effectif: 45 });
    });

    it('deletes a group by id', () => {
        service.delete(7).subscribe((result) => {
            expect(result).toBeNull();
        });

        const req = httpMock.expectOne('/api/groups/7');
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
