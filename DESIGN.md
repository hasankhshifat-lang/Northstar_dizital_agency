---
name: Northstar Dizital AI
description: Websites and AI receptionists for service businesses, shown on a light, precise studio page.
colors:
  ground: "#F7F7F9"
  surface: "#FFFFFF"
  ink: "#101016"
  ink-secondary: "#4A4856"
  ink-tertiary: "#64616F"
  hairline: "#E3E1E9"
  hairline-strong: "#CFCCD8"
  logo-violet: "#966EFF"
  ink-violet: "#5A31D4"
  violet-tint: "#F0EBFF"
  panel-ink-violet: "#17112A"
  panel-text: "#F4F1FB"
  panel-muted: "#BDB5D3"
  mist: "#EEEDF2"
  bubble-grey: "#F1F0F4"
  confirm-green: "#1E7A4C"
  confirm-tint: "#E8F4EE"
  error-red: "#B4234A"
  error-tint: "#FBEAEF"
typography:
  display:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 4.4rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.85rem, 3.4vw, 2.8rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  price:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 2.6vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  lead:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  label-mono:
    fontFamily: "Spline Sans Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
    fontFeature: "tnum"
  numeral-mono:
    fontFamily: "Spline Sans Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1
rounded:
  badge: "6px"
  link: "8px"
  control: "10px"
  frame: "12px"
  chat: "16px"
  panel: "20px"
  full: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  card: "28px"
  xl: "32px"
  2xl: "48px"
  section: "clamp(48px, 7vw, 96px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-violet}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
  button-on-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
  button-on-panel-hover:
    backgroundColor: "{colors.violet-tint}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
    height: "48px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.frame}"
    padding: "{spacing.card}"
  recommended-badge:
    backgroundColor: "{colors.ink-violet}"
    textColor: "{colors.surface}"
    rounded: "{rounded.badge}"
    padding: "6px 10px"
  provenance-label:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.badge}"
    padding: "5px 8px"
  capability-tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.badge}"
    padding: "7px 10px"
  closing-panel:
    backgroundColor: "{colors.panel-ink-violet}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.panel}"
    padding: "clamp(40px, 6vw, 72px) clamp(24px, 6vw, 72px)"
---

# Design System: Northstar Dizital AI

## Overview

**Creative North Star: "The Open Studio Bench"**

A precise, light studio site that shows the offer instead of describing it. The page is a cool near-white bench on which real things are laid out: live client screenshots in thin browser frames, a phone-width example conversation that books an appointment, three fixed-price packages with their terms printed in mono. Near-black ink carries almost everything; violet appears only where the visitor can act or where Northstar is making a recommendation. The visual standard is conventional by commitment: the polish of precise product sites and work-first small studios, not a novel layout.

Density is calm but not sparse. Sections breathe on a 48 to 96px rhythm, content sits in a 1160px column, and structure comes from hairline rules and 12px-cornered white surfaces rather than colour blocks or shadows. The one dark moment is the inset ink-violet closing panel that ends each page with the two ways to start: the form and WhatsApp.

The world replaces the earlier dark theme and refuses the neon "AI agency" page outright: no glow, no gradient text, no 3D faces, no buzzword tickers. The AI is shown working (the example chat), never decorated.

**Key Characteristics:**
- Cool near-white ground, near-black ink, white surfaces separated by hairlines.
- One violet family: ink-violet for actions, focus and icons; logo violet only for the brand mark, selection and the recommended-package ring.
- Schibsted Grotesk set tight for display and body; Spline Sans Mono for metadata only.
- Real screenshots in thin browser frames are the primary imagery.
- One inset ink-violet closing panel per page, never a full-bleed field.
- Authored line-icon SVGs at a 1.8 stroke.

## Colors

A near-monochrome cool-neutral system with a single violet family and a deep ink-violet reserved for the closing panel.

### Primary
- **Ink Violet** (ink-violet): the working accent. Primary-button hover, focus outlines, caret, link hover, check and feature icons, step numerals, the Recommended badge background. Chosen over the logo violet for these jobs because it holds 7.4:1 on white where the logo violet holds 3.5:1.
- **Logo Violet** (logo-violet): the brand colour from the logo. Used only for the recommended package's 2px ring and text selection. Never for text.
- **Violet Tint** (violet-tint): the soft wash behind the assistant avatar, the input focus halo, and the hover fill of the white button on the closing panel.

