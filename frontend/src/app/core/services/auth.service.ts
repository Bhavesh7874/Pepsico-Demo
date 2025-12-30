import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5002/api/auth';
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private logger: LoggerService
  ) {
    this.logger.info('AuthService initialized');
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  register(userData: any): Observable<any> {
    this.logger.info('Attempting registration', { email: userData.email });
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap({
        next: (response: any) => {
          if (response.token) {
            this.logger.info('Registration successful', { email: response.email });
            localStorage.setItem('user', JSON.stringify(response));
            this.userSubject.next(response);
          }
        },
        error: (err) => this.logger.error('Registration failed', err)
      })
    );
  }

  login(userData: any): Observable<any> {
    this.logger.info('Attempting login', { email: userData.email });
    return this.http.post(`${this.apiUrl}/login`, userData).pipe(
      tap({
        next: (response: any) => {
          if (response.token) {
            this.logger.info('Login successful', { email: response.email });
            localStorage.setItem('user', JSON.stringify(response));
            this.userSubject.next(response);
          }
        },
        error: (err) => this.logger.error('Login failed', err)
      })
    );
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put(`http://localhost:5002/api/users/profile`, userData).pipe(
      tap((response: any) => {
        const currentUser = this.currentUserValue;
        const updatedUser = { ...currentUser, ...response };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.userSubject.next(updatedUser);
      })
    );
  }

  logout() {
    this.logger.info('Logging out user', { email: this.currentUserValue?.email });
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  get currentUserValue() {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
}
