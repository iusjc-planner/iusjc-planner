import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Course } from '../../core/models/course.model';
import { Edt, EdtGenerationRequest, EdtGenerationResult, EdtPeriodeType, EdtVueType, SlotSuggestion, ValidationReport } from '../../core/models/edt.model';
import { Group } from '../../core/models/group.model';
import { Room } from '../../core/models/room.model';
import { ScheduleEntry } from '../../core/models/schedule.model';
import { Teacher } from '../../core/models/teacher.model';
import { User } from '../../core/models/user.model';
import { CourseService } from '../../core/services/course.service';
import { EdtService } from '../../core/services/edt.service';
import { GroupService } from '../../core/services/group.service';
import { NotificationService } from '../../core/services/notification.service';
import { RoomService } from '../../core/services/room.service';
import { TeacherService } from '../../core/services/teacher.service';
import { UserService } from '../../core/services/user.service';

type PlanningViewMode = 'global' | 'group' | 'teacher' | 'room';
type SelectOption = { label: string; value: number };
type EntryForm = {
    courseId?: number;
    teacherId?: number;
    roomId?: number;
    groupId?: number;
    date: string;
    startTime: string;
    endTime: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
};
type EntryRow = {
    id?: number;
    courseLabel: string;
    teacherLabel: string;
    groupLabel: string;
    roomLabel: string;
    dateLabel: string;
    startLabel: string;
    endLabel: string;
    status: string;
};
type QuickMoveSlot = { label: string; dayOffset: number; startTime: string; endTime: string };

@Component({
    selector: 'app-emploi-du-temps',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, MultiSelectModule, SelectModule, TableModule],
    templateUrl: './emploi-du-temps.html'
})
export class EmploiDuTempsPage {
    viewMode: PlanningViewMode = 'global';
    semaine = 1;
    annee = new Date().getFullYear();
    selectedTargetId?: number;
    selectedPeriode: EdtPeriodeType = 'ANNUEL';
    loading = false;
    noTargetEdt = false;

    availableEdts: Edt[] = [];
    selectedEdt?: Edt;
    entries: ScheduleEntry[] = [];
    entryRows: EntryRow[] = [];
    weeklyViewData: Record<string, ScheduleEntry[]> = {};

    generationResult?: EdtGenerationResult;
    lastValidationReport?: ValidationReport;
    entryValidationMessages: string[] = [];

    displayGenerateDialog = false;
    displayEntryDialog = false;
    isEditMode = false;
    editingEntryId?: number;
    draggedEntryId?: number;
    suggestions: SlotSuggestion[] = [];

    generationForm: { periode: EdtPeriodeType; groupIds: number[]; dryRun: boolean; algorithmType: string } = {
        periode: 'ANNUEL',
        groupIds: [],
        dryRun: false,
        algorithmType: 'GREEDY'
    };
    entryForm: EntryForm = this.emptyEntryForm();

    stats = { totalEntries: 0, uniqueTeachers: 0, uniqueGroups: 0, uniqueRooms: 0 };

    viewModeOptions = [
        { label: 'Globale', value: 'global' as PlanningViewMode },
        { label: 'Par groupe', value: 'group' as PlanningViewMode },
        { label: 'Par enseignant', value: 'teacher' as PlanningViewMode },
        { label: 'Par salle', value: 'room' as PlanningViewMode }
    ];
    periodeOptions = [
        { label: 'SEMESTRE1', value: 'SEMESTRE1' as EdtPeriodeType },
        { label: 'SEMESTRE2', value: 'SEMESTRE2' as EdtPeriodeType },
        { label: 'ANNUEL', value: 'ANNUEL' as EdtPeriodeType }
    ];
    algorithmOptions = [
        { label: 'GREEDY', value: 'GREEDY' },
        { label: 'FORD_FULKERSON', value: 'FORD_FULKERSON' }
    ];
    quickMoveSlots: QuickMoveSlot[] = [
        { label: 'Slot A', dayOffset: 0, startTime: '08:00', endTime: '10:00' },
        { label: 'Slot B', dayOffset: 1, startTime: '10:00', endTime: '12:00' },
        { label: 'Slot C', dayOffset: 2, startTime: '14:00', endTime: '16:00' }
    ];

