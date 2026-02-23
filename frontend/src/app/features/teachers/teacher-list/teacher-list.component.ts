import { Component, OnInit } from '@angular/core';
import { TeacherService } from '../../../core/services/teacher.service';
import { Teacher, TeacherStatus } from '../../../shared/models/teacher.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-teacher-list',
  templateUrl: './teacher-list.component.html',
  styleUrls: ['./teacher-list.component.css']
})
export class TeacherListComponent implements OnInit {
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  
  // Filtres simplifiés
  searchTerm: string = '';
  
  // Vue grille/liste
  viewMode: 'grid' | 'list' = 'list';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  loading = false;
  errorMessage = '';

  constructor(
    private teacherService: TeacherService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignants:', error);
        this.errorMessage = 'Erreur lors du chargement des enseignants';
        this.notificationService.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTeachers = this.teachers.filter(teacher => {
      const matchesSearch = !this.searchTerm || 
        teacher.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSearch;
    });
    
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTeachers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getPaginatedTeachers(): Teacher[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredTeachers.slice(startIndex, endIndex);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Statistiques
  getTotalTeachers(): number {
    return this.teachers.length;
  }

  getAvailableTeachers(): number {
    return this.teachers.filter(t => t.status === TeacherStatus.ACTIVE).length;
  }

  getBusyTeachers(): number {
    return this.teachers.filter(t => t.status === TeacherStatus.EN_CONGE).length;
  }

  getTotalCourses(): number {
    return this.teachers.reduce((total, teacher) => total + (teacher.coursesCount || 0), 0);
  }

  // Nouvelles statistiques pour les blocs colorés
  getTotalSchools(): number {
    return 4; // SJI, SJM, PrepaVogt, CPGE
  }

  getTotalRooms(): number {
    return 32; // Nombre fictif de salles
  }

  deleteTeacher(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      this.teacherService.deleteTeacher(id).subscribe({
        next: () => {
          this.notificationService.success('Enseignant supprimé avec succès');
          this.teachers = this.teachers.filter(t => t.id !== id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression', error);
          this.notificationService.error('Suppression impossible');
        }
      });
    }
  }

  // Méthode utilitaire pour le template
  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
