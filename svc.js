/* same ad attribution as index.html: first-touch utm/click-id/referrer kept 30 days, appended to the bot /start parameter */
(()=>{const U=new URLSearchParams(location.search),cl=v=>(v||'').replace(/[^A-Za-z0-9]/g,'').slice(0,16);
  let src=cl(U.get('utm_source'));const cmp=cl(U.get('utm_campaign'));
  if(!src)src=U.get('fbclid')?'fbads':U.get('gclid')?'googleads':U.get('yclid')?'yaads':'';
  if(!src&&document.referrer){try{const h=new URL(document.referrer).hostname;if(!/inkside\.by$|github\.io$/.test(h))
    src='org'+(/instagram/.test(h)?'ig':/facebook|fb\./.test(h)?'fb':/google/.test(h)?'google':/yandex|ya\.ru/.test(h)?'ya':/tiktok/.test(h)?'tiktok':/vk\.com/.test(h)?'vk':/t\.me|telegram/.test(h)?'tg':'web')}catch(e){}}
  let a=src?src+(cmp?'-'+cmp:''):'';
  try{const s=JSON.parse(localStorage.getItem('attr')||'null');if(a)localStorage.setItem('attr',JSON.stringify({a,t:Date.now()}));else if(s&&Date.now()-s.t<30*864e5)a=s.a}catch(e){}
  if(a)document.querySelectorAll('a[href^="https://t.me/inkside_bot"]').forEach(l=>{const u=new URL(l.href);u.searchParams.set('start',(u.searchParams.get('start')||'site')+'_'+a);l.href=u.href})})();

/* consent-gated Meta Pixel: same key and bar as index.html ("consent" = yes / no), so a choice on any page applies everywhere */
(()=>{const PIXEL='3078632395869326',base=document.currentScript.src;
  const load=()=>{!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',PIXEL);fbq('track','PageView')};
  let c=null;try{c=localStorage.getItem('consent')}catch(e){}
  if(c==='yes')load();
  else if(!c){const b=document.createElement('div');b.className='cookie sheet';b.setAttribute('role','region');b.setAttribute('aria-label','Cookie');
    b.innerHTML='<p>Cookie для статистики. <a href="'+new URL('privacy.html',base).href+'">Подробнее</a></p><button class="btn sm" data-c="yes">Хорошо</button><button class="btn sm dark" data-c="no">Нет</button>';
    const show=()=>{if(b.isConnected)return;document.body.appendChild(b);requestAnimationFrame(()=>requestAnimationFrame(()=>b.classList.add('on')))};
    addEventListener('scroll',show,{once:true,passive:true});setTimeout(show,12000);b.onclick=e=>{const v=e.target.dataset.c;if(!v)return;try{localStorage.setItem('consent',v)}catch(x){}if(v==='yes')load();b.remove()}}
  // events: booking bot = InitiateCheckout; phone, Viber, Instagram Direct, personal Telegram = Contact
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href]');if(!a||!window.fbq)return;const h=a.href;
    if(h.startsWith('https://t.me/inkside_bot'))fbq('track','InitiateCheckout');
    else if(/^(tel:|viber:)|^https:\/\/(ig\.me\/|(www\.)?instagram\.com\/direct|t\.me\/)/.test(h))fbq('track','Contact')},true)})();

