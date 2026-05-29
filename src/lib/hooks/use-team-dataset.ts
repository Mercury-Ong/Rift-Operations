"use client";

import { seedData } from "@/lib/data/seed";
import {
  clearLocalDataset,
  loadLocalDataset,
  saveLocalDataset,
} from "@/lib/data/localStore";
import {
  fetchSharedDataset,
  saveSharedDataset,
  subscribeToSharedDataset,
} from "@/lib/data/supabaseStore";
import { TeamDataset } from "@/lib/models";
import { hasSupabaseConfig } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function useTeamDataset() {
  const [dataset, setDataset] = useState<TeamDataset>(
    structuredClone(seedData),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const local = loadLocalDataset();
      if (active) {
        setDataset(local);
      }

      if (!hasSupabaseConfig()) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const remote = await fetchSharedDataset();
        if (remote && active) {
          setDataset(remote);
          saveLocalDataset(remote);
          setLastSyncedAt(new Date().toISOString());
        }
      } catch (error) {
        if (active) {
          setSyncError(error instanceof Error ? error.message : "Sync failed");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    const unsubscribe = subscribeToSharedDataset((remoteDataset) => {
      if (!active) {
        return;
      }

      setDataset(remoteDataset);
      saveLocalDataset(remoteDataset);
      setLastSyncedAt(new Date().toISOString());
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const saveDataset = (nextDataset: TeamDataset) => {
    setDataset(nextDataset);
    saveLocalDataset(nextDataset);
  };

  const saveDatasetShared = async (nextDataset: TeamDataset) => {
    setSyncError(null);
    saveDataset(nextDataset);

    if (!hasSupabaseConfig()) {
      throw new Error("Supabase is not configured");
    }

    await saveSharedDataset(nextDataset);
    setLastSyncedAt(new Date().toISOString());
  };

  const refreshFromShared = async () => {
    if (!hasSupabaseConfig()) {
      return;
    }

    setSyncError(null);
    try {
      const remote = await fetchSharedDataset();
      if (remote) {
        setDataset(remote);
        saveLocalDataset(remote);
        setLastSyncedAt(new Date().toISOString());
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Sync failed");
    }
  };

  const resetDataset = () => {
    clearLocalDataset();
    setDataset(structuredClone(seedData));
  };

  return {
    dataset,
    isLoading,
    syncError,
    lastSyncedAt,
    isSharedSyncEnabled: hasSupabaseConfig(),
    saveDataset,
    saveDatasetShared,
    refreshFromShared,
    resetDataset,
  };
}
