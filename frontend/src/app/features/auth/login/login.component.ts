import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../shared/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  credentials: LoginRequest = {
    login: '',
    password: ''
  };
  
  showPassword = false;
  rememberMe = false;
  loading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Récupérer l'URL de retour depuis les paramètres de requête
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.authService.getRedirectUrlByRole();
    
    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      const redirectUrl = this.authService.getRedirectUrlByRole();
      this.router.navigate([redirectUrl]);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
  }

  onSubmit(): void {
    if (!this.credentials.login || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        
        // Rediriger selon le rôle de l'utilisateur
        const redirectUrl = this.route.snapshot.queryParams['returnUrl'] || this.authService.getRedirectUrlByRole();
        this.router.navigate([redirectUrl]);
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.errorMessage = error.message || 'Erreur de connexion';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

}
