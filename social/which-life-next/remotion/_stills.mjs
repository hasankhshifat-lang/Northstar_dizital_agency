// node stills.mjs <bundleDir> <compId> <outDir> t1 t2 ...
import { renderStill, selectComposition } from "@remotion/renderer";
const [bundle, id, out, ...ts] = process.argv.slice(2);
const comp = await selectComposition({ serveUrl: bundle, id, inputProps: {} });
for (const t of ts) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(parseFloat(t) * 30));
  await renderStill({ composition: comp, serveUrl: bundle, output: `${out}/s_${String(t).padStart(5, "0")}.png`, frame, inputProps: {}, scale: 0.4 });
}
console.log("done");
