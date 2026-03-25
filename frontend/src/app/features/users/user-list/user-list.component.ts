import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { SchoolService } from '../../../core/services/school.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { User, UserRole, UserStatus } from '../../../shared/models/user.model';
import { School } from '../../../shared/models/school.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  schools: School[] = [];
  searchTerm: string = '';
  filterRole: string = '';
  filterStatus: string = '';
  filterSchoolId: string = '';
  loading = false;
  errorMessage = '';
  itemsPerPage = 10;

  constructor(
    private userService: UserService,
    private schoolService: SchoolService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      users: this.userService.getAllUsers(),
      schools: this.schoolService.getAllSchools().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ users, schools }) => {
        this.schools = schools;
        this.users = users.map(user => ({
          ...user,
          schoolName: this.resolveSchoolName(user.schoolId, schools)
        }));
        this.filteredUsers = [...this.users];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur lors du chargement des utilisateurs';
        this.notificationService.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
        user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.login.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.filterRole || user.role === this.filterRole;
      const matchesStatus = !this.filterStatus || user.status === this.filterStatus;
      const matchesSchool = !this.filterSchoolId || user.schoolId?.toString() === this.filterSchoolId;

      return matchesSearch && matchesRole && matchesStatus && matchesSchool;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterStatus = '';
    this.filterSchoolId = '';
    this.filteredUsers = [...this.users];
  }

  deleteUser(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== id);
        this.filterUsers();
        this.notificationService.success('Utilisateur supprimé avec succès');
      },
      error: (error) => {
        this.notificationService.error('Erreur lors de la suppression: ' + error.message);
      }
    });
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrateur';
      case UserRole.ENSEIGNANT:
        return 'Enseignant';
      default:
        return role;
    }
  }

  getStatusDisplayName(status: UserStatus): string {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'Actif';
      case UserStatus.INACTIVE:
        return 'Inactif';
      default:
        return status;
    }
  }

  private resolveSchoolName(schoolId: number | undefined, schools: School[]): string {
    if (!schoolId) {
      return '-';
    }

    const school = schools.find(item => item.id === schoolId);
    return school?.name || '-';
  }
}
