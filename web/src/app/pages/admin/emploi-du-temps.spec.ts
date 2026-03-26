import { of } from 'rxjs';
// @ts-ignore - tooling false positive: module resolves correctly during Angular test compilation
import { EmploiDuTempsPage } from './emploi-du-temps';
import { ScheduleService } from '../../core/services/schedule.service';
import { TeacherService } from '../../core/services/teacher.service';
import { RoomService } from '../../core/services/room.service';
import { NotificationService } from '../../core/services/notification.service';

describe('EmploiDuTempsPage', () => {
    let scheduleService: jasmine.SpyObj<ScheduleService>;
    let teacherService: jasmine.SpyObj<TeacherService>;
    let roomService: jasmine.SpyObj<RoomService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let page: EmploiDuTempsPage;

    beforeEach(() => {
        scheduleService = jasmine.createSpyObj<ScheduleService>('ScheduleService', ['getAll', 'create', 'update']);
        teacherService = jasmine.createSpyObj<TeacherService>('TeacherService', ['getAll']);
        roomService = jasmine.createSpyObj<RoomService>('RoomService', ['getAll']);
        notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['info', 'warn', 'error']);

        scheduleService.getAll.and.returnValue(
            of([
                { id: 1, courseId: 10, teacherId: 2, roomId: 3, groupId: 4, day: 'MONDAY', startTime: '08:00', endTime: '10:00', statut: 'conflit' }
            ])
        );
        scheduleService.create.and.returnValue(
            of({ id: 2, courseId: 11, teacherId: 5, roomId: 6, groupId: 7, day: 'TUESDAY', startTime: '10:00', endTime: '12:00' })
        );
        scheduleService.update.and.returnValue(
            of({ id: 1, courseId: 10, teacherId: 2, roomId: 3, groupId: 4, day: 'TUESDAY', startTime: '10:00', endTime: '12:00' })
        );

        teacherService.getAll.and.returnValue(of([{ id: 2, nom: 'Dupont', prenom: 'Jean', email: 'j@iusjc.cm', login: 'dupont', statut: 'Actif' }]));
        roomService.getAll.and.returnValue(of([{ id: 3, code: 'A1', nom: 'Salle A1', capacite: 30, statut: 'Disponible' }]));

        page = new EmploiDuTempsPage(scheduleService, teacherService, roomService, notificationService);
    });

    it('loads filters and computes schedule stats', () => {
        page.ngOnInit();

        expect(teacherService.getAll).toHaveBeenCalled();
        expect(roomService.getAll).toHaveBeenCalled();
        expect(scheduleService.getAll).toHaveBeenCalled();
        expect(page.stats.coursPlanifies).toBe(1);
        expect(page.stats.conflitsDetectes).toBe(1);
        expect(page.groupes.length).toBe(1);
    });

    it('filters sessions in teacher view mode', () => {
        page.ngOnInit();
        page.viewMode = 'teacher';
        page.selectedEnseignant = '2';
        page.computeViewData();

        expect(page.coursDuJour.length).toBe(1);
        expect(page.getViewLabel()).toBe('Planning enseignant');
    });

    it('blocks session creation when a conflict is detected', () => {
        page.ngOnInit();
        page.newSession = {
            courseId: 20,
            teacherId: 2,
            roomId: 3,
            groupId: 8,
            day: 'MONDAY',
            startTime: '09:00',
            endTime: '11:00'
        };

        page.createSession();

        expect(scheduleService.create).not.toHaveBeenCalled();
        expect(page.conflictMessages.length).toBeGreaterThan(0);
        expect(notificationService.error).toHaveBeenCalled();
    });

    it('creates session when no conflict is found', () => {
        page.ngOnInit();
        page.newSession = {
            courseId: 20,
            teacherId: 9,
            roomId: 10,
            groupId: 8,
            day: 'TUESDAY',
            startTime: '09:00',
            endTime: '11:00'
        };

        page.createSession();

        expect(scheduleService.create).toHaveBeenCalled();
        expect(notificationService.info).toHaveBeenCalled();
    });

    it('blocks drag-drop move when conflict is detected', () => {
        page.ngOnInit();
        page.onDragStart(1);

        // Existing session with same teacher in target slot => conflict.
        (page as any).schedules = [
            { id: 1, courseId: 10, teacherId: 2, roomId: 3, groupId: 4, day: 'MONDAY', startTime: '08:00', endTime: '10:00' },
            { id: 2, courseId: 12, teacherId: 2, roomId: 7, groupId: 9, day: 'TUESDAY', startTime: '10:00', endTime: '12:00' }
        ];

        page.onDropToSlot({ day: 'TUESDAY', startTime: '10:00', endTime: '12:00' });

        expect(scheduleService.update).not.toHaveBeenCalled();
        expect(page.conflictMessages.length).toBeGreaterThan(0);
    });

    it('moves a session through drag-drop when no conflict', () => {
        page.ngOnInit();
        page.onDragStart(1);

        page.onDropToSlot({ day: 'THURSDAY', startTime: '14:00', endTime: '16:00' });

        expect(scheduleService.update).toHaveBeenCalled();
        expect(notificationService.info).toHaveBeenCalled();
    });
});
