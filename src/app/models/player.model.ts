import { Team } from "./team.model";

export interface Player {
    id: number;
    fullName: string;
    age: number;
    height: number;
    weight: number;
    dateOfBirth: string;
    team?: Team;
  }