import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FPS = 30;

export const C = {
  skyDay: "#9ec7d9",
  skyDawn: "#f2b880",
  skyDusk: "#c96f4a",
  skyNight: "#1f2a44",
  sun: "#ffd67a",
  prairie: "#c9a35b",
  prairieDark: "#9c7a3c",
  dirt: "#7a5a36",
  river: "#6b5a3e",
  riverLight: "#8a7550",
  canvas: "#efe6d2",
  canvasShade: "#d8cbb0",
  wood: "#6e4526",
  woodDark: "#4a2d17",
  iron: "#3b3b3b",
  ox: "#8a5a3a",
  oxDark: "#5e3b24",
  skin: "#e2b08c",
  skinShade: "#c48e6a",
  shirt: "#7c8f9e",
  rock: "#a08f7a",
  rockShade: "#7d6d5b",
  snow: "#f4f6f8",
  mountain: "#6c7a8c",
  ink: "#1b1612",
  cream: "#fbf4e4",
  red: "#c23b2a",
  tin: "#9aa3a8",
  tinDark: "#6f777c",
};

export const fontsReady = Promise.all([
  loadFont({ family: "Oswald", url: staticFile("fonts/oswald-latin-700-normal.woff2"), weight: "700" }),
  loadFont({ family: "Oswald", url: staticFile("fonts/oswald-latin-500-normal.woff2"), weight: "500" }),
  loadFont({ family: "Bitter", url: staticFile("fonts/bitter-latin-600-normal.woff2"), weight: "600" }),
]);

export const s = (seconds: number) => Math.round(seconds * FPS);