    courses: Course[] = [];
    groups: Group[] = [];
    teachers: Teacher[] = [];
    rooms: Room[] = [];

    courseOptions: SelectOption[] = [];
    groupOptions: SelectOption[] = [];
    teacherOptions: SelectOption[] = [];
    roomOptions: SelectOption[] = [];

    private groupsById = new Map<number, Group>();
    private roomsById = new Map<number, Room>();
    private teachersById = new Map<number, Teacher>();
    private coursesById = new Map<number, Course>();
    private usersById = new Map<number, User>();

    constructor(
        private readonly edtService: EdtService,
        private readonly courseService: CourseService,
        private readonly groupService: GroupService,
        private readonly teacherService: TeacherService,
        private readonly roomService: RoomService,
        private readonly userService: UserService,
        private readonly notificationService: NotificationService
    ) {}

    ngOnInit() {
        const weekData = this.isoWeekData(new Date());
        this.semaine = weekData.week;
        this.annee = weekData.year;
        this.loadReferenceData();
    }

    requiresTarget(): boolean {
        return this.viewMode !== 'global';
    }

    get targetOptions(): SelectOption[] {
        if (this.viewMode === 'group') return this.groupOptions;
        if (this.viewMode === 'teacher') return this.teacherOptions;
        if (this.viewMode === 'room') return this.roomOptions;
        return [];
    }

    canCreateTargetEdt(): boolean {
        return this.requiresTarget() && this.selectedTargetId !== undefined;
    }

    canExport(): boolean {
        return this.requiresTarget() && this.selectedTargetId !== undefined;
    }

    onViewModeChange() {
        this.selectedTargetId = undefined;
        this.selectedEdt = undefined;
        this.noTargetEdt = false;
        this.entries = [];
        this.entryRows = [];
        this.updateStats();
    }

    refreshView() {
        this.generationResult = undefined;
        this.entryValidationMessages = [];
        this.lastValidationReport = undefined;
        this.loading = true;
        if (this.viewMode === 'global') {
            this.loadGlobalView();
            return;
        }
        this.loadTargetView();
    }

    openGenerateDialog() {
        this.generationForm = { periode: this.selectedPeriode, groupIds: [], dryRun: false, algorithmType: 'GREEDY' };
        this.displayGenerateDialog = true;
    }

    runGeneration() {
        const payload: EdtGenerationRequest = {
            semaine: this.semaine,
            annee: this.annee,
            periode: this.generationForm.periode,
            groupIds: this.generationForm.groupIds,
            dryRun: this.generationForm.dryRun,
            algorithmType: this.generationForm.algorithmType
        };
        this.edtService.generate(payload).subscribe({
            next: (result) => {
                this.generationResult = result;
                this.displayGenerateDialog = false;
                this.notificationService.info('Generation', `Placed ${result.placed}/${result.requested}`);
                this.refreshView();
            },
            error: () => this.notificationService.error('Erreur', 'Generation EDT impossible')
        });
    }

