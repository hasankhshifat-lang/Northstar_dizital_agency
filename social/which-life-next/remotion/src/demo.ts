import { EpisodeProps } from "./Episode";

/** A short demo used as Studio default props. Real episodes pass their own JSON via --props. */
export const demoEpisode: EpisodeProps = {
  captions: [
    { start: 0.2, end: 3, text: "It's January twelfth, 1888." },
    { start: 3, end: 6, text: "The warmest morning in weeks." },
    { start: 6, end: 10, text: "By tonight, it will be twenty-seven below zero." },
  ],
  shots: [
    { kind: "landscape", durationInFrames: 120, time: "dawn", snow: 0.25, elements: [{ type: "sodhouse", x: 1350, scale: 1 }, { type: "barn", x: 520, scale: 0.7, y: 760 }],
      kit: { x: 900, walkTo: 1150, pose: "side", walking: true, scale: 0.9 }, camera: { zoom: [1, 1.08], pan: [0, -40] } },
    { kind: "card", durationInFrames: 75, card: { title: ["50°F  →  −27°F"], subtitle: "IN ONE DAY", background: { time: "storm", snow: 0.6 } } },
    { kind: "landscape", durationInFrames: 120, time: "storm", snow: 0.8, weather: 0.9, wind: 2,
      elements: [{ type: "sodhouse", x: 520, scale: 1 }, { type: "barn", x: 1500, scale: 0.9 }, { type: "rope", x1: 700, y1: 700, x2: 1360, y2: 720 }],
      kit: { x: 820, walkTo: 1200, pose: "side", walking: true, holdingRope: true, outfit: "winter", lean: 8, scale: 0.85, y: 940 }, tint: "cold", camera: { zoom: [1.05, 1.15] } },
  ],
};
