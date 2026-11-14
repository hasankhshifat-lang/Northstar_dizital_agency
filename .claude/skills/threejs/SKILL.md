---
name: threejs
description: Build interactive 3D for the web with three.js (WebGL / WebGPU) and render it to MP4 or PNG headless. Use when the user asks for a three.js scene, 3D website hero, interactive 3D product viewer, WebGL/WebGPU effect, TSL shader, GLTF model viewer, 3D landing-page element, or a browser-rendered 3D clip for a video, Short or Reel. For offline photoreal renders use blender-3d-animation.
---

# three.js

three.js (https://github.com/mrdoob/three.js, MIT) is a JavaScript 3D library for the browser.
The repo has no Claude skill of its own. This skill is built on its **official LLM docs**,
copied from the repo at release **r187 (`three@0.187.0`)**:

- `references/llms.txt`: short rules and links. **Read it before writing three.js code.**
- `references/llms-full.txt`: the full reference (about 380 KB), including complete example scenes
  and the whole TSL (Three.js Shading Language) guide. Use `grep -n` to find a section and read
  only that part, e.g. `grep -n '^## ' references/llms-full.txt`.
- `references/LICENSE-threejs`: the three.js MIT license.

## 1. Rules from the official docs

- **Use an import map with ES modules.** Never use the old `<script src=".../three.min.js">` pattern.
  Pin an exact version:
  ```html
  <script type="importmap">
  { "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/" } }
  </script>
  <script type="module">
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  </script>
  ```
  In an npm project use `npm install three` and the same import paths.
- **WebGLRenderer** is the default because it runs in the most browsers. Use **WebGPURenderer**
  (`import * as THREE from 'three/webgpu'`, then `await renderer.init()`) only when you need TSL
  materials, compute shaders or node materials.
- With WebGPURenderer, write custom shaders in **TSL** (`three/tsl`) with `*NodeMaterial` classes,
  not raw GLSL strings or `onBeforeCompile`.
- Use `renderer.setAnimationLoop(fn)`, not a manual `requestAnimationFrame`.
- Addons (controls, loaders, post-processing) come from `three/addons/...`.

## 2. Start from the template

`templates/scene.html` is a working scene: renderer, environment lighting, shadows, OrbitControls,
and a resize handler. Copy it and replace the block marked `Scene content`. Keep the
**render contract** if the scene will be exported to video:

- every animation is a pure function of time inside `update(t)`, with no `Date.now()` or random
  values per frame (seed any randomness once);
- set `window.sceneReady = true` only after models, textures and fonts have loaded.

## 3. Render to PNG or MP4 (headless)

`scripts/render.mjs` opens the page in the preinstalled Playwright Chromium (software WebGL),
steps time frame by frame and pipes the frames to ffmpeg, so the output is smooth whatever the
render speed.

```bash
S=.claude/skills/threejs
# 1. still frame: check composition first
node $S/scripts/render.mjs scene.html still.png --w 1920 --h 1080 --t 2
# 2. quick preview (half size, 15 fps)
node $S/scripts/render.mjs scene.html preview.mp4 --w 1080 --h 1920 --seconds 6 --preview
# 3. final render
node $S/scripts/render.mjs scene.html final.mp4 --w 1080 --h 1920 --fps 30 --seconds 6
```

- 16:9 is `--w 1920 --h 1080`. Shorts and Reels (9:16) are `--w 1080 --h 1920`.
- Always look at the still (Read the PNG) and the preview before the full render.
- Rendering uses the CPU, so heavy scenes are slow at 1080p. Keep geometry and shadow-map sizes
  modest for video.
- The CDN must be reachable. To work offline, `npm install three@0.187.0` and point the import map
  at `node_modules/three/...`.
- Page errors are printed as `[page error]`. If the script times out waiting, `sceneReady` was
  never set or the module failed to load.

## 4. Use on websites and artifacts

For a site hero or a product viewer, drop the `capture` parts or keep them because they do nothing
in a normal browser. Cap the pixel ratio (`Math.min(devicePixelRatio, 2)`), dispose geometries and
materials you remove, and give a static fallback image for devices without WebGL.

## 5. Updating the docs

To refresh to a newer three.js release:
```bash
curl -sSL https://threejs.org/docs/llms.txt -o .claude/skills/threejs/references/llms.txt
curl -sSL https://threejs.org/docs/llms-full.txt -o .claude/skills/threejs/references/llms-full.txt
```
Then update the version in the import maps here, in `templates/scene.html`, and at the top of this file.