    generateFromAvailabilities() {
        this.loading = true;
        this.courseService.getAll().subscribe({
            next: (allCourses) => {
                const scheduled = allCourses.filter(c => (c.status || 'SCHEDULED') === 'SCHEDULED' && c.teacherId && c.groupId && c.date && c.startTime && c.endTime);
                if (scheduled.length === 0) {
                    this.loading = false;
                    this.notificationService.warn('Aucune disponibilité', 'Aucun cours planifié trouvé depuis les disponibilités des enseignants');
                    return;
                }

                const groupIds = [...new Set(scheduled.map(c => c.groupId!))];
                const edtCreations = groupIds.map(groupId => {
                    const payload: Edt = {
                        semaine: this.semaine,
                        annee: this.annee,
                        periode: this.selectedPeriode || 'ANNUEL',
                        vue: 'GROUPE',
                        targetId: groupId,
                        status: 'DRAFT'
                    };
                    return this.edtService.createEdt(payload).pipe(catchError(() => of(null)));
                });

                forkJoin(edtCreations).subscribe({
                    next: (edts) => {
                        const edtByGroup = new Map<number, number>();
                        edts.forEach((edt, idx) => {
                            if (edt?.id) edtByGroup.set(groupIds[idx], edt.id);
                        });

                        const entryCreations = scheduled
                            .filter(c => edtByGroup.has(c.groupId!))
                            .map(c => {
                                const edtId = edtByGroup.get(c.groupId!)!;
                                const entry: ScheduleEntry = {
                                    courseId: c.id,
                                    teacherId: c.teacherId,
                                    roomId: c.roomId,
                                    groupId: c.groupId,
                                    day: this.dayCode(c.date!),
                                    startTime: `${c.date}T${c.startTime}:00`,
                                    endTime: `${c.date}T${c.endTime}:00`,
                                    status: 'SCHEDULED'
                                };
                                return this.edtService.addEntry(edtId, entry).pipe(catchError(() => of(null)));
                            });

                        if (entryCreations.length === 0) {
                            this.loading = false;
                            this.notificationService.warn('Aucune séance', 'Aucun EDT créé pour les groupes concernés');
                            return;
                        }

                        forkJoin(entryCreations).subscribe({
                            next: (results) => {
                                const success = results.filter(r => r !== null).length;
                                this.loading = false;
                                this.notificationService.info('Séances générées', `${success} séance(s) créée(s) depuis les disponibilités`);
                                this.refreshView();
                            },
                            error: () => {
                                this.loading = false;
                                this.notificationService.error('Erreur', 'Echec de création des séances');
                            }
                        });
                    },
                    error: () => {
                        this.loading = false;
                        this.notificationService.error('Erreur', 'Echec de création des EDTs');
                    }
                });
            },
            error: () => {
                this.loading = false;
                this.notificationService.error('Erreur', 'Impossible de charger les disponibilités');
            }
        });
    }

    createTargetEdt() {
        if (!this.canCreateTargetEdt()) {
            this.notificationService.warn('Validation', 'Selectionnez une cible pour creer un EDT');
            return;
        }
        const payload: Edt = {
            semaine: this.semaine,
            annee: this.annee,
            periode: this.selectedPeriode,
            vue: this.toEdtVue(this.viewMode),
            targetId: this.selectedTargetId as number,
            status: 'DRAFT'
        };
        this.edtService.createEdt(payload).subscribe({
            next: (edt) => {
                this.selectedEdt = edt;
                this.noTargetEdt = false;
                this.notificationService.info('Succes', `EDT #${edt.id} cree`);
                this.refreshView();
            },
            error: () => this.notificationService.error('Erreur', 'Creation EDT impossible')
        });
    }

    validateSelectedEdt() {
        if (!this.selectedEdt?.id) return;
        this.edtService.validateEdt(this.selectedEdt.id).subscribe({
            next: (report) => {
                this.lastValidationReport = report;
                this.notificationService.info('Validation', `Status ${report.status}`);
                this.refreshView();
            },
            error: () => this.notificationService.error('Erreur', 'Validation EDT impossible')
        });
    }

    publishSelectedEdt() {
        if (!this.selectedEdt?.id) return;
        this.edtService.publishEdt(this.selectedEdt.id).subscribe({
            next: (edt) => {
                this.selectedEdt = edt;
                this.notificationService.info('Publication', 'EDT publie');
            },
            error: () => this.notificationService.error('Erreur', 'Publication EDT impossible')
        });
    }