### Secondary
- **Panel Ink Violet** (panel-ink-violet): the background of the closing panel and nothing else. **Panel Text** (panel-text) and **Panel Muted** (panel-muted) are its foreground pair; headings on it are pure white.

### Neutral
- **Ground** (ground): page background and the translucent sticky header.
- **Surface** (surface): cards, frames, pricing packages, inputs, secondary buttons, the chat card.
- **Ink** (ink): headings, body text, primary buttons, user chat bubbles, the process rule.
- **Ink Secondary** (ink-secondary): supporting paragraphs, lead copy, nav links, label text.
- **Ink Tertiary** (ink-tertiary): mono metadata, definition-list terms, footer fine print, unavailable values.
- **Hairline** (hairline): every structural rule and card border. **Hairline Strong** (hairline-strong): control borders (secondary button, inputs, burger) and resting link underlines.
- **Mist** (mist): provenance-label fill and empty image placeholders. **Bubble Grey** (bubble-grey): assistant chat bubbles and the typing indicator.

### Status
- **Confirm Green** on **Confirm Tint**: the "Booked" chat confirmation and the form's success message.
- **Error Red** on **Error Tint**: invalid field borders, field error text, the form failure message.

### Named Rules
**The Earned Violet Rule.** Violet marks an action, a focus, or Northstar's recommendation. If an element is neither clickable, focused, nor the recommended package, it is ink or grey.

**The Two Violets Rule.** Logo violet is a brand mark and a ring; ink-violet is the working accent. Text and icons in violet always use ink-violet.

## Typography

**Display Font:** Schibsted Grotesk (with ui-sans-serif, system-ui fallback), self-hosted variable 400 to 900.
**Body Font:** Schibsted Grotesk.
**Label/Mono Font:** Spline Sans Mono (with ui-monospace, SFMono-Regular, Menlo fallback), self-hosted variable 300 to 700.

**Character:** One grotesk does all the speaking, set tight and semibold at the top and plain at reading size; the mono is the studio's ledger, appearing only where a fact is being recorded.

### Hierarchy
- **Display** (display token): page H1s only. Max width about 11em on the home hero, 14em on inner page headers. Balanced wrapping.
- **Headline** (headline token): section H2s, including the closing panel heading.
- **Title** (title token): card, step and project titles. Package titles step to 1.25rem; service-row titles to 1.5rem at -0.025em.
- **Price** (price token): package amounts, set in the sans with tabular figures, never in the mono.
- **Lead** (lead token): the one-sentence subcopy under an H1, in ink-secondary, max 34 to 36em.
- **Body** (body token) and **Body Small** (body-small token): reading text and secondary card copy. Supporting paragraphs cap near 30 to 42em.
- **Label Mono** (label-mono token): payment terms, durations, frame URLs, the hero price-and-time line, project category tags, provenance labels (at 0.75rem, weight 500), and the "Example conversation" label.
- **Numeral Mono** (numeral-mono token): the two-digit step counters (01 to 04) in ink-violet.

### Named Rules
**The Ledger Rule.** Mono is for recorded facts: terms, durations, URLs, tags, step numerals, the example label. Headings, prices, buttons and prose are always the sans.

**The Sentence Case Rule.** Headings are sentence case and end with a full stop when they are a statement ("Fixed prices, agreed before we start.").

## Layout

Content sits in a single centred column of min(1160px, 100% minus 40px). Sections are separated by vertical rhythm alone (section token, 48 to 96px), not by alternating backgrounds. Section headers place the H2 and a short supporting paragraph on one baseline row, wrapping on narrow screens.

The home hero is a two-column grid (1fr : 1.08fr): text left, the framed screenshot right with the chat card overlapping its bottom-left edge. At 900px it stacks; at 560px the buttons go full width and the chat card tucks up under the frame with a negative top margin, so the H1, subcopy, price line and both buttons sit above the fold at 390px.

