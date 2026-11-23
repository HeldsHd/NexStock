export type ThemePreference = "system" | "light" | "dark";
export type AccentPreference = "orange" | "blue" | "violet";

export type UserSettings = {
  displayName: string;
  email: string;
  theme: ThemePreference;
  accent: AccentPreference;
  reduceMotion: boolean;
};

export const defaultUserSettings: UserSettings = {
  displayName: "",
  email: "",
  theme: "system",
  accent: "orange",
  reduceMotion: false,
};

export const userSettingsStorageKey = "nexstock-user-settings";

export function isUserSettings(value: unknown): value is UserSettings {
  if (!value || typeof value !== "object") return false;

  const settings = value as Record<string, unknown>;
  return (
    typeof settings.displayName === "string" &&
    typeof settings.email === "string" &&
    ["system", "light", "dark"].includes(String(settings.theme)) &&
    ["orange", "blue", "violet"].includes(String(settings.accent)) &&
    typeof settings.reduceMotion === "boolean"
  );
}
