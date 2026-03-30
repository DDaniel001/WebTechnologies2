export interface Game {
  _id?: string;
  title: string;
  platform: 'PC' | 'PS5' | 'Xbox' | 'Switch' | 'PS4';
  genre: string;
  rating: number;
  status: 'Playing' | 'Completed' | 'Backlog';
  user?: string;
  createdAt?: Date;
}