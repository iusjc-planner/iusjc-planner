import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { TeacherService } from '../../core/services/teacher.service';
import { UserService } from '../../core/services/user.service';
import { Course } from '../../shared/models/course.model';

@Component({
  selector: 'app-dashboard-teacher',
  templateUrl: './dashboard-teacher.component.html',
  styleUrls: ['./dashboard-teacher.component.scss']
})
export class DashboardTeacherComponent implements OnInit {
  loading = true;
  errorMessage = '';

  weeklyKpis = {
    coursesThisWeek: 0,
    groupsCount: 0,
    teachingHours: 0
  };

  upcomingCourses: Course[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private teacherService: TeacherService,
    private courseService: CourseService
  ) { }

  ngOnInit(): void {
    this.loadTeacherDashboard();
  }

  private loadTeacherDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.login) {
      this.errorMessage = 'Impossible d\'identifier l\'enseignant connecté.';
      this.loading = false;
      return;
    }

    this.userService.getUserByLogin(currentUser.login).pipe(
      switchMap(user => this.teacherService.getAllTeachers().pipe(
        switchMap(teachers => {
          const teacher = teachers.find(item => item.userId === user.id || item.email === user.email);
          if (!teacher?.id) {
            this.errorMessage = 'Aucun profil enseignant associé à ce compte.';
            return of([] as Course[]);
          }

          return this.courseService.getAll({ teacherId: teacher.id }).pipe(catchError(() => of([])));
        })
      )),
      catchError(() => of([]))
    ).subscribe(courses => {
      this.upcomingCourses = courses
        .filter(course => this.toDate(course.date, course.startTime) >= new Date())
        .sort((a, b) => this.toDate(a.date, a.startTime).getTime() - this.toDate(b.date, b.startTime).getTime())
        .slice(0, 8);

      const weeklyCourses = courses.filter(course => this.isInCurrentWeek(course.date));
      const uniqueGroups = new Set(weeklyCourses.map(course => course.groupId).filter(Boolean));
      const weeklyHours = weeklyCourses.reduce((total, course) => total + this.computeHours(course.startTime, course.endTime), 0);

      this.weeklyKpis = {
        coursesThisWeek: weeklyCourses.length,
        groupsCount: uniqueGroups.size,
        teachingHours: Math.round(weeklyHours * 10) / 10
      };

      this.loading = false;
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  private isInCurrentWeek(date: string): boolean {
    const target = new Date(`${date}T00:00:00`);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return target >= start && target <= end;
  }

  private computeHours(start: string, end: string): number {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startValue = startHour + (startMinute / 60);
    const endValue = endHour + (endMinute / 60);
    return Math.max(0, endValue - startValue);
  }

  private toDate(date: string, time: string): Date {
    return new Date(`${date}T${time}:00`);
  }

}