    unpublishSelectedEdt() {
        if (!this.selectedEdt?.id) return;
        this.edtService.unpublishEdt(this.selectedEdt.id).subscribe({
            next: (edt) => {
                this.selectedEdt = edt;
                this.notificationService.info('Depublication', 'EDT depublie');
            },
            error: () => this.notificationService.error('Erreur', 'Depublication EDT impossible')
        });
    }

    loadValidationReport() {
        if (!this.selectedEdt?.id) return;
        this.edtService.validationReport(this.selectedEdt.id).subscribe({
            next: (report) => (this.lastValidationReport = report),
            error: () => this.notificationService.error('Erreur', 'Rapport de validation indisponible')
        });
    }

    exportEdt(format: 'pdf' | 'excel') {
        if (!this.canExport()) {
            this.notificationService.warn('Export', 'Selectionnez une vue cible pour exporter');
            return;
        }
        this.edtService.exportByView(this.toEdtVue(this.viewMode), this.selectedTargetId as number, this.semaine, this.annee, format).subscribe({
            next: (blob) => {
                const target = this.selectedTargetId as number;
                const ext = format === 'excel' ? 'xlsx' : 'pdf';
                const filename = `EDT_${this.toEdtVue(this.viewMode)}_${target}_S${this.semaine}_${this.annee}.${ext}`;
                this.downloadBlob(blob, filename);
                this.notificationService.info('Export', `Fichier ${filename} telecharge`);
            },
            error: () => this.notificationService.error('Erreur', 'Export EDT impossible')
        });
    }

    openCreateEntryDialog() {
        if (this.requiresTarget() && !this.selectedEdt?.id) {
            this.notificationService.warn('Validation', 'Aucun EDT cible selectionne');
            return;
        }
        this.isEditMode = false;
        this.editingEntryId = undefined;
        this.entryValidationMessages = [];
        this.suggestions = [];
        this.entryForm = this.emptyEntryForm();
        if (this.viewMode === 'group') this.entryForm.groupId = this.selectedTargetId;
        if (this.viewMode === 'teacher') this.entryForm.teacherId = this.selectedTargetId;
        if (this.viewMode === 'room') this.entryForm.roomId = this.selectedTargetId;
        this.displayEntryDialog = true;
    }

    openEditEntryDialog(entry: ScheduleEntry) {
        this.isEditMode = true;
        this.editingEntryId = entry.id;
        this.entryValidationMessages = [];
        this.suggestions = [];
        this.entryForm = {
            courseId: entry.courseId,
            teacherId: entry.teacherId,
            roomId: entry.roomId,
            groupId: entry.groupId,
            date: this.datePart(entry.startTime),
            startTime: this.timePart(entry.startTime),
            endTime: this.timePart(entry.endTime),
            status: entry.status || 'SCHEDULED'
        };
        this.displayEntryDialog = true;
    }

    requestSuggestions() {
        if (!this.entryForm.teacherId || !this.entryForm.date) {
            this.notificationService.warn('Validation', 'Enseignant et date sont obligatoires pour les suggestions');
            return;
        }
        const course = this.entryForm.courseId ? this.coursesById.get(this.entryForm.courseId) : undefined;
        const group = this.entryForm.groupId ? this.groupsById.get(this.entryForm.groupId) : undefined;
        this.edtService
            .suggestions({
                teacherId: this.entryForm.teacherId,
                date: this.entryForm.date,
                groupId: this.entryForm.groupId,
                matiereId: course?.matiereId,
                effectif: group?.effectif
            })
            .subscribe({
                next: (items) => {
                    this.suggestions = items;
                    if (items.length === 0) this.notificationService.warn('Suggestion', 'Aucun creneau disponible');
                },
                error: () => this.notificationService.error('Erreur', 'Suggestions indisponibles')
            });
    }

