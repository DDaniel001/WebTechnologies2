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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSelectModule,
    MatSnackBarModule
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
  private snackBar = inject(MatSnackBar);

  user$ = this.authService.user$;
  games: Game[] = [];
  filteredGames: Game[] = []; 
  
  // States
  isEditMode = false;
  editingGameId: string | null = null;
  searchTerm: string = ''; // EZ A SOR HIÁNYZOTT!

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
        this.filteredGames = data; 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error loading games', err)
    });
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.filteredGames = this.games.filter(game => 
      game.title.toLowerCase().includes(this.searchTerm) || 
      game.platform.toLowerCase().includes(this.searchTerm) ||
      game.genre.toLowerCase().includes(this.searchTerm)
    );
  }

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
        this.gameService.updateGame(this.editingGameId, this.gameForm.value).subscribe({
          next: (updatedGame) => {
            this.games = this.games.map(g => g._id === this.editingGameId ? updatedGame : g);
            this.filteredGames = [...this.games];
            this.snackBar.open('Game updated successfully!', 'Close', { duration: 3000 });
            this.cancelEdit();
            this.cdr.detectChanges();
          },
          error: (err) => this.snackBar.open('Error updating game', 'Close', { duration: 3000 })
        });
      } else {
        this.gameService.addGame(this.gameForm.value).subscribe({
          next: (newGame) => {
            this.games = [...this.games, newGame];
            this.filteredGames = [...this.games];
            this.gameForm.reset({ rating: 5, status: 'Backlog' });
            this.snackBar.open('Game added successfully!', 'Close', { duration: 3000 });
            this.cdr.detectChanges(); 
          },
          error: (err) => this.snackBar.open('Error adding game', 'Close', { duration: 3000 })
        });
      }
    }
  }

  deleteGame(id: string | undefined): void {
    if (!id) return;
    this.gameService.deleteGame(id).subscribe({
      next: () => {
        this.games = this.games.filter(g => g._id !== id);
        this.filteredGames = this.filteredGames.filter(g => g._id !== id);
        this.snackBar.open('Game deleted successfully', 'Close', { duration: 3000 });
        this.cdr.detectChanges(); 
      },
      error: (err) => this.snackBar.open('Error deleting game', 'Close', { duration: 3000 })
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}