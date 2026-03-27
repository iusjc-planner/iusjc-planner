import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService } from '../../../core/services/schedule.service';
import { GroupService } from '../../../core/services/group.service';
import { ScheduleEntry, ScheduleStatus } from '../../../shared/models/schedule.model';
import { Group } from '../../../shared/models/group.model';
import { DragDropModule } from 'primeng/dragdrop';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-schedule-group',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule],
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
  dropDate = this.formatDateInput(new Date());
  dropStartTime = '08:00';
  dropping = false;
  conflictMessage = '';

  constructor(
    private scheduleService: ScheduleService,
    private groupService: GroupService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupService.getAll().subscribe({
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

    this.scheduleService.update(entry.id, payload).subscribe({
      next: () => {
        this.notificationService.success('Séance déplacée avec succès.');
        this.loadSchedule();
      },
      error: (err) => {
        const backendMessage = err?.error?.message || err?.message || 'Conflit détecté';
        if (err?.status === 409) {
          this.conflictMessage = `Conflit de planning: ${backendMessage}`;
          this.notificationService.error(this.conflictMessage);
        } else {
          this.notificationService.error('Déplacement impossible pour cette séance.');
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