    applySuggestion(suggestion: SlotSuggestion) {
        this.entryForm.date = this.datePart(suggestion.startTime);
        this.entryForm.startTime = this.timePart(suggestion.startTime);
        this.entryForm.endTime = this.timePart(suggestion.endTime);
        if (suggestion.roomId) this.entryForm.roomId = suggestion.roomId;
    }

    saveEntry() {
        const validationMessage = this.validateEntryForm();
        if (validationMessage) {
            this.notificationService.warn('Validation', validationMessage);
            return;
        }
        const payload = this.toSchedulePayload(this.entryForm);
        const groupSize = payload.groupId ? this.groupsById.get(payload.groupId)?.effectif : undefined;
        const roomCapacity = payload.roomId ? this.roomsById.get(payload.roomId)?.capacite : undefined;
        const excludeEntryId = this.isEditMode ? this.editingEntryId : undefined;
        this.edtService
            .validateEntry({
                courseId: payload.courseId as number,
                teacherId: payload.teacherId as number,
                roomId: payload.roomId as number,
                groupId: payload.groupId as number,
                startTime: payload.startTime,
                endTime: payload.endTime,
                groupSize,
                roomCapacity,
                excludeEntryId
            })
            .subscribe({
                next: (result) => {
                    this.entryValidationMessages = [...(result.conflicts || []), ...(result.warnings || [])];
                    if (!result.valid) {
                        this.notificationService.error('Conflit', 'Seance invalide: conflits detectes');
                        return;
                    }
                    if (this.isEditMode && this.editingEntryId) {
                        this.edtService.updateEntry(this.editingEntryId, payload).subscribe({
                            next: () => {
                                this.displayEntryDialog = false;
                                this.notificationService.info('Succes', 'Seance mise a jour');
                                this.refreshView();
                            },
                            error: () => this.notificationService.error('Erreur', 'Mise a jour seance impossible')
                        });
                        return;
                    }
                    if (!this.selectedEdt?.id) {
                        this.notificationService.warn('Validation', 'Aucun EDT selectionne pour ajout de seance');
                        return;
                    }
                    this.edtService.addEntry(this.selectedEdt.id, payload).subscribe({
                        next: () => {
                            this.displayEntryDialog = false;
                            this.notificationService.info('Succes', 'Seance ajoutee');
                            this.refreshView();
                        },
                        error: () => this.notificationService.error('Erreur', 'Ajout de seance impossible')
                    });
                },
                error: () => this.notificationService.error('Erreur', 'Validation backend de la seance indisponible')
            });
    }

    deleteEntry(entry: ScheduleEntry) {
        if (!entry.id) return;
        this.edtService.deleteEntry(entry.id).subscribe({
            next: () => {
                this.notificationService.info('Succes', 'Seance supprimee');
                this.refreshView();
            },
            error: () => this.notificationService.error('Erreur', 'Suppression seance impossible')
        });
    }

    onDragStart(entryId?: number) {
        this.draggedEntryId = entryId;
    }

    onDropToSlot(slot: QuickMoveSlot) {
        if (!this.draggedEntryId) return;
        const current = this.entries.find((item) => item.id === this.draggedEntryId);
        if (!current || !current.id) return;
        const date = this.dateForDayOffset(slot.dayOffset);
        const updated: ScheduleEntry = {
            ...current,
            day: this.dayCode(date),
            startTime: this.toDateTime(date, slot.startTime),
            endTime: this.toDateTime(date, slot.endTime)
        };
        const groupSize = updated.groupId ? this.groupsById.get(updated.groupId)?.effectif : undefined;
        const roomCapacity = updated.roomId ? this.roomsById.get(updated.roomId)?.capacite : undefined;
        this.edtService
            .validateEntry({
                courseId: updated.courseId as number,
                teacherId: updated.teacherId as number,
                roomId: updated.roomId as number,
                groupId: updated.groupId as number,
                startTime: updated.startTime,
                endTime: updated.endTime,
                groupSize,
                roomCapacity,
                excludeEntryId: current.id
            })
            .subscribe({
                next: (result) => {
                    this.entryValidationMessages = [...(result.conflicts || []), ...(result.warnings || [])];
                    if (!result.valid) {
                        this.notificationService.error('Conflit', 'Deplacement bloque');
                        return;
                    }
                    this.edtService.updateEntry(current.id as number, updated).subscribe({
                        next: () => {
                            this.draggedEntryId = undefined;
                            this.notificationService.info('Succes', 'Seance deplacee');
                            this.refreshView();
                        },
                        error: () => this.notificationService.error('Erreur', 'Deplacement impossible')
                    });
                },
                error: () => this.notificationService.error('Erreur', 'Validation du deplacement indisponible')
            });
    }

