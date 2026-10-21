const WA='8801872692783',EMAIL='contact@hasankhshifat.com';
const P=[['index.html','/','Home'],['services.html','/services','Services'],['projects.html','/projects','Projects'],['about.html','/about','About'],['contact.html','/contact','Contact']];
const cur=document.body.dataset.p;
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
document.getElementById('hd').innerHTML=`<div class="wrap nav"><a href="/" aria-label="Northstar Dizital AI home"><img src="/assets/logo.png" alt="Northstar Dizital" width="220" height="30"></a>
<nav aria-label="Main"><div class="links" id="lk">${P.slice(1).map(p=>`<a href="${p[1]}" ${cur===p[0]?'aria-current="page"':''}>${p[2]}</a>`).join('')}<a href="/#pricing">Pricing</a><a href="/#approach">Approach</a><a href="/services#faq">FAQ</a></div></nav>
<a class="btn w nc" href="/contact">Start a Project ↗</a><button class="burger" id="bg" aria-label="Menu" aria-expanded="false" aria-controls="lk">☰</button></div>`;
document.getElementById('ft').innerHTML=`<div class="wrap"><div class="fg"><div><img src="/assets/logo.png" alt="Northstar Dizital" width="220" height="30"><p>Creative design, modern web development and practical AI solutions for small businesses and independent professionals.</p></div>
<div><h4>Pages</h4>${P.map(p=>`<a href="${p[1]}">${p[2]}</a>`).join('')}</div>
<div><h4>Services</h4><a href="/services">Website Design</a><a href="/services">UI/UX Design</a><a href="/services">AI Solutions</a><a href="/services">Maintenance</a></div>
<div><h4>Contact</h4><a href="https://wa.me/${WA}">WhatsApp +${WA}</a><a href="mailto:${EMAIL}">${EMAIL}</a></div></div>
<div class="cp">© ${new Date().getFullYear()} Northstar Dizital AI. All rights reserved.</div></div>`;
const h=document.getElementById('hd'),bg=document.getElementById('bg'),lk=document.getElementById('lk');
addEventListener('scroll',()=>h.classList.toggle('s',scrollY>20),{passive:true});
bg.onclick=()=>{const o=lk.classList.toggle('o');bg.setAttribute('aria-expanded',o)};
lk.onclick=e=>{if(e.target.tagName=='A')lk.classList.remove('o')};
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.12});
document.querySelectorAll('.rv').forEach(e=>io.observe(e));
// project filters
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('on',x===b));
document.querySelectorAll('[data-c]').forEach(c=>c.hidden=b.dataset.f!='all'&&c.dataset.c!=b.dataset.f)});
document.querySelectorAll('.im img').forEach(i=>i.onerror=()=>i.remove());
// contact form
const f=document.getElementById('cf');
if(f){f.onsubmit=async e=>{e.preventDefault();const s=document.getElementById('fs'),d=new FormData(f);let ok=true;
f.querySelectorAll('[required]').forEach(i=>{const er=i.parentElement.querySelector('.er');let m='';
if(!i.value.trim())m='This field is required.';else if(i.type=='email'&&!/^\S+@\S+\.\S+$/.test(i.value))m='Enter a valid email address.';
i.setAttribute('aria-invalid',!!m);er.textContent=m;if(m)ok=false});
if(!ok||d.get('_honey'))return;
const b=f.querySelector('button');b.disabled=true;b.textContent='Sending…';s.className='';
try{const r=await fetch('https://formsubmit.co/ajax/'+EMAIL,{method:'POST',headers:{Accept:'application/json'},body:d});const j=await r.json();
if(r.ok&&String(j.success)=='true'){s.className='ok';s.textContent='Thanks! Your inquiry was sent. We will reply soon.';f.reset()}else throw 0}
catch{s.className='bad';s.innerHTML=`Sorry, we could not send your inquiry. Please message us on <a href="https://wa.me/${WA}"><u>WhatsApp</u></a> instead.`}
b.disabled=false;b.textContent='Send Inquiry'}}
// floating particles (head stays still)
const fc=document.getElementById('face');
if(fc){const C=['#FF8A2B','#D8B8A0','#EC3FA0','#7B3FE4','#FFD23F','#2B8CFF','#1FB863'];
for(let i=0;i<(innerWidth<760?14:22);i++){const p=document.createElement('span'),sz=6+Math.random()*16,tri=i%3==0;p.className='pt';p.setAttribute('aria-hidden','true');
p.style.cssText=`left:${Math.random()*96}%;top:${Math.random()*92}%;width:${sz}px;height:${sz}px;background:${C[i%7]};${tri?'clip-path:polygon(50% 0,100% 100%,0 100%);':'border-radius:50%;'}--dx:${(Math.random()-.5)*40}px;--dy:${(Math.random()-.5)*50}px;--r:${(Math.random()-.5)*120}deg;animation-duration:${9+Math.random()*9}s;animation-delay:-${Math.random()*10}s`;fc.appendChild(p)}}
