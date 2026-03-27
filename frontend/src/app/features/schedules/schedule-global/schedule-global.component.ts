import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from 'primeng/dragdrop';
import { ScheduleService } from '../../../core/services/schedule.service';
import { ScheduleEntry, ScheduleStats } from '../../../shared/models/schedule.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-schedule-global',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule],
  templateUrl: './schedule-global.component.html',
  styleUrls: ['./schedule-global.component.css']
})
export class ScheduleGlobalComponent implements OnInit {
  entries: ScheduleEntry[] = [];
  stats?: ScheduleStats;
  loading = false;
  exporting = false;
  generating = false;
  dropDate = this.formatDateInput(new Date());
  dropStartTime = '08:00';
  dropping = false;
  conflictMessage = '';

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

  onSessionDrop(event: any): void {
    const entry = event?.dragData as ScheduleEntry | undefined;
    if (!entry || !entry.id) {
      return;
    }

    this.conflictMessage = '';
    this.dropping = true;

    const start = new Date(entry.startTime);
    const end = new Date(entry.endTime);
    const durationMs = Math.max(0, end.getTime() - start.getTime());
    const nextStart = new Date(`${this.dropDate}T${this.dropStartTime}:00`);
    const nextEnd = new Date(nextStart.getTime() + durationMs);

    const payload: ScheduleEntry = {
      ...entry,
      startTime: nextStart.toISOString(),
      endTime: nextEnd.toISOString()
    };

    this.service.update(entry.id, payload).subscribe({
      next: () => {
        this.notify.success('Séance déplacée avec succès.');
        this.load();
        this.loadStats();
      },
      error: (err) => {
        const backendMessage = err?.error?.message || err?.message || 'Conflit détecté';
        if (err?.status === 409) {
          this.conflictMessage = `Conflit de planning: ${backendMessage}`;
          this.notify.error(this.conflictMessage);
        } else {
          this.notify.error('Déplacement impossible pour cette séance.');
        }
      },
      complete: () => {
        this.dropping = false;
      }
    });
  }

  private formatDateInput(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
