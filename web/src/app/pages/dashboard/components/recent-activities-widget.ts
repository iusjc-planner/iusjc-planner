import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { catchError, forkJoin, of } from 'rxjs';
import { ScheduleService } from '../../../core/services/schedule.service';
import { CourseService } from '../../../core/services/course.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { GroupService } from '../../../core/services/group.service';
import { ScheduleEntry } from '../../../core/models/schedule.model';
import { Course } from '../../../core/models/course.model';
import { Teacher } from '../../../core/models/teacher.model';
import { Group } from '../../../core/models/group.model';

interface ActivityRow {
    courseLabel: string;
    teacherLabel: string;
    groupLabel: string;
    day: string;
    startTime: string;
    endTime: string;
}

@Component({
    standalone: true,
    selector: 'app-recent-activities-widget',
    imports: [CommonModule, TableModule],
    template: `<div class="card">
        <h5 class="text-xl font-bold mb-4">Activités récentes</h5>
        <div *ngIf="loading" class="text-muted-color text-center py-3">Chargement des activités...</div>
        <p-table *ngIf="!loading" [value]="activities" [rows]="5" [paginator]="activities.length > 5" responsiveLayout="scroll">
            <ng-template pTemplate="header">
                <tr>
                    <th>Cours</th>
                    <th>Enseignant</th>
                    <th>Groupe</th>
                    <th>Jour</th>
                    <th>Horaire</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-activity>
                <tr>
                    <td>{{ activity.courseLabel }}</td>
                    <td>{{ activity.teacherLabel }}</td>
                    <td>{{ activity.groupLabel }}</td>
                    <td>{{ activity.day }}</td>
                    <td>{{ activity.startTime }} – {{ activity.endTime }}</td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="5" class="text-center text-muted-color py-4">Aucune activité récente</td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class RecentActivitiesWidget implements OnInit {
    private readonly scheduleService = inject(ScheduleService);
    private readonly courseService = inject(CourseService);
    private readonly teacherService = inject(TeacherService);
    private readonly groupService = inject(GroupService);
    private readonly destroyRef = inject(DestroyRef);

    loading = true;
    activities: ActivityRow[] = [];

    ngOnInit(): void {
        forkJoin({
            schedule: this.scheduleService.getAll().pipe(catchError(() => of<ScheduleEntry[]>([]))),
            courses: this.courseService.getAll().pipe(catchError(() => of<Course[]>([]))),
            teachers: this.teacherService.getAll().pipe(catchError(() => of<Teacher[]>([]))),
            groups: this.groupService.getAll().pipe(catchError(() => of<Group[]>([])))
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ schedule, courses, teachers, groups }) => {
                const courseMap = new Map<number, string>(
                    courses.map((c) => [c.id!, c.nom || c.title || `Cours #${c.id}`])
                );
                const teacherMap = new Map<number, string>(
                    teachers.map((t) => [t.id!, [t.prenom, t.nom].filter(Boolean).join(' ') || `Enseignant #${t.id}`])
                );
                const groupMap = new Map<number, string>(
                    groups.map((g) => [g.id!, g.nom || `Groupe #${g.id}`])
                );

                this.activities = schedule.slice(0, 5).map((entry) => ({
                    courseLabel: entry.courseId ? (courseMap.get(entry.courseId) ?? `Cours #${entry.courseId}`) : '—',
                    teacherLabel: entry.teacherId ? (teacherMap.get(entry.teacherId) ?? `Enseignant #${entry.teacherId}`) : '—',
                    groupLabel: entry.groupId ? (groupMap.get(entry.groupId) ?? `Groupe #${entry.groupId}`) : '—',
                    day: entry.day,
                    startTime: entry.startTime,
                    endTime: entry.endTime
                }));

                this.loading = false;
            });
    }
}
