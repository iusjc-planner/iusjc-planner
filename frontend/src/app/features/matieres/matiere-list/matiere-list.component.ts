import { Component, OnInit } from '@angular/core';
import { MatiereService } from '../../../core/services/matiere.service';
import { SchoolService } from '../../../core/services/school.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { Matiere, MatiereStatus } from '../../../shared/models/matiere.model';
import { School, Filiere } from '../../../shared/models/school.model';
import { Teacher } from '../../../shared/models/teacher.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-matiere-list',
  templateUrl: './matiere-list.component.html',
  styleUrls: ['./matiere-list.component.css']
})
export class MatiereListComponent implements OnInit {
  matieres: Matiere[] = [];
  filteredMatieres: Matiere[] = [];
  schools: School[] = [];
  filieres: Filiere[] = [];
  teachers: Teacher[] = [];
  
  // Filtres
  searchTerm: string = '';
  selectedSchoolId: number | null = null;
  selectedFiliereId: number | null = null;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  loading = false;
  errorMessage = '';

  constructor(
    private matiereService: MatiereService,
    private schoolService: SchoolService,
    private teacherService: TeacherService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadMatieres();
    this.loadSchools();
    this.loadTeachers();
  }

  loadMatieres(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.matiereService.getAll().subscribe({
      next: (matieres) => {
        this.matieres = matieres;
        this.enrichMatieres();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières:', error);
        this.errorMessage = 'Erreur lors du chargement des matières';
        this.notificationService.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  loadSchools(): void {
    this.schoolService.getAllSchools().subscribe({
      next: (schools) => {
        this.schools = schools;
        // Extraire toutes les filières
        this.filieres = [];
        schools.forEach(school => {
          if (school.filieres) {
            school.filieres.forEach(f => {
              this.filieres.push({ ...f, schoolId: school.id });
            });
          }
        });
        this.enrichMatieres();
      },
      error: (error) => console.error('Erreur chargement écoles:', error)
    });
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
        this.enrichMatieres();
      },
      error: (error) => console.error('Erreur chargement enseignants:', error)
    });
  }

  enrichMatieres(): void {
    this.matieres.forEach(matiere => {
      const school = this.schools.find(s => s.id === matiere.schoolId);
      matiere.schoolName = school?.name;
      
      const filiere = this.filieres.find(f => f.id === matiere.filiereId);
      matiere.filiereName = filiere?.nom;
      
      const teacher = this.teachers.find(t => t.id === matiere.teacherId);
      matiere.teacherName = teacher ? `${teacher.prenom} ${teacher.nom}` : undefined;
    });
  }

  applyFilters(): void {
    this.filteredMatieres = this.matieres.filter(matiere => {
      const matchesSearch = !this.searchTerm || 
        matiere.code?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        matiere.nom?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesSchool = !this.selectedSchoolId || matiere.schoolId === this.selectedSchoolId;
      const matchesFiliere = !this.selectedFiliereId || matiere.filiereId === this.selectedFiliereId;
      
      return matchesSearch && matchesSchool && matchesFiliere;
    });
    
    this.updatePagination();
  }

  onSchoolChange(): void {
    // Filtrer les filières de l'école sélectionnée
    if (this.selectedSchoolId) {
      const school = this.schools.find(s => s.id === this.selectedSchoolId);
      this.filieres = school?.filieres || [];
    } else {
      // Recharger toutes les filières
      this.filieres = [];
      this.schools.forEach(school => {
        if (school.filieres) {
          school.filieres.forEach(f => {
            this.filieres.push({ ...f, schoolId: school.id });
          });
        }
      });
    }
    this.selectedFiliereId = null;
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredMatieres.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getPaginatedMatieres(): Matiere[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredMatieres.slice(startIndex, endIndex);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedSchoolId = null;
    this.selectedFiliereId = null;
    this.currentPage = 1;
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  deleteMatiere(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      this.matiereService.delete(id).subscribe({
        next: () => {
          this.notificationService.success('Matière supprimée avec succès');
          this.matieres = this.matieres.filter(m => m.id !== id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression', error);
          this.notificationService.error('Suppression impossible');
        }
      });
    }
  }

  // Stats
  getTotalMatieres(): number {
    return this.matieres.length;
  }

  getTotalCredits(): number {
    return this.matieres.reduce((total, m) => total + (m.credits || 0), 0);
  }

  getTotalHours(): number {
    return this.matieres.reduce((total, m) => total + (m.hoursTotal || 0), 0);
  }

  getActiveCount(): number {
    return this.matieres.filter(m => m.status === MatiereStatus.ACTIVE).length;
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
