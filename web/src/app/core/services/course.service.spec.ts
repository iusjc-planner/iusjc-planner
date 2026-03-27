import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CourseService } from './course.service';

describe('CourseService', () => {
    let service: CourseService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CourseService, provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(CourseService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('loads courses from courses endpoint', () => {
        service.getAll().subscribe((courses) => {
            expect(courses.length).toBe(1);
            expect(courses[0].nom).toBe('Programmation C');
        });

        const req = httpMock.expectOne('/api/courses');
        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, code: 'INF101', nom: 'Programmation C' }]);
    });

    it('updates a course by id', () => {
        service.update(4, { id: 4, code: 'INF101', nom: 'Algo avancee' }).subscribe((course) => {
            expect(course.id).toBe(4);
            expect(course.nom).toBe('Algo avancee');
        });

        const req = httpMock.expectOne('/api/courses/4');
        expect(req.request.method).toBe('PUT');
        req.flush({ id: 4, code: 'INF101', nom: 'Algo avancee' });
    });
});
