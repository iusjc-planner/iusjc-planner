import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.usersUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getUserByLogin(login: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/login/${login}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createUser(user: User): Observable<User> {
    // Validation côté client avant envoi
    if (!user.nom || !user.prenom || !user.email || !user.login || !user.password) {
      return throwError(() => new Error('Tous les champs obligatoires doivent être remplis'));
    }
    
    if (user.password && user.password.length < 6) {
      return throwError(() => new Error('Le mot de passe doit contenir au moins 6 caractères'));
    }
    
    return this.http.post<User>(this.apiUrl, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email?email=${email}`)
      .pipe(
        catchError(() => {
          // Si l'endpoint n'existe pas, on retourne false
          return [false];
        })
      );
  }

  checkLoginExists(login: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-login?login=${login}`)
      .pipe(
        catchError(() => {
          // Si l'endpoint n'existe pas, on retourne false
          return [false];
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides';
          break;
        case 401:
          errorMessage = 'Non autorisé';
          break;
        case 403:
          errorMessage = 'Accès interdit';
          break;
        case 404:
          errorMessage = 'Utilisateur non trouvé';
          break;
        case 409:
          errorMessage = 'Conflit - L\'utilisateur existe déjà';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Erreur UserService:', error);
    return throwError(() => new Error(errorMessage));
  }
}