Grids: pricing is three equal columns to 980px, then one column capped at 560px. Work is two columns to 720px. Services is a ruled list of two-column rows (1fr : 1.35fr) that stack at 760px. Process is four columns under a full-width ink rule, two at 860px, one at 480px. Inner-page cards use auto-fill columns of at least 280px (420px for project cards, 220px for numbered process cards). Gaps step through 8, 12, 16, 24, 32 and 48px.

The header is sticky at 72px, translucent ground, gaining a hairline bottom border only once the page scrolls. Below 900px the links collapse into a burger menu that drops a full-width ruled list with both actions stacked beneath it, over a 32% ink scrim.

## Elevation & Depth

Flat by default, with depth reserved for real objects laid on the bench. Hairlines and white-on-ground contrast do the structural work; shadows only appear under the screenshot frames and the chat card, which are meant to read as physical artefacts, and under the open mobile menu.

### Shadow Vocabulary
- **Frame rest** (`box-shadow: 0 1px 2px rgba(16,16,22,.04), 0 24px 48px -24px rgba(16,16,22,.22)`): the hero browser frame.
- **Frame quiet** (`box-shadow: 0 1px 2px rgba(16,16,22,.04)`): work frames at rest.
- **Frame lifted** (`box-shadow: 0 1px 2px rgba(16,16,22,.04), 0 30px 56px -24px rgba(16,16,22,.3)`): work frames on hover, paired with a 3px rise.
- **Chat card** (`box-shadow: 0 2px 4px rgba(16,16,22,.05), 0 30px 60px -20px rgba(16,16,22,.3)`): the example conversation floating over the hero frame.
- **Menu drop** (`box-shadow: 0 18px 30px -18px rgba(16,16,22,.25)`): the mobile menu panel.
- **Focus halo** (`box-shadow: 0 0 0 3px` violet-tint): inputs on focus.

### Named Rules
**The Artefact Rule.** Only things that represent real objects (a screenshot, a phone conversation, an open menu) cast shadows. Cards, packages and panels stay flat and are separated by hairlines.

## Shapes

Gently rounded and consistent. Surfaces that hold content (cards, packages, browser frames) use 12px; controls (buttons, inputs, burger, status messages) use 10px; small markers (badges, tags, labels) use 6px; nav-link hover fills use 8px. The chat card is softer at 16px to read as a phone-scale object, and its bubbles use 12px with the corner nearest the speaker cut to 4px. The closing panel is the largest radius at 20px. Avatars and the frame's window dots are circles.

Borders are 1px hairlines everywhere; the only heavier line is the 1px ink rule over the process steps and the 2px logo-violet ring on the recommended package.

## Components

### Buttons
Solid, quiet and tactile: a 48px target, a 1px press on active, colour change on hover.
- **Shape:** 10px corners, min height 48px (42px in the header, 40px for project filters).
- **Primary:** ink fill, white text, 600 weight. Hover shifts the fill and border to ink-violet.
- **Secondary:** white surface with a hairline-strong border and ink text; hover darkens the border to ink. Used for "Chat on WhatsApp" (with the WhatsApp line icon) and the non-recommended package choices.
- **On the closing panel:** primary becomes a white fill with ink text (hover violet-tint); the secondary becomes transparent with a 35% white border (hover full white).
- **Focus:** 2px ink-violet outline at 3px offset; white on the closing panel.
- **Text link:** 600-weight ink with a hairline-strong underline at 5px offset; hover turns text and underline ink-violet.

### Chips
- **Capability tag:** white fill, hairline border, 6px corners, 0.8125rem sans in ink-secondary. Static, under each service row.
- **Provenance label:** mist fill, 6px corners, 0.75rem mono at 500 in ink-secondary. States what a piece of work is ("Demo · sample content", "Personal brand"). Mandatory wherever demo or concept work is shown.
- **Filter:** the project filter row reuses secondary buttons at 40px; the selected one switches to the ink fill.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** white surface on the ground.
- **Shadow Strategy:** none (see The Artefact Rule).
- **Border:** 1px hairline; hover strengthens it to hairline-strong.
- **Internal Padding:** 28px; project cards drop padding to bleed their 16:10 screenshot, then pad text at 22 to 24px.

