// Channel palette: muted ochre / slate blue / deep brown, matching the painted look of the
// first episodes. Every set and Kit use these so episodes stay visually consistent.
export const palette = {
  ink: "#1d1914",
  paper: "#f5ecd6",
  gold: "#d6aa60",
  ochre: "#b8873f",
  grassDry: "#a88a4f",
  grassGreen: "#8a9a5b",
  soil: "#5b4330",
  sod: "#6e5a3f",
  sodDark: "#4f3f2c",
  wood: "#7a5a3a",
  woodDark: "#4a3524",
  canvas: "#e8dcc0",
  snow: "#eef2f6",
  snowShade: "#c9d3de",
  lamp: "#ffcf7a",
};

export type TimeOfDay = "dawn" | "day" | "dusk" | "night" | "storm";

export const skies: Record<TimeOfDay, [string, string, string]> = {
  dawn: ["#6f7fa0", "#d8a978", "#f2d7a8"],
  day: ["#7fa3c4", "#b9cfe0", "#e9e2cf"],
  dusk: ["#3d4a6b", "#9a6e6a", "#e0a86e"],
  night: ["#0f1626", "#1f2b45", "#33405e"],
  storm: ["#2b313b", "#4a525e", "#6d7480"],
};

export const fonts = {
  serif: "DejaVu Serif, Georgia, serif",
  sans: "Inter, DejaVu Sans, Arial, sans-serif",
};
