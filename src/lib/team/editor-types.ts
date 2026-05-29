import { PlayerRole } from "@/lib/models";

export type PoolEditorEntry = {
  key: string;
  championId: string;
  comfort: number;
};

export type PlayerEditor = {
  id: string;
  isNew: boolean;
  summonerName: string;
  role: PlayerRole;
  pool: PoolEditorEntry[];
};

export type ChampionOption = {
  id: string;
  name: string;
};

export const roleOptions: PlayerRole[] = [
  "TOP",
  "JUNGLE",
  "MID",
  "ADC",
  "SUPPORT",
];
