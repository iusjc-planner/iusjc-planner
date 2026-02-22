import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  courseId!: number;
  course: Course | null = null;
  matiere: Matiere | null = null;
  teacher: Teacher | null = null;
  room: Room | null = null;
  group: Group | null = null;
  loading = false;
  error: string | null = null;
  CourseStatus = CourseStatus;
  CourseType = CourseType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private matiereService: MatiereService,
    private teacherService: TeacherService,
    private roomService: RoomService,
    private groupService: GroupService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId = +id;
      this.loadCourse();
    }
  }

  loadCourse(): void {
    this.loading = true;
    this.courseService.getById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        if (course.matiereId) this.loadMatiere(course.matiereId);
        if (course.teacherId) this.loadTeacher(course.teacherId);
        if (course.roomId) this.loadRoom(course.roomId);
        if (course.groupId) this.loadGroup(course.groupId);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement séance:', err);
        this.error = 'Erreur lors du chargement de la séance';
        this.loading = false;
      }
    });
  }

  loadMatiere(id: number): void {
    this.matiereService.getById(id).subscribe({
      next: (m) => this.matiere = m,
      error: () => {}
    });
  }

  loadTeacher(id: number): void {
    this.teacherService.getTeacherById(id).subscribe({
      next: (t) => this.teacher = t,
      error: () => {}
    });
  }

  loadRoom(id: number): void {
    this.roomService.getById(id).subscribe({
      next: (r) => this.room = r,
      error: () => {}
    });
  }

  loadGroup(id: number): void {
    this.groupService.getById(id).subscribe({
      next: (g) => this.group = g,
      error: () => {}
    });
  }

  getTypeLabel(type: CourseType): string {
    const labels: Record<CourseType, string> = {
      [CourseType.CM]: 'Cours Magistral',
      [CourseType.TD]: 'Travaux Dirigés',
      [CourseType.TP]: 'Travaux Pratiques',
      [CourseType.EXAM]: 'Examen'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: CourseStatus): string {
    const labels: Record<CourseStatus, string> = {
      [CourseStatus.SCHEDULED]: 'Programmée',
      [CourseStatus.COMPLETED]: 'Terminée',
      [CourseStatus.CANCELLED]: 'Annulée',
      [CourseStatus.POSTPONED]: 'Reportée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: CourseStatus): string {
    const classes: Record<CourseStatus, string> = {
      [CourseStatus.SCHEDULED]: 'bg-info',
      [CourseStatus.COMPLETED]: 'bg-success',
      [CourseStatus.CANCELLED]: 'bg-danger',
      [CourseStatus.POSTPONED]: 'bg-warning text-dark'
    };
    return classes[status] || 'bg-secondary';
  }

  onEdit(): void {
    this.router.navigate(['/app/courses', this.courseId, 'edit']);
  }

  onDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      this.courseService.delete(this.courseId).subscribe({
        next: () => this.router.navigate(['/app/courses']),
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.error = 'Erreur lors de la suppression';
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/app/courses']);
  }
}