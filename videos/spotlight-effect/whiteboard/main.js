// Spotlight Effect · Whiteboard: page contract (film.js builds the board; engine/wb.js is the style's demo engine, ported to 9:16)
const mod = await import('./film.js');
await document.fonts.load('44px AD');
const F = await mod.build();
const ctx = document.getElementById('c').getContext('2d');
window.DUR = F.dur; window.EV = F.ev; window.SUBS_CUES = F.subs;
window.render = t => F.render(ctx, t);
window.READY = true;
