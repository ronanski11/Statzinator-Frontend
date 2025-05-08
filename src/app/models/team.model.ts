import { Player } from "./player";

export interface Team {
    id: number;
    name: string;
    coach: string;
    players?: Player[];
  }