import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService } from '../../../core/services/schedule.service';
import { ScheduleEntry, ScheduleStats } from '../../../shared/models/schedule.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-schedule-global',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './schedule-global.component.html',
  styleUrls: ['./schedule-global.component.css']
})
export class ScheduleGlobalComponent implements OnInit {
  entries: ScheduleEntry[] = [];
  stats?: ScheduleStats;
  loading = false;
  exporting = false;
  generating = false;

  constructor(private service: ScheduleService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.load();
    this.loadStats();
  }

  load(): void {
    this.loading = true;
    this.service.list().subscribe({
      next: data => { this.entries = data; this.loading = false; },
      error: err => { console.error(err); this.notify.error('Erreur lors du chargement des séances'); this.loading = false; }
    });
  }

  loadStats(): void {
    this.service.stats().subscribe({
      next: data => this.stats = data,
      error: () => this.stats = undefined
    });
  }

  deleteEntry(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      this.service.delete(id).subscribe({
        next: () => {
          this.notify.success('Séance supprimée');
          this.load();
          this.loadStats();
        },
        error: (err) => {
          console.error(err);
          this.notify.error('Erreur lors de la suppression');
        }
      });
    }
  }

  exportPdf(id: number): void {
    this.exporting = true;
    this.service.exportPdf(id).subscribe({
      next: blob => this.downloadBlob(blob, `schedule-${id}.pdf`),
      error: err => { console.error(err); this.notify.error('Export PDF en échec (stub)'); },
      complete: () => this.exporting = false
    });
  }

  exportExcel(id: number): void {
    this.exporting = true;
    this.service.exportExcel(id).subscribe({
      next: blob => this.downloadBlob(blob, `schedule-${id}.xlsx`),
      error: err => { console.error(err); this.notify.error('Export Excel en échec (stub)'); },
      complete: () => this.exporting = false
    });
  }

  generateAuto(): void {
    this.generating = true;
    this.service.generateAuto().subscribe({
      next: res => {
        this.notify.success(res.message || 'Génération lancée');
        this.load();
        this.loadStats();
      },
      error: err => { console.error(err); this.notify.error('Génération automatique en échec'); },
      complete: () => this.generating = false
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
