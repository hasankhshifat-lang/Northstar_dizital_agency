# voice-pov.md - POV American History channel

The second channel. Not North Star: no agency, no parlor owners, no website pitch. Use this file
instead of `voice.md` for any video on this channel. *(inferred)* lines are starting assumptions -
replace them with what the channel's analytics show after the first ten uploads.

## Who I am talking to

One person: an American adult, 25 to 50, who played The Oregon Trail in a school computer lab, now
watches history on the living-room TV or on a phone at lunch, and likes the "what would I have
done?" question more than dates and names. Not a history buff - curious, not an expert.
*(inferred)*

## How I actually talk

Second person, present tense, always. The viewer IS the character: "You wake up at four. The oxen
need yoking before anyone eats." Never "settlers did this" - "you do this".

- Short sentences. One action or one fact per sentence, so Mike can land each one.
- A real number in place of an adjective: "two hundred pounds of flour", not "tons of food".
- Dry, calm humour, never jokey. The danger is real; the narrator is steady.
- Every section ends with a small cliffhanger that pulls into the next one.
- One honest "here's what you don't know yet" turn per video - the gap between what the character
  knows and what we know now.

## Words I never use

- "Let's dive in", "buckle up", "without further ado", "smash that like button".
- "Insane", "crazy", "epic", "you won't believe".
- "Back in the day", "olden times".
- Modern slang in the past - no "vibe", no "literally".

## Words I do use

- Opens on "You..." or a question that contains "you".
- "Here's the thing nobody on this trail knows yet."
- Day stamps: "Day 1.", "Day 12." - a clock the viewer can feel.
- Close: "Which life do you want to live next? Tell me in the comments."

## What I will not claim

- **Every number is sourced.** Each script ships with a sources list. When historians disagree,
  say so or use the more careful figure, and attribute it ("by the Park Service's estimate").
- No invented diary quotes. A quote from a real diary is named; anything else is narration.
- The POV character is a composite, and the video says so once, early.
- No game assets, logos or the game's exact screens. Referencing the game is fine; copying it is not.

## Hero character - Kit

Kit is the "You" in every video: one character who lives a new American life each episode. Code:
`.claude/youtube/pov/remotion/src/lib/Kit.tsx` (`<Kit outfit mood pose talking look size flip />`).

- **Never changes:** red scarf (brand red, tails always flapping), teal lock of hair over the
  forehead (visible under every hat), brass pocket watch on a chain, big eyes, freckles.
- **Changes per era:** hat, top, trousers, boots. Current outfits: `pioneer` (1850), `miner` (1925),
  `attendant` (1987 night shift), `recruit` (Navy, today), `plain`. Add a new outfit per new life.
- **Moods:** happy, determined, smirk, worried, shocked, sad. **Poses:** stand, walk, point, cheer.
- **On screen:** Kit appears in the hook and the payoff of every video and in every thumbnail.
  First-person shots (hands, cup) are still Kit's hands.
- **Tone:** Kit reacts to real history - shocked or sad at deaths, never smiling at a grave.
- **Name:** spoken only if the script needs it. On screen the narration stays "you".

## Default voiceover

ElevenLabs "Mike - 2D & 3D POV/Storytime" - voice_id `zfc8CJQpe8Kqyl0vvCzo`, speed 1.10,
stability 50%, similarity boost 75%. Same as the North Star channel.

## My format

- **Long-form:** 7 to 10 minutes, about 150 words per minute. **Shorts:** 3 cut from each long one.
- **Visuals:** 2D animated, first-person POV - the viewer's hands, the viewer's view. Simple
  characters, painted backgrounds, a day counter in the corner.
- **No intro, no channel branding at the start.** First frame is the hook.
- **Structure:** hook → the setup (who you are, what you have) → day-by-day beats with a clock →
  the "what you don't know yet" turn → payoff of the hook's question → one ask.
- **Title shape:** "POV: You [verb] [specific place/job] in [year]" - a number or date in every
  title.
