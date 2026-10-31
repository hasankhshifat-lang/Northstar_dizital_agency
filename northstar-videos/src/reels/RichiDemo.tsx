import React from "react";
import { AbsoluteFill, Series, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, CtaScene, HookScene, PopIn } from "../components/Brand";
import { Bubble, ChatHeader, Phone, Typing } from "../components/Phone";
import { colors } from "../theme";

// Reel 1 · Sun 1 Nov — the AI receptionist answering a customer at 2 AM.
export const RICHI_DEMO_DURATION = 90 + 390 + 150;

const ChatScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Backdrop>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
        <PopIn>
          <div
            style={{
              fontSize: 50,
              fontWeight: 700,
              color: colors.cyan,
              marginBottom: 40,
            }}
          >
            AI receptionist demo
          </div>
        </PopIn>
        <Phone>
          <div
            style={{
              height: "100%",
              background: colors.chatBg,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ChatHeader name="NorthStar Dizital" status="online" />
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                padding: "24px 26px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: 20,
              }}
            >
              <div
                style={{
                  alignSelf: "center",
                  background: "#D1E9F6",
                  color: "#333",
                  fontSize: 28,
                  padding: "8px 22px",
                  borderRadius: 14,
                }}
              >
                আজ · রাত ২:০০
              </div>
              <Bubble side="out" time="2:00 AM" appearAt={15}>
                Price koto? Amar boutique shop er jonno website lagbe
              </Bubble>
              <Typing from={35} to={95} />
              <Bubble side="in" time="2:00 AM" appearAt={95}>
                আসসালামু আলাইকুম! আমি রিচি, NorthStar Dizital-এর AI assistant।
                😊 আপনার boutique-এর জন্য website শুরু ৳৮,০০০ থেকে, ৩–৫ দিনে
                ready।
              </Bubble>
              <Bubble side="in" time="2:00 AM" appearAt={165}>
                Website-এ থাকবে products, price আর এক click-এ WhatsApp order।
                একটা free demo দেখতে চান?
              </Bubble>
              <Bubble side="out" time="2:01 AM" appearAt={245}>
                Haan, dekhan please 🙏
              </Bubble>
              <Typing from={265} to={310} />
              <Bubble side="in" time="2:01 AM" appearAt={310}>
                অবশ্যই! আপনার নাম আর shop-এর নামটা বলুন, demo পাঠিয়ে দিচ্ছি। ✨
              </Bubble>
            </div>
          </div>
        </Phone>
      </AbsoluteFill>
      {frame >= 95 ? (
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: 60,
            rotate: "-4deg",
            background: colors.gold,
            color: colors.navy,
            fontSize: 46,
            fontWeight: 700,
            padding: "18px 30px",
            borderRadius: 24,
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            scale: interpolate(frame, [95, 105], [0.4, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          ⚡ ৫ সেকেন্ডে উত্তর
        </div>
      ) : null}
    </Backdrop>
  );
};

export const RichiDemo: React.FC = () => (
  <Series>
    <Series.Sequence name="Hook" durationInFrames={90}>
      <HookScene eyebrow="রাত ২:০০ টা" lines={["Customer:", "“price কত?”"]} />
    </Series.Sequence>
    <Series.Sequence name="Chat" durationInFrames={390}>
      <ChatScene />
    </Series.Sequence>
    <Series.Sequence name="CTA" durationInFrames={150}>
      <CtaScene
        headline="আপনার page বা WhatsApp-এ বসাতে চান?"
        sub="রাত-দিন উত্তর দেয়, বাংলা ও English-এ"
      />
    </Series.Sequence>
  </Series>
);
