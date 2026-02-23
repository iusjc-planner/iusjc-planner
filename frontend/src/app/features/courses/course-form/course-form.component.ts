import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { RoomService } from '../../../core/services/room.service';
import { MatiereService } from '../../../core/services/matiere.service';
import { GroupService } from '../../../core/services/group.service';
import { Course, CourseStatus, CourseType } from '../../../shared/models/course.model';
import { Teacher } from '../../../shared/models/teacher.model';
import { Room } from '../../../shared/models/room.model';
import { Matiere } from '../../../shared/models/matiere.model';
import { Group } from '../../../shared/models/group.model';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css']
})
export class CourseFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  courseId: number | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  
  matieres: Matiere[] = [];
  teachers: Teacher[] = [];
  rooms: Room[] = [];
  groups: Group[] = [];
  
  CourseStatus = CourseStatus;
  CourseType = CourseType;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private matiereService: MatiereService,
    private teacherService: TeacherService,
    private roomService: RoomService,
    private groupService: GroupService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMatieres();
    this.loadTeachers();
    this.loadRooms();
    this.loadGroups();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId = +id;
      this.isEditMode = true;
      this.loadCourse(this.courseId);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      matiereId: [null, Validators.required],
      type: [CourseType.CM, Validators.required],
      date: ['', Validators.required],
      startTime: ['08:00', Validators.required],
      endTime: ['10:00', Validators.required],
      roomId: [null],
      groupId: [null],
      teacherId: [null],
      status: [CourseStatus.SCHEDULED, Validators.required],
      notes: ['']
    });
  }

  loadCourse(id: number): void {
    this.loading = true;
    this.courseService.getById(id).subscribe({
      next: (course) => {
        this.form.patchValue({
          matiereId: course.matiereId,
          type: course.type,
          date: course.date,
          startTime: course.startTime,
          endTime: course.endTime,
          roomId: course.roomId,
          groupId: course.groupId,
          teacherId: course.teacherId,
          status: course.status,
          notes: course.notes
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

  loadMatieres(): void {
    this.matiereService.getAll().subscribe({
      next: (data) => this.matieres = data,
      error: (err) => console.error('Erreur chargement matières:', err)
    });
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (data) => this.teachers = data,
      error: (err) => console.error('Erreur chargement enseignants:', err)
    });
  }

  loadRooms(): void {
    this.roomService.getAll().subscribe({
      next: (data) => this.rooms = data,
      error: (err) => console.error('Erreur chargement salles:', err)
    });
  }

  loadGroups(): void {
    this.groupService.getAll().subscribe({
      next: (data) => this.groups = data,
      error: (err) => console.error('Erreur chargement groupes:', err)
    });
  }

  onMatiereChange(): void {
    const matiereId = this.form.get('matiereId')?.value;
    if (matiereId) {
      const matiere = this.matieres.find(m => m.id === matiereId);
      if (matiere?.teacherId) {
        this.form.patchValue({ teacherId: matiere.teacherId });
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;
    const course: Course = this.form.value;

    const request = this.isEditMode
      ? this.courseService.update(this.courseId!, course)
      : this.courseService.create(course);

    request.subscribe({
      next: () => {
        this.router.navigate(['/app/courses']);
      },
      error: (err) => {
        console.error('Erreur sauvegarde:', err);
        this.error = 'Erreur lors de la sauvegarde';
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/app/courses']);
  }

  get f() {
    return this.form.controls;
  }
}