import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminStatsWidget } from './admin-stats-widget';
import { TeacherService } from '../../../core/services/teacher.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { SchoolService } from '../../../core/services/school.service';
import { RoomService } from '../../../core/services/room.service';

describe('AdminStatsWidget', () => {
    let fixture: ComponentFixture<AdminStatsWidget>;
    let component: AdminStatsWidget;

    const teacherServiceSpy = jasmine.createSpyObj<TeacherService>('TeacherService', ['getAll']);
    const scheduleServiceSpy = jasmine.createSpyObj<ScheduleService>('ScheduleService', ['getAll']);
    const schoolServiceSpy = jasmine.createSpyObj<SchoolService>('SchoolService', ['getAll']);
    const roomServiceSpy = jasmine.createSpyObj<RoomService>('RoomService', ['getAll']);

    beforeEach(async () => {
        teacherServiceSpy.getAll.and.returnValue(
            of([
                { id: 1, nom: 'A', prenom: 'B', email: 'a@b.com', login: 'ab', statut: 'Actif' },
                { id: 2, nom: 'C', prenom: 'D', email: 'c@d.com', login: 'cd', statut: 'Inactif' }
            ])
        );
        scheduleServiceSpy.getAll.and.returnValue(
            of([
                { id: 1, day: 'Monday', startTime: '08:00', endTime: '10:00', statut: 'en_attente' },
                { id: 2, day: 'Tuesday', startTime: '10:00', endTime: '12:00', statut: 'conflit' }
            ])
        );
        schoolServiceSpy.getAll.and.returnValue(of([{ id: 1, nom: 'Ecole 1' }, { id: 2, nom: 'Ecole 2' }]));
        roomServiceSpy.getAll.and.returnValue(
            of([
                { id: 1, code: 'A1', nom: 'Salle A1', capacite: 30, statut: 'disponible' },
                { id: 2, code: 'B1', nom: 'Salle B1', capacite: 40, statut: 'maintenance' }
            ])
        );

        await TestBed.configureTestingModule({
            imports: [AdminStatsWidget],
            providers: [
                { provide: TeacherService, useValue: teacherServiceSpy },
                { provide: ScheduleService, useValue: scheduleServiceSpy },
                { provide: SchoolService, useValue: schoolServiceSpy },
                { provide: RoomService, useValue: roomServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminStatsWidget);
        component = fixture.componentInstance;
    });

    it('loads aggregated stats from services', () => {
        fixture.detectChanges();

        expect(component.loading).toBeFalse();
        expect(component.stats.teachers).toBe(2);
        expect(component.stats.activeTeachers).toBe(1);
        expect(component.stats.pendingReservations).toBe(1);
        expect(component.stats.schools).toBe(2);
        expect(component.stats.rooms).toBe(2);
        expect(component.stats.availableRooms).toBe(1);
        expect(component.stats.maintenanceRooms).toBe(1);
        expect(component.stats.conflicts).toBe(1);
    });

    it('falls back to zeros when one source fails', async () => {
        teacherServiceSpy.getAll.and.returnValue(throwError(() => new Error('boom')));

        const errorFixture = TestBed.createComponent(AdminStatsWidget);
        const errorComponent = errorFixture.componentInstance;
        errorFixture.detectChanges();

        expect(errorComponent.loading).toBeFalse();
        expect(errorComponent.stats.teachers).toBe(0);
        expect(errorComponent.stats.activeTeachers).toBe(0);
    });
});
