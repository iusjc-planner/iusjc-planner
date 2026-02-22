import { Component, OnInit } from '@angular/core';
import { Room, RoomStatus, RoomType } from '../../../shared/models/room.model';
import { RoomService } from '../../../core/services/room.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  filtered: Room[] = [];
  searchTerm = '';
  typeFilter?: RoomType;
  statusFilter?: RoomStatus;
  minCapacity?: number;

  loading = false;
  errorMessage = '';

  RoomType = RoomType;
  RoomStatus = RoomStatus;

  constructor(private roomService: RoomService, private notification: NotificationService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = true;
    this.errorMessage = '';
    this.roomService.getAll({
      name: this.searchTerm || undefined,
      type: this.typeFilter,
      status: this.statusFilter,
      minCapacity: this.minCapacity
    }).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement salles', err);
        this.errorMessage = 'Impossible de charger les salles';
        this.notification.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filtered = this.rooms.filter((r) => {
      const matchesSearch = !this.searchTerm || r.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || (r.location || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.typeFilter || r.type === this.typeFilter;
      const matchesStatus = !this.statusFilter || r.status === this.statusFilter;
      const matchesCapacity = !this.minCapacity || (r.capacity || 0) >= this.minCapacity;
      return matchesSearch && matchesType && matchesStatus && matchesCapacity;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.typeFilter = undefined;
    this.statusFilter = undefined;
    this.minCapacity = undefined;
    this.applyFilters();
    this.loadRooms();
  }

  deleteRoom(id: number): void {
    if (!confirm('Supprimer cette salle ?')) return;
    this.roomService.delete(id).subscribe({
      next: () => {
        this.notification.success('Salle supprimée');
        this.rooms = this.rooms.filter((r) => r.id !== id);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur suppression salle', err);
        this.notification.error('Suppression impossible');
      }
    });
  }
}
