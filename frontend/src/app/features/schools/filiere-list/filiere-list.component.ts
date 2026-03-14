import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FiliereService, Filiere } from '../services/filiere.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-filiere-list',
  templateUrl: './filiere-list.component.html',
  styleUrls: ['./filiere-list.component.css']
})
export class FiliereListComponent implements OnInit {
  filieres: Filiere[] = [];
  filteredFilieres: Filiere[] = [];
  paginatedFilieres: Filiere[] = [];
  filterCode: string = '';
  filterNom: string = '';
  filterStatus: string = '';
  loading = false;
  schoolId: number | null = null;
  
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private filiereService: FiliereService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['schoolId']) {
        this.schoolId = params['schoolId'];
        this.loadFilieres();
      }
    });
  }

  loadFilieres(): void {
    this.loading = true;
    const request = this.schoolId 
      ? this.filiereService.getBySchoolId(this.schoolId)
      : this.filiereService.getAll();
    
    request.subscribe({
      next: (filieres) => {
        this.filieres = filieres;
        this.filteredFilieres = [...this.filieres];
        this.updatePagination();
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement des filières');
        this.loading = false;
      }
    });
  }

  filterFilieres(): void {
    this.filteredFilieres = this.filieres.filter(filiere => {
      const matchesCode = !this.filterCode || filiere.code.toLowerCase().includes(this.filterCode.toLowerCase());
      const matchesNom = !this.filterNom || filiere.nom.toLowerCase().includes(this.filterNom.toLowerCase());
      const matchesStatus = !this.filterStatus || filiere.status === this.filterStatus;
      return matchesCode && matchesNom && matchesStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters(): void {
    this.filterCode = '';
    this.filterNom = '';
    this.filterStatus = '';
    this.filteredFilieres = [...this.filieres];
    this.currentPage = 1;
    this.updatePagination();
  }

  deleteFiliere(id: number | undefined): void {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer cette filière ?')) return;
    
    this.filiereService.delete(id).subscribe({
      next: () => {
        this.filieres = this.filieres.filter(f => f.id !== id);
        this.filterFilieres();
        this.notificationService.success('Filière supprimée avec succès');
      },
      error: () => this.notificationService.error('Erreur lors de la suppression')
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredFilieres.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedFilieres = this.filteredFilieres.slice(startIndex, startIndex + this.itemsPerPage);
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

  goBack(): void {
    this.router.navigate(['/app/schools']);
  }
}
