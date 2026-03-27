import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { Report, ReportFormat } from '../../../shared/models/report.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-report-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './report-rooms.component.html',
  styleUrls: ['./report-rooms.component.css']
})
export class ReportRoomsComponent {
  from = this.defaultFromDate();
  to = this.defaultToDate();
  salleId?: number;
  format: ReportFormat = 'PDF';
  generating = false;
  latestReport?: Report;

  constructor(
    private reportService: ReportService,
    private notificationService: NotificationService
  ) {}

  generate(): void {
    this.generating = true;
    this.reportService.generateRoomReport(this.from, this.to, this.format, this.salleId).subscribe({
      next: report => {
        this.latestReport = report;
        this.generating = false;
        this.notificationService.success('Rapport occupation salles genere.');
      },
      error: err => {
        this.generating = false;
        const message = err?.error?.message || err?.message || 'Generation du rapport impossible.';
        this.notificationService.error(message);
      }
    });
  }

  download(): void {
    if (!this.latestReport?.id) {
      return;
    }

    this.reportService.download(this.latestReport.id).subscribe({
      next: blob => {
        const extension = this.latestReport?.format === 'EXCEL' ? 'xlsx' : this.latestReport?.format.toLowerCase();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport_occupation_salles.${extension}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error('Telechargement impossible.')
    });
  }

  private defaultFromDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 10);
  }

  private defaultToDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
