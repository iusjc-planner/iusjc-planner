import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { GenerateReportRequest, Report, ReportFormat, ReportType } from '../../../shared/models/report.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './report-dashboard.component.html',
  styleUrls: ['./report-dashboard.component.css']
})
export class ReportDashboardComponent implements OnInit {
  reports: Report[] = [];
  loading = false;
  generating = false;
  errorMessage = '';

  readonly reportTypes: { label: string; value: ReportType }[] = [
    { label: 'Occupation salles', value: 'OCCUPATION_SALLE' },
    { label: 'Charge enseignants', value: 'CHARGE_ENSEIGNANT' },
    { label: 'Statistiques ecole', value: 'STATISTIQUES_ECOLE' },
    { label: 'Evenements', value: 'EVENEMENTS' },
    { label: 'Global', value: 'GLOBAL' }
  ];

  readonly reportFormats: ReportFormat[] = ['PDF', 'EXCEL'];

  request: GenerateReportRequest = {
    type: 'GLOBAL',
    format: 'PDF',
    periodeDebut: this.defaultFromDate(),
    periodeFin: this.defaultToDate()
  };

  constructor(
    private reportService: ReportService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.errorMessage = '';
    this.reportService.list().subscribe({
      next: data => {
        this.reports = data.sort((a, b) => new Date(b.dateGeneration).getTime() - new Date(a.dateGeneration).getTime());
        this.loading = false;
      },
      error: err => {
        const message = err?.error?.message || err?.message || 'Impossible de charger l historique des rapports.';
        this.errorMessage = message;
        this.notificationService.error(message);
        this.loading = false;
      }
    });
  }

  generate(): void {
    this.generating = true;
    this.errorMessage = '';

    this.reportService.generate(this.request).subscribe({
      next: report => {
        this.generating = false;
        this.notificationService.success('Rapport genere avec succes.');
        this.reports = [report, ...this.reports];
      },
      error: err => {
        this.generating = false;
        const message = err?.error?.message || err?.message || 'Generation du rapport impossible.';
        this.errorMessage = message;
        this.notificationService.error(message);
      }
    });
  }

  download(report: Report): void {
    this.reportService.download(report.id).subscribe({
      next: blob => {
        const extension = report.format === 'EXCEL' ? 'xlsx' : report.format.toLowerCase();
        const filename = `rapport_${report.id}.${extension}`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        const message = err?.error?.message || err?.message || 'Telechargement impossible.';
        this.notificationService.error(message);
      }
    });
  }

  delete(report: Report): void {
    if (!confirm('Supprimer ce rapport ?')) {
      return;
    }

    this.reportService.delete(report.id).subscribe({
      next: () => {
        this.reports = this.reports.filter(item => item.id !== report.id);
        this.notificationService.success('Rapport supprime.');
      },
      error: err => {
        const message = err?.error?.message || err?.message || 'Suppression impossible.';
        this.notificationService.error(message);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'TERMINE':
        return 'bg-success';
      case 'EN_COURS':
        return 'bg-warning';
      case 'ERREUR':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
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