    labelForSlotDate(dayOffset: number): string {
        return this.dateForDayOffset(dayOffset);
    }

    roomLabel(roomId?: number): string {
        if (!roomId) return '-';
        const room = this.roomsById.get(roomId);
        if (!room) return `Salle #${roomId}`;
        return `${room.code || room.nom}`;
    }

    private loadReferenceData() {
        forkJoin({
            courses: this.courseService.getAll().pipe(catchError(() => of([] as Course[]))),
            groups: this.groupService.getAll().pipe(catchError(() => of([] as Group[]))),
            teachers: this.teacherService.getAll().pipe(catchError(() => of([] as Teacher[]))),
            rooms: this.roomService.getAll().pipe(catchError(() => of([] as Room[]))),
            users: this.userService.getAll().pipe(catchError(() => of([] as User[])))
        }).subscribe({
            next: ({ courses, groups, teachers, rooms, users }) => {
                this.courses = courses;
                this.groups = groups;
                this.teachers = teachers;
                this.rooms = rooms;
                this.coursesById = new Map(courses.filter((item) => item.id !== undefined).map((item) => [item.id as number, item]));
                this.groupsById = new Map(groups.filter((item) => item.id !== undefined).map((item) => [item.id as number, item]));
                this.teachersById = new Map(teachers.filter((item) => item.id !== undefined).map((item) => [item.id as number, item]));
                this.roomsById = new Map(rooms.filter((item) => item.id !== undefined).map((item) => [item.id as number, item]));
                this.usersById = new Map(users.filter((item) => item.id !== undefined).map((item) => [item.id as number, item]));
                this.courseOptions = courses
                    .filter((item) => item.id !== undefined)
                    .map((item) => ({ label: item.nom || item.title || `Cours #${item.id}`, value: item.id as number }));
                this.groupOptions = groups.filter((item) => item.id !== undefined).map((item) => ({ label: item.nom, value: item.id as number }));
                this.teacherOptions = teachers.filter((item) => item.id !== undefined).map((item) => ({ label: this.teacherDisplayName(item), value: item.id as number }));
                this.roomOptions = rooms
                    .filter((item) => item.id !== undefined)
                    .map((item) => ({ label: `${item.code || item.nom} - ${item.nom}`, value: item.id as number }));
                this.refreshView();
            },
            error: () => this.notificationService.error('Erreur', 'Chargement des ressources EDT impossible')
        });
    }

    private loadGlobalView() {
        this.selectedEdt = undefined;
        this.noTargetEdt = false;
        this.edtService.listEdt({ semaine: this.semaine, annee: this.annee }).subscribe({
            next: (edts) => {
                this.availableEdts = edts.filter((item) => item.vue === 'GROUPE');
                const ids = this.availableEdts.map((item) => item.id).filter((id): id is number => id !== undefined);
                if (ids.length === 0) {
                    this.entries = [];
                    this.entryRows = [];
                    this.weeklyViewData = {};
                    this.updateStats();
                    this.loading = false;
                    return;
                }
                const requests = ids.map((id) => this.edtService.getEntries(id).pipe(catchError(() => of([] as ScheduleEntry[]))));
                forkJoin(requests).subscribe({
                    next: (resultSets) => {
                        this.entries = this.deduplicateEntries(resultSets.flat());
                        this.rebuildEntryRows();
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                        this.notificationService.error('Erreur', 'Chargement des seances globales impossible');
                    }
                });
            },
            error: () => {
                this.loading = false;
                this.notificationService.error('Erreur', 'Chargement des EDT impossible');
            }
        });
    }

