#!/usr/bin/env node
// Render a three.js page to MP4 or PNG, frame by frame, with headless Chromium.
//
// Usage:
//   node render.mjs <scene.html> <out.mp4|out.png> [--w 1920] [--h 1080]
//        [--fps 30] [--seconds 6] [--t 0] [--preview]
//
// The page must set window.sceneReady = true and define window.renderFrame(t)
// (see templates/scene.html). Output .png renders one still at --t seconds.
// --preview renders at half size and 15 fps for a quick check.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire( import.meta.url );
let chromium;
try { ( { chromium } = require( 'playwright' ) ); }
catch { ( { chromium } = require( '/opt/node22/lib/node_modules/playwright' ) ); }

const args = process.argv.slice( 2 );
const [ input, output ] = args.filter( ( a, i ) => ! a.startsWith( '--' ) && ! ( args[ i - 1 ] || '' ).match( /^--(w|h|fps|seconds|t)$/ ) );
const opt = ( name, def ) => { const i = args.indexOf( '--' + name ); return i >= 0 ? Number( args[ i + 1 ] ) : def; };
if ( ! input || ! output ) {
  console.error( 'usage: node render.mjs <scene.html> <out.mp4|out.png> [--w 1920 --h 1080 --fps 30 --seconds 6 --t 0 --preview]' );
  process.exit( 1 );
}
const preview = args.includes( '--preview' );
let W = opt( 'w', 1920 ), H = opt( 'h', 1080 ), fps = opt( 'fps', 30 );
const seconds = opt( 'seconds', 6 ), stillT = opt( 't', 0 );
if ( preview ) { W = Math.round( W / 2 / 2 ) * 2; H = Math.round( H / 2 / 2 ) * 2; fps = 15; }

const browser = await chromium.launch( {
  args: [ '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist' ],
} );
const page = await browser.newPage( { viewport: { width: W, height: H }, deviceScaleFactor: 1 } );
page.on( 'console', ( m ) => { if ( m.type() === 'error' ) console.error( '[page]', m.text() ); } );
page.on( 'pageerror', ( e ) => console.error( '[page error]', e.message ) );

const url = pathToFileURL( resolve( input ) ).href + `?capture=1&w=${W}&h=${H}`;
await page.goto( url );
await page.waitForFunction( () => window.sceneReady === true && typeof window.renderFrame === 'function', null, { timeout: 120000 } );
const canvas = await page.$( 'canvas' );

const shoot = async ( t ) => {
  await page.evaluate( ( tt ) => window.renderFrame( tt ), t );
  return canvas.screenshot( { type: 'png' } );
};

if ( output.toLowerCase().endsWith( '.png' ) ) {
  const fs = await import( 'node:fs' );
  fs.writeFileSync( output, await shoot( stillT ) );
  console.log( `wrote ${output} (${W}x${H}, t=${stillT}s)` );
} else {
  const total = Math.round( seconds * fps );
  const ff = spawn( 'ffmpeg', [ '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String( fps ), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', preview ? '28' : '18', '-preset', preview ? 'veryfast' : 'slow',
    '-movflags', '+faststart', output ], { stdio: [ 'pipe', 'inherit', 'inherit' ] } );
  const done = new Promise( ( ok, fail ) => ff.on( 'close', ( c ) => c === 0 ? ok() : fail( new Error( 'ffmpeg exit ' + c ) ) ) );
  for ( let i = 0; i < total; i ++ ) {
    const buf = await shoot( i / fps );
    if ( ! ff.stdin.write( buf ) ) await new Promise( ( r ) => ff.stdin.once( 'drain', r ) );
    if ( i % fps === 0 ) process.stdout.write( `\rframe ${i + 1}/${total}` );
  }
  ff.stdin.end();
  await done;
  console.log( `\nwrote ${output} (${W}x${H}, ${fps} fps, ${seconds}s)` );
}
await browser.close();