/* motion and live bits, same vocabulary as the main page */
(()=>{const $=(q,c=document)=>c.querySelector(q),$$=(q,c=document)=>[...c.querySelectorAll(q)],H=document.documentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches,lite=H.classList.contains('lite');
  const base=document.currentScript.src;

  // mural: a tiny blurred copy is in the CSS from the first paint; the full image fades over it once decoded, after load
  const wall=$('.wall');addEventListener('load',()=>{const im=new Image();im.src=new URL('img/'+(innerWidth<=900?'mural_tall_b':'mural_b')+'.webp',base).href;
    im.decode().then(()=>{wall.style.setProperty('--mural','url('+im.src+')');requestAnimationFrame(()=>wall.classList.add('on'))}).catch(()=>{})});

  // open / closed sign by Minsk time
  const sign=$('#openSign');if(sign){const h=+new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Minsk',hour:'2-digit',hour12:false}).format(new Date())%24,open=h>=11&&h<23;
    sign.classList.toggle('closed',!open);$('b',sign).textContent=open?'ОТКРЫТО':'ЗАКРЫТО';$('span',sign).textContent=open?'до 23:00':'откроемся в 11:00'}

  // calm background switch (footer), stored like on the main page
  const sw=$$('[data-calm]'),setSw=()=>sw.forEach(b=>b.setAttribute('aria-checked',H.classList.contains('calm')));setSw();
  sw.forEach(b=>b.addEventListener('click',()=>{const on=H.classList.toggle('calm');try{localStorage.setItem('inkside_calm',on?'1':'0')}catch(e){}setSw()}));

  // reveal on scroll; sections off screen pause their CSS loops
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(!x.isIntersecting)return;x.target.classList.add('in');io.unobserve(x.target)}),{rootMargin:'0px 0px -8% 0px'});
  $$('.rv,h2.poster').forEach(el=>io.observe(el));
  const idle=new IntersectionObserver(es=>es.forEach(x=>x.target.classList.toggle('off',!x.isIntersecting)));
  $$('main>section,main>header').forEach(el=>idle.observe(el));

  // lazy images fade in when they arrive
  $$('img[loading=lazy]').forEach(i=>{const ok=()=>i.classList.add('ok');i.complete?ok():(i.addEventListener('load',ok),i.addEventListener('error',ok))});

  // galleries: "Показать ещё" opens the rest
  $$('[data-more]').forEach(b=>b.addEventListener('click',()=>{$$('.cut',$('#'+b.dataset.more)).forEach(x=>{x.classList.remove('cut');x.classList.add('in')});b.setAttribute('aria-expanded','true');b.parentElement.remove()}));

  // related strip: ~22 px/s auto-scroll, pause button (WCAG 2.2.2), holds while touched, mouse drag with inertia (touch swipes natively)
  $$('.related').forEach(s=>{const g=$('.rl-g',s),b=$('.rl-pause',s),vp=$('.rl-vp',s),tr=$('.rl-track',s);if(!g||!b)return;
    const dur=()=>tr.style.setProperty('--rl-dur',Math.max(30,g.scrollWidth/22)+'s');dur();addEventListener('load',dur);
    const set=(p,save)=>{s.classList.toggle('paused',p);b.setAttribute('aria-pressed',p);b.setAttribute('aria-label',p?'Запустить прокрутку':'Остановить прокрутку');if(save)try{localStorage.setItem('ink.rl',p?'0':'1')}catch(e){}};
    let saved=null;try{saved=localStorage.getItem('ink.rl')}catch(e){}if(saved==='0')set(true);
    b.addEventListener('click',()=>set(!s.classList.contains('paused'),true));
    let t,x0,s0,lx,lt,v=0,moved=0;
    s.addEventListener('pointerdown',e=>{clearTimeout(t);s.classList.add('hold');if(e.pointerType!=='mouse'||e.button||!e.target.closest('.rl-vp'))return;
      x0=lx=e.clientX;s0=vp.scrollLeft;lt=e.timeStamp;moved=0;v=0;
      vp.onpointermove=m=>{const dx=m.clientX-x0;if(Math.abs(dx)>4&&!moved){moved=1;vp.setPointerCapture(m.pointerId)}v=(m.clientX-lx)/Math.max(1,m.timeStamp-lt);lx=m.clientX;lt=m.timeStamp;vp.scrollLeft=s0-dx}});
    ['pointerup','pointercancel'].forEach(ev=>s.addEventListener(ev,()=>{if(vp.onpointermove){vp.onpointermove=null;
        const glide=()=>{vp.scrollLeft-=v*16;v*=.92;if(Math.abs(v)>.05&&!reduce)requestAnimationFrame(glide)};if(moved)glide()}
      t=setTimeout(()=>s.classList.remove('hold'),1500)}));
    vp.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=0}},true);
    vp.addEventListener('dragstart',e=>e.preventDefault())});

  // nav hides on scroll down; vinyl CTA steps aside at the final call; mural drifts a little (not in lite)
  const nav=$('.nav'),stamp=$('.stamp'),last=$('.last-card');let y0=0,tick=0;
  addEventListener('scroll',()=>{if(tick)return;tick=requestAnimationFrame(()=>{tick=0;const y=scrollY;
    nav.classList.toggle('hide',y>y0&&y>400);y0=y;
    if(stamp&&last){const r=last.getBoundingClientRect();stamp.classList.toggle('is-hidden',r.top<innerHeight&&r.bottom>0)}
    if(!reduce&&!lite)wall.style.transform=`translate3d(0,${-y*.02}px,0)`})},{passive:true});

  // desktop: a click on the phone number also copies it, a toast with a timer bar confirms (as on the main page)
  if(fine)$$('a[href^="tel:"]').forEach(a=>a.addEventListener('click',()=>{const n=a.getAttribute('href').slice(4);
    navigator.clipboard&&navigator.clipboard.writeText(n).then(()=>{const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.innerHTML='<p></p><i></i>';
      $('p',d).textContent='Номер скопирован: '+n;document.body.appendChild(d);setTimeout(()=>d.classList.add('on'),20);
      $('i',d).onanimationend=()=>{d.classList.remove('on');setTimeout(()=>d.remove(),400)}}).catch(()=>{})}));

  if(!fine||reduce)return;
  // card spotlight (A4): one delegated listener, the card under the pointer gets --x/--y
  const SPOT='.rl,.kd,.tl-c,.vs-c,.sheet:not(.bar)';
  document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest(SPOT);if(!c)return;const r=c.getBoundingClientRect();
    c.style.setProperty('--x',e.clientX-r.left+'px');c.style.setProperty('--y',e.clientY-r.top+'px')},{passive:true});
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
      const o=$('#sum');if(sum!==shown&&!reduce){o.classList.remove('bump');void o.offsetWidth;o.classList.add('bump')}tween(o,shown,sum,x=>'от '+x+' BYN');shown=sum;$('#hrs').textContent=`≈ ${String(h).replace('.',',')} ч работы${v('size')===6?' за сеанс':''}`;
      const go=$('#calcGo');if(go){const ix=n=>$$(`[name=${n}]`,form).findIndex(x=>x.checked)+1,u=new URL(go.href),st=u.searchParams.get('start')||'';
        u.searchParams.set('start','c'+ix('size')+ix('kind')+ix('place')+st.replace(/^[^_]*/,''));go.href=u.href}};
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
  groups.filter=b=>{const f=b.dataset.f;$('#rzG').classList.toggle('f',f!=='all');$$('#rzG .mz').forEach(a=>a.classList.toggle('off',f!=='all'&&a.dataset.c!==f))};
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

  // /kontakty/: the Google map loads 1.2s after page load or on the first interaction (keeps the first paint light)
  const map=$('#map');if(map){const load=()=>{if(map.dataset.on)return;map.dataset.on=1;const f=document.createElement('iframe');
      f.title='Карта: Минск, пер. Макаёнка 4';f.src=map.dataset.src.replace(/&amp;/g,'&');f.referrerPolicy='no-referrer-when-downgrade';f.allowFullscreen=true;
      map.appendChild(f);setTimeout(()=>$('#mapFac')&&$('#mapFac').remove(),600);['scroll','pointerdown','keydown'].forEach(t=>removeEventListener(t,load))};
    $('#mapFac').addEventListener('click',load);['scroll','pointerdown','keydown'].forEach(t=>addEventListener(t,load,{once:true,passive:true}));addEventListener('load',()=>setTimeout(load,1200))}
})();