    private loadTargetView() {
        if (!this.selectedTargetId) {
            this.entries = [];
            this.entryRows = [];
            this.selectedEdt = undefined;
            this.noTargetEdt = false;
            this.updateStats();
            this.loading = false;
            return;
        }
        const request =
            this.viewMode === 'group'
                ? this.edtService.getByGroupe(this.selectedTargetId, this.semaine, this.annee)
                : this.viewMode === 'teacher'
                ? this.edtService.getByEnseignant(this.selectedTargetId, this.semaine, this.annee)
                : this.edtService.getBySalle(this.selectedTargetId, this.semaine, this.annee);
        request.subscribe({
            next: (edt) => {
                this.selectedEdt = edt;
                this.availableEdts = [edt];
                this.noTargetEdt = false;
                this.loadEntriesForEdt(edt.id as number);
            },
            error: (error: { status?: number }) => {
                if (error?.status === 404) {
                    this.noTargetEdt = true;
                    this.selectedEdt = undefined;
                    this.entries = [];
                    this.entryRows = [];
                    this.updateStats();
                    this.loading = false;
                    return;
                }
                this.loading = false;
                this.notificationService.error('Erreur', 'Chargement EDT cible impossible');
            }
        });
    }

    private loadEntriesForEdt(edtId: number) {
        forkJoin({
            entries: this.edtService.getEntries(edtId),
            weekly: this.edtService.weeklyView(edtId).pipe(catchError(() => of({} as Record<string, ScheduleEntry[]>)))
        }).subscribe({
            next: ({ entries, weekly }) => {
                this.entries = this.sortByStartTime(entries || []);
                this.weeklyViewData = weekly || {};
                this.rebuildEntryRows();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.notificationService.error('Erreur', 'Chargement des seances EDT impossible');
            }
        });
    }

    private rebuildEntryRows() {
        this.entryRows = this.entries.map((entry) => ({
            id: entry.id,
            courseLabel: this.courseLabel(entry.courseId),
            teacherLabel: this.teacherLabel(entry.teacherId),
            groupLabel: this.groupLabel(entry.groupId),
            roomLabel: this.roomLabel(entry.roomId),
            dateLabel: this.datePart(entry.startTime),
            startLabel: this.timePart(entry.startTime),
            endLabel: this.timePart(entry.endTime),
            status: entry.status || entry.statut || 'SCHEDULED'
        }));
        this.updateStats();
    }

    private updateStats() {
        this.stats = {
            totalEntries: this.entries.length,
            uniqueTeachers: new Set(this.entries.map((item) => item.teacherId).filter((id) => id !== undefined)).size,
            uniqueGroups: new Set(this.entries.map((item) => item.groupId).filter((id) => id !== undefined)).size,
            uniqueRooms: new Set(this.entries.map((item) => item.roomId).filter((id) => id !== undefined)).size
        };
    }

    private validateEntryForm(): string | null {
        if (!this.entryForm.courseId || !this.entryForm.teacherId || !this.entryForm.groupId || !this.entryForm.roomId) {
            return 'Cours, enseignant, groupe et salle sont obligatoires';
        }
        if (!this.entryForm.date || !this.entryForm.startTime || !this.entryForm.endTime) return 'Date et horaires sont obligatoires';
        if (this.entryForm.startTime >= this.entryForm.endTime) return 'L heure de fin doit etre superieure a l heure de debut';
        return null;
    }

