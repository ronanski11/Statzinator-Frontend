import { Game } from "./game.model";

export interface Stats {
    id: number;
    stats: Record<string, string>;
    game?: Game;
  }