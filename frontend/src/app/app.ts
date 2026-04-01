import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from './services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.html'
})
export class AppComponent {
  authService = inject(AuthService);
  router = inject(Router);

  // Observable to track user login status reactively
  user$ = this.authService.user$;

  /**
   * Handle global logout from the navigation bar
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}