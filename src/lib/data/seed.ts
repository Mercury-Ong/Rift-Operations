import { TeamDataset } from "@/lib/models";
import { leagueChampions } from "@/lib/data/leagueChampions";

export const seedData: TeamDataset = {
  players: [],
  champions: leagueChampions,
  championPool: [],
  synergies: [],
  scrims: [],
};
