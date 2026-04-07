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
  private cdr = inject(ChangeDetectorRef);

  user$ = this.authService.user$;
  games: Game[] = [];
  
  // Edit logic states
  isEditMode = false;
  editingGameId: string | null = null;

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

  loadGames(): void {
    this.gameService.getGames().subscribe({
      next: (data) => {
        this.games = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error loading games', err)
    });
  }

  /**
   * Switches to Edit Mode and fills the form with the game's data
   */
  editGame(game: Game): void {
    this.isEditMode = true;
    this.editingGameId = game._id!;
    this.gameForm.patchValue({
      title: game.title,
      platform: game.platform,
      genre: game.genre,
      rating: game.rating,
      status: game.status
    });
    // Scroll smoothly to the form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Resets the form and returns to Add Mode
   */
  cancelEdit(): void {
    this.isEditMode = false;
    this.editingGameId = null;
    this.gameForm.reset({ rating: 5, status: 'Backlog' });
    this.cdr.detectChanges();
  }

  /**
   * Handles both Add and Update logic based on isEditMode
   */
  onSubmitGame(): void {
    if (this.gameForm.valid) {
      if (this.isEditMode && this.editingGameId) {
        // --- UPDATE LOGIC ---
        this.gameService.updateGame(this.editingGameId, this.gameForm.value).subscribe({
          next: (updatedGame) => {
            // Update the game in the local array
            this.games = this.games.map(g => g._id === this.editingGameId ? updatedGame : g);
            this.cancelEdit();
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error updating game', err)
        });
      } else {
        // --- ADD LOGIC ---
        this.gameService.addGame(this.gameForm.value).subscribe({
          next: (newGame) => {
            this.games = [...this.games, newGame]; 
            this.gameForm.reset({ rating: 5, status: 'Backlog' });
            this.cdr.detectChanges(); 
          },
          error: (err) => console.error('Error adding game', err)
        });
      }
    }
  }

  deleteGame(id: string | undefined): void {
    if (!id) return;
    this.gameService.deleteGame(id).subscribe({
      next: () => {
        this.games = this.games.filter(g => g._id !== id);
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