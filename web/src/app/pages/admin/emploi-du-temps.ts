import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from '../../core/services/schedule.service';
import { TeacherService } from '../../core/services/teacher.service';
import { RoomService } from '../../core/services/room.service';
import { NotificationService } from '../../core/services/notification.service';
import { ScheduleEntry } from '../../core/models/schedule.model';
import { Teacher } from '../../core/models/teacher.model';
import { Room } from '../../core/models/room.model';

type PlanningViewMode = 'global' | 'teacher' | 'room' | 'group';

@Component({
    selector: 'app-emploi-du-temps',
    standalone: true,
    imports: [CommonModule, ButtonModule, InputTextModule, FormsModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des emplois du temps</h5>
                <button pButton type="button" label="Creer cours" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="createSession()"></button>
            </div>

            <div class="grid grid-cols-12 gap-4 mb-6">
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Vue planning</label>
                    <select [(ngModel)]="viewMode" (ngModelChange)="computeViewData()" class="w-full px-3 py-2 border rounded">
                        <option value="global">Globale</option>
                        <option value="teacher">Par enseignant</option>
                        <option value="room">Par salle</option>
                        <option value="group">Par groupe</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Selectionner une date</label>
                    <input type="date" [(ngModel)]="selectedDate" (ngModelChange)="loadSchedule()" class="w-full px-3 py-2 border rounded" />
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Filtrer par enseignant</label>
                    <select [(ngModel)]="selectedEnseignant" (ngModelChange)="loadSchedule()" class="w-full px-3 py-2 border rounded">
                        <option value="">Tous les enseignants</option>
                        <option *ngFor="let ens of enseignants" [value]="ens.value">{{ ens.label }}</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Filtrer par salle</label>
                    <select [(ngModel)]="selectedSalle" (ngModelChange)="loadSchedule()" class="w-full px-3 py-2 border rounded">
                        <option value="">Toutes les salles</option>
                        <option *ngFor="let salle of salles" [value]="salle.value">{{ salle.label }}</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Filtrer par groupe</label>
                    <select [(ngModel)]="selectedGroupe" (ngModelChange)="loadSchedule()" class="w-full px-3 py-2 border rounded">
                        <option value="">Tous les groupes</option>
                        <option *ngFor="let groupe of groupes" [value]="groupe.value">{{ groupe.label }}</option>
                    </select>
                </div>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <p class="text-sm text-muted-color">
                    <i class="pi pi-info-circle mr-2"></i>
                    Validation conflits activee: un creneau en chevauchement (enseignant ou salle) est bloque avant creation/deplacement.
                </p>
            </div>

            <div class="card mb-6 bg-surface-50 dark:bg-surface-800">
                <h6 class="font-bold mb-3">Nouvelle seance</h6>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-3">
                        <label class="block mb-2 font-medium">Jour</label>
                        <select [(ngModel)]="newSession.day" class="w-full px-3 py-2 border rounded">
                            <option value="MONDAY">Lundi</option>
                            <option value="TUESDAY">Mardi</option>
                            <option value="WEDNESDAY">Mercredi</option>
                            <option value="THURSDAY">Jeudi</option>
                            <option value="FRIDAY">Vendredi</option>
                            <option value="SATURDAY">Samedi</option>
                            <option value="SUNDAY">Dimanche</option>
                        </select>
                    </div>
                    <div class="col-span-12 md:col-span-2">
                        <label class="block mb-2 font-medium">Debut</label>
                        <input type="time" [(ngModel)]="newSession.startTime" class="w-full px-3 py-2 border rounded" />
                    </div>
                    <div class="col-span-12 md:col-span-2">
                        <label class="block mb-2 font-medium">Fin</label>
                        <input type="time" [(ngModel)]="newSession.endTime" class="w-full px-3 py-2 border rounded" />
                    </div>
                    <div class="col-span-12 md:col-span-2">
                        <label class="block mb-2 font-medium">Course ID</label>
                        <input pInputText type="number" [(ngModel)]="newSession.courseId" class="w-full" />
                    </div>
                    <div class="col-span-12 md:col-span-3">
                        <label class="block mb-2 font-medium">Enseignant</label>
                        <select [(ngModel)]="newSession.teacherId" class="w-full px-3 py-2 border rounded">
                            <option [ngValue]="undefined">Selectionner</option>
                            <option *ngFor="let ens of enseignants" [ngValue]="toNumber(ens.value)">{{ ens.label }}</option>
                        </select>
                    </div>
                    <div class="col-span-12 md:col-span-3">
                        <label class="block mb-2 font-medium">Salle</label>
                        <select [(ngModel)]="newSession.roomId" class="w-full px-3 py-2 border rounded">
                            <option [ngValue]="undefined">Selectionner</option>
                            <option *ngFor="let salle of salles" [ngValue]="toNumber(salle.value)">{{ salle.label }}</option>
                        </select>
                    </div>
                    <div class="col-span-12 md:col-span-3">
                        <label class="block mb-2 font-medium">Groupe ID</label>
                        <input pInputText type="number" [(ngModel)]="newSession.groupId" class="w-full" />
                    </div>
                </div>
                <div class="mt-4">
                    <button pButton type="button" label="Valider et creer" icon="pi pi-check" (click)="createSession()"></button>
                </div>

                <div *ngIf="conflictMessages.length > 0" class="mt-4 p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p class="font-semibold text-red-700 dark:text-red-300 mb-2">Conflits detectes</p>
                    <ul class="text-sm text-red-700 dark:text-red-300 list-disc ml-4">
                        <li *ngFor="let conflict of conflictMessages">{{ conflict }}</li>
                    </ul>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <div class="card bg-surface-50 dark:bg-surface-800">
                        <h6 class="font-bold mb-3">{{ getViewLabel() }}</h6>
                        <div class="space-y-2">
                            <div
                                *ngFor="let course of coursDuJour"
                                class="p-3 bg-white dark:bg-surface-700 rounded border-l-4 border-blue-500 cursor-move"
                                draggable="true"
                                (dragstart)="onDragStart(course.id)"
                            >
                                <p class="font-medium">{{ course.title }}</p>
                                <p class="text-sm text-muted-color">{{ course.day }} | {{ course.time }} | {{ course.room }}</p>
                            </div>
                            <p *ngIf="coursDuJour.length === 0" class="text-sm text-muted-color">Aucun cours pour les filtres selectionnes.</p>
                        </div>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <div class="card bg-surface-50 dark:bg-surface-800">
                        <h6 class="font-bold mb-3">Statistiques</h6>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Cours planifies:</span>
                                <span class="font-bold">{{ stats.coursPlanifies }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Salles occupees:</span>
                                <span class="font-bold">{{ stats.sallesOccupees }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Conflits detectes:</span>
                                <span class="font-bold text-red-600">{{ stats.conflitsDetectes }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-6 bg-surface-50 dark:bg-surface-800">
                <h6 class="font-bold mb-3">Deplacement rapide (drag and drop)</h6>
                <p class="text-sm text-muted-color mb-4">Glissez une seance depuis la liste puis deposez-la sur un creneau cible.</p>

                <div class="grid grid-cols-12 gap-3">
                    <div
                        *ngFor="let slot of quickMoveSlots"
                        class="col-span-12 md:col-span-4 p-3 border rounded-lg bg-white dark:bg-surface-700"
                        (dragover)="$event.preventDefault()"
                        (drop)="onDropToSlot(slot)"
                    >
                        <p class="font-semibold">{{ slot.label }}</p>
                        <p class="text-sm text-muted-color">{{ slot.day }} | {{ slot.startTime }} - {{ slot.endTime }}</p>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class EmploiDuTempsPage {
    selectedDate = '';
    selectedEnseignant = '';
    selectedSalle = '';
    selectedGroupe = '';
    viewMode: PlanningViewMode = 'global';

    enseignants: Array<{ label: string; value: string }> = [];
    salles: Array<{ label: string; value: string }> = [];
    groupes: Array<{ label: string; value: string }> = [];

    coursDuJour: Array<{ id?: number; title: string; time: string; room: string; day: string; startTime: string; endTime: string; roomId?: number }> = [];
    stats = {
        coursPlanifies: 0,
        sallesOccupees: '0/0',
        conflitsDetectes: 0
    };

    conflictMessages: string[] = [];
    draggedSessionId?: number;

    quickMoveSlots: Array<{ label: string; day: string; startTime: string; endTime: string }> = [
        { label: 'Slot A', day: 'MONDAY', startTime: '08:00', endTime: '10:00' },
        { label: 'Slot B', day: 'TUESDAY', startTime: '10:00', endTime: '12:00' },
        { label: 'Slot C', day: 'WEDNESDAY', startTime: '14:00', endTime: '16:00' }
    ];

    newSession: {
        courseId?: number;
        teacherId?: number;
        roomId?: number;
        groupId?: number;
        day: string;
        startTime: string;
        endTime: string;
    } = {
        day: 'MONDAY',
        startTime: '08:00',
        endTime: '10:00'
    };

    private schedules: ScheduleEntry[] = [];
    private teachers: Teacher[] = [];
    private rooms: Room[] = [];

    constructor(
        private scheduleService: ScheduleService,
        private teacherService: TeacherService,
        private roomService: RoomService,
        private notificationService: NotificationService
    ) {}

    ngOnInit() {
        const today = new Date();
        this.selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        this.loadFilters();
        this.loadSchedule();
    }

    toNumber(value: string): number {
        return Number(value);
    }

    loadSchedule() {
        const teacherId = this.selectedEnseignant ? Number(this.selectedEnseignant) : undefined;
        const roomId = this.selectedSalle ? Number(this.selectedSalle) : undefined;
        const groupId = this.selectedGroupe ? Number(this.selectedGroupe) : undefined;
        const date = this.selectedDate || undefined;

        this.scheduleService.getAll({ fromDate: date, toDate: date, teacherId, roomId, groupId }).subscribe({
            next: (entries) => {
                this.schedules = entries;
                this.updateGroupOptions();
                this.computeViewData();
            },
            error: () => {
                this.notificationService.error('Erreur', 'Chargement des emplois du temps impossible');
            }
        });
    }

    createSession() {
        const validationError = this.validateNewSession();
        if (validationError) {
            this.notificationService.warn('Validation', validationError);
            return;
        }

        const candidate = this.newSession as ScheduleEntry;
        this.conflictMessages = this.detectConflicts(candidate);
        if (this.conflictMessages.length > 0) {
            this.notificationService.error('Conflit', 'Creation bloquee: conflits detectes');
            return;
        }

        this.scheduleService.create(candidate).subscribe({
            next: () => {
                this.notificationService.info('Succes', 'Seance creee avec succes');
                this.newSession = {
                    ...this.newSession,
                    courseId: undefined,
                    teacherId: undefined,
                    roomId: undefined,
                    groupId: undefined
                };
                this.loadSchedule();
            },
            error: () => {
                this.notificationService.error('Erreur', 'Creation de la seance impossible');
            }
        });
    }

    onDragStart(sessionId?: number) {
        this.draggedSessionId = sessionId;
    }

    onDropToSlot(slot: { day: string; startTime: string; endTime: string }) {
        if (!this.draggedSessionId) {
            return;
        }

        const currentSession = this.schedules.find((entry) => entry.id === this.draggedSessionId);
        if (!currentSession || !currentSession.id) {
            return;
        }

        const updatedSession: ScheduleEntry = {
            ...currentSession,
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime
        };

        const conflicts = this.detectConflicts(updatedSession, currentSession.id);
        if (conflicts.length > 0) {
            this.conflictMessages = conflicts;
            this.notificationService.error('Conflit', 'Deplacement bloque: conflit detecte');
            return;
        }

        this.scheduleService.update(currentSession.id, updatedSession).subscribe({
            next: () => {
                this.notificationService.info('Succes', 'Seance deplacee avec succes');
                this.draggedSessionId = undefined;
                this.loadSchedule();
            },
            error: () => {
                this.notificationService.error('Erreur', 'Deplacement de la seance impossible');
            }
        });
    }

    getViewLabel(): string {
        switch (this.viewMode) {
            case 'teacher':
                return 'Planning enseignant';
            case 'room':
                return 'Planning salle';
            case 'group':
                return 'Planning groupe';
            default:
                return 'Planning global';
        }
    }

    private loadFilters() {
        this.teacherService.getAll().subscribe({
            next: (teachers) => {
                this.teachers = teachers;
                this.enseignants = teachers
                    .map((teacher) => ({
                        label: `${teacher.prenom} ${teacher.nom}`,
                        value: String(teacher.id || '')
                    }))
                    .filter((item) => item.value);
            }
        });

        this.roomService.getAll().subscribe({
            next: (rooms) => {
                this.rooms = rooms;
                this.salles = rooms
                    .map((room) => ({
                        label: room.nom,
                        value: String(room.id || '')
                    }))
                    .filter((item) => item.value);
            }
        });
    }

    computeViewData() {
        const roomById = new Map(this.rooms.filter((room) => room.id !== undefined).map((room) => [room.id as number, room.nom]));
        const filteredSchedules = this.getSchedulesForCurrentView();

        this.coursDuJour = filteredSchedules.map((entry) => ({
            id: entry.id,
            title: `Cours #${entry.courseId || '-'}`,
            time: `${entry.startTime} - ${entry.endTime}`,
            room: entry.roomId ? roomById.get(entry.roomId) || `Salle #${entry.roomId}` : 'Salle non assignee',
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            roomId: entry.roomId
        }));

        const occupiedRooms = new Set(filteredSchedules.map((entry) => entry.roomId).filter((id): id is number => id !== undefined));
        const totalRooms = this.rooms.length;

        this.stats = {
            coursPlanifies: filteredSchedules.length,
            sallesOccupees: `${occupiedRooms.size}/${totalRooms}`,
            conflitsDetectes: filteredSchedules.filter((entry) => this.isConflictStatus(entry.statut)).length
        };
    }

    private getSchedulesForCurrentView(): ScheduleEntry[] {
        if (this.viewMode === 'teacher') {
            if (this.selectedEnseignant) {
                const teacherId = Number(this.selectedEnseignant);
                return this.schedules.filter((entry) => entry.teacherId === teacherId);
            }
            return this.schedules.filter((entry) => entry.teacherId !== undefined);
        }

        if (this.viewMode === 'room') {
            if (this.selectedSalle) {
                const roomId = Number(this.selectedSalle);
                return this.schedules.filter((entry) => entry.roomId === roomId);
            }
            return this.schedules.filter((entry) => entry.roomId !== undefined);
        }

        if (this.viewMode === 'group') {
            if (this.selectedGroupe) {
                const groupId = Number(this.selectedGroupe);
                return this.schedules.filter((entry) => entry.groupId === groupId);
            }
            return this.schedules.filter((entry) => entry.groupId !== undefined);
        }

        return this.schedules;
    }

    private updateGroupOptions() {
        const groupIds = Array.from(new Set(this.schedules.map((entry) => entry.groupId).filter((id): id is number => id !== undefined))).sort((a, b) => a - b);
        this.groupes = groupIds.map((id) => ({ label: `Groupe #${id}`, value: String(id) }));
    }

    private validateNewSession(): string | null {
        if (!this.newSession.courseId) {
            return 'Le cours est obligatoire';
        }

        if (!this.newSession.teacherId) {
            return 'L enseignant est obligatoire';
        }

        if (!this.newSession.roomId) {
            return 'La salle est obligatoire';
        }

        if (!this.newSession.groupId) {
            return 'Le groupe est obligatoire';
        }

        if (!this.newSession.startTime || !this.newSession.endTime || this.newSession.startTime >= this.newSession.endTime) {
            return 'Le creneau horaire est invalide';
        }

        return null;
    }

    private detectConflicts(candidate: ScheduleEntry, excludeId?: number): string[] {
        const conflicts: string[] = [];

        for (const entry of this.schedules) {
            if (excludeId && entry.id === excludeId) {
                continue;
            }

            if (entry.day !== candidate.day) {
                continue;
            }

            if (!this.overlaps(entry.startTime, entry.endTime, candidate.startTime, candidate.endTime)) {
                continue;
            }

            if (entry.teacherId && candidate.teacherId && entry.teacherId === candidate.teacherId) {
                conflicts.push(`Conflit enseignant sur ${candidate.day} (${candidate.startTime}-${candidate.endTime})`);
            }

            if (entry.roomId && candidate.roomId && entry.roomId === candidate.roomId) {
                conflicts.push(`Conflit salle sur ${candidate.day} (${candidate.startTime}-${candidate.endTime})`);
            }
        }

        return Array.from(new Set(conflicts));
    }

    private overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
        return startA < endB && startB < endA;
    }

    private isConflictStatus(status?: string): boolean {
        const normalized = (status || '').toUpperCase();
        return normalized.includes('CONFLICT') || normalized.includes('CONFLIT');
    }
}
