import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Group } from '../../../shared/models/group.model';
import { GroupService } from '../services/group.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.css']
})
export class GroupFormComponent implements OnInit {
  group: Group = { name: '', schoolId: 0, level: '', size: undefined, status: 'ACTIVE' };
  loading = false;
  isEdit = false;
  id?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: GroupService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = +idParam;
      this.load(this.id);
    }
  }

  load(id: number): void {
    this.loading = true;
    this.service.get(id).subscribe({
      next: g => {
        this.group = g;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.notification.error('Impossible de charger le groupe');
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (!this.group.name || !this.group.schoolId) {
      this.notification.error('Nom et École sont obligatoires');
      return;
    }
    this.loading = true;
    const request = this.isEdit && this.id
      ? this.service.update(this.id, this.group)
      : this.service.create(this.group);
    request.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Groupe mis à jour' : 'Groupe créé');
        this.router.navigate(['/app/groups']);
      },
      error: err => {
        console.error(err);
        this.notification.error('Erreur lors de la sauvegarde');
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/app/groups']);
  }
}
