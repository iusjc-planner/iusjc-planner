import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Room, RoomStatus, RoomType } from '../../../shared/models/room.model';

@Component({
  selector: 'app-room-form',
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.css']
})
export class RoomFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  roomId?: number;
  submitting = false;

  RoomType = RoomType;
  RoomStatus = RoomStatus;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      type: [RoomType.CLASSROOM, Validators.required],
      status: [RoomStatus.ACTIVE, Validators.required],
      location: [''],
      description: [''],
      equipments: ['']
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.roomId = +params['id'];
        this.loadRoom(this.roomId);
      }
    });
  }

  loadRoom(id: number): void {
    this.roomService.getById(id).subscribe({
      next: (room) => {
        this.form.patchValue({
          ...room,
          equipments: (room.equipments || []).join(', ')
        });
      },
      error: (err) => {
        console.error('Erreur chargement salle', err);
        this.notification.error('Impossible de charger la salle');
      }
    });
  }

  onSubmit(): void {
    this.submitting = true;
    if (this.form.invalid) {
      this.submitting = false;
      return;
    }

    const value = this.form.value;
    const payload: Room = {
      ...value,
      equipments: value.equipments ? value.equipments.split(',').map((e: string) => e.trim()).filter((e: string) => !!e) : []
    };

    const request = this.isEdit && this.roomId
      ? this.roomService.update(this.roomId, payload)
      : this.roomService.create(payload);

    request.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Salle mise à jour' : 'Salle créée');
        this.router.navigate(['/app/rooms']);
      },
      error: (err) => {
        console.error('Erreur sauvegarde salle', err);
        this.notification.error('Enregistrement impossible');
        this.submitting = false;
      }
    });
  }
}
