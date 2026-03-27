import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { SchoolService } from '../../../core/services/school.service';
import { User, UserRole, UserStatus } from '../../../shared/models/user.model';
import { School } from '../../../shared/models/school.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user?: User;
  userId?: number;
  loading = false;
  errorMessage = '';
  canEdit = false;
  schools: School[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    public authService: AuthService,
    private schoolService: SchoolService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = +params['id'];
        this.loadUser(this.userId);
      }
    });

    this.schoolService.getAllSchools().subscribe({
      next: (schools) => {
        this.schools = schools;
      }
    });

    // Vérifier si l'utilisateur peut modifier (admin ou son propre profil)
    this.checkEditPermissions();
  }

  loadUser(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.user.schoolName = this.resolveSchoolName(user.schoolId);
        this.checkEditPermissions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.errorMessage = error.message || 'Erreur lors du chargement de l\'utilisateur';
        this.loading = false;
      }
    });
  }

  checkEditPermissions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Admin peut modifier tout le monde, utilisateur peut modifier son propre profil
      this.canEdit = this.authService.isAdmin() || 
                     (currentUser.login === this.user?.login);
    }
  }

  private resolveSchoolName(schoolId: number | undefined): string {
    if (!schoolId) {
      return 'Non assignée';
    }
    return this.schools.find(school => school.id === schoolId)?.name || `Ecole #${schoolId}`;
  }

  deleteUser(): void {
    if (!this.user?.id) return;
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'utilisateur ${this.user.prenom} ${this.user.nom} ?`;
    if (confirm(confirmMessage)) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          console.log('Utilisateur supprimé avec succès');
          this.router.navigate(['/app/users']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'utilisateur: ' + error.message);
        }
      });
    }
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

  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'badge badge-primary';
      case UserRole.ENSEIGNANT:
        return 'badge badge-info';
      default:
        return 'badge badge-secondary';
    }
  }

  getStatusClass(status: UserStatus): string {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'badge badge-success';
      case UserStatus.INACTIVE:
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  }

  changePassword(): void {
    // TODO: Implémenter le changement de mot de passe
    alert('Fonctionnalité de changement de mot de passe à implémenter');
  }
}
