import React from "react";
import { Composition, Folder } from "remotion";
import { NorthstarShort } from "./NorthstarShort";
import { ColdOpen } from "./scenes/ColdOpen";
import { Constellation } from "./scenes/Constellation";
import { Warp } from "./scenes/Warp";
import { Reveal } from "./scenes/Reveal";
import { FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Scenes">
      <Composition id="ColdOpen" component={ColdOpen} width={W} height={H} fps={FPS} durationInFrames={120} />
      <Composition id="Constellation" component={Constellation} width={W} height={H} fps={FPS} durationInFrames={150} />
      <Composition id="Warp" component={Warp} width={W} height={H} fps={FPS} durationInFrames={150} />
      <Composition id="Reveal" component={Reveal} width={W} height={H} fps={FPS} durationInFrames={210} />
    </Folder>
    {/* 120 + 150 + 150 + 210 - 20 - 10 (transition overlap) = 600 frames = 20s */}
    <Composition id="NorthstarShort" component={NorthstarShort} width={W} height={H} fps={FPS} durationInFrames={600} />
  </>
);
