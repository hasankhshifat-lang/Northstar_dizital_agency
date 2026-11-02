# Northstar Digital Agency — Claude instructions

## YouTube scheduled posts: rotate Clawlink and Metricool

Every YouTube post that is scheduled goes through **one** of two tools, taking turns:

1. Open `social/youtube-schedule-log.md` and check the last row's **Tool**.
2. Use the other tool for this post. If the log is empty, start with **Clawlink**.
3. Schedule the post with that tool:
   - **Clawlink**: `clawlink_execute` with integration `youtube`, action `multipart_upload_video`.
     Set `status.privacyStatus: "private"` and `status.publishAt` to the scheduled time
     (ISO 8601 / RFC 3339, UTC). YouTube makes the video public at that time.
   - **Metricool**: `createScheduledPost` with brand `7727550` (YouTube channel
     `UCPTrW0n3ONI9uU4WetWwFCQ`), timezone `Asia/Singapore`. The video must be at a public URL.
4. Add a row to the log (date scheduled, publish time, title, tool, post/video ID), then commit and push.
5. If the tool whose turn it is fails, or is not connected, say so before using the other one.
   Log the tool that was actually used, so the next post goes to the other tool.

Confirm the title, description, publish time, and video file with the user before scheduling.

## YouTube analysis: use vidIQ

For any YouTube analysis (channel or video performance, keyword and topic research, competitor
channels, titles, tags, best posting times, outlier videos), use the **vidIQ** connector first.
- Fall back to YouTube Analytics through Clawlink (`youtube` / `query_analytics`), or Metricool
  analytics, only when vidIQ is not connected or has no tool for the question. Say which source
  was used.
- If vidIQ is not connected, tell the user it needs to be authorized in claude.ai connector
  settings before using a fallback.

## YouTube video creation: pop-up for historical figures and places

When making a video for the YouTube channel, every time the voice-over names a historical
figure or a historical place or structure (a fort, trail, landmark, building, bridge, ship,
battlefield, and so on), show a real image of it in a pop-up in one corner of the video.

1. **Find the mentions.** Go through the final script and list each historical figure, place
   or structure it names. Get word-level timestamps for the voice-over (for example ElevenLabs
   `creative_transcribe_audio`) so each pop-up can start on the word where the name is spoken.
2. **Use the exact face or place.** Use a real photograph, painting or engraving of that person
   or place, never an AI-generated or look-alike image. Prefer public-domain or freely licensed
   sources: Wikimedia Commons, the Library of Congress, the National Archives, Smithsonian, and
   similar archives. If no authentic portrait of a person exists, use the best-known historical
   portrait and caption it "Portrait"; if there is no authentic image at all, skip the pop-up and
   tell the user which mention was skipped.
3. **Pop-up style.**
   - Where: the top-left corner for Shorts (9:16), clear of the YouTube buttons on the right and
     the title area at the bottom (about 220 px from the top and 60 px from the left at
     1080×1920). The top-right corner for long videos (16:9).
   - Size: about 30% of the frame width for Shorts and 22% for long videos. Rounded corners, a
     thin white border and a soft shadow.
   - Label: a name strip under the image with the name and years, for example
     "Brigham Young (1801–1877)" or "Fort Laramie, 1834".
   - Timing: pop in (quick scale-up, about 250 ms) on the first word of the name, stay on screen
     for 3 to 5 seconds, then pop out. Show it again if the name comes back later in the video.
     When two names come close together, replace the first pop-up with the second.
   - Do not cover burned-in captions or the main subject of the shot.
4. **Keep a source list.** Save the images and a `sources.md` in
   `social/video-assets/<video-slug>/`, with one row per pop-up: name, timestamp, image file,
   source URL and license. Commit and push it with the rest of the video work.
5. **Confirm before rendering.** Show the user the list of mentions, the image chosen for each
   and the timestamps, and render only after they approve it.
