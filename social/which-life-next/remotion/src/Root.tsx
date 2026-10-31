import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Composition, Folder, Still } from "remotion";
import { Episode, EpisodeProps, episodeDuration, Short, ShortProps } from "./Episode";
import { Kit } from "./kit/Kit";
import { Prairie, Sky } from "./sets/sets";
import { demoEpisode } from "./demo";
import { Thumb } from "./Thumb";
import { fonts, palette } from "./theme";

const episodeMeta: CalculateMetadataFunction<EpisodeProps> = ({ props }) => ({ durationInFrames: Math.max(1, episodeDuration(props)) });
const shortMeta: CalculateMetadataFunction<ShortProps> = ({ props }) => ({ durationInFrames: props.durationInFrames });

/** Character sheet: the reference for Kit's look (v2, 2026-10-31). Compare every new episode against it. */
const KitSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: palette.ink }}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <Sky time="day" clouds={3} />
      <Prairie tufts={30} />
      {([
        ["front", 230, {}], ["side", 590, {}], ["back", 950, {}], ["front", 1310, { outfit: "winter" }], ["side", 1680, { lantern: true, facing: -1 }],
      ] as const).map(([pose, x, extra], i) => (
        <g key={i} transform={`translate(${x} 520) scale(1.1)`}>
          <Kit pose={pose} {...(extra as object)} />
        </g>
      ))}
      {(["neutral", "happy", "scared", "determined", "sad"] as const).map((e, i) => (
        <g key={e} transform={`translate(${230 + i * 362} 1500) scale(2.2)`}>
          <Kit pose="front" expression={e} />
        </g>
      ))}
    </svg>
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 14, fontFamily: fonts.serif, fontSize: 30, color: palette.paper, fontWeight: 700 }}>
      KIT v2 — front · side · back · winter · lantern  /  neutral · happy · scared · determined · sad
    </AbsoluteFill>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Reference">
      <Still id="KitSheet" component={KitSheet} width={1920} height={1080} />
      <Still id="Thumb" component={Thumb} width={1920} height={1080} defaultProps={{ variant: "closeup" as const }} />
    </Folder>
    <Composition id="Episode" component={Episode} width={1920} height={1080} fps={30} durationInFrames={300}
      defaultProps={demoEpisode} calculateMetadata={episodeMeta} />
    <Composition id="Short" component={Short} width={1080} height={1920} fps={30} durationInFrames={300}
      defaultProps={{ ...demoEpisode, startFrame: 0, durationInFrames: 300, hook: ["KIT'S FIRST WINTER", "WOULD YOU MAKE IT?"] }} calculateMetadata={shortMeta} />
  </>
);
