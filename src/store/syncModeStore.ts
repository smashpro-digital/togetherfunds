import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";

export type SyncMode = "local" | "server";

const STORAGE_KEY = "togetherfunds:sync-mode:v1";

let mode: SyncMode = "local";
let hydrated = false;
let hydratePromise: Promise<void> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  return { mode, hydrated };
}

export function hydrateSyncMode() {
  if (hydratePromise) return hydratePromise;

  hydratePromise = AsyncStorage.getItem(STORAGE_KEY)
    .then((value) => {
      if (value === "server" || value === "local") {
        mode = value;
      }
    })
    .finally(() => {
      hydrated = true;
      emit();
    });

  return hydratePromise;
}

export function setSyncMode(nextMode: SyncMode) {
  mode = nextMode;
  hydrated = true;
  emit();
  AsyncStorage.setItem(STORAGE_KEY, nextMode).catch(() => undefined);
}

export function useSyncMode() {
  useEffect(() => {
    hydrateSyncMode();
  }, []);

  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
