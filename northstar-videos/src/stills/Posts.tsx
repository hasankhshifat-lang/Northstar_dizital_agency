import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop, Logo, Star, WhatsAppIcon } from "../components/Brand";
import { Bubble, ChatHeader, Phone } from "../components/Phone";
import { colors, WHATSAPP } from "../theme";

// Static 1080x1350 feed images for the photo posts in the 1–7 Nov plan.

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Backdrop>
    <AbsoluteFill style={{ padding: "90px 90px 70px", display: "flex", flexDirection: "column" }}>
      {children}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Logo scale={0.8} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 38, fontWeight: 700 }}>
          <WhatsAppIcon size={52} />
          {WHATSAPP}
        </div>
      </div>
    </AbsoluteFill>
  </Backdrop>
);

const Check: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 52, fontWeight: 600 }}>
    <div
      style={{
        width: 70,
        height: 70,
        flexShrink: 0,
        borderRadius: 999,
        background: colors.cyan,
        color: colors.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 44,
        fontWeight: 700,
      }}
    >
      ✓
    </div>
    {children}
  </div>
);

// Post 2 · Mon 2 Nov — what the ৳8,000 website includes.
export const PackagePost: React.FC = () => (
  <Frame>
    <div style={{ fontSize: 58, fontWeight: 600, color: colors.muted }}>Website package</div>
    <div style={{ fontSize: 150, fontWeight: 700, color: colors.gold, lineHeight: 1.15 }}>
      ৳৮,০০০
    </div>
    <div style={{ fontSize: 58, fontWeight: 600, marginBottom: 60 }}>থেকে শুরু</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <Check>Mobile-friendly design</Check>
      <Check>Service আর price page</Check>
      <Check>Google Maps location</Check>
      <Check>এক click-এ WhatsApp</Check>
      <Check>৩–৫ দিনে ready</Check>
    </div>
  </Frame>
);

const STEPS = [
  { day: "দিন ১", text: "আপনার ব্যবসা, service আর price জেনে নিই" },
  { day: "দিন ২", text: "Design দেখাই, আপনার মতামত নিই" },
  { day: "দিন ৩–৪", text: "Website বানাই, WhatsApp আর Maps যোগ করি" },
  { day: "দিন ৫", text: "Live! 🚀" },
];

// Post 5 · Wed 4 Nov — how a website is built in 3–5 days.
export const TimelinePost: React.FC = () => (
  <Frame>
    <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.2, marginBottom: 70 }}>
      ৩–৫ দিনে website <span style={{ color: colors.cyan }}>কীভাবে বানাই?</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {STEPS.map((s, i) => (
        <div key={s.day} style={{ display: "flex", gap: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Star size={64} color={i === STEPS.length - 1 ? colors.gold : colors.cyan} />
            {i < STEPS.length - 1 ? (
              <div style={{ width: 6, flex: 1, background: `${colors.cyan}55`, minHeight: 90 }} />
            ) : null}
          </div>
          <div style={{ paddingBottom: 40 }}>
            <div style={{ fontSize: 46, fontWeight: 700, color: colors.gold }}>{s.day}</div>
            <div style={{ fontSize: 46, lineHeight: 1.35 }}>{s.text}</div>
          </div>
        </div>
      ))}
    </div>
  </Frame>
);

// Post 6 · Wed 4 Nov — AI receptionist taking a restaurant table booking.
export const RestaurantPost: React.FC = () => (
  <Backdrop>
    <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: "0 0 0 80px", gap: 0 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 36, zIndex: 1 }}>
        <div style={{ fontSize: 46, fontWeight: 600, color: colors.cyan }}>Restaurant মালিকদের জন্য 🍽️</div>
        <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.25 }}>
          ব্যস্ত রাতেও প্রতিটা booking নেয়
        </div>
        <div style={{ fontSize: 42, color: colors.muted, lineHeight: 1.45 }}>
          Menu পাঠায়, order নেয়, table book করে — আপনার team-কে জানিয়ে দেয়।
        </div>
        <Logo scale={0.75} />
      </div>
      <div style={{ scale: 0.8, width: 470, display: "flex", justifyContent: "center" }}>
        <Phone width={580} height={1250}>
          <div style={{ height: "100%", background: colors.chatBg }}>
            <ChatHeader name="Spice Garden" status="AI receptionist" />
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <Bubble side="out" time="8:02 PM" appearAt={-10}>
                Aj rat 9 tay 4 joner table hobe?
              </Bubble>
              <Bubble side="in" time="8:02 PM" appearAt={-10}>
                জি, হবে! ৯টায় ৪ জনের table রাখছি। আপনার নামটা বলবেন? 😊
              </Bubble>
              <Bubble side="out" time="8:03 PM" appearAt={-10}>
                Rahim
              </Bubble>
              <Bubble side="in" time="8:03 PM" appearAt={-10}>
                ধন্যবাদ Rahim ভাই! Booking confirmed ✅ Menu পাঠাবো?
              </Bubble>
            </div>
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  </Backdrop>
);

// Post 9 · Sat 7 Nov — free 15-minute consultation offer.
export const OfferPost: React.FC = () => (
  <Frame>
    <div
      style={{
        alignSelf: "flex-start",
        fontSize: 52,
        fontWeight: 700,
        background: colors.gold,
        color: colors.navy,
        padding: "12px 38px",
        borderRadius: 999,
        marginBottom: 50,
      }}
    >
      এই সপ্তাহে FREE
    </div>
    <div style={{ fontSize: 120, fontWeight: 700, lineHeight: 1.15 }}>
      ১৫ মিনিটের <span style={{ color: colors.cyan }}>consultation</span> ☕
    </div>
    <div style={{ fontSize: 50, color: colors.muted, margin: "40px 0 50px", lineHeight: 1.4 }}>
      আপনার ব্যবসা দেখে বলে দেবো:
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <Check>Website লাগবে কিনা</Check>
      <Check>AI receptionist কত সময় বাঁচাবে</Check>
      <Check>খরচ কত, লুকানো charge ছাড়া</Check>
    </div>
    <div style={{ fontSize: 46, fontWeight: 600, color: colors.gold, marginTop: 50 }}>
      “Consultation” লিখে WhatsApp করুন 👇
    </div>
  </Frame>
);
