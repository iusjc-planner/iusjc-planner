import { of, throwError } from 'rxjs';
// @ts-ignore - tooling false positive: module resolves correctly during Angular test compilation
import { EmploiDuTempsPage } from './emploi-du-temps';
import { CourseService } from '../../core/services/course.service';
import { EdtService } from '../../core/services/edt.service';
import { GroupService } from '../../core/services/group.service';
import { NotificationService } from '../../core/services/notification.service';
import { RoomService } from '../../core/services/room.service';
import { TeacherService } from '../../core/services/teacher.service';
import { UserService } from '../../core/services/user.service';

describe('EmploiDuTempsPage', () => {
    let edtService: jasmine.SpyObj<EdtService>;
    let courseService: jasmine.SpyObj<CourseService>;
    let groupService: jasmine.SpyObj<GroupService>;
    let teacherService: jasmine.SpyObj<TeacherService>;
    let roomService: jasmine.SpyObj<RoomService>;
    let userService: jasmine.SpyObj<UserService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let page: EmploiDuTempsPage;

    beforeEach(() => {
        edtService = jasmine.createSpyObj<EdtService>('EdtService', [
            'listEdt',
            'getByGroupe',
            'getByEnseignant',
            'getBySalle',
            'getEntries',
            'weeklyView',
            'generate',
            'validateEdt',
            'publishEdt',
            'unpublishEdt',
            'validationReport',
            'validateEntry',
            'addEntry',
            'suggestions',
            'exportByView',
            'createEdt',
            'updateEntry',
            'deleteEntry'
        ]);
        courseService = jasmine.createSpyObj<CourseService>('CourseService', ['getAll']);
        groupService = jasmine.createSpyObj<GroupService>('GroupService', ['getAll']);
        teacherService = jasmine.createSpyObj<TeacherService>('TeacherService', ['getAll']);
        roomService = jasmine.createSpyObj<RoomService>('RoomService', ['getAll']);
        userService = jasmine.createSpyObj<UserService>('UserService', ['getAll']);
        notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['info', 'warn', 'error']);

        const edt = { id: 101, semaine: 12, annee: 2026, periode: 'ANNUEL', vue: 'GROUPE', targetId: 1, status: 'DRAFT' };
        const entry = { id: 501, courseId: 11, teacherId: 21, roomId: 31, groupId: 1, day: 'MONDAY', startTime: '2026-03-23T08:00:00', endTime: '2026-03-23T10:00:00', status: 'SCHEDULED' };
        const generation = { edtIds: [101], requested: 1, placed: 1, unplaced: 0, conflicts: [], algorithmUsed: 'GREEDY' };
        const report = { edtId: 101, status: 'VALID', errors: [], warnings: [] };

        courseService.getAll.and.returnValue(of([{ id: 11, nom: 'Maths', matiereId: 44 }]));
        groupService.getAll.and.returnValue(of([{ id: 1, nom: 'G1', effectif: 30 }]));
        teacherService.getAll.and.returnValue(of([{ id: 21, userId: 201, nom: 'Dupont', prenom: 'Jean' }]));
        roomService.getAll.and.returnValue(of([{ id: 31, code: 'A1', nom: 'Salle A1', capacite: 40 }]));
        userService.getAll.and.returnValue(of([{ id: 201, nom: 'Dupont', prenom: 'Jean', email: 'j@x.com', login: 'dupont', role: 'ENSEIGNANT' }]));

        edtService.listEdt.and.returnValue(of([edt] as any));
        edtService.getByGroupe.and.returnValue(of(edt as any));
        edtService.getByEnseignant.and.returnValue(of({ ...edt, vue: 'ENSEIGNANT', targetId: 21 } as any));
        edtService.getBySalle.and.returnValue(of({ ...edt, vue: 'SALLE', targetId: 31 } as any));
        edtService.getEntries.and.returnValue(of([entry] as any));
        edtService.weeklyView.and.returnValue(of({ lundi: [entry], mardi: [], mercredi: [], jeudi: [], vendredi: [], samedi: [] } as any));
        edtService.generate.and.returnValue(of(generation as any));
        edtService.validateEdt.and.returnValue(of(report as any));
        edtService.publishEdt.and.returnValue(of({ ...edt, status: 'PUBLISHED' } as any));
        edtService.unpublishEdt.and.returnValue(of({ ...edt, status: 'VALIDATED' } as any));
        edtService.validationReport.and.returnValue(of(report as any));
        edtService.validateEntry.and.returnValue(of({ valid: true, conflicts: [], warnings: [] } as any));
        edtService.addEntry.and.returnValue(of(entry as any));
        edtService.suggestions.and.returnValue(of([{ startTime: '2026-03-24T10:00:00', endTime: '2026-03-24T12:00:00', roomId: 31 } as any]));
        edtService.exportByView.and.returnValue(of(new Blob(['test'], { type: 'application/pdf' })));
        edtService.createEdt.and.returnValue(of(edt as any));

        edtService.updateEntry.and.returnValue(of(entry as any));
        edtService.deleteEntry.and.returnValue(of(void 0));

        page = new EmploiDuTempsPage(edtService, courseService, groupService, teacherService, roomService, userService, notificationService);
    });

    it('loads global EDT view and computes rows', () => {
        page.ngOnInit();

        expect(edtService.listEdt).toHaveBeenCalled();
        expect(edtService.getEntries).toHaveBeenCalled();
        expect(page.entryRows.length).toBe(1);
        expect(page.stats.totalEntries).toBe(1);
    });

    it('loads target EDT in group mode', () => {
        page.ngOnInit();
        page.viewMode = 'group';
        page.selectedTargetId = 1;

        page.refreshView();

        expect(edtService.getByGroupe).toHaveBeenCalled();
        expect(page.selectedEdt?.id).toBe(101);
    });

    it('runs generation and keeps result panel', () => {
        page.ngOnInit();
        page.openGenerateDialog();
        page.runGeneration();

        expect(edtService.generate).toHaveBeenCalled();
        expect(page.generationResult?.placed).toBe(1);
        expect(notificationService.info).toHaveBeenCalled();
    });

    it('executes validate/publish/unpublish/report workflow', () => {
        page.ngOnInit();
        page.selectedEdt = { id: 101 } as any;

        page.validateSelectedEdt();
        page.publishSelectedEdt();
        page.unpublishSelectedEdt();
        page.loadValidationReport();

        expect(edtService.validateEdt).toHaveBeenCalledWith(101);
        expect(edtService.publishEdt).toHaveBeenCalledWith(101);
        expect(edtService.unpublishEdt).toHaveBeenCalledWith(101);
        expect(edtService.validationReport).toHaveBeenCalledWith(101);
    });

    it('creates entry through validateEntry then addEntry', () => {
        page.ngOnInit();
        page.viewMode = 'group';
        page.selectedEdt = { id: 101, vue: 'GROUPE', targetId: 1 } as any;
        page.openCreateEntryDialog();

        page.entryForm = {
            courseId: 11,
            teacherId: 21,
            roomId: 31,
            groupId: 1,
            date: '2026-03-23',
            startTime: '08:00',
            endTime: '10:00',
            status: 'SCHEDULED'
        };

        page.saveEntry();

        expect(edtService.validateEntry).toHaveBeenCalled();
        expect(edtService.addEntry).toHaveBeenCalledWith(101, jasmine.anything());
    });

    it('blocks drag and drop move when validation reports conflicts', () => {
        page.ngOnInit();
        edtService.validateEntry.and.returnValue(of({ valid: false, conflicts: ['conflict'], warnings: [] } as any));
        page.entries = [{ id: 501, courseId: 11, teacherId: 21, roomId: 31, groupId: 1, day: 'MONDAY', startTime: '2026-03-23T08:00:00', endTime: '2026-03-23T10:00:00' }];

        page.onDragStart(501);
        page.onDropToSlot({ label: 'A', dayOffset: 0, startTime: '10:00', endTime: '12:00' });

        expect(edtService.updateEntry).not.toHaveBeenCalled();
        expect(notificationService.error).toHaveBeenCalled();
    });

    it('moves entry through drag and drop when validation succeeds', () => {
        page.ngOnInit();
        page.entries = [{ id: 501, courseId: 11, teacherId: 21, roomId: 31, groupId: 1, day: 'MONDAY', startTime: '2026-03-23T08:00:00', endTime: '2026-03-23T10:00:00' }];

        page.onDragStart(501);
        page.onDropToSlot({ label: 'A', dayOffset: 0, startTime: '10:00', endTime: '12:00' });

        expect(edtService.updateEntry).toHaveBeenCalled();
    });

    it('exports EDT by selected view/target', () => {
        const anchor = document.createElement('a');
        spyOn(anchor, 'click');
        spyOn(document, 'createElement').and.returnValue(anchor);
        spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
        spyOn(URL, 'revokeObjectURL');

        page.ngOnInit();
        page.viewMode = 'group';
        page.selectedTargetId = 1;

        page.exportEdt('pdf');

        expect(edtService.exportByView).toHaveBeenCalled();
        expect(anchor.click).toHaveBeenCalled();
    });

    it('shows no-target state when backend returns 404 for target view', () => {
        page.ngOnInit();
        page.viewMode = 'group';
        page.selectedTargetId = 22;
        edtService.getByGroupe.and.returnValue(throwError(() => ({ status: 404 })));

        page.refreshView();

        expect(page.noTargetEdt).toBeTrue();
        expect(page.entryRows.length).toBe(0);
    });
});
