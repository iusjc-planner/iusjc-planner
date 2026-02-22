import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Group } from '../../../shared/models/group.model';
import { GroupService } from '../services/group.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  groups: Group[] = [];
  filtered: Group[] = [];
  search = '';
  levelFilter = '';
  statusFilter = '';
  loading = false;
  errorMessage = '';

  constructor(
    private groupService: GroupService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.groupService.list().subscribe({
      next: data => {
        this.groups = data;
        this.filtered = [...data];
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Erreur lors du chargement des groupes';
        this.notification.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const searchLower = this.search.toLowerCase();
    this.filtered = this.groups.filter(g => {
      const matchesSearch = !this.search || (g.name?.toLowerCase().includes(searchLower) ?? false);
      const matchesLevel = !this.levelFilter || g.level === this.levelFilter;
      const matchesStatus = !this.statusFilter || g.status === this.statusFilter;
      return matchesSearch && matchesLevel && matchesStatus;
    });
  }

  reset(): void {
    this.search = '';
    this.levelFilter = '';
    this.statusFilter = '';
    this.filtered = [...this.groups];
  }

  delete(id: number): void {
    if (!confirm('Supprimer ce groupe ?')) return;
    this.groupService.delete(id).subscribe({
      next: () => {
        this.groups = this.groups.filter(g => g.id !== id);
        this.applyFilters();
        this.notification.success('Groupe supprimé');
      },
      error: err => {
        console.error(err);
        this.notification.error('Erreur lors de la suppression');
      }
    });
  }
}
