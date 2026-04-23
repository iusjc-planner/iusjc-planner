import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { catchError, forkJoin, of } from 'rxjs';
import { EdtService } from '../../core/services/edt.service';
import { TeacherService } from '../../core/services/teacher.service';
import { GroupService } from '../../core/services/group.service';
import { RoomService } from '../../core/services/room.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { ScheduleEntry } from '../../core/models/schedule.model';
import { Teacher } from '../../core/models/teacher.model';
import { Group } from '../../core/models/group.model';
import { Room } from '../../core/models/room.model';
import { User } from '../../core/models/user.model';

type ViewTarget = 'group' | 'teacher' | 'room';
type SelectOption = { label: string; value: number };

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

@Component({
    selector: 'app-calendrier-edt',
    standalone: true,
    imports: [CommonModule, FormsModule, FullCalendarModule, ButtonModule, SelectModule],
    template: `
        <div class="card">
            <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
                <h5 class="text-2xl font-bold">Calendrier des emplois du temps</h5>
                <button pButton type="button" label="Actualiser" icon="pi pi-refresh" class="p-button-text" (click)="loadEvents()"></button>
            </div>

            <div class="grid grid-cols-12 gap-4 mb-4">
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Vue par</label>
                    <p-select [(ngModel)]="viewTarget" [options]="viewTargetOptions" optionLabel="label" optionValue="value"
                        appendTo="body" class="w-full" (ngModelChange)="onViewTargetChange()" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Cible</label>
                    <p-select [(ngModel)]="selectedTargetId" [options]="targetOptions" optionLabel="label" optionValue="value"
                        [filter]="true" filterBy="label" [showClear]="true" placeholder="Tous"
                        appendTo="body" class="w-full" (ngModelChange)="loadEvents()" />
                </div>
                <div class="col-span-12 md:col-span-2">
                    <label class="block mb-2 font-medium">Semaine ISO</label>
                    <input type="number" [(ngModel)]="semaine" min="1" max="53" class="w-full px-3 py-2 border rounded" (change)="loadEvents()" />
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Annee</label>
                    <input type="number" [(ngModel)]="annee" min="2000" max="2100" class="w-full px-3 py-2 border rounded" (change)="loadEvents()" />
                </div>
            </div>

            <div *ngIf="loading" class="text-muted-color text-center py-4">Chargement du calendrier...</div>
            <full-calendar *ngIf="!loading" [options]="calendarOptions"></full-calendar>
        </div>
    `
})
export class CalendrierEdtPage implements OnInit {
    viewTarget: ViewTarget = 'group';
    selectedTargetId?: number;
    semaine = 1;
    annee = new Date().getFullYear();
    loading = false;

    viewTargetOptions = [
        { label: 'Par groupe', value: 'group' as ViewTarget },
        { label: 'Par enseignant', value: 'teacher' as ViewTarget },
        { label: 'Par salle', value: 'room' as ViewTarget }
    ];

