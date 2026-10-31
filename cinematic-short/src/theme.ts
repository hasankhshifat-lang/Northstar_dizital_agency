import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Space Grotesk (brand font), bundled locally in public/ so renders work offline.
export const fontFamily = "Space Grotesk";
for (const weight of ["300", "500", "700"]) {
  loadFont({ family: fontFamily, url: staticFile(`SpaceGrotesk-${weight}.woff2`), weight });
}

export const C = {
  bg: "#050408",
  purple: "#9566FF",
  purpleLight: "#B49AFF",
  magenta: "#EC5AAE",
  orange: "#FF9A62",
  text: "#F7F5FA",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
