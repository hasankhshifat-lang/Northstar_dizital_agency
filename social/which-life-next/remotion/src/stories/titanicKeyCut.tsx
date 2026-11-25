import React from "react";
import { AbsoluteFill } from "remotion";
import { Key } from "../sets/titanicKeyScenes";

/** The brass crow's-nest key from the Titanic-key Short on a transparent background (thumbnail cutout). */
export const TitanicKeyCut: React.FC = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 900 500" width="100%" height="100%"><Key x={150} y={200} s={2.0} rot={0} /></svg>
  </AbsoluteFill>
);
