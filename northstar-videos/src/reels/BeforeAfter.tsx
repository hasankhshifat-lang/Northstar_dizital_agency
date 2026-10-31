import React from "react";
import { AbsoluteFill, Series, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, CtaScene, HookScene, PopIn } from "../components/Brand";
import { Phone, ScrollingSite } from "../components/Phone";
import {
  MapCard,
  PriceRow,
  SiteHero,
  SiteNav,
  SiteSection,
  WhatsAppButton,
} from "../components/Site";
import { colors } from "../theme";

// Reel 4 · Tue 3 Nov — a salon with only a Facebook page, then with a website.
export const BEFORE_AFTER_DURATION = 90 + 180 + 240 + 150;

const Tag: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div
    style={{
      fontSize: 56,
      fontWeight: 700,
      background: color,
      color: colors.white,
      padding: "10px 40px",
      borderRadius: 18,
      letterSpacing: 3,
    }}
  >
    {label}
  </div>
);

const INBOX = [
  "price koto?",
  "location ta kothay?",
  "aj khola ache?",
  "appointment deya jabe?",
  "bhai reply den",
  "price ta bolen please",
];

const BeforeScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Backdrop>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 100, gap: 34 }}>
        <PopIn>
          <Tag label="BEFORE" color="#E11D48" />
        </PopIn>
        <PopIn delay={6}>
          <div style={{ fontSize: 50, fontWeight: 600, textAlign: "center", padding: "0 90px" }}>
            Customer-কে inbox-এ সব জিজ্ঞেস করতে হয়
          </div>
        </PopIn>
        <Phone width={720} height={1340}>
          <div style={{ padding: "100px 30px 0", background: "#fff", height: "100%" }}>
            <div style={{ fontSize: 44, fontWeight: 700, marginBottom: 20, color: "#111" }}>
              Chats
            </div>
            {INBOX.map((msg, i) => {
              const t = frame - 20 - i * 18;
              if (t < 0) return null;
              return (
                <div
                  key={msg}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "20px 0",
                    borderBottom: "1px solid #f0f0f0",
                    opacity: interpolate(t, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
                    translate: `${interpolate(t, [0, 8], [-60, 0], { extrapolateRight: "clamp" })}px 0px`,
                  }}
                >
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 999,
                      background: ["#93C5FD", "#FCA5A5", "#86EFAC", "#FCD34D", "#C4B5FD", "#F9A8D4"][i],
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "#111" }}>Customer {i + 1}</div>
                    <div style={{ fontSize: 30, color: "#111", fontWeight: 600 }}>{msg}</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: 999, background: "#1877F2" }} />
                </div>
              );
            })}
          </div>
        </Phone>
      </AbsoluteFill>
    </Backdrop>
  );
};

const AfterScene: React.FC = () => (
  <Backdrop>
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 100, gap: 34 }}>
      <PopIn>
        <Tag label="AFTER" color="#16A34A" />
      </PopIn>
      <PopIn delay={6}>
        <div style={{ fontSize: 50, fontWeight: 600, textAlign: "center", padding: "0 90px" }}>
          সব তথ্য এক জায়গায়, এক click-এ WhatsApp
        </div>
      </PopIn>
      <Phone width={720} height={1340}>
        <ScrollingSite scrollFrom={45} scrollTo={200} distance={880}>
          <SiteNav name="Glow Salon" accent="#BE185D" />
          <SiteHero
            title="Dhanmondi-র Glow Salon"
            subtitle="Hair · Skin · Makeup — প্রতিদিন সকাল ১০টা থেকে রাত ৯টা"
            gradient="linear-gradient(135deg,#BE185D,#7C3AED)"
            cta="WhatsApp-এ booking"
          />
          <SiteSection title="Services & Price">
            <PriceRow item="Hair cut" price="৳৫০০" accent="#BE185D" />
            <PriceRow item="Facial" price="৳১,২০০" accent="#BE185D" />
            <PriceRow item="Party makeup" price="৳৩,০০০" accent="#BE185D" />
          </SiteSection>
          <SiteSection title="Location">
            <MapCard area="Road 27, Dhanmondi, Dhaka" hours="সকাল ১০টা – রাত ৯টা" />
          </SiteSection>
          <SiteSection title="Booking">
            <WhatsAppButton label="এখনই message করুন" />
          </SiteSection>
        </ScrollingSite>
      </Phone>
    </AbsoluteFill>
  </Backdrop>
);

export const BeforeAfter: React.FC = () => (
  <Series>
    <Series.Sequence name="Hook" durationInFrames={90}>
      <HookScene eyebrow="Before ➜ After" lines={["শুধু Facebook page", "৫ দিনে website 🚀"]} />
    </Series.Sequence>
    <Series.Sequence name="Before" durationInFrames={180}>
      <BeforeScene />
    </Series.Sequence>
    <Series.Sequence name="After" durationInFrames={240}>
      <AfterScene />
    </Series.Sequence>
    <Series.Sequence name="CTA" durationInFrames={150}>
      <CtaScene headline="Website শুরু ৳৮,০০০ থেকে" sub="৩–৫ দিনে ready" />
    </Series.Sequence>
  </Series>
);
