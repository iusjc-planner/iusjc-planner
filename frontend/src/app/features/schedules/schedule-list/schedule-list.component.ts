import { Component, OnInit } from '@angular/core';
import { ScheduleService, ScheduleEntry } from '../services/schedule.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.css']
})
export class ScheduleListComponent implements OnInit {
  schedules: ScheduleEntry[] = [];
  filteredSchedules: ScheduleEntry[] = [];
  paginatedSchedules: ScheduleEntry[] = [];
  filterStatus: string = '';
  loading = false;
  
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;

  constructor(
    private scheduleService: ScheduleService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.loading = true;
    this.scheduleService.getAll().subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.filteredSchedules = [...this.schedules];
        this.updatePagination();
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement de l\'emploi du temps');
        this.loading = false;
      }
    });
  }

  filterSchedules(): void {
    this.filteredSchedules = this.schedules.filter(schedule => {
      const matchesStatus = !this.filterStatus || schedule.status === this.filterStatus;
      return matchesStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters(): void {
    this.filterStatus = '';
    this.filteredSchedules = [...this.schedules];
    this.currentPage = 1;
    this.updatePagination();
  }

  generateSchedule(): void {
    if (!confirm('Êtes-vous sûr de vouloir générer automatiquement l\'emploi du temps ?')) return;
    
    this.loading = true;
    this.scheduleService.generateAuto().subscribe({
      next: () => {
        this.notificationService.success('Emploi du temps généré avec succès');
        this.loadSchedules();
      },
      error: () => {
        this.notificationService.error('Erreur lors de la génération');
        this.loading = false;
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSchedules.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedSchedules = this.filteredSchedules.slice(startIndex, startIndex + this.itemsPerPage);
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
