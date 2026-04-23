import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px; min-width: 380px;">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Mot de passe oublié</div>
                            <span class="text-muted-color font-medium">Entrez votre email pour recevoir un lien de réinitialisation</span>
                        </div>

                        <div *ngIf="!sent">
                            <label class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText type="email" [(ngModel)]="email" placeholder="votre@email.com" class="w-full mb-6" />

                            <small *ngIf="errorMessage" class="text-red-500 block mb-4">{{ errorMessage }}</small>

                            <p-button label="Envoyer le lien" styleClass="w-full mb-4" [loading]="loading" (onClick)="submit()"></p-button>
                            <div class="text-center">
                                <a routerLink="/auth/login" class="text-primary cursor-pointer font-medium">Retour à la connexion</a>
                            </div>
                        </div>

                        <div *ngIf="sent" class="text-center">
                            <i class="pi pi-check-circle text-green-500 text-5xl mb-4 block"></i>
                            <p class="text-surface-700 dark:text-surface-200 mb-6">
                                Un email de réinitialisation a été envoyé à <strong>{{ email }}</strong>.<br/>
                                Vérifiez votre boîte de réception (et les spams).
                            </p>
                            <a routerLink="/auth/login" class="text-primary cursor-pointer font-medium">Retour à la connexion</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ForgotPasswordPage {
    email = '';
    loading = false;
    sent = false;
    errorMessage = '';

    private readonly http = inject(HttpClient);
    private readonly destroyRef = inject(DestroyRef);

    submit(): void {
        if (!this.email.trim()) {
            this.errorMessage = 'Veuillez saisir votre adresse email.';
            return;
        }
        this.errorMessage = '';
        this.loading = true;

        this.http.post('/auth/forgot-password', { email: this.email })
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                catchError(() => {
                    this.errorMessage = 'Aucun compte associé à cet email.';
                    this.loading = false;
                    return of(null);
                })
            )
            .subscribe((res) => {
                this.loading = false;
                if (res !== null) {
                    this.sent = true;
                }
            });
    }
}
