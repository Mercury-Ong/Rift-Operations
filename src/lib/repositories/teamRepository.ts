import { seedData } from "@/lib/data/seed";
import { TeamDataset } from "@/lib/models";

export interface TeamRepository {
  getDataset(): TeamDataset;
}

class InMemoryTeamRepository implements TeamRepository {
  private readonly dataset: TeamDataset;

  constructor() {
    this.dataset = structuredClone(seedData);
  }

  getDataset(): TeamDataset {
    return structuredClone(this.dataset);
  }
}

export const teamRepository: TeamRepository = new InMemoryTeamRepository();
