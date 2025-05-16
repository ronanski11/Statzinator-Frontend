import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { GameListComponent } from './game-list.component';
import { GameService } from '../../service/game.service';
import { of, throwError } from 'rxjs';
import { Game, GameStatus } from '../../models';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

describe('GameListComponent', () => {
  let component: GameListComponent;
  let fixture: ComponentFixture<GameListComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;

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
    {
      id: 3,
      teams: [
        { id: 105, name: 'Warriors', coach: 'Steve Kerr' },
        { id: 106, name: 'Nets', coach: 'Jackie Moon' },
      ],
      time: '2025-05-15T19:00:00',
      status: GameStatus.CANCELLED,
    },
  ];

  beforeEach(async () => {
    const gameSpy = jasmine.createSpyObj('GameService', ['getList']);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatButtonModule,
        RouterModule.forRoot([]),
        GameListComponent,
      ],
      providers: [{ provide: GameService, useValue: gameSpy }],
    }).compileComponents();

    gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
  });

  beforeEach(() => {
    gameServiceSpy.getList.and.returnValue(of(mockGames));
    fixture = TestBed.createComponent(GameListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load games on init', () => {
    expect(gameServiceSpy.getList).toHaveBeenCalled();
    expect(component.games.length).toBe(3);
    expect(component.filteredGames.length).toBe(3);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading games', fakeAsync(() => {
    gameServiceSpy.getList.and.returnValue(
      throwError(() => new Error('Failed to load'))
    );
    component.games = [];
    component.filteredGames = [];

    component.fetchGames();
    tick();
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.error).toBeTruthy();
    expect(component.games.length).toBe(0);
  }));

  describe('filtering', () => {
    it('should filter games by PENDING status', () => {
      component.filterByStatus(GameStatus.PENDING);
      expect(component.activeFilter).toBe(GameStatus.PENDING);
      expect(component.filteredGames.length).toBe(1);
      expect(component.filteredGames[0].id).toBe(1);
    });

    it('should filter games by OVER status', () => {
      component.filterByStatus(GameStatus.OVER);
      expect(component.activeFilter).toBe(GameStatus.OVER);
      expect(component.filteredGames.length).toBe(1);
      expect(component.filteredGames[0].id).toBe(2);
    });

    it('should filter games by CANCELLED status', () => {
      component.filterByStatus(GameStatus.CANCELLED);
      expect(component.activeFilter).toBe(GameStatus.CANCELLED);
      expect(component.filteredGames.length).toBe(1);
      expect(component.filteredGames[0].id).toBe(3);
    });

    it('should show all games when ALL filter is selected', () => {
      component.filterByStatus(GameStatus.PENDING);
      expect(component.filteredGames.length).toBe(1);

      component.filterByStatus('ALL');
      expect(component.activeFilter).toBe('ALL');
      expect(component.filteredGames.length).toBe(3);
    });
  });

  describe('sorting', () => {
    it('should sort games by ID in ascending order', () => {
      const sort: Sort = { active: 'id', direction: 'asc' };
      component.sortData(sort);
      expect(component.filteredGames[0].id).toBe(1);
      expect(component.filteredGames[1].id).toBe(2);
      expect(component.filteredGames[2].id).toBe(3);
    });

    it('should sort games by ID in descending order', () => {
      const sort: Sort = { active: 'id', direction: 'desc' };
      component.sortData(sort);
      expect(component.filteredGames[0].id).toBe(3);
      expect(component.filteredGames[1].id).toBe(2);
      expect(component.filteredGames[2].id).toBe(1);
    });

    it('should sort games by time in ascending order', () => {
      const sort: Sort = { active: 'time', direction: 'asc' };
      component.sortData(sort);
      expect(component.filteredGames[0].id).toBe(1); // '2025-05-10T19:30:00'
      expect(component.filteredGames[1].id).toBe(2); // '2025-05-12T20:00:00'
      expect(component.filteredGames[2].id).toBe(3); // '2025-05-15T19:00:00'
    });

    it('should sort games by time in descending order', () => {
      const sort: Sort = { active: 'time', direction: 'desc' };
      component.sortData(sort);
      expect(component.filteredGames[0].id).toBe(3); // '2025-05-15T19:00:00'
      expect(component.filteredGames[1].id).toBe(2); // '2025-05-12T20:00:00'
      expect(component.filteredGames[2].id).toBe(1); // '2025-05-10T19:30:00'
    });

    it('should sort games by status in ascending order', () => {
      const sort: Sort = { active: 'status', direction: 'asc' };
      component.sortData(sort);
      expect(component.filteredGames[0].status).toBe(GameStatus.CANCELLED);
      expect(component.filteredGames[1].status).toBe(GameStatus.OVER);
      expect(component.filteredGames[2].status).toBe(GameStatus.PENDING);
    });

    it('should not sort when direction is empty', () => {
      const sort1: Sort = { active: 'id', direction: 'desc' };
      component.sortData(sort1);

      const originalOrder = [...component.filteredGames];
      const sort2: Sort = { active: 'id', direction: '' };
      component.sortData(sort2);

      expect(component.filteredGames).toEqual(originalOrder);
    });
  });

  describe('pagination', () => {
    it('should update paginated games based on page size and index', () => {
      component.pageSize = 2;
      component.pageIndex = 0;
      component.updatePaginatedGames();

      expect(component.paginatedGames.length).toBe(2);
      expect(component.paginatedGames[0].id).toBe(1);
      expect(component.paginatedGames[1].id).toBe(2);

      component.pageIndex = 1;
      component.updatePaginatedGames();

      expect(component.paginatedGames.length).toBe(1);
      expect(component.paginatedGames[0].id).toBe(3);
    });

    it('should handle page change events', () => {
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 2,
        length: 3,
      };

      component.onPageChange(pageEvent);

      expect(component.pageIndex).toBe(1);
      expect(component.pageSize).toBe(2);
      expect(component.paginatedGames.length).toBe(1);
      expect(component.paginatedGames[0].id).toBe(3);
    });
  });

  describe('helper methods', () => {
    it('should format date correctly', () => {
      const dateString = '2025-05-10T19:30:00';
      const formatted = component.formatDate(dateString);

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should return correct status color for PENDING', () => {
      const color = component.getStatusColor(GameStatus.PENDING);
      expect(color).toBe('accent');
    });

    it('should return correct status color for OVER', () => {
      const color = component.getStatusColor(GameStatus.OVER);
      expect(color).toBe('primary');
    });

    it('should return correct status color for CANCELLED', () => {
      const color = component.getStatusColor(GameStatus.CANCELLED);
      expect(color).toBe('warn');
    });

    it('should return correct status icon for PENDING', () => {
      const icon = component.getStatusIcon(GameStatus.PENDING);
      expect(icon).toBe('schedule');
    });

    it('should return correct status icon for OVER', () => {
      const icon = component.getStatusIcon(GameStatus.OVER);
      expect(icon).toBe('check_circle');
    });

    it('should return correct status icon for CANCELLED', () => {
      const icon = component.getStatusIcon(GameStatus.CANCELLED);
      expect(icon).toBe('cancel');
    });

    it('should refresh games list', () => {
      spyOn(component, 'fetchGames');
      component.refreshGames();
      expect(component.fetchGames).toHaveBeenCalled();
    });
  });

  describe('compare function', () => {
    it('should compare numbers correctly in ascending order', () => {
      expect(component.compare(1, 2, true)).toBe(-1);
      expect(component.compare(2, 1, true)).toBe(1);
      expect(component.compare(1, 1, true)).toBe(1);
    });

    it('should compare numbers correctly in descending order', () => {
      expect(component.compare(1, 2, false)).toBe(1);
      expect(component.compare(2, 1, false)).toBe(-1);
      expect(component.compare(1, 1, false)).toBe(-1);
    });

    it('should compare strings correctly in ascending order', () => {
      expect(component.compare('a', 'b', true)).toBe(-1);
      expect(component.compare('b', 'a', true)).toBe(1);
      expect(component.compare('a', 'a', true)).toBe(1);
    });

    it('should compare strings correctly in descending order', () => {
      expect(component.compare('a', 'b', false)).toBe(1);
      expect(component.compare('b', 'a', false)).toBe(-1);
      expect(component.compare('a', 'a', false)).toBe(-1);
    });
  });
});
