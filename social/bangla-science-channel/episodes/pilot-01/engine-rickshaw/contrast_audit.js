// node contrast_audit.js html out.json : every visible <text> at sampled times, with its fill and screen box
const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const [,,html,out]=process.argv; const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
 await p.goto('file://'+html); await p.evaluate(()=>document.fonts.ready); const res=[];
 for(let T=9;T<117;T+=0.5){ await p.evaluate(T=>window.render(T),T);
  const items=await p.evaluate(()=>[...document.querySelectorAll('text')].map(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
    return {txt:e.textContent.trim(), fill:cs.fill, x:r.x,y:r.y,w:r.width,h:r.height, vis:r.width>4&&r.height>4&&e.checkVisibility({opacityProperty:true,visibilityProperty:true})};}).filter(o=>o.vis&&o.txt&&o.x>-50&&o.y>-50&&o.x<1080&&o.y<1920));
  if(items.length){ const shot=`ca_${T}.png`; await p.screenshot({path:shot}); res.push({T,shot,items}); } }
 fs.writeFileSync(out,JSON.stringify(res)); await b.close(); })();
