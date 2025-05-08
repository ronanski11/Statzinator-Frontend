import { Player } from "./player.model";

export interface Team {
  id: number;
  name: string;
  coach: string;
  players?: Player[];
}