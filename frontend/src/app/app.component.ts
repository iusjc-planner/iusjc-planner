import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'IUSJ Planner';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Vérifier l'authentification au démarrage
    if (!this.authService.isAuthenticated()) {
      // Forcer la redirection vers login si pas authentifié
      this.router.navigate(['/login']);
    }
  }
}
