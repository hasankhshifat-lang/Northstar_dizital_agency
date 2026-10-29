import { Composition, Folder } from "remotion";
import { ShortA, SHORT_A_SECONDS } from "./shorts/ShortA";
import { ShortB, SHORT_B_SECONDS } from "./shorts/ShortB";
import { ShortC, SHORT_C_SECONDS } from "./shorts/ShortC";
import { LongVideo, LONG_SECONDS } from "./long/LongVideo";
import { KitExpressions, KitIntro, KitOutfits } from "./kit/KitSheet";
import { Banner, BannerSafeCheck, ProfilePicture } from "./kit/ChannelArt";
import { Thumbnail01 } from "./kit/Thumbnail";
import { FPS, s } from "./lib/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Folder name="Kit-Character">
      <Composition id="Kit-Outfits" component={KitOutfits} width={1920} height={1080} fps={FPS} durationInFrames={60} />
      <Composition id="Kit-Expressions" component={KitExpressions} width={1920} height={1080} fps={FPS} durationInFrames={60} />
      <Composition id="Channel-ProfilePicture" component={ProfilePicture} width={800} height={800} fps={FPS} durationInFrames={30} />
      <Composition id="Channel-Banner" component={Banner} width={2560} height={1440} fps={FPS} durationInFrames={30} />
      <Composition id="Channel-Banner-SafeCheck" component={BannerSafeCheck} width={2560} height={1440} fps={FPS} durationInFrames={30} />
      <Composition id="Thumb-01-Oregon-Trail" component={Thumbnail01} width={1280} height={720} fps={FPS} durationInFrames={30} />
      <Composition id="Kit-Intro" component={KitIntro} width={1920} height={1080} fps={FPS} durationInFrames={180} />
    </Folder>
    <Composition id="Long-Oregon-Trail" component={LongVideo} width={1920} height={1080} fps={FPS} durationInFrames={s(LONG_SECONDS)} />
    <Folder name="Oregon-Trail-Shorts">
      <Composition id="ShortA-Cholera" component={ShortA} width={1080} height={1920} fps={FPS} durationInFrames={s(SHORT_A_SECONDS)} />
      <Composition id="ShortB-Outfit" component={ShortB} width={1080} height={1920} fps={FPS} durationInFrames={s(SHORT_B_SECONDS)} />
      <Composition id="ShortC-July4" component={ShortC} width={1080} height={1920} fps={FPS} durationInFrames={s(SHORT_C_SECONDS)} />
    </Folder>
    </>
  );
};
