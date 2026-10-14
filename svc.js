/* same ad attribution as index.html: first-touch utm/click-id/referrer kept 30 days, appended to the bot /start parameter */
(()=>{const U=new URLSearchParams(location.search),cl=v=>(v||'').replace(/[^A-Za-z0-9]/g,'').slice(0,16);
  let src=cl(U.get('utm_source'));const cmp=cl(U.get('utm_campaign'));
  if(!src)src=U.get('fbclid')?'fbads':U.get('gclid')?'googleads':U.get('yclid')?'yaads':'';
  if(!src&&document.referrer){try{const h=new URL(document.referrer).hostname;if(!/inkside\.by$|github\.io$/.test(h))
    src='org'+(/instagram/.test(h)?'ig':/facebook|fb\./.test(h)?'fb':/google/.test(h)?'google':/yandex|ya\.ru/.test(h)?'ya':/tiktok/.test(h)?'tiktok':/vk\.com/.test(h)?'vk':/t\.me|telegram/.test(h)?'tg':'web')}catch(e){}}
  let a=src?src+(cmp?'-'+cmp:''):'';
  try{const s=JSON.parse(localStorage.getItem('attr')||'null');if(a)localStorage.setItem('attr',JSON.stringify({a,t:Date.now()}));else if(s&&Date.now()-s.t<30*864e5)a=s.a}catch(e){}
  if(a)document.querySelectorAll('a[href^="https://t.me/inkside_bot"]').forEach(l=>{const u=new URL(l.href);u.searchParams.set('start',(u.searchParams.get('start')||'site')+'_'+a);l.href=u.href})})();
