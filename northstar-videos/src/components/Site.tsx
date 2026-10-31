import React from "react";
import { colors } from "../theme";
import { WhatsAppIcon } from "./Brand";

// Building blocks for the mock local-business websites shown inside the phone.

export const SiteNav: React.FC<{ name: string; accent: string }> = ({
  name,
  accent,
}) => (
  <div
    style={{
      padding: "96px 34px 22px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #eee",
    }}
  >
    <div style={{ fontSize: 36, fontWeight: 700, color: accent }}>{name}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 40, height: 5, background: "#333", borderRadius: 3 }} />
      ))}
    </div>
  </div>
);

export const SiteHero: React.FC<{
  title: string;
  subtitle: string;
  gradient: string;
  cta: string;
}> = ({ title, subtitle, gradient, cta }) => (
  <div
    style={{
      background: gradient,
      color: colors.white,
      padding: "70px 40px",
      display: "flex",
      flexDirection: "column",
      gap: 22,
    }}
  >
    <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
    <div style={{ fontSize: 32, opacity: 0.92, lineHeight: 1.4 }}>{subtitle}</div>
    <WhatsAppButton label={cta} />
  </div>
);

export const WhatsAppButton: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      alignSelf: "flex-start",
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: colors.whatsapp,
      color: colors.white,
      fontSize: 32,
      fontWeight: 700,
      padding: "16px 30px",
      borderRadius: 999,
    }}
  >
    <WhatsAppIcon size={44} />
    {label}
  </div>
);

export const SiteSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div style={{ padding: "44px 34px", display: "flex", flexDirection: "column", gap: 22 }}>
    <div style={{ fontSize: 42, fontWeight: 700, color: "#111" }}>{title}</div>
    {children}
  </div>
);

export const PriceRow: React.FC<{ item: string; price: string; accent: string }> = ({
  item,
  price,
  accent,
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: 32,
      padding: "18px 24px",
      background: "#F6F7FB",
      borderRadius: 18,
      color: "#222",
    }}
  >
    <span>{item}</span>
    <span style={{ fontWeight: 700, color: accent }}>{price}</span>
  </div>
);

export const MapCard: React.FC<{ area: string; hours: string }> = ({ area, hours }) => (
  <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid #e3e3e3" }}>
    <div
      style={{
        height: 230,
        background:
          "repeating-linear-gradient(45deg,#E8F0E3 0 40px,#DDE8D6 40px 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 70,
      }}
    >
      📍
    </div>
    <div style={{ padding: "18px 24px", fontSize: 30, color: "#333", lineHeight: 1.5 }}>
      {area}
      <br />
      🕘 {hours}
    </div>
  </div>
);