    targetOptions: SelectOption[] = [];

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'timeGridWeek',
        locale: frLocale,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        slotMinTime: '07:00:00',
        slotMaxTime: '20:00:00',
        allDaySlot: false,
        weekends: true,
        height: 'auto',
        events: [],
        eventClick: (info) => {
            const props = info.event.extendedProps;
            alert(`Cours: ${info.event.title}\nSalle: ${props['roomLabel'] ?? '-'}\nGroupe: ${props['groupLabel'] ?? '-'}\nEnseignant: ${props['teacherLabel'] ?? '-'}`);
        }
    };

    private groups: Group[] = [];
    private teachers: Teacher[] = [];
    private rooms: Room[] = [];
    private users: User[] = [];

    private readonly edtService = inject(EdtService);
    private readonly teacherService = inject(TeacherService);
    private readonly groupService = inject(GroupService);
    private readonly roomService = inject(RoomService);
    private readonly userService = inject(UserService);
    private readonly notificationService = inject(NotificationService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit() {
        const weekData = this.isoWeekData(new Date());
        this.semaine = weekData.week;
        this.annee = weekData.year;

        forkJoin({
            groups: this.groupService.getAll().pipe(catchError(() => of([] as Group[]))),
            teachers: this.teacherService.getAll().pipe(catchError(() => of([] as Teacher[]))),
            rooms: this.roomService.getAll().pipe(catchError(() => of([] as Room[]))),
            users: this.userService.getAll().pipe(catchError(() => of([] as User[])))
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ groups, teachers, rooms, users }) => {
            this.groups = groups;
            this.teachers = teachers;
            this.rooms = rooms;
            this.users = users;
            this.updateTargetOptions();
            this.loadEvents();
        });
    }

    onViewTargetChange() {
        this.selectedTargetId = undefined;
        this.updateTargetOptions();
        this.loadEvents();
    }

    private updateTargetOptions() {
        if (this.viewTarget === 'group') {
            this.targetOptions = this.groups
                .filter(g => g.id !== undefined)
                .map(g => ({ label: g.nom, value: g.id as number }));
        } else if (this.viewTarget === 'teacher') {
            this.targetOptions = this.teachers
                .filter(t => t.id !== undefined)
                .map(t => ({ label: this.teacherName(t), value: t.id as number }));
        } else {
            this.targetOptions = this.rooms
                .filter(r => r.id !== undefined)
                .map(r => ({ label: r.code || r.nom, value: r.id as number }));
        }
    }

    loadEvents() {
        this.loading = true;

        if (this.selectedTargetId) {
            this.getEdtForTarget().pipe(
                catchError(() => of(null)),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe({
                next: (edt: any) => {
                    const ids: number[] = edt?.id ? [edt.id as number] : [];
                    this.loadEntriesForIds(ids);
                },
                error: () => { this.loading = false; }
            });
        } else {
            this.edtService.listEdt({ semaine: this.semaine, annee: this.annee }).pipe(
                catchError(() => of([])),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe({
                next: (edts) => {
                    const ids = edts.filter(e => e?.id).map(e => e.id as number);
                    this.loadEntriesForIds(ids);
                },
                error: () => { this.loading = false; }
            });
        }
    }

    private loadEntriesForIds(ids: number[]) {
        if (ids.length === 0) {
            this.calendarOptions = { ...this.calendarOptions, events: [] };
            this.loading = false;
            return;
        }

        const requests = ids.map(id =>
            this.edtService.getEntries(id).pipe(catchError(() => of([] as ScheduleEntry[])))
        );

        forkJoin(requests).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (resultSets) => {
                const allEntries = (resultSets as ScheduleEntry[][]).flat();
                const events = this.toCalendarEvents(allEntries);
                this.calendarOptions = { ...this.calendarOptions, events, initialDate: this.mondayOfWeek() };
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.notificationService.error('Erreur', 'Chargement des seances impossible');
            }
        });
    }

    private getEdtForTarget() {
        if (this.viewTarget === 'group') {
            return this.edtService.getByGroupe(this.selectedTargetId!, this.semaine, this.annee);
        } else if (this.viewTarget === 'teacher') {
            return this.edtService.getByEnseignant(this.selectedTargetId!, this.semaine, this.annee);
        } else {
            return this.edtService.getBySalle(this.selectedTargetId!, this.semaine, this.annee);
        }
    }

    private toCalendarEvents(entries: ScheduleEntry[]): EventInput[] {
        const colorMap = new Map<number, string>();
        let colorIndex = 0;

        return entries.map(entry => {
            const courseId = entry.courseId ?? 0;
            if (!colorMap.has(courseId)) {
                colorMap.set(courseId, COLORS[colorIndex % COLORS.length]);
                colorIndex++;
            }

            const roomLabel = entry.roomId
                ? (this.rooms.find(r => r.id === entry.roomId)?.code || `Salle ${entry.roomId}`)
                : '-';
            const groupLabel = entry.groupId
                ? (this.groups.find(g => g.id === entry.groupId)?.nom || `Groupe ${entry.groupId}`)
                : '-';
            const teacher = this.teachers.find(t => t.id === entry.teacherId);
            const teacherLabel = teacher ? this.teacherName(teacher) : '-';

            return {
                id: String(entry.id ?? Math.random()),
                title: `${roomLabel} — ${groupLabel}`,
                start: entry.startTime,
                end: entry.endTime,
                backgroundColor: colorMap.get(courseId),
                borderColor: colorMap.get(courseId),
                extendedProps: { ...entry, roomLabel, groupLabel, teacherLabel }
            };
        });
    }

    private teacherName(teacher?: Teacher): string {
        if (!teacher) return 'Enseignant inconnu';
        if (teacher.userId) {
            const user = this.users.find(u => u.id === teacher.userId);
            if (user) return `${user.prenom ?? ''} ${user.nom ?? ''}`.trim();
        }
        return `Enseignant #${teacher.id}`;
    }

    private mondayOfWeek(): string {
        const jan4 = new Date(this.annee, 0, 4);
        const day = (jan4.getDay() + 6) % 7;
        const monday = new Date(this.annee, 0, 4 - day + (this.semaine - 1) * 7);
        return monday.toISOString().split('T')[0];
    }

    private isoWeekData(input: Date): { week: number; year: number } {
        const value = new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
        value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
        const week = Math.ceil(((value.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        return { week, year: value.getUTCFullYear() };
    }
}
