"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  defaultUserSettings,
  isUserSettings,
  userSettingsStorageKey,
  type UserSettings,
} from "@/components/config/user-settings";

type UserSettingsContextValue = {
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
  saveSettings: () => void;
  loadError: string;
};

const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);

function applySettings(settings: UserSettings) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.accent = settings.accent;

  if (settings.reduceMotion) {
    root.dataset.motion = "reduced";
  } else {
    delete root.dataset.motion;
  }
}

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultUserSettings);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(userSettingsStorageKey);
      if (!saved) {
        applySettings(defaultUserSettings);
        return;
      }

      const parsed: unknown = JSON.parse(saved);
      if (!isUserSettings(parsed)) {
        setLoadError("As preferências salvas são inválidas. Revise e salve novamente.");
        applySettings(defaultUserSettings);
        return;
      }

      setSettings(parsed);
      applySettings(parsed);
    } catch {
      setLoadError("Não foi possível carregar as preferências salvas neste navegador.");
      applySettings(defaultUserSettings);
    }
  }, []);

  function updateSettings(nextSettings: UserSettings) {
    setSettings(nextSettings);
    applySettings(nextSettings);
  }

  function saveSettings() {
    window.localStorage.setItem(userSettingsStorageKey, JSON.stringify(settings));
  }

  return (
    <UserSettingsContext.Provider value={{ settings, updateSettings, saveSettings, loadError }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);

  if (!context) {
    throw new Error("useUserSettings deve ser usado dentro de UserSettingsProvider.");
  }

  return context;
}
