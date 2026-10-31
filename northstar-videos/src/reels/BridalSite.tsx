import React from "react";
import { AbsoluteFill, Img, Series, staticFile } from "remotion";
import { Backdrop, CtaScene, HookScene, PopIn } from "../components/Brand";
import { Phone, ScrollingSite } from "../components/Phone";
import { SiteHero, SiteNav, SiteSection, WhatsAppButton } from "../components/Site";

// Reel 7 · Thu 5 Nov — walkthrough of a bridal studio demo website.
export const BRIDAL_SITE_DURATION = 90 + 480 + 150;

const ACCENT = "#9D174D";

const PACKAGES = [
  { name: "Party Makeup", detail: "Makeup · Hair styling" },
  { name: "Engagement / Holud", detail: "Makeup · Hair · Saree draping" },
  { name: "Bridal Full Package", detail: "Makeup · Hair · Jewellery setting · Trial" },
];

// Real bridal looks supplied by the client, in public/portfolio.
const PORTFOLIO = [1, 2, 3, 4, 5, 6].map((n) => staticFile(`portfolio/look${n}.jpg`));

const SiteScene: React.FC = () => (
  <Backdrop>
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 110, gap: 36 }}>
      <PopIn>
        <div style={{ fontSize: 52, fontWeight: 700, textAlign: "center" }}>
          Demo website · Bridal studio
        </div>
      </PopIn>
      <Phone width={740} height={1460}>
        <ScrollingSite scrollFrom={50} scrollTo={440} distance={1700}>
          <SiteNav name="Rose Bridal Studio" accent={ACCENT} />
          <SiteHero
            title="আপনার বিশেষ দিনের জন্য"
            subtitle="Bridal, holud আর party makeup — trial সহ"
            gradient="linear-gradient(160deg,#9D174D,#DB2777 60%,#F59E0B)"
            cta="WhatsApp-এ booking"
          />
          <SiteSection title="Packages">
            {PACKAGES.map((p) => (
              <div
                key={p.name}
                style={{
                  border: `2px solid ${ACCENT}22`,
                  borderRadius: 22,
                  padding: "22px 26px",
                  background: "#FFF5F8",
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 700, color: ACCENT }}>{p.name}</div>
                <div style={{ fontSize: 28, color: "#444", marginTop: 6 }}>{p.detail}</div>
              </div>
            ))}
          </SiteSection>
          <SiteSection title="Portfolio">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {PORTFOLIO.map((src, i) => (
                <div
                  key={src}
                  style={{
                    height: 400,
                    borderRadius: 20,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Img
                    src={src}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(transparent 65%, rgba(0,0,0,0.55))",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 16,
                      color: "#fff",
                      fontSize: 26,
                      fontWeight: 600,
                    }}
                  >
                    Look {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </SiteSection>
          <SiteSection title="Booking">
            <div style={{ fontSize: 30, color: "#444", lineHeight: 1.5 }}>
              তারিখ আর package জানিয়ে message করুন, আমরা confirm করে দেবো।
            </div>
            <WhatsAppButton label="Date book করুন" />
          </SiteSection>
        </ScrollingSite>
      </Phone>
    </AbsoluteFill>
  </Backdrop>
);

export const BridalSite: React.FC = () => (
  <Series>
    <Series.Sequence name="Hook" durationInFrames={90}>
      <HookScene lines={["Bridal studio-র website", "দেখতে এমন হয় 💄"]} />
    </Series.Sequence>
    <Series.Sequence name="Site" durationInFrames={480}>
      <SiteScene />
    </Series.Sequence>
    <Series.Sequence name="CTA" durationInFrames={150}>
      <CtaScene
        headline="Salon, bridal studio, clinic — যেকোনো local business"
        sub="Website শুরু ৳৮,০০০ থেকে"
      />
    </Series.Sequence>
  </Series>
);
