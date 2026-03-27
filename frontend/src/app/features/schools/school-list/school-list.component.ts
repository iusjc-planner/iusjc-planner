import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolService } from '../../../core/services/school.service';
import { School } from '../../../shared/models/school.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-school-list',
  templateUrl: './school-list.component.html',
  styleUrls: ['./school-list.component.css']
})
export class SchoolListComponent implements OnInit {
  schools: School[] = [];
  filteredSchools: School[] = [];
  searchTerm: string = '';
  loading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private schoolService: SchoolService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadSchools();
  }

  loadSchools(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.schoolService.getAllSchools().subscribe({
      next: (schools) => {
        this.schools = schools;
        this.filteredSchools = [...this.schools];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des écoles:', error);
        this.errorMessage = 'Erreur lors du chargement des écoles';
        this.notificationService.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  filterSchools(): void {
    this.filteredSchools = this.schools.filter(school => {
      const matchesSearch = !this.searchTerm || 
        (school.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false) ||
        (school.code?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false);
      
      return matchesSearch;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filteredSchools = [...this.schools];
  }

  deleteSchool(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) {
      this.schoolService.deleteSchool(id).subscribe({
        next: () => {
          this.schools = this.schools.filter(s => s.id !== id);
          this.filterSchools();
          this.notificationService.success('École supprimée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.notificationService.error('Erreur lors de la suppression: ' + error.message);
        }
      });
    }
  }

  getTotalTeachers(): number {
    return this.schools.reduce((total, school) => total + (school.teachersCount || 0), 0);
  }

  getTotalStudents(): number {
    return this.schools.reduce((total, school) => total + (school.studentsCount || 0), 0);
  }

  getTotalSchools(): number {
    return this.schools.length;
  }

  getTotalFilieres(): number {
    return this.schools.reduce((total, school) => total + (school.filieres?.length || 0), 0);
  }
}