import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { TeacherService } from '../../../core/services/teacher.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { SchoolService } from '../../../core/services/school.service';
import { RoomService } from '../../../core/services/room.service';
import { GroupService } from '../../../core/services/group.service';
import { EventService } from '../../../core/services/event.service';

@Component({
    standalone: true,
    selector: 'app-admin-stats-widget',
    imports: [CommonModule, RouterModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Enseignants</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.teachers }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ stats.activeTeachers }} actifs </span>
                <span class="text-muted-color">dans le systeme</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Réservations en attente</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.pendingReservations }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-clock text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">À approuver </span>
                <span class="text-muted-color">cette semaine</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Écoles</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.schools }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-building text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Actives </span>
                <span class="text-muted-color">dans le système</span>
                <div class="mt-3">
                    <a routerLink="/pages/admin/ecoles" class="text-sm font-medium text-primary hover:underline">Gerer les ecoles</a>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ressources</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.rooms }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-server text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ stats.availableRooms }} disponibles </span>
                <span class="text-muted-color">{{ stats.maintenanceRooms }} en maintenance</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Étudiants</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">1,245</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-green-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Répartis </span>
                <span class="text-muted-color">dans 6 écoles</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Salles</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.rooms }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-indigo-100 dark:bg-indigo-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-home text-indigo-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ stats.occupancyRate }}% </span>
                <span class="text-muted-color">taux d'occupation</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Groupes d'étudiants</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.groups }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-teal-100 dark:bg-teal-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-sitemap text-teal-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Groupes actifs </span>
                <span class="text-muted-color">dans le système</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Événements à venir</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.upcomingEvents }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar-plus text-yellow-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Planifiés </span>
                <span class="text-muted-color">ou confirmés</span>
            </div>
        </div>
        <div class="col-span-12" *ngIf="loading">
            <div class="text-muted-color text-center py-3">Chargement des indicateurs...</div>
        </div>`
})
export class AdminStatsWidget implements OnInit {
    private readonly teacherService = inject(TeacherService);
    private readonly scheduleService = inject(ScheduleService);
    private readonly schoolService = inject(SchoolService);
    private readonly roomService = inject(RoomService);
    private readonly groupService = inject(GroupService);
    private readonly eventService = inject(EventService);
    private readonly destroyRef = inject(DestroyRef);

    loading = true;
    stats = {
        teachers: 0,
        activeTeachers: 0,
        pendingReservations: 0,
        schools: 0,
        rooms: 0,
        availableRooms: 0,
        maintenanceRooms: 0,
        occupancyRate: 0,
        conflicts: 0,
        groups: 0,
        upcomingEvents: 0
    };

    ngOnInit(): void {
        forkJoin({
            teachers: this.teacherService.getAll().pipe(catchError(() => of([]))),
            schedule: this.scheduleService.getAll().pipe(catchError(() => of([]))),
            schools: this.schoolService.getAll().pipe(catchError(() => of([]))),
            rooms: this.roomService.getAll().pipe(catchError(() => of([]))),
            groups: this.groupService.getAll().pipe(catchError(() => of([]))),
            events: this.eventService.getAll().pipe(catchError(() => of([])))
        })
            .pipe(finalize(() => (this.loading = false)), takeUntilDestroyed(this.destroyRef))
            .subscribe(({ teachers, schedule, schools, rooms, groups, events }) => {
                const activeTeachers = teachers.filter((teacher) => this.isActive(teacher.statut)).length;
                const pendingReservations = schedule.filter((entry) => this.isPending(entry.statut)).length;
                const conflicts = schedule.filter((entry) => this.isConflict(entry.statut)).length;
                const maintenanceRooms = rooms.filter((room) => this.isMaintenance(room.statut)).length;
                const availableRooms = Math.max(rooms.length - maintenanceRooms, 0);
                const occupancyRate = rooms.length === 0 ? 0 : Math.round((schedule.length / (rooms.length * 5)) * 100);
                const today = new Date().toISOString().split('T')[0];
                const upcomingEvents = events.filter((e) => e.date >= today && e.status !== 'ANNULE' && e.status !== 'TERMINE').length;

                this.stats = {
                    teachers: teachers.length,
                    activeTeachers,
                    pendingReservations,
                    schools: schools.length,
                    rooms: rooms.length,
                    availableRooms,
                    maintenanceRooms,
                    occupancyRate: Math.min(100, occupancyRate),
                    conflicts,
                    groups: groups.length,
                    upcomingEvents
                };
            });
    }

    private isActive(status?: string): boolean {
        const s = status?.toUpperCase();
        return s === 'ACTIVE' || s === 'ACTIF';
    }

    private isPending(status?: string): boolean {
        return status?.toLowerCase() === 'en_attente';
    }

    private isConflict(status?: string): boolean {
        return status?.toLowerCase() === 'conflit';
    }

    private isMaintenance(status?: string): boolean {
        return status?.toLowerCase() === 'maintenance';
    }
}
