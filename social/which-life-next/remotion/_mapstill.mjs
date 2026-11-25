import { renderStill, selectComposition } from "@remotion/renderer";
const [id, t, out] = process.argv.slice(2);
const c = await selectComposition({ serveUrl: "/tmp/tkb", id, inputProps: { clean: true } });
await renderStill({ composition: c, serveUrl: "/tmp/tkb", output: out, frame: Math.round(parseFloat(t) * 30), imageFormat: "png", inputProps: { clean: true } });
