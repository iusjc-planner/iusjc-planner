import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService } from '../../../core/services/schedule.service';
import { ScheduleEntry, ScheduleStatus } from '../../../shared/models/schedule.model';
import { Group } from '../../../shared/models/group.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-schedule-group',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './schedule-group.component.html',
  styleUrls: ['./schedule-group.component.css']
})
export class ScheduleGroupComponent implements OnInit {
  groups: Group[] = [];
  selectedGroupId: string = '';
  entries: ScheduleEntry[] = [];
  loading = false;
  loadingEntries = false;
  ScheduleStatus = ScheduleStatus;

  constructor(
    private scheduleService: ScheduleService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.http.get<Group[]>(`${environment.apiUrl}/groups`).subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement groupes:', err);
        this.loading = false;
      }
    });
  }

  loadSchedule(): void {
    if (!this.selectedGroupId) return;
    this.loadingEntries = true;
    this.scheduleService.list({ groupId: this.selectedGroupId }).subscribe({
      next: (data) => {
        this.entries = data;
        this.loadingEntries = false;
      },
      error: (err) => {
        console.error('Erreur chargement planning:', err);
        this.loadingEntries = false;
      }
    });
  }

  getSelectedGroup(): Group | undefined {
    return this.groups.find(g => g.id?.toString() === this.selectedGroupId);
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case ScheduleStatus.SCHEDULED: return 'bg-primary';
      case ScheduleStatus.COMPLETED: return 'bg-success';
      case ScheduleStatus.CANCELLED: return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
}
