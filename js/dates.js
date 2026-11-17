/* Календарь проекта: даты зафиксированы. Д1 = понедельник 07.12.2026.
   Рабочие дни — по производственному календарю РФ для пятидневной недели:
   праздники и переносы по ТК РФ (ст. 112) и постановлениям Правительства РФ № 1466 от 24.09.2025 и № 1187 от 17.09.2026.
   [data-d="N"]  — рабочий день проекта N (отрицательный — до старта);
   [data-m="K"]  — последний день месяца через K месяцев после месяца закрытия проекта (Д120);
   data-f: "" → 09.06.2027 · "dn" → 09.06.2027 (Д94) · "long" → «09» июня 2027 г. · "y" → 2027 */
(()=>{
  const DAY=864e5,MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const dn=s=>Math.round(Date.parse(s+'T00:00:00Z')/DAY);
  const S0=dn('2026-12-07');
  /* нерабочие праздничные и перенесённые выходные дни */
  const HOL=[
    '2026-11-04','2026-12-31',
    '2027-01-01','2027-01-04','2027-01-05','2027-01-06','2027-01-07','2027-01-08',
    '2027-02-22','2027-02-23','2027-03-08','2027-05-03','2027-05-10','2027-06-14',
    '2027-11-04','2027-11-05','2027-12-31'
  ];
  const WORK=['2027-02-20'];            /* рабочая суббота (перенос выходного на 22.02) */
  const H=new Set(HOL.map(dn)), W=new Set(WORK.map(dn));
  const dow=n=>(new Date(n*DAY).getUTCDay()+6)%7;
  const isWork=n=>W.has(n)||(dow(n)<5&&!H.has(n));
  const wd=k=>{let t=S0;if(k>=1){let n=k-1;while(n>0){t++;if(isWork(t))n--}}else{let n=-k;while(n>0){t--;if(isWork(t))n--}}return t};
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
  /* праздники внутри интервала рабочих дней проекта [a..b] — для подсказок и легенд */
  const holidaysIn=(a,b)=>HOL.map(dn).filter(n=>n>=wd(a)&&n<=wd(b)&&dow(n)<5);
  window.KM_DATES={S0,wd,mEnd,closeDn,D,fmt,fill,isWork,holidaysIn,CAL:'производственный календарь РФ, пятидневная неделя'};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>fill());else fill();
})();
