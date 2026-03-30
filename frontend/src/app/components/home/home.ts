import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Get the current user observable from AuthService
  user$ = this.authService.user$;

  /**
   * Logs out the user and redirects to the login page
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}