import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Composition, Folder, Still } from "remotion";
import { Episode, EpisodeProps, episodeDuration, Short, ShortProps } from "./Episode";
import { Kit } from "./kit/Kit";
import { HORIZON, Prairie, Sky } from "./sets/sets";
import { demoEpisode } from "./demo";
import { fonts, palette } from "./theme";

const episodeMeta: CalculateMetadataFunction<EpisodeProps> = ({ props }) => ({ durationInFrames: Math.max(1, episodeDuration(props)) });
const shortMeta: CalculateMetadataFunction<ShortProps> = ({ props }) => ({ durationInFrames: props.durationInFrames });

/** Character sheet: the reference for Kit's look. Compare every new episode against it. */
const KitSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: palette.ink }}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <Sky time="day" clouds={3} />
      <Prairie tufts={30} />
      {([["front", 420], ["side", 960], ["back", 1500]] as const).map(([pose, x]) => (
        <g key={pose} transform={`translate(${x} ${HORIZON + 330}) scale(1.4)`}>
          <Kit pose={pose} />
        </g>
      ))}
    </svg>
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 40, fontFamily: fonts.serif, fontSize: 64, color: palette.paper, fontWeight: 700 }}>
      KIT — front · side · back
    </AbsoluteFill>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Reference">
      <Still id="KitSheet" component={KitSheet} width={1920} height={1080} />
    </Folder>
    <Composition id="Episode" component={Episode} width={1920} height={1080} fps={30} durationInFrames={300}
      defaultProps={demoEpisode} calculateMetadata={episodeMeta} />
    <Composition id="Short" component={Short} width={1080} height={1920} fps={30} durationInFrames={300}
      defaultProps={{ ...demoEpisode, startFrame: 0, durationInFrames: 300, hook: ["KIT'S FIRST WINTER", "WOULD YOU MAKE IT?"] }} calculateMetadata={shortMeta} />
  </>
);
