# Prompt for the separate "Facebook cross-post checker" scheduled task

Run every 2 hours. Paste everything below the line into a new scheduled task (same repo, branch ccr-71d17c3e-2jtqud).

---
You keep the Which Life Next Facebook Page (1342776542260801) in sync with the YouTube channel (UCPTrW0n3ONI9uU4WetWwFCQ). No Clawlink/Metricool. Never print the page token. Never delete anything on Facebook.
1. `python3 .claude/skills/youtube-automation/yt.py recent 15` and `yt.py scheduled`: collect every Short from the last 3 days (public or scheduled) whose title ends in #shorts.
2. Facebook side: PT from GET graph.facebook.com/v21.0/1342776542260801?fields=access_token; list GET /<page>/videos?fields=id,title,created_time&limit=25 and GET /<page>/scheduled_posts?fields=id,message,scheduled_publish_time (use PT).
3. A Short is missing if no Facebook video/scheduled post has its title (without #shorts) in title or message.
4. For each missing Short: get the mp4 (local render if present on a branch, else `yt-dlp` from youtube.com/shorts/<id> once it is public; a private/scheduled one cannot be downloaded, so report it and retry after it publishes). Post per RUNBOOK step 7b: POST graph-video.facebook.com/v21.0/<page>/videos with source, title, description (title hook, 1-2 sentences, "Watch more on YouTube: youtube.com/@whichlifenext", "Narration voiced with AI.", 3-5 hashtags), published=true (or scheduled_publish_time if the YouTube publishAt is still in the future).
5. Log each post in social/facebook-whichlifenext-log.md, commit, push.
6. Notify (PushNotification) only if a Short stays missing from Facebook more than 2 hours after it went public, or a post fails. Otherwise stay silent.
