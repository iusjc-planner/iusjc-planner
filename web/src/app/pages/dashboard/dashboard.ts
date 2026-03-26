import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ScheduleService } from '../../core/services/schedule.service';
import { TeacherService } from '../../core/services/teacher.service';
import { CourseService } from '../../core/services/course.service';
import { RoomService } from '../../core/services/room.service';
import { NotificationApiService } from '../../core/services/notification-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ScheduleEntry } from '../../core/models/schedule.model';
import { Teacher } from '../../core/models/teacher.model';
import { Course } from '../../core/models/course.model';
import { Room } from '../../core/models/room.model';
import { AppNotification } from '../../core/models/notification.model';
import { combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, CardModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12">
                <div class="card">
                    <h5 class="text-2xl font-bold mb-2">Dashboard enseignant</h5>
                    <p class="text-muted-color">Suivi de votre planning personnel et de vos alertes recentes.</p>
                </div>
            </div>

            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-sm text-muted-color mb-2">Cours planifies</div>
                    <div class="text-3xl font-bold">{{ stats.coursPlanifies }}</div>
                </p-card>
            </div>
            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-sm text-muted-color mb-2">Salles utilisees</div>
                    <div class="text-3xl font-bold">{{ stats.sallesUtilisees }}</div>
                </p-card>
            </div>
            <div class="col-span-12 md:col-span-4">
                <p-card>
                    <div class="text-sm text-muted-color mb-2">Notifications non lues</div>
                    <div class="text-3xl font-bold">{{ stats.notificationsNonLues }}</div>
                </p-card>
            </div>

            <div class="col-span-12 xl:col-span-8">
                <div class="card">
                    <h6 class="text-xl font-bold mb-4">Planning personnel</h6>
                    <div *ngIf="planning.length === 0" class="text-muted-color">Aucun cours planifie.</div>
                    <div class="space-y-3" *ngIf="planning.length > 0">
                        <div *ngFor="let item of planning" class="p-3 border rounded-lg flex justify-between items-center">
                            <div>
                                <p class="font-semibold">{{ item.cours }}</p>
                                <p class="text-sm text-muted-color">{{ item.jour }} | {{ item.heure }}</p>
                            </div>
                            <span class="text-sm font-medium">{{ item.salle }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-4">
                <div class="card">
                    <h6 class="text-xl font-bold mb-4">Dernieres notifications</h6>
                    <div *ngIf="recentNotifications.length === 0" class="text-muted-color">Aucune notification recente.</div>
                    <div class="space-y-3" *ngIf="recentNotifications.length > 0">
                        <div *ngFor="let notification of recentNotifications" class="p-3 border rounded-lg">
                            <p class="font-semibold">{{ notification.titre }}</p>
                            <p class="text-sm text-muted-color">{{ notification.message }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Dashboard {
    private readonly scheduleService = inject(ScheduleService);
    private readonly teacherService = inject(TeacherService);
    private readonly courseService = inject(CourseService);
    private readonly roomService = inject(RoomService);
    private readonly notificationApiService = inject(NotificationApiService);
    private readonly authService = inject(AuthService);

    planning: Array<{ cours: string; jour: string; heure: string; salle: string }> = [];
    recentNotifications: AppNotification[] = [];
    stats = {
        coursPlanifies: 0,
        sallesUtilisees: 0,
        notificationsNonLues: 0
    };

    ngOnInit() {
        this.loadDashboardData();
    }

    private loadDashboardData() {
        const session = this.authService.getSession();
        const username = session?.username?.toLowerCase() || '';

        this.teacherService
            .getAll()
            .pipe(catchError(() => of([] as Teacher[])))
            .subscribe((teachers) => {
                const teacher = teachers.find((item) => item.login?.toLowerCase() === username || item.email?.toLowerCase() === username);
                this.loadPlanningAndNotifications(teacher?.id);
            });
    }

    private loadPlanningAndNotifications(teacherId?: number) {
        combineLatest([
            this.scheduleService.getAll(teacherId ? { teacherId } : undefined).pipe(catchError(() => of([] as ScheduleEntry[]))),
            this.courseService.getAll().pipe(catchError(() => of([] as Course[]))),
            this.roomService.getAll().pipe(catchError(() => of([] as Room[]))),
            this.notificationApiService.getAll().pipe(catchError(() => of([] as AppNotification[])))
        ]).subscribe(([entries, courses, rooms, notifications]) => {
            const courseById = new Map(courses.filter((course) => course.id !== undefined).map((course) => [course.id as number, course.nom]));
            const roomById = new Map(rooms.filter((room) => room.id !== undefined).map((room) => [room.id as number, room.nom]));

            this.planning = entries.slice(0, 8).map((entry) => ({
                cours: courseById.get(entry.courseId || -1) || `Cours #${entry.courseId || '-'}`,
                jour: entry.day,
                heure: `${entry.startTime} - ${entry.endTime}`,
                salle: roomById.get(entry.roomId || -1) || `Salle #${entry.roomId || '-'}`
            }));

            this.recentNotifications = notifications.slice(0, 5);
            this.stats = {
                coursPlanifies: entries.length,
                sallesUtilisees: new Set(entries.map((entry) => entry.roomId).filter((id): id is number => id !== undefined)).size,
                notificationsNonLues: notifications.filter((item) => !item.lu).length
            };
        });
    }
}
