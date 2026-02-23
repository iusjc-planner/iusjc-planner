import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../../../shared/models/room.model';
import { RoomService } from '../../../core/services/room.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.css']
})
export class RoomDetailComponent implements OnInit {
  room?: Room;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadRoom(+params['id']);
      }
    });
  }

  loadRoom(id: number): void {
    this.loading = true;
    this.roomService.getById(id).subscribe({
      next: (room) => {
        this.room = room;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement salle', err);
        this.notification.error('Salle introuvable');
        this.loading = false;
        this.router.navigate(['/app/rooms']);
      }
    });
  }
}
