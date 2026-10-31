import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop, Logo, Star } from "../components/Brand";
import { Bubble, ChatHeader, Phone } from "../components/Phone";
import { colors } from "../theme";

// 1125x600 (1.91:1) image headers for the WhatsApp outreach templates.

const Layout: React.FC<{ left: React.ReactNode; right: React.ReactNode }> = ({
  left,
  right,
}) => (
  <Backdrop>
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 0 0 70px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>{left}</div>
      <div style={{ width: 430, height: "100%", position: "relative", overflow: "hidden" }}>
        {right}
      </div>
    </AbsoluteFill>
  </Backdrop>
);

const Pill: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = colors.gold,
}) => (
  <div
    style={{
      alignSelf: "flex-start",
      fontSize: 30,
      fontWeight: 700,
      background: color,
      color: colors.navy,
      padding: "6px 24px",
      borderRadius: 999,
    }}
  >
    {children}
  </div>
);

const MiniChat: React.FC<{ customer: string; reply: string }> = ({ customer, reply }) => (
  <div style={{ position: "absolute", top: 50, left: 20, scale: 0.62, transformOrigin: "top left" }}>
    <Phone width={620} height={1100}>
      <div style={{ height: "100%", background: colors.chatBg }}>
        <ChatHeader name="Your Business" status="AI receptionist · online" />
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
          <Bubble side="out" time="2:00 AM" appearAt={-10}>
            {customer}
          </Bubble>
          <Bubble side="in" time="2:00 AM" appearAt={-10}>
            {reply}
          </Bubble>
        </div>
      </div>
    </Phone>
  </div>
);

// Template 1 · northstar_intro_offer
export const WaIntroHeader: React.FC = () => (
  <Layout
    left={
      <>
        <Logo scale={0.8} />
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>
          AI Automation <span style={{ color: colors.cyan }}>+</span>
          <br />
          Smart Websites
        </div>
        <div style={{ fontSize: 30, color: colors.muted, lineHeight: 1.4 }}>
          Reply to customers 24/7 and get found on Google.
        </div>
        <Pill>Free 15-min consultation</Pill>
      </>
    }
    right={
      <MiniChat
        customer="Price koto? Website lagbe"
        reply="আসসালামু আলাইকুম! Website শুরু ৳৮,০০০ থেকে, ৩–৫ দিনে ready। 😊"
      />
    }
  />
);

// Template 2 · northstar_followup_1
export const WaFollowup1Header: React.FC = () => (
  <Layout
    left={
      <>
        <Logo scale={0.8} />
        <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.15 }}>
          Never miss a
          <br />
          customer <span style={{ color: colors.gold }}>at 2 AM</span>
        </div>
        <div style={{ fontSize: 30, color: colors.muted, lineHeight: 1.4 }}>
          Your AI receptionist answers prices, takes orders and books appointments.
        </div>
      </>
    }
    right={
      <MiniChat
        customer="Kal appointment hobe?"
        reply="জি, হবে! কাল সকাল ১১টায় আপনার appointment রাখছি। ✅"
      />
    }
  />
);

// Template 3 · northstar_followup_2
export const WaFollowup2Header: React.FC = () => (
  <Layout
    left={
      <>
        <Logo scale={0.8} />
        <Pill>Last chance this week</Pill>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
          Free 15-min
          <br />
          <span style={{ color: colors.cyan }}>consultation</span> ☕
        </div>
        <div style={{ fontSize: 30, color: colors.muted, lineHeight: 1.4 }}>
          Website · AI receptionist · Clear pricing, no hidden charges
        </div>
      </>
    }
    right={
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 330, height: 330 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: `${colors.cyan}22` }} />
          <div style={{ position: "absolute", inset: 45, borderRadius: 999, background: `${colors.cyan}33` }} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <Star size={170} color={colors.gold} />
          </AbsoluteFill>
        </div>
      </AbsoluteFill>
    }
  />
);