    private toSchedulePayload(form: EntryForm): ScheduleEntry {
        return {
            courseId: form.courseId,
            teacherId: form.teacherId,
            roomId: form.roomId,
            groupId: form.groupId,
            day: this.dayCode(form.date),
            startTime: this.toDateTime(form.date, form.startTime),
            endTime: this.toDateTime(form.date, form.endTime),
            status: form.status
        };
    }

    private emptyEntryForm(): EntryForm {
        const monday = this.dateForDayOffset(0);
        return { courseId: undefined, teacherId: undefined, roomId: undefined, groupId: undefined, date: monday, startTime: '08:00', endTime: '10:00', status: 'SCHEDULED' };
    }

    private teacherDisplayName(teacher: Teacher): string {
        if (teacher.userId) {
            const user = this.usersById.get(teacher.userId);
            if (user) {
                return `${user.nom} ${user.prenom}`.trim();
            }
        }
        const fullName = `${teacher.prenom || ''} ${teacher.nom || ''}`.trim();
        return fullName || `Enseignant #${teacher.id}`;
    }

    private courseLabel(courseId?: number): string {
        if (!courseId) return 'Cours -';
        const course = this.coursesById.get(courseId);
        return course?.nom || course?.title || `Cours #${courseId}`;
    }

    private teacherLabel(teacherId?: number): string {
        if (!teacherId) return 'Enseignant -';
        const teacher = this.teachersById.get(teacherId);
        if (!teacher) return `Enseignant #${teacherId}`;
        return this.teacherDisplayName(teacher);
    }

    private groupLabel(groupId?: number): string {
        if (!groupId) return 'Groupe -';
        const group = this.groupsById.get(groupId);
        return group?.nom || `Groupe #${groupId}`;
    }

    private toEdtVue(mode: PlanningViewMode): EdtVueType {
        if (mode === 'group') return 'GROUPE';
        if (mode === 'teacher') return 'ENSEIGNANT';
        if (mode === 'room') return 'SALLE';
        return 'GROUPE';
    }

    private deduplicateEntries(entries: ScheduleEntry[]): ScheduleEntry[] {
        const map = new Map<string, ScheduleEntry>();
        for (const entry of entries) {
            const key = entry.id !== undefined ? `id-${entry.id}` : `${entry.courseId}-${entry.teacherId}-${entry.roomId}-${entry.groupId}-${entry.startTime}-${entry.endTime}`;
            map.set(key, entry);
        }
        return this.sortByStartTime(Array.from(map.values()));
    }

    private sortByStartTime(entries: ScheduleEntry[]): ScheduleEntry[] {
        return [...entries].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    private isoWeekData(input: Date): { week: number; year: number } {
        const value = new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
        value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
        const week = Math.ceil(((value.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        return { week, year: value.getUTCFullYear() };
    }

    private mondayDateForWeek(year: number, week: number): Date {
        const jan4 = new Date(year, 0, 4);
        const day = (jan4.getDay() + 6) % 7;
        const monday = new Date(year, 0, 4 - day + (week - 1) * 7);
        monday.setHours(0, 0, 0, 0);
        return monday;
    }

    private dateForDayOffset(dayOffset: number): string {
        const monday = this.mondayDateForWeek(this.annee, this.semaine);
        const value = new Date(monday);
        value.setDate(monday.getDate() + dayOffset);
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private toDateTime(date: string, time: string): string {
        return `${date}T${time}:00`;
    }

    private dayCode(date: string): string {
        const value = new Date(`${date}T00:00:00`);
        const map = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        return map[value.getDay()] || 'MONDAY';
    }

    private datePart(value: string): string {
        const [datePart] = (value || '').split('T');
        if (datePart && datePart.length === 10) return datePart;
        return this.dateForDayOffset(0);
    }

    private timePart(value: string): string {
        const split = (value || '').split('T');
        if (split.length < 2) return '08:00';
        const time = split[1].slice(0, 5);
        return time.length === 5 ? time : '08:00';
    }

    private downloadBlob(blob: Blob, filename: string) {
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(blobUrl);
    }
}
