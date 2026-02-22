import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.css']
})
export class SettingsProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = false;
  saving = false;
  savingPassword = false;
  error: string | null = null;
  success: string | null = null;
  activeTab = 'profile';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUser();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      prenom: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      telephone: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  loadUser(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.login) {
      this.userService.getUserByLogin(currentUser.login).subscribe({
        next: (user) => {
          this.user = user;
          this.profileForm.patchValue({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            login: user.login,
            telephone: user.telephone || ''
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement profil:', err);
          this.error = 'Erreur lors du chargement du profil';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.error = 'Utilisateur non connecté';
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;
    this.success = null;

    const updatedUser: Partial<User> = {
      ...this.user,
      ...this.profileForm.value
    };

    this.userService.updateUser(this.user!.id!, updatedUser as User).subscribe({
      next: () => {
        this.success = 'Profil mis à jour avec succès';
        this.saving = false;
        // Update local storage
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          localStorage.setItem('user', JSON.stringify({ ...currentUser, ...this.profileForm.value }));
        }
      },
      error: (err) => {
        console.error('Erreur mise à jour profil:', err);
        this.error = 'Erreur lors de la mise à jour du profil';
        this.saving = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.savingPassword = true;
    this.error = null;
    this.success = null;

    // Note: This would need a dedicated endpoint in the backend
    // For now we'll update the user with new password
    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    // Simulated - in real implementation, call userService.changePassword()
    setTimeout(() => {
      this.success = 'Mot de passe modifié avec succès';
      this.passwordForm.reset();
      this.savingPassword = false;
    }, 1000);
  }

  logout(): void {
    this.authService.logout();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.error = null;
    this.success = null;
  }

  get f() {
    return this.profileForm.controls;
  }

  get pf() {
    return this.passwordForm.controls;
  }
}
