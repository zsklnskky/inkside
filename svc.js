/* same ad attribution as index.html: first-touch utm/click-id/referrer kept 30 days, appended to the bot /start parameter */
(()=>{const U=new URLSearchParams(location.search),cl=v=>(v||'').replace(/[^A-Za-z0-9]/g,'').slice(0,16);
  let src=cl(U.get('utm_source'));const cmp=cl(U.get('utm_campaign'));
  if(!src)src=U.get('fbclid')?'fbads':U.get('gclid')?'googleads':U.get('yclid')?'yaads':'';
  if(!src&&document.referrer){try{const h=new URL(document.referrer).hostname;if(!/inkside\.by$|github\.io$/.test(h))
    src='org'+(/instagram/.test(h)?'ig':/facebook|fb\./.test(h)?'fb':/google/.test(h)?'google':/yandex|ya\.ru/.test(h)?'ya':/tiktok/.test(h)?'tiktok':/vk\.com/.test(h)?'vk':/t\.me|telegram/.test(h)?'tg':'web')}catch(e){}}
  let a=src?src+(cmp?'-'+cmp:''):'';
  try{const s=JSON.parse(localStorage.getItem('attr')||'null');if(a)localStorage.setItem('attr',JSON.stringify({a,t:Date.now()}));else if(s&&Date.now()-s.t<30*864e5)a=s.a}catch(e){}
  if(a)document.querySelectorAll('a[href^="https://t.me/inkside_bot"]').forEach(l=>{const u=new URL(l.href);u.searchParams.set('start',(u.searchParams.get('start')||'site')+'_'+a);l.href=u.href})})();

/* motion and live bits, same vocabulary as the main page */
(()=>{const $=(q,c=document)=>c.querySelector(q),$$=(q,c=document)=>[...c.querySelectorAll(q)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

  // mural behind everything: well after load, so its 150 KB never compete with the first screen; appears over the warm base
  const wall=$('.wall');addEventListener('load',()=>setTimeout(()=>wall.classList.add('on'),2500));

  // open / closed sign by Minsk time
  const sign=$('#openSign');if(sign){const h=+new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Minsk',hour:'2-digit',hour12:false}).format(new Date())%24,open=h>=11&&h<23;
    sign.classList.toggle('closed',!open);$('b',sign).textContent=open?'ОТКРЫТО':'ЗАКРЫТО';$('span',sign).textContent=open?'до 23:00':'откроемся в 11:00'}

  // fact numbers count up once visible ("8+" -> 0..8 then "+"; words stay as they are)
  const count=b=>{const m=b.textContent.match(/^(\d+)(.*)$/);if(!m||reduce)return;const n=+m[1],t0=performance.now();
    (function f(t){const k=Math.min(1,(t-t0)/1100),v=Math.round(n*(1-Math.pow(1-k,3)));b.textContent=v+m[2];if(k<1)requestAnimationFrame(f)})(t0)};

  // reveal on scroll
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(!x.isIntersecting)return;x.target.classList.add('in');io.unobserve(x.target);
    if(x.target.classList.contains('fact'))count($('b',x.target))}),{rootMargin:'0px 0px -8% 0px'});
  $$('.rv,h2.poster').forEach(el=>io.observe(el));

  // nav hides on scroll down; vinyl CTA steps aside at the final call; mural and hero photos drift
  const nav=$('.nav'),stamp=$('.stamp'),last=$('.last-card'),photos=$$('.hero-photos .polaroid');let y0=0,tick=0;
  addEventListener('scroll',()=>{if(tick)return;tick=requestAnimationFrame(()=>{tick=0;const y=scrollY;
    nav.classList.toggle('hide',y>y0&&y>400);y0=y;
    if(stamp&&last){const r=last.getBoundingClientRect();stamp.classList.toggle('is-hidden',r.top<innerHeight&&r.bottom>0)}
    if(!reduce){wall.style.transform=`translate3d(0,${-y*.04}px,0)`;if(y<innerHeight*1.2)photos.forEach((p,i)=>p.style.transform=`translate3d(0,${-y*[.12,.22,.06][i]}px,0)`)}})},{passive:true});

  if(!fine||reduce)return;
  // buttons: circle wipe from the cursor, magnets pull
  $$('.btn').forEach(b=>b.addEventListener('pointerenter',e=>{const r=b.getBoundingClientRect();b.style.setProperty('--bx',e.clientX-r.left+'px');b.style.setProperty('--by',e.clientY-r.top+'px')}));
  $$('.magnet').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.translate=`${(e.clientX-r.left-r.width/2)*.2}px ${(e.clientY-r.top-r.height/2)*.3}px`});b.addEventListener('pointerleave',()=>b.style.translate='')});
  // polaroids tilt toward the cursor
  $$('.pol,.rel,.master').forEach(t=>{t.addEventListener('pointermove',e=>{const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    t.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-6px)`});t.addEventListener('pointerleave',()=>t.style.transform='')});
})();
