# Richi — ElevenLabs "Inbound Lead Qualifier"

Agent ID: `agent_5501m54wm9rwepdvpfff5t9thf92` (answers WhatsApp +880 / +65 and the website widget, voice + chat).

Retrained 31 Oct 2026:
- **System prompt:** identity as a live product demo, natural Bangla with English tech terms, voice vs text style rules,
  **demo mode** (role-plays as the visitor's own business receptionist), published prices only, lead capture via
  `submit_qualified_lead` with consent, human handover, honesty rules, OTP/spam handling.
- **Knowledge base:** one accurate fact sheet "NorthStar Dizital — Official agency facts (Oct 2026)" (always in the prompt)
  plus the website crawl. The two older PDFs (draft prices ৳5,999 / ৳12,999 / ৳24,999, "contact not confirmed")
  were detached, not deleted.
- **First message:** offers services info or a quick demo (typo "আলাইকু" fixed). English preset updated too.
- **Workflow:** node instructions rewritten to match real capabilities (no calendar booking, no case studies).
- **Data collection:** 10 lead fields (see `social/whatsapp-outreach.md`).
- **Guardrail:** "No unapproved commitments" (blocks discounts, unpublished fixed prices, guarantees, claimed agency
  bookings) replaced the over-strict pricing guardrail. Demo role-play is allowed.
- **Voice:** expressive mode and audio tags off, so no "[laughs]"-style tags leak into chat text.
- **Singapore / international:** replies in English, never quotes taka packages, says the team sends an SGD quote,
  gives WhatsApp +65 8069 4543.
- **Length:** text replies max ~3 short lines; voice 1–2 sentences; one question at a time.

Simulation tests (ElevenLabs → Agent → Tests): restaurant demo, Banglish price question, Singapore clinic visitor.

To change prices or services, update the fact sheet in ElevenLabs → Knowledge Base; the prompt reads facts from it.

**Language (31 Oct 2026):** English is the default language and first message. The website widget has a language
dropdown (English / বাংলা); choosing Bangla switches the greeting and replies to Bangla. Richi also follows whatever
language the visitor writes or speaks. International visitors never get taka prices; the team sends a quote in their
currency.
