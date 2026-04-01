import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../models/game.model';
import { AuthService } from './auth'; // Ensure this path matches your auth.service file

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  // Base URL for the games API
  private apiUrl = 'http://localhost:3000/api/games';

  /**
   * Helper method to attach the JWT token to requests
   * The backend requires this in the Authorization header
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Fetch all games for the logged-in user
   */
  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Add a new game to the database
   */
  addGame(game: Game): Observable<Game> {
    return this.http.post<Game>(this.apiUrl, game, { headers: this.getHeaders() });
  }

  /**
   * Update an existing game (e.g., changing status from Backlog to Completed)
   */
  updateGame(id: string, gameData: Partial<Game>): Observable<Game> {
    return this.http.put<Game>(`${this.apiUrl}/${id}`, gameData, { headers: this.getHeaders() });
  }

  /**
   * Delete a game from the database
   */
  deleteGame(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}