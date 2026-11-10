/* Плавающий календарь, как во всех порталах тренинга: Д1 = первый понедельник следующего месяца, пятидневка.
   [data-d="N"]  — рабочий день проекта N (отрицательный — до старта);
   [data-m="K"]  — последний день месяца через K месяцев после месяца закрытия проекта (Д120);
   data-f: "" → 09.06.2028 · "dn" → 09.06.2028 (Д94) · "long" → «09» июня 2028 г. · "y" → 2028 */
(()=>{
  const DAY=864e5,MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const dow=n=>(new Date(n*DAY).getUTCDay()+6)%7;
  const S0=(()=>{const n=new Date();let s=Math.round(Date.UTC(n.getFullYear(),n.getMonth()+1,1)/DAY);while(dow(s)!==0)s++;return s})();
  const wd=k=>{let t=S0;if(k>=1){let n=k-1;while(n>0){t++;if(dow(t)<5)n--}}else{let n=-k;while(n>0){t--;if(dow(t)<5)n--}}return t};
  const D=n=>new Date(n*DAY);
  const closeDn=wd((window.KM_PROJECT&&KM_PROJECT.close)||120);
  const mEnd=k=>{const d=D(closeDn);return Math.round(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+k+1,0)/DAY)};
  const p2=x=>String(x).padStart(2,'0');
  const fmt=n=>{const d=D(n);return p2(d.getUTCDate())+'.'+p2(d.getUTCMonth()+1)+'.'+d.getUTCFullYear()};
  const lng=n=>{const d=D(n);return '«'+p2(d.getUTCDate())+'» '+MON[d.getUTCMonth()]+' '+d.getUTCFullYear()+' г.'};
  const dnLabel=k=>'Д'+String(k).replace('-','−');
  const fill=root=>(root||document).querySelectorAll('[data-d],[data-m]').forEach(el=>{
    const n=el.dataset.m!=null?mEnd(+el.dataset.m):wd(+el.dataset.d),f=el.dataset.f||'';
    el.textContent=f==='long'?lng(n):f==='y'?String(D(n).getUTCFullYear()):f==='dn'?fmt(n)+' ('+dnLabel(el.dataset.d)+')':fmt(n);
  });
  window.KM_DATES={S0,wd,mEnd,closeDn,D,fmt,fill};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>fill());else fill();
})();
