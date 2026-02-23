import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService } from '../../../core/services/schedule.service';
import { RoomService } from '../../../core/services/room.service';
import { ScheduleEntry, ScheduleStatus } from '../../../shared/models/schedule.model';
import { Room } from '../../../shared/models/room.model';

@Component({
  selector: 'app-schedule-room',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './schedule-room.component.html',
  styleUrls: ['./schedule-room.component.css']
})
export class ScheduleRoomComponent implements OnInit {
  rooms: Room[] = [];
  selectedRoomId: string = '';
  entries: ScheduleEntry[] = [];
  loading = false;
  loadingEntries = false;
  ScheduleStatus = ScheduleStatus;

  constructor(
    private scheduleService: ScheduleService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = true;
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.rooms = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement salles:', err);
        this.loading = false;
      }
    });
  }

  loadSchedule(): void {
    if (!this.selectedRoomId) return;
    this.loadingEntries = true;
    this.scheduleService.list({ roomId: this.selectedRoomId }).subscribe({
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

  getSelectedRoom(): Room | undefined {
    return this.rooms.find(r => r.id?.toString() === this.selectedRoomId);
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
