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

  // reveal on scroll
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(!x.isIntersecting)return;x.target.classList.add('in');io.unobserve(x.target)}),{rootMargin:'0px 0px -8% 0px'});
  $$('.rv,h2.poster').forEach(el=>io.observe(el));

  // nav hides on scroll down; vinyl CTA steps aside at the final call; mural drifts
  const nav=$('.nav'),stamp=$('.stamp'),last=$('.last-card');let y0=0,tick=0;
  addEventListener('scroll',()=>{if(tick)return;tick=requestAnimationFrame(()=>{tick=0;const y=scrollY;
    nav.classList.toggle('hide',y>y0&&y>400);y0=y;
    if(stamp&&last){const r=last.getBoundingClientRect();stamp.classList.toggle('is-hidden',r.top<innerHeight&&r.bottom>0)}
    if(!reduce)wall.style.transform=`translate3d(0,${-y*.04}px,0)`})},{passive:true});

  if(!fine||reduce)return;
  // buttons: circle wipe from the cursor, magnets pull
  $$('.btn').forEach(b=>b.addEventListener('pointerenter',e=>{const r=b.getBoundingClientRect();b.style.setProperty('--bx',e.clientX-r.left+'px');b.style.setProperty('--by',e.clientY-r.top+'px')}));
  $$('.magnet').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.translate=`${(e.clientX-r.left-r.width/2)*.2}px ${(e.clientY-r.top-r.height/2)*.3}px`});b.addEventListener('pointerleave',()=>b.style.translate='')});
  // polaroids tilt toward the cursor
  $$('.pol').forEach(t=>{t.addEventListener('pointermove',e=>{const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    t.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-6px)`});t.addEventListener('pointerleave',()=>t.style.transform='')});
})();

/* page centerpieces (each block runs only if its markup is on the page) */
(()=>{const $=(q,c=document)=>c.querySelector(q),$$=(q,c=document)=>[...c.querySelectorAll(q)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const store={get(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
  const tween=(el,from,to,fmt)=>{if(reduce||from===to){el.textContent=fmt(to);return}const t0=performance.now();
    (function f(t){const k=Math.min(1,(t-t0)/600),v=from+(to-from)*(1-Math.pow(1-k,3));el.textContent=fmt(k<1?Math.round(v/10)*10:to);if(k<1)requestAnimationFrame(f)})(t0)};

  // tabs: click + arrow keys (data-tabs lists)
  $$('[data-tabs]').forEach(list=>{const tabs=$$('[role=tab]',list);
    const sel=t=>{tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;$('#'+x.getAttribute('aria-controls')).hidden=!on});list.dispatchEvent(new CustomEvent('tab',{detail:t}))};
    tabs.forEach((t,i)=>{t.addEventListener('click',()=>sel(t));t.addEventListener('keydown',e=>{const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];
      if(d){e.preventDefault();const n=tabs[(i+d+tabs.length)%tabs.length];n.focus();sel(n)}})});
    list._sel=sel});

  // single-choice chips (aria-pressed); each group reacts by its data-group name
  const groups={};
  $$('[data-group]').forEach(g=>{const bs=$$('button',g);const pick=b=>{bs.forEach(x=>x.setAttribute('aria-pressed',x===b));groups[g.dataset.group]&&groups[g.dataset.group](b)};
    bs.forEach(b=>b.addEventListener('click',()=>pick(b)));g._pick=pick});
  const init=name=>{const g=$(`[data-group="${name}"]`);if(!g)return;const b=$('[aria-pressed=true]',g);if(b)groups[name](b)};

  // /ceny/: calculator, same formula as the main page; sleeve/leg = one ~6 h session
  const form=$('#calc');if(form){let shown=180;const v=n=>+$(`[name=${n}]:checked`,form).value;
    const calc=()=>{const h=v('size')===6?6:Math.max(1,Math.round(v('size')*v('kind')*v('place')*2)/2),sum=180+Math.ceil(h-1)*150;
      tween($('#sum'),shown,sum,x=>'от '+x+' BYN');shown=sum;$('#hrs').textContent=`≈ ${String(h).replace('.',',')} ч работы${v('size')===6?' за сеанс':''}`};
    form.addEventListener('change',calc);form.addEventListener('submit',e=>e.preventDefault());calc()}

  // /uhod-za-tatu/: the line fills while the timeline passes the middle of the screen
  const tl=$('#tl');if(tl){const items=$$('.tl-i',tl);let tk=0;const upd=()=>{tk=0;const r=tl.getBoundingClientRect(),mid=innerHeight*.6;
      const p=Math.min(1,Math.max(0,(mid-r.top)/r.height));tl.style.setProperty('--p',reduce?1:p);
      items.forEach(i=>i.classList.toggle('on',reduce||i.getBoundingClientRect().top<mid))};
    addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(upd)},{passive:true});upd()}

  // /bolno-li-delat-tatu/: zone -> meter
  const LV=['','терпимо','средне','чувствительно','сильнее всего'];
  groups.pain=b=>{const l=+b.dataset.l,m=$('.meter');m.className='meter sheet l'+l;$$('.mt i',m).forEach((x,i)=>x.classList.toggle('f',i<l));
    $('#zName').textContent=$('span',b).textContent;$('#zLvl').textContent=LV[l];$('#zNote').textContent=b.dataset.n;
    $$('.hs').forEach(h=>h.classList.toggle('on',h.dataset.z===b.dataset.z))};
  $$('.hs').forEach(h=>h.addEventListener('click',()=>{const g=$('[data-group=pain]');g._pick($(`button[data-z="${h.dataset.z}"]`,g))}));
  init('pain');

  // /pervaya-tatu/: steps with ticks kept in this browser
  const rail=$('.pv-rail');if(rail){const boxes=$$('[data-step]'),done=new Set(store.get('pv')||[]);
    const draw=()=>{boxes.forEach(b=>{b.checked=done.has(+b.dataset.step);$('#t-s'+b.dataset.step).classList.toggle('done',b.checked)});
      $('#pvN').textContent=done.size;$('.pv-prog').style.setProperty('--k',done.size/boxes.length)};
    boxes.forEach(b=>b.addEventListener('change',()=>{b.checked?done.add(+b.dataset.step):done.delete(+b.dataset.step);store.set('pv',[...done]);draw()}));
    $$('[data-next]').forEach(b=>b.addEventListener('click',()=>{const t=$('#t-s'+b.dataset.next);rail._sel(t);t.focus();if(innerWidth<900)t.scrollIntoView({block:'nearest',inline:'center',behavior:reduce?'auto':'smooth'})}));
    draw()}

  // /mastera/: style -> master
  groups.master=b=>{const m=b.dataset.m,ps=$$('.ms-p');ps.forEach(p=>{p.classList.toggle('hl',m==='b'||p.dataset.m===m);p.classList.toggle('dim',m!=='b'&&p.dataset.m!==m)});
    $('#msOut').textContent=b.textContent+': '+(m==='n'?'к Надежде.':m==='v'?'к Виталию.':'делают оба мастера.')};

  // /realizm/: filter + lightbox
  groups.filter=b=>{const f=b.dataset.f;$$('#rzG .mz').forEach(a=>a.classList.toggle('off',f!=='all'&&a.dataset.c!==f))};
  const lbx=$('#lbx');if(lbx){const im=$('img',lbx);$$('[data-lb]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();im.src=a.href;im.alt=$('img',a).alt;lbx.showModal()}));
    $('.lbx-x',lbx).onclick=()=>lbx.close();lbx.addEventListener('click',e=>{if(e.target===lbx)lbx.close()})}

  // /cvetnoy-realizm/: carousel arrows
  const car=$('#car');if(car)$$('[data-car]').forEach(b=>b.addEventListener('click',()=>car.scrollBy({left:+b.dataset.car*($('.cs',car).offsetWidth+20),behavior:reduce?'auto':'smooth'})));

  // /korrekciya-tatu/: before / after
  const ba=$('#ba');if(ba){const r=$('input',ba);r.addEventListener('input',()=>ba.style.setProperty('--x',r.value+'%'))}

  // /portret-tatu/: flip the polaroid stack
  const stack=$('#stack');if(stack){let busy=0;$('#stackNext').addEventListener('click',()=>{if(busy)return;const top=stack.firstElementChild;busy=1;top.classList.add('fly');
    setTimeout(()=>{stack.appendChild(top);top.classList.remove('fly');$$('.st',stack).forEach((s,i)=>s.style.setProperty('--k',i));busy=0},reduce?0:420)})}

  // /rukav/: horizontal strip pinned while scrolling (wide screens with motion); otherwise a swipe row
  const pin=$('#rkPin');if(pin&&!reduce&&innerWidth>900){const tr=$('#rkTrack');pin.classList.add('pinned');let tk=0,dist=0;
    const size=()=>{dist=Math.max(0,tr.scrollWidth-innerWidth);pin.style.height=dist+innerHeight+'px'};
    const upd=()=>{tk=0;const y=Math.min(dist,Math.max(0,-pin.getBoundingClientRect().top));tr.style.transform=`translate3d(${-y}px,0,0)`};
    size();addEventListener('resize',size);addEventListener('load',size);addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(upd)},{passive:true});upd()}

  // /mini-tatu/: size ruler
  const cm=$('#cm');if(cm){const ru=$('#ruler'),set=()=>{const n=+cm.value;ru.style.setProperty('--cm',n);$('#cmOut').textContent=n;
      $('#tierP').textContent=n<=5?'от 180 BYN':'от 330 BYN';$('#tierT').textContent=n<=5?'до 5 см, до 1 часа работы':'тату 5-10 см'};cm.addEventListener('input',set);set()}

  // /sertifikat/: amount chips -> card, what it covers by the price list
  const gs=$('#gfSum');if(gs){let cur=300;
    groups.gift=b=>{const a=+b.dataset.sum;gs.classList.remove('bump');void gs.offsetWidth;gs.classList.add('bump');
      if(a){tween(gs,cur,a,x=>x+' BYN');cur=a}else gs.textContent='любая сумма';
      $('#gfCov').textContent=!a?'то, что выберет человек: мини до 5 см - от 180 BYN':a>=930?'сеанс на рукав или ногу (от 930 BYN)':a>=480?'тату 10-20 см (от 480 BYN)':a>=330?'тату 5-10 см (от 330 BYN)':'мини до 5 см (от 180 BYN)'};
    const card=$('#gcard');if(fine&&!reduce){card.parentElement.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.setProperty('--rx',x*22+'deg');card.style.setProperty('--ry',-y*16+'deg');card.style.setProperty('--gx',x*60+'%')});
      card.parentElement.addEventListener('pointerleave',()=>['--rx','--ry','--gx'].forEach(p=>card.style.removeProperty(p)))}}

  // /kontakty/: the Google map loads on the first interaction (keeps the first screen light)
  const map=$('#map');if(map){const load=()=>{if(map.dataset.on)return;map.dataset.on=1;const f=document.createElement('iframe');
      f.title='Карта: Минск, пер. Макаёнка 4';f.src=map.dataset.src.replace(/&amp;/g,'&');f.referrerPolicy='no-referrer-when-downgrade';f.allowFullscreen=true;
      map.appendChild(f);setTimeout(()=>$('#mapFac')&&$('#mapFac').remove(),600);['scroll','pointerdown','keydown'].forEach(t=>removeEventListener(t,load))};
    $('#mapFac').addEventListener('click',load);['scroll','pointerdown','keydown'].forEach(t=>addEventListener(t,load,{once:true,passive:true}))}
})();
