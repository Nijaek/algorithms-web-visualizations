export type PlaybackState = "idle" | "running" | "paused" | "completed";

export type SpeedSetting = {
  label: string;
  msPerStep: number;
};
