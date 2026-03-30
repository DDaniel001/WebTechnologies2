import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model'; // Importing the User interface

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base URL for the authentication API based on backend configuration
  private apiUrl = 'http://localhost:3000/api/auth';
  
  // A BehaviorSubject to store and broadcast the current user state to the application
  private userSubject = new BehaviorSubject<User | null>(null);
  
  // Observable for components to subscribe to user changes
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // On service initialization, check if user data exists in browser's local storage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.userSubject.next(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * Register a new user
   * @param userData Object containing username, email, and password
   * @returns Observable of the registered User
   */
  register(userData: any): Observable<User> {
    // Calls the POST /api/auth/register endpoint
    return this.http.post<User>(`${this.apiUrl}/register`, userData).pipe(
      tap(user => this.handleAuthentication(user))
    );
  }

  /**
   * Authenticate an existing user
   * @param credentials Object containing email and password
   * @returns Observable of the authenticated User with JWT token
   */
  login(credentials: any): Observable<User> {
    // Calls the POST /api/auth/login endpoint
    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => this.handleAuthentication(user))
    );
  }

  /**
   * Remove user data from storage and reset the user state
   */
  logout(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  /**
   * Helper method to save user data and token upon successful auth
   * @param user The user object returned from the backend
   */
  private handleAuthentication(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /**
   * Check if a user is currently logged in
   * @returns boolean
   */
  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  /**
   * Retrieve the JWT token for authenticated requests
   * @returns string | null
   */
  getToken(): string | null {
    return this.userSubject.value?.token || null;
  }
}