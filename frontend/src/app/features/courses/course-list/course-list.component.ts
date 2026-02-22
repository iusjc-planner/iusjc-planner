import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { MatiereService } from '../../../core/services/matiere.service';
import { Course, CourseFilters, CourseStats, CourseStatus, CourseType } from '../../../shared/models/course.model';
import { Matiere } from '../../../shared/models/matiere.model';
import { TeacherService } from '../../../core/services/teacher.service';
import { RoomService } from '../../../core/services/room.service';
import { Teacher } from '../../../shared/models/teacher.model';
import { Room } from '../../../shared/models/room.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  matieres: Matiere[] = [];
  teachers: Teacher[] = [];
  rooms: Room[] = [];
  stats: CourseStats | null = null;
  loading = false;
  error: string | null = null;

  // Filtres
  filterMatiereId: number | null = null;
  filterStatus: CourseStatus | '' = '';
  filterType: CourseType | '' = '';
  filterTeacherId: number | null = null;
  filterDateFrom: string = '';
  filterDateTo: string = '';

  CourseStatus = CourseStatus;
  CourseType = CourseType;

  constructor(
    private courseService: CourseService,
    private matiereService: MatiereService,
    private teacherService: TeacherService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadMatieres();
    this.loadTeachers();
    this.loadRooms();
    this.loadStats();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = null;
    const filters: CourseFilters = {};
    if (this.filterMatiereId) filters.matiereId = this.filterMatiereId;
    if (this.filterStatus) filters.status = this.filterStatus;
    if (this.filterType) filters.type = this.filterType;
    if (this.filterTeacherId) filters.teacherId = this.filterTeacherId;
    if (this.filterDateFrom) filters.dateFrom = this.filterDateFrom;
    if (this.filterDateTo) filters.dateTo = this.filterDateTo;

    this.courseService.getAll(filters).subscribe({
      next: (data) => {
        this.courses = data;
        this.enrichCourses();
        this.filteredCourses = this.courses;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement séances:', err);
        this.error = 'Erreur lors du chargement des séances';
        this.loading = false;
      }
    });
  }

  loadMatieres(): void {
    this.matiereService.getAll().subscribe({
      next: (data) => {
        this.matieres = data;
        this.enrichCourses();
      },
      error: (err) => console.error('Erreur chargement matières:', err)
    });
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        this.enrichCourses();
      },
      error: (err) => console.error('Erreur chargement enseignants:', err)
    });
  }

  loadRooms(): void {
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.rooms = data;
        this.enrichCourses();
      },
      error: (err) => console.error('Erreur chargement salles:', err)
    });
  }

  loadStats(): void {
    this.courseService.getStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Erreur chargement stats:', err)
    });
  }

  enrichCourses(): void {
    this.courses.forEach(course => {
      const matiere = this.matieres.find(m => m.id === course.matiereId);
      course.matiereName = matiere?.nom;
      course.matiereCode = matiere?.code;
      
      const teacher = this.teachers.find(t => t.id === course.teacherId);
      course.teacherName = teacher ? `${teacher.prenom} ${teacher.nom}` : undefined;
      
      const room = this.rooms.find(r => r.id === course.roomId);
      course.roomName = room?.name;
    });
  }

  applyFilters(): void {
    this.loadCourses();
  }

  resetFilters(): void {
    this.filterMatiereId = null;
    this.filterStatus = '';
    this.filterType = '';
    this.filterTeacherId = null;
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.loadCourses();
  }

  deleteCourse(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      this.courseService.delete(id).subscribe({
        next: () => {
          this.loadCourses();
          this.loadStats();
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.error = 'Erreur lors de la suppression';
        }
      });
    }
  }

  getStatusLabel(status?: CourseStatus): string {
    switch (status) {
      case CourseStatus.SCHEDULED: return 'Programmée';
      case CourseStatus.COMPLETED: return 'Terminée';
      case CourseStatus.CANCELLED: return 'Annulée';
      case CourseStatus.POSTPONED: return 'Reportée';
      default: return '-';
    }
  }

  getStatusClass(status?: CourseStatus): string {
    switch (status) {
      case CourseStatus.SCHEDULED: return 'bg-primary';
      case CourseStatus.COMPLETED: return 'bg-success';
      case CourseStatus.CANCELLED: return 'bg-danger';
      case CourseStatus.POSTPONED: return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getTypeLabel(type?: CourseType): string {
    switch (type) {
      case CourseType.CM: return 'CM';
      case CourseType.TD: return 'TD';
      case CourseType.TP: return 'TP';
      case CourseType.EXAM: return 'Examen';
      default: return '-';
    }
  }
}