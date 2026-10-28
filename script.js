const WA='8801872692783',EMAIL='contact@hasankhshifat.com';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// ElevenLabs conversational assistant widget — shared across every route.
const elevenWidget=document.createElement('elevenlabs-convai');
elevenWidget.setAttribute('agent-id','agent_5501m54wm9rwepdvpfff5t9thf92');
elevenWidget.setAttribute('variant','tiny');
elevenWidget.setAttribute('placement','bottom-right');
document.body.appendChild(elevenWidget);
const elevenScript=document.createElement('script');
elevenScript.src='https://unpkg.com/@elevenlabs/convai-widget-embed';
elevenScript.async=true;
elevenScript.type='text/javascript';
document.body.appendChild(elevenScript);
// only invite visitors to try the assistant once the widget has actually loaded
const tryIt=document.getElementById('try');
if(tryIt&&window.customElements)customElements.whenDefined('elevenlabs-convai').then(()=>tryIt.classList.add('on'));

// header: current page, scroll edge, mobile menu
const cur={'services.html':'/services','projects.html':'/projects','about.html':'/about'}[document.body.dataset.p];
if(cur)document.querySelectorAll(`#lk a[href="${cur}"]`).forEach(a=>a.setAttribute('aria-current','page'));
const yr=document.getElementById('yr');if(yr)yr.textContent=new Date().getFullYear();
const h=document.getElementById('hd'),bg=document.getElementById('bg'),lk=document.getElementById('lk');
const edge=()=>h.classList.toggle('s',scrollY>8);edge();addEventListener('scroll',edge,{passive:true});
const menu=o=>{lk.classList.toggle('o',o);bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Close menu':'Menu')};
bg.onclick=()=>menu(!lk.classList.contains('o'));
lk.addEventListener('click',e=>{if(e.target.closest('a'))menu(false)});
addEventListener('keydown',e=>{if(e.key=='Escape'&&lk.classList.contains('o')){menu(false);bg.focus()}});
addEventListener('click',e=>{if(lk.classList.contains('o')&&!h.contains(e.target))menu(false)});
matchMedia('(min-width: 901px)').addEventListener('change',e=>{if(e.matches)menu(false)});

// project filters
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-f]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});
document.querySelectorAll('[data-c]').forEach(c=>c.hidden=b.dataset.f!='all'&&c.dataset.c!=b.dataset.f)});
// a preview that fails to load keeps its frame and says so, instead of vanishing
document.querySelectorAll('.pj .im img,.frame img').forEach(i=>i.addEventListener('error',()=>{const s=document.createElement('span');s.className='mono nimg';s.textContent='Preview unavailable';i.replaceWith(s)}));

// example AI conversation: plays once when it scrolls into view; fully visible without JS or with reduced motion
const cl=document.getElementById('cl');
if(cl&&!reduce&&'IntersectionObserver'in window){const items=[...cl.children];cl.classList.add('run');items.forEach(li=>li.classList.add('h'));
const play=async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));await wait(500);
for(const li of items){if(li.classList.contains('a')||li.classList.contains('k')){const t=document.createElement('li');t.className='t';t.setAttribute('aria-hidden','true');t.innerHTML='<i></i><i></i><i></i>';t.style.top=li.offsetTop+'px';cl.append(t);await wait(li.classList.contains('k')?500:1100);t.remove()}
li.classList.remove('h');await wait(li.classList.contains('u')?900:600)}};
const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();play()}},{threshold:.5});io.observe(cl)}

// contact form
const f=document.getElementById('cf');
if(f){const pk=new URLSearchParams(location.search).get('package'),sel=document.getElementById('pkg');
if(sel&&pk&&[...sel.options].some(o=>o.value==pk)){sel.value=pk;const sv=f.elements.service;if(sv&&!sv.value)sv.value='Business Websites'}
f.onsubmit=async e=>{e.preventDefault();const s=document.getElementById('fs'),d=new FormData(f);let ok=true,first=null;
f.querySelectorAll('[required]').forEach(i=>{const er=i.parentElement.querySelector('.er');let m='';
if(!i.value.trim())m='This field is required.';else if(i.type=='email'&&!/^\S+@\S+\.\S+$/.test(i.value))m='Enter a valid email address, like name@example.com.';
i.setAttribute('aria-invalid',!!m);er.textContent=m;if(m){ok=false;first=first||i}});
if(!ok){first.focus();return}if(d.get('_honey'))return;
const b=f.querySelector('button');b.disabled=true;b.textContent='Sending…';s.className='';
try{const r=await fetch('https://formsubmit.co/ajax/'+EMAIL,{method:'POST',headers:{Accept:'application/json'},body:d});const j=await r.json();
if(r.ok&&String(j.success)=='true'){s.className='ok';s.textContent='Thanks, your inquiry was sent. We will reply with a practical next step.';f.reset()}else throw 0}
catch{s.className='bad';s.innerHTML=`Sorry, your inquiry could not be sent. Your details are still in the form. Please try again, or message us on <a href="https://wa.me/${WA}">WhatsApp</a>.`}
b.disabled=false;b.textContent='Send inquiry'}}
