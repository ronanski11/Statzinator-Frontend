import { GameStatus } from "../game-status.enum";
import { Stats } from "../stats.model";

export interface GameDto {
    teamIds: number[];
    time: string;
    status: GameStatus;
    stats?: Stats;
  }