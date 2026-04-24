import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px; min-width: 380px;">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Nouveau mot de passe</div>
                            <span class="text-muted-color font-medium">Choisissez un nouveau mot de passe sécurisé</span>
                        </div>

                        <div *ngIf="!done && !tokenError">
                            <label class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Nouveau mot de passe</label>
                            <p-password [(ngModel)]="newPassword" placeholder="Nouveau mot de passe" [toggleMask]="true" styleClass="mb-4" [fluid]="true"></p-password>

                            <label class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2 mt-4">Confirmer</label>
                            <p-password [(ngModel)]="confirmPassword" placeholder="Confirmer le mot de passe" [toggleMask]="true" [feedback]="false" styleClass="mb-6" [fluid]="true"></p-password>

                            <small *ngIf="errorMessage" class="text-red-500 block mb-4">{{ errorMessage }}</small>

                            <p-button label="Réinitialiser" styleClass="w-full mb-4" [loading]="loading" (onClick)="submit()"></p-button>
                        </div>

                        <div *ngIf="tokenError" class="text-center">
                            <i class="pi pi-times-circle text-red-500 text-5xl mb-4 block"></i>
                            <p class="text-surface-700 dark:text-surface-200 mb-6">Ce lien est invalide ou a expiré.</p>
                            <a routerLink="/auth/forgot-password" class="text-primary cursor-pointer font-medium">Demander un nouveau lien</a>
                        </div>

                        <div *ngIf="done" class="text-center">
                            <i class="pi pi-check-circle text-green-500 text-5xl mb-4 block"></i>
                            <p class="text-surface-700 dark:text-surface-200 mb-6">Mot de passe réinitialisé avec succès !</p>
                            <a routerLink="/auth/login" class="text-primary cursor-pointer font-medium">Se connecter</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ResetPasswordPage implements OnInit {
    newPassword = '';
    confirmPassword = '';
    loading = false;
    done = false;
    tokenError = false;
    errorMessage = '';
    private token = '';

    private readonly http = inject(HttpClient);
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
        if (!this.token) {
            this.tokenError = true;
        }
    }

    submit(): void {
        if (!this.newPassword || this.newPassword.length < 6) {
            this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.errorMessage = 'Les mots de passe ne correspondent pas.';
            return;
        }
        this.errorMessage = '';
        this.loading = true;

        this.http.post('/auth/reset-password', { token: this.token, newPassword: this.newPassword })
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                catchError(() => {
                    this.errorMessage = 'Token invalide ou expiré.';
                    this.loading = false;
                    return of(null);
                })
            )
            .subscribe((res) => {
                this.loading = false;
                if (res !== null) {
                    this.done = true;
                }
            });
    }
}
