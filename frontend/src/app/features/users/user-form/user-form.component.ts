import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { User, UserRole, UserStatus } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId?: number;
  loading = false;
  errorMessage = '';
  
  userRoles = Object.values(UserRole);
  userStatuses = Object.values(UserStatus);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // Vérifier si on est en mode édition AVANT d'initialiser le formulaire
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
      }
      
      // Initialiser le formulaire après avoir défini le mode
      this.initForm();
      
      // Charger les données utilisateur si en mode édition
      if (this.isEditMode && this.userId) {
        this.loadUser(this.userId);
      }
    });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role: [UserRole.ENSEIGNANT, Validators.required],
      status: [UserStatus.ACTIVE, Validators.required]
    });
  }

  loadUser(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        // Ne pas inclure le mot de passe dans le formulaire
        const { password, ...userWithoutPassword } = user;
        this.userForm.patchValue(userWithoutPassword);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.errorMessage = error.message || 'Erreur lors du chargement de l\'utilisateur';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('Form submitted');
    console.log('Form valid:', this.userForm.valid);
    console.log('Form value:', this.userForm.value);
    console.log('Form errors:', this.getFormValidationErrors());
    
    if (this.userForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const formData: User = { ...this.userForm.value };
      
      if (this.isEditMode && this.userId) {
        // Mise à jour - ne pas envoyer le mot de passe s'il est vide
        if (!formData.password) {
          delete formData.password;
        }
        
        console.log('Updating user with data:', formData);
        this.userService.updateUser(this.userId, formData).subscribe({
          next: (updatedUser) => {
            console.log('Utilisateur mis à jour:', updatedUser);
            this.showSuccessMessage('Utilisateur mis à jour avec succès !');
            this.router.navigate(['/app/users']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.errorMessage = this.getErrorMessage(error);
            this.notificationService.error(this.errorMessage);
            this.loading = false;
          }
        });
      } else {
        // Création
        console.log('Creating user with data:', formData);
        this.userService.createUser(formData).subscribe({
          next: (newUser) => {
            console.log('Utilisateur créé:', newUser);
            this.showSuccessMessage('Utilisateur créé avec succès !');
            this.router.navigate(['/app/users']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.errorMessage = this.getErrorMessage(error);
            this.notificationService.error(this.errorMessage);
            this.loading = false;
          }
        });
      }
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      this.notificationService.warning(this.errorMessage);
      console.log('Form is invalid, errors:', this.getFormValidationErrors());
    }
  }

  private getFormValidationErrors(): any {
    const formErrors: any = {};
    Object.keys(this.userForm.controls).forEach(key => {
      const controlErrors = this.userForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 409) {
      return 'Un utilisateur avec cet email ou ce login existe déjà';
    } else if (error.status === 400) {
      return 'Données invalides. Vérifiez les champs du formulaire';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return error.message || 'Une erreur est survenue';
    }
  }

  private showSuccessMessage(message: string): void {
    this.notificationService.success(message);
  }

  // Validation en temps réel pour l'email
  onEmailChange(): void {
    const emailControl = this.userForm.get('email');
    if (emailControl?.valid && emailControl.value && !this.isEditMode) {
      this.userService.checkEmailExists(emailControl.value).subscribe({
        next: (exists) => {
          if (exists) {
            emailControl.setErrors({ emailExists: true });
          }
        },
        error: () => {
          // Ignorer les erreurs de vérification
        }
      });
    }
  }

  // Validation en temps réel pour le login
  onLoginChange(): void {
    const loginControl = this.userForm.get('login');
    if (loginControl?.valid && loginControl.value && !this.isEditMode) {
      this.userService.checkLoginExists(loginControl.value).subscribe({
        next: (exists) => {
          if (exists) {
            loginControl.setErrors({ loginExists: true });
          }
        },
        error: () => {
          // Ignorer les erreurs de vérification
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
}