### Pricing Package
A white card with title, one-line audience, price in the price token, a mono "One-time payment" line, a ruled definition list (Pages, Delivery, AI assistant) with right-aligned values, a check-icon feature list, a full-width button and a WhatsApp text link. The recommended package adds the logo-violet ring and a Recommended badge (ink-violet fill, white 0.75rem sans, 6px corners) straddling its top edge; its button is primary while the others are secondary.

### Inputs / Fields
- **Style:** white fill, 1px hairline-strong border, 10px corners, 12px by 14px padding, min height 48px, 1rem sans. Labels sit above in 0.875rem semibold ink; "optional" in ink-tertiary at 400.
- **Hover:** border to ink-tertiary.
- **Focus:** border to ink-violet plus a 3px violet-tint halo; no outline.
- **Error:** border to error-red with a 0.8125rem error-red message below. The form-level result is a 10px-cornered tinted block (confirm or error pair).

### Navigation
- **Desktop:** logo left; links at 0.9375rem in ink-secondary with 8px-cornered hover fills at 4% ink; the current page in ink at 600. Right side: a square secondary WhatsApp icon button and a compact primary "Start a project".
- **Mobile (900px and below):** a 44px bordered burger whose two lines rotate into a cross; the menu is a full-width ruled list on the ground with both actions stacked as full buttons, closing on link tap, outside click or Escape.

### Browser Frame
The signature container for real work. A white 12px-cornered box with a hairline border and a 36px bar on #FBFBFC holding three hairline-grey window dots and the site URL in 0.75rem mono, over a 16:10 top-anchored screenshot. A failed image keeps the frame and shows "Preview unavailable" in mono.

### Example Conversation
A 310px phone-scale chat card (16px corners, chat card shadow) with a header naming "AI receptionist" over a mono "Example conversation" label and a violet-tint avatar. User bubbles are ink on white text aligned right; assistant bubbles are bubble-grey aligned left; it ends on a confirm-green "Booked" chip with a check icon. It plays once when half in view: a three-dot typing indicator precedes each assistant line and messages rise 6px into place over 0.35s (cubic-bezier(.2,.8,.2,1)). With reduced motion or without JavaScript it is fully static and complete. The example label is required whenever the conversation is shown.

### Closing Panel
An inset panel inside the content column, not a full-bleed field: panel-ink-violet fill, 20px corners, generous clamp padding, a two-column grid with the heading and one line of copy on the left and the two actions on the right, stacking at 860px. An email fallback line in panel-muted sits under the copy.

### Process Steps
Four columns under a 1px ink rule, each opening with a mono two-digit numeral in ink-violet, then a title and a short body-small paragraph.

## Do's and Don'ts

### Do:
- **Do** keep the page on the ground colour with white surfaces and 1px hairlines; let structure come from rules, not fills.
- **Do** use ink-violet for every violet text, icon, focus and hover; reserve logo violet for the logo, selection and the recommended ring.
- **Do** show real work in the browser frame, 16:10, top-anchored, with its URL in the bar and its provenance label beside the title.
- **Do** set prices in the sans with tabular figures and put their terms (payment, duration) in the mono.
- **Do** give every button a 48px minimum target and keep the form and WhatsApp side by side wherever a page asks for action.
- **Do** end each page with the inset ink-violet closing panel at 20px corners, inside the content column.
- **Do** draw icons as authored inline line SVGs at 1.8 stroke, round caps and joins, 14 to 20px.
- **Do** make any motion play once and leave a complete static state for reduced motion.

### Don't:
- **Don't** use glow, gradient text, neon-on-dark, 3D faces or buzzword tickers; this world replaced the dark AI-agency theme.
- **Don't** set violet text in logo violet (#966EFF holds only 3.5:1 on white).
- **Don't** extend the closing panel to full bleed or add a second dark band elsewhere on the page.
- **Don't** put a mono or uppercase line above a section heading; mono belongs to facts, not to introducing headings.
- **Don't** add shadows to cards, packages or the closing panel.
- **Don't** set headings, prices, buttons or paragraphs in the mono.
- **Don't** show demo or concept work, or the example conversation, without its label.
