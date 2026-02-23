import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScheduleService } from '../../../core/services/schedule.service';
import { CourseService } from '../../../core/services/course.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { RoomService } from '../../../core/services/room.service';
import { ScheduleEntry, ScheduleStatus } from '../../../shared/models/schedule.model';
import { Course } from '../../../shared/models/course.model';
import { Teacher } from '../../../shared/models/teacher.model';
import { Room } from '../../../shared/models/room.model';
import { Group } from '../../../shared/models/group.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.css']
})
export class ScheduleFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  entryId: number | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  
  courses: Course[] = [];
  teachers: Teacher[] = [];
  rooms: Room[] = [];
  groups: Group[] = [];
  ScheduleStatus = ScheduleStatus;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private scheduleService: ScheduleService,
    private courseService: CourseService,
    private teacherService: TeacherService,
    private roomService: RoomService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.entryId = +id;
      this.isEditMode = true;
      this.loadEntry(this.entryId);
    }
  }

  initForm(): void {
    const now = new Date();
    const startTime = new Date(now.setHours(8, 0, 0, 0));
    const endTime = new Date(now.setHours(10, 0, 0, 0));

    this.form = this.fb.group({
      courseId: ['', Validators.required],
      teacherId: ['', Validators.required],
      roomId: ['', Validators.required],
      groupId: ['', Validators.required],
      date: [this.formatDateForInput(new Date()), Validators.required],
      startTime: ['08:00', Validators.required],
      endTime: ['10:00', Validators.required],
      status: [ScheduleStatus.SCHEDULED, Validators.required]
    });
  }

  loadData(): void {
    this.courseService.getAll().subscribe({
      next: (data) => this.courses = data,
      error: (err) => console.error('Erreur chargement cours:', err)
    });

    this.teacherService.getAllTeachers().subscribe({
      next: (data) => this.teachers = data,
      error: (err) => console.error('Erreur chargement enseignants:', err)
    });

    this.roomService.getAll().subscribe({
      next: (data) => this.rooms = data,
      error: (err) => console.error('Erreur chargement salles:', err)
    });

    this.http.get<Group[]>(`${environment.apiUrl}/groups`).subscribe({
      next: (data) => this.groups = data,
      error: (err) => console.error('Erreur chargement groupes:', err)
    });
  }

  loadEntry(id: number): void {
    this.loading = true;
    this.scheduleService.get(id).subscribe({
      next: (entry) => {
        const startDate = new Date(entry.startTime);
        const endDate = new Date(entry.endTime);
        
        this.form.patchValue({
          courseId: entry.courseId,
          teacherId: entry.teacherId,
          roomId: entry.roomId,
          groupId: entry.groupId,
          date: this.formatDateForInput(startDate),
          startTime: this.formatTimeForInput(startDate),
          endTime: this.formatTimeForInput(endDate),
          status: entry.status
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement séance:', err);
        this.error = 'Erreur lors du chargement de la séance';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.form.value;
    const startTime = this.combineDateAndTime(formValue.date, formValue.startTime);
    const endTime = this.combineDateAndTime(formValue.date, formValue.endTime);

    const entry: ScheduleEntry = {
      courseId: formValue.courseId,
      teacherId: formValue.teacherId,
      roomId: formValue.roomId,
      groupId: formValue.groupId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: formValue.status
    };

    const request = this.isEditMode
      ? this.scheduleService.update(this.entryId!, entry)
      : this.scheduleService.create(entry);

    request.subscribe({
      next: () => {
        this.router.navigate(['/app/schedules']);
      },
      error: (err) => {
        console.error('Erreur sauvegarde:', err);
        this.error = err.error?.message || 'Erreur lors de la sauvegarde (conflit possible)';
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/app/schedules']);
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  get f() {
    return this.form.controls;
  }
}
