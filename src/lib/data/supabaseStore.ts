import { TeamDataset } from "@/lib/models";
import { getSupabaseClient } from "@/lib/supabase/client";

const SHARED_DATASET_ID = "main";

interface TeamDatasetRow {
  id: string;
  payload: TeamDataset;
  updated_at?: string;
}

export async function fetchSharedDataset(): Promise<TeamDataset | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("team_datasets")
    .select("id,payload,updated_at")
    .eq("id", SHARED_DATASET_ID)
    .maybeSingle<TeamDatasetRow>();

  if (error || !data?.payload) {
    return null;
  }

  return data.payload;
}

export async function saveSharedDataset(dataset: TeamDataset): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.from("team_datasets").upsert({
    id: SHARED_DATASET_ID,
    payload: dataset,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export function subscribeToSharedDataset(
  onChange: (dataset: TeamDataset) => void,
): (() => void) | null {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const channel = supabase
    .channel("team-dataset-sync")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "team_datasets",
        filter: `id=eq.${SHARED_DATASET_ID}`,
      },
      (payload) => {
        const nextPayload = payload.new as Partial<TeamDatasetRow>;
        if (nextPayload?.payload) {
          onChange(nextPayload.payload);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
