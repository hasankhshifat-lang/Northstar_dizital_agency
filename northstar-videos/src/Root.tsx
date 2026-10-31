import { Composition, Folder, Still } from "remotion";
import { BeforeAfter, BEFORE_AFTER_DURATION } from "./reels/BeforeAfter";
import { BridalSite, BRIDAL_SITE_DURATION } from "./reels/BridalSite";
import { RichiDemo, RICHI_DEMO_DURATION } from "./reels/RichiDemo";
import { OfferPost, PackagePost, RestaurantPost, TimelinePost } from "./stills/Posts";
import { FPS, POST, REEL } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Reels">
        <Composition
          id="Reel1-RichiDemo"
          component={RichiDemo}
          durationInFrames={RICHI_DEMO_DURATION}
          fps={FPS}
          {...REEL}
        />
        <Composition
          id="Reel4-BeforeAfter"
          component={BeforeAfter}
          durationInFrames={BEFORE_AFTER_DURATION}
          fps={FPS}
          {...REEL}
        />
        <Composition
          id="Reel7-BridalSite"
          component={BridalSite}
          durationInFrames={BRIDAL_SITE_DURATION}
          fps={FPS}
          {...REEL}
        />
      </Folder>
      <Folder name="Posts">
        <Still id="Post2-Package" component={PackagePost} {...POST} />
        <Still id="Post5-Timeline" component={TimelinePost} {...POST} />
        <Still id="Post6-Restaurant" component={RestaurantPost} {...POST} />
        <Still id="Post9-Offer" component={OfferPost} {...POST} />
      </Folder>
    </>
  );
};
