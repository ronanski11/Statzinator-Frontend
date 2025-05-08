import { GameStatus } from "./game-status.enum";
import { Stats } from "./stats.model";
import { Team } from "./team.model";

export interface Game {
    id: number;
    teams: Team[];
    time: string;
    status: GameStatus;
    stats?: Stats;
  }