import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { GameService } from './game.service';
import { environment } from '../environments/environment';
import { Game, GameStatus } from '../models';

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameService],
    });
    service = TestBed.inject(GameService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getList', () => {
    it('should retrieve all games from the API', () => {
      const mockGames: Game[] = [
        {
          id: 1,
          teams: [
            { id: 101, name: 'Lakers', coach: 'John Smith' },
            { id: 102, name: 'Celtics', coach: 'Jane Doe' },
          ],
          time: '2025-05-10T19:30:00',
          status: GameStatus.PENDING,
        },
        {
          id: 2,
          teams: [
            { id: 103, name: 'Bulls', coach: 'Mike Johnson' },
            { id: 104, name: 'Heat', coach: 'Dave Wilson' },
          ],
          time: '2025-05-12T20:00:00',
          status: GameStatus.OVER,
          stats: {
            id: 201,
            stats: {
              t1Pts: '105',
              t2Pts: '98',
            },
          },
        },
      ];

      service.getList().subscribe((games) => {
        expect(games).toEqual(mockGames);
        expect(games.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.backendBaseUrl}game`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGames);
    });

    it('should handle empty response', () => {
      service.getList().subscribe((games) => {
        expect(games).toEqual([]);
        expect(games.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.backendBaseUrl}game`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle error response', () => {
      service.getList().subscribe({
        next: () => fail('should have failed with a 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${environment.backendBaseUrl}game`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getOne', () => {
    it('should retrieve a single game by ID', () => {
      const mockGame: Game = {
        id: 1,
        teams: [
          { id: 101, name: 'Lakers', coach: 'John Smith' },
          { id: 102, name: 'Celtics', coach: 'Jane Doe' },
        ],
        time: '2025-05-10T19:30:00',
        status: GameStatus.PENDING,
      };

      service.getOne(1).subscribe((game) => {
        expect(game).toEqual(mockGame);
        expect(game.id).toBe(1);
        expect(game.teams.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.backendBaseUrl}game/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGame);
    });

    it('should handle error when game not found', () => {
      service.getOne(999).subscribe({
        next: () => fail('should have failed with a 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${environment.backendBaseUrl}game/999`);
      req.flush('Game not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
