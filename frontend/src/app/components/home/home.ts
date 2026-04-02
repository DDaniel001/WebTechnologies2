import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../services/auth';
import { GameService } from '../../services/game';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  private gameService = inject(GameService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  // Inject ChangeDetectorRef to manually trigger UI updates
  private cdr = inject(ChangeDetectorRef);

  user$ = this.authService.user$;
  games: Game[] = [];
  
  gameForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    platform: ['', Validators.required],
    genre: ['', Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    status: ['Backlog', Validators.required]
  });

  ngOnInit(): void {
  this.authService.user$.subscribe(user => {
    if (user) {
      this.loadGames();
    }
  });
}

  /**
   * Fetches the user's games and updates the view
   */
  loadGames(): void {
    this.gameService.getGames().subscribe({
      next: (data) => {
        this.games = data;
        // Tell Angular to update the HTML right now
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error loading games', err)
    });
  }

  /**
   * Submits the new game form and updates the list instantly
   */
  onSubmitGame(): void {
    if (this.gameForm.valid) {
      this.gameService.addGame(this.gameForm.value).subscribe({
        next: (newGame) => {
          // Use spread operator to create a new array reference instead of .push()
          this.games = [...this.games, newGame]; 
          this.gameForm.reset({ rating: 5, status: 'Backlog' });
          
          // Force UI refresh after adding the game
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Error adding game', err)
      });
    }
  }

  /**
   * Deletes a game and updates the list instantly
   */
  deleteGame(id: string | undefined): void {
    if (!id) return;
    this.gameService.deleteGame(id).subscribe({
      next: () => {
        // Filter out the deleted game
        this.games = this.games.filter(g => g._id !== id);
        
        // Force UI refresh after deletion
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error deleting game', err)
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}