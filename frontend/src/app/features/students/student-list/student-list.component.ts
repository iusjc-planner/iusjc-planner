import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService, Student } from '../services/student.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  paginatedStudents: Student[] = [];
  filterMatricule: string = '';
  filterNom: string = '';
  filterStatus: string = '';
  loading = false;
  
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;

  constructor(
    private router: Router,
    private studentService: StudentService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.filteredStudents = [...this.students];
        this.updatePagination();
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement des étudiants');
        this.loading = false;
      }
    });
  }

  filterStudents(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesMatricule = !this.filterMatricule || student.matricule.toLowerCase().includes(this.filterMatricule.toLowerCase());
      const matchesNom = !this.filterNom || student.nom.toLowerCase().includes(this.filterNom.toLowerCase());
      const matchesStatus = !this.filterStatus || student.status === this.filterStatus;
      return matchesMatricule && matchesNom && matchesStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters(): void {
    this.filterMatricule = '';
    this.filterNom = '';
    this.filterStatus = '';
    this.filteredStudents = [...this.students];
    this.currentPage = 1;
    this.updatePagination();
  }

  deleteStudent(id: number | undefined): void {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) return;
    
    this.studentService.delete(id).subscribe({
      next: () => {
        this.students = this.students.filter(s => s.id !== id);
        this.filterStudents();
        this.notificationService.success('Étudiant supprimé avec succès');
      },
      error: () => this.notificationService.error('Erreur lors de la suppression')
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedStudents = this.filteredStudents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
