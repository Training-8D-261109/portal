/* Шапка портала проекта: одна на всех страницах. Кнопки документов окрашены в цвет их страниц.
   Закрытые разделы (ещё не выданы студентам) показаны с замком и ведут на страницу-заглушку soon.html. */
(()=>{
const LOGO='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMxZjVmNDUiLz48cGF0aCBkPSJNMTAgMzZjNC05IDEwLTEzIDE0LTEzIDMgMCA0IDMgNiAzczMtMyA2LTNjNCAwIDEwIDQgMTggMTMiIGZpbGw9IiM3ZmM3OWEiLz48Y2lyY2xlIGN4PSIyNCIgY3k9IjI3IiByPSIyLjYiIGZpbGw9IiMxMzI0MWIiLz48Y2lyY2xlIGN4PSIzNiIgY3k9IjI3IiByPSIyLjYiIGZpbGw9IiMxMzI0MWIiLz48cGF0aCBkPSJNNiAzOGM0IDAgNCAzIDggM3M0LTMgOC0zIDQgMyA4IDMgNC0zIDgtMyA0IDMgOCAzIDQtMyA4LTMgNCAzIDQgM3Y5SDZ6IiBmaWxsPSIjM2I4ZmM5Ii8+PHBhdGggZD0iTTYgNDZjNCAwIDQgMyA4IDNzNC0zIDgtMyA0IDMgOCAzIDQtMyA4LTMgNCAzIDggMyA0LTMgOC0zIDQgMyA0IDMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2E5ZDZmMiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4K';
const P=KM_PROJECT;
const LOCK='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 7V5a4 4 0 1 1 8 0v2h1v8H3V7h1zm2 0h4V5a2 2 0 1 0-4 0v2z"/></svg>';
const NAV=[
  {k:'gantt',color:'серый',t:'Гант',lock:1,hint:'ИСР, диаграмма Ганта, вехи и критический путь'},
  {k:'charter',href:'index.html',t:'Устав',hint:P.charter.hint||('Устав проекта v'+P.charter.v+' · '+P.charter.st.toLowerCase())},
  {k:'bc',href:'business-case.html',t:'Бизнес-кейс',hint:'Business Case и Benefits Management Plan'},
  {k:'sh',color:'голубой',t:'Стейкхолдеры',lock:1,hint:'Реестр стейкхолдеров, матрица влияния и интереса'},
  {k:'comms',color:'жёлтый',t:'Коммуникации',lock:1,hint:'План коммуникаций и RACI'},
  {k:'risks',color:'чёрный',t:'Риски',lock:1,hint:'Реестр рисков, журнал проблем, резервы'},
  {k:'pmo',color:'белый',t:'Сводка PMO',lock:1,hint:'Светофоры и сводка для проектного офиса'}
];
NAV.forEach(n=>{if(n.lock)n.href='soon.html#'+n.k});
window.KM_NAV=NAV;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CSS=`
:host{
  --bar:#ffffff; --bar-line:#d9dde6; --ink:#1a2130; --ink-2:#5d6676; --ink-3:#8a92a1; --focus:#2f5bd3;
  --red:#d13b3b; --amber:#e0a106; --green:#2e9e5b;
  --pop:#ffffff; --pop-line:#d9dde6; --pop-shadow:0 14px 40px rgb(16 22 36 / .18);
  --gantt-bg:#eef0f4; --gantt-fg:#2a3140;
  --charter-bg:#f6dedb; --charter-fg:#a3302b;
  --bc-bg:#dbeedd; --bc-fg:#22703f;
  --sh-bg:#e3ebf7; --sh-fg:#2f4fc4;
  --comms-bg:#f8eec4; --comms-fg:#7a560a;
  --risks-bg:#2b2b31; --risks-fg:#f2f1f5;
  --pmo-bg:#ffffff; --pmo-fg:#1a2130;
  --goal-bg:#eaf0fd; --goal-line:#c9d6f6; --goal-ink:#1f3a8a; --goal-ink-2:#3f5694;
  --f:"IBM Plex Sans",-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
  display:block; font:13px/1.4 var(--f); color:var(--ink);
}
:host([bleed]){margin:-18px calc(-1 * max(16px, env(safe-area-inset-right,0px))) 18px calc(-1 * max(16px, env(safe-area-inset-left,0px)))}
@media (prefers-color-scheme:dark){:host(:not([theme="light"])){
  --bar:#161a21; --bar-line:#2c323e; --ink:#e6e9ef; --ink-2:#9aa3b3; --ink-3:#6e7787; --focus:#6189f0;
  --red:#f0625b; --amber:#f0b429; --green:#4fbf7f;
  --pop:#1c212a; --pop-line:#353c4a; --pop-shadow:0 14px 40px rgb(0 0 0 / .55);
  --gantt-bg:#232933; --gantt-fg:#cdd3de;
  --charter-bg:#3a1c19; --charter-fg:#f0897f;
  --bc-bg:#183020; --bc-fg:#7fd39b;
  --sh-bg:#1b2742; --sh-fg:#9db2ff;
  --comms-bg:#352d12; --comms-fg:#e2bb52;
  --risks-bg:#050507; --risks-fg:#ecebf0;
  --pmo-bg:#161a21; --pmo-fg:#e6e9ef;
  --goal-bg:#17213a; --goal-line:#2a3a63; --goal-ink:#b9c9f7; --goal-ink-2:#8fa3d6;}}
:host([theme="dark"]){
  --bar:#161a21; --bar-line:#2c323e; --ink:#e6e9ef; --ink-2:#9aa3b3; --ink-3:#6e7787; --focus:#6189f0;
  --red:#f0625b; --amber:#f0b429; --green:#4fbf7f;
  --pop:#1c212a; --pop-line:#353c4a; --pop-shadow:0 14px 40px rgb(0 0 0 / .55);
  --gantt-bg:#232933; --gantt-fg:#cdd3de;
  --charter-bg:#3a1c19; --charter-fg:#f0897f;
  --bc-bg:#183020; --bc-fg:#7fd39b;
  --sh-bg:#1b2742; --sh-fg:#9db2ff;
  --comms-bg:#352d12; --comms-fg:#e2bb52;
  --risks-bg:#050507; --risks-fg:#ecebf0;
  --pmo-bg:#161a21; --pmo-fg:#e6e9ef;
  --goal-bg:#17213a; --goal-line:#2a3a63; --goal-ink:#b9c9f7; --goal-ink-2:#8fa3d6;}
*{box-sizing:border-box}
a{color:inherit}
.bar{background:var(--bar);border-bottom:1px solid var(--bar-line);display:flex;align-items:center;gap:10px 18px;flex-wrap:wrap;
  padding-block:8px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.id{display:flex;align-items:center;gap:10px;min-width:0;text-decoration:none}
.id img{width:30px;height:30px;flex:none}
.id b{display:block;font-size:14px;font-weight:600;letter-spacing:-.005em;white-space:nowrap}
.id small{display:block;font-size:11.5px;color:var(--ink-2);white-space:nowrap;font-variant-numeric:tabular-nums}
.id small .late{color:var(--red);font-weight:500}
nav{display:flex;gap:8px;align-items:center;flex:1;min-width:0;overflow-x:auto;padding:6px 6px 6px 2px;margin:-6px 0;scrollbar-width:thin}
.sep{flex:1;min-width:4px}
.btn{position:relative;flex:none;display:inline-flex;align-items:center;height:32px;padding:0 13px;border-radius:7px;font-size:12.5px;font-weight:500;
  text-decoration:none;white-space:nowrap;background:var(--b);color:var(--c);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 22%,transparent);transition:transform .12s}
.btn:hover{transform:translateY(-1px)}
.btn[aria-current="page"]{box-shadow:inset 0 0 0 2px var(--c)}
.btn[aria-current="page"]::after{content:"";position:absolute;left:10px;right:10px;bottom:-7px;height:2px;border-radius:2px;background:var(--c)}
.btn:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.btn.gantt{--b:var(--gantt-bg);--c:var(--gantt-fg)} .btn.charter{--b:var(--charter-bg);--c:var(--charter-fg)}
.btn.bc{--b:var(--bc-bg);--c:var(--bc-fg)} .btn.sh{--b:var(--sh-bg);--c:var(--sh-fg)}
.btn.comms{--b:var(--comms-bg);--c:var(--comms-fg)} .btn.risks{--b:var(--risks-bg);--c:var(--risks-fg)}
.btn.pmo{--b:var(--pmo-bg);--c:var(--pmo-fg);box-shadow:inset 0 0 0 1px var(--bar-line)}
.btn.pmo[aria-current="page"]{box-shadow:inset 0 0 0 2px var(--pmo-fg)}
.dot{position:absolute;top:-5px;right:-5px;width:13px;height:13px;border-radius:50%;border:2.5px solid var(--bar);background:var(--ink-3)}
.dot.red{background:var(--red)} .dot.amber{background:var(--amber)} .dot.green{background:var(--green)}
.dot.wait{background:var(--bar-line)}
.chk{margin-left:6px;font-size:11px;opacity:.8}
/* popover */
.pop{position:fixed;z-index:1000;width:min(400px,calc(100vw - 24px));background:var(--pop);color:var(--ink);border:1px solid var(--pop-line);border-radius:10px;
  box-shadow:var(--pop-shadow);padding:12px 14px 10px;font-size:12.5px;line-height:1.45}
.pop[hidden]{display:none}
.pop h4{margin:0 0 2px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px}
.pop .lv{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:4px;color:#fff}
.pop .lv.red{background:var(--red)} .pop .lv.amber{background:var(--amber);color:#2a1c00} .pop .lv.green{background:var(--green)}
.pop .sub{color:var(--ink-2);font-size:12px;margin:0 0 8px}
.pop ul{list-style:none;margin:0;padding:0;display:grid;gap:5px;max-height:min(46vh,340px);overflow:auto}
.pop li{display:grid;grid-template-columns:10px 1fr;gap:8px;align-items:start}
.pop li i{width:8px;height:8px;border-radius:50%;margin-top:5px;background:var(--ink-3)}
.pop li i.red{background:var(--red)} .pop li i.amber{background:var(--amber)} .pop li i.green{background:var(--green)}
.pop li i.info{background:transparent;box-shadow:inset 0 0 0 1.5px var(--ink-3)}
.pop li a{text-decoration:none} .pop li a:hover{text-decoration:underline}
.pop details{margin-top:8px;border-top:1px solid var(--pop-line);padding-top:6px;color:var(--ink-2);font-size:12px}
.pop summary{cursor:pointer;color:var(--ink-2)}
.pop details p{margin:5px 0 0}
.pop .go{display:inline-block;margin-top:8px;font-weight:600;text-decoration:none;color:var(--focus)}
@media (max-width:760px){nav{flex-basis:100%}.sep{display:none}}
@media (max-width:520px){.id small{white-space:normal}.id b{white-space:normal}}
@media (prefers-reduced-motion:reduce){.btn{transition:none}.btn:hover{transform:none}}
.btn.locked svg{width:11px;height:11px;margin-right:6px;fill:currentColor;opacity:.75}
.btn.locked{opacity:.88}
.pop.gantt{--pb:var(--gantt-bg);--pc:var(--gantt-fg)} .pop.charter{--pb:var(--charter-bg);--pc:var(--charter-fg)}
.pop.bc{--pb:var(--bc-bg);--pc:var(--bc-fg)} .pop.sh{--pb:var(--sh-bg);--pc:var(--sh-fg)}
.pop.comms{--pb:var(--comms-bg);--pc:var(--comms-fg)} .pop.risks{--pb:var(--risks-bg);--pc:var(--risks-fg)}
.pop.pmo{--pb:var(--pmo-bg);--pc:var(--pmo-fg)}
.pop[class*=" "]{background:var(--pb);color:var(--pc);border-color:color-mix(in srgb,var(--pc) 28%,transparent)}
.pop[class*=" "] .sub{color:inherit;opacity:.82}
.pop[class*=" "] .go{color:inherit;text-decoration:underline}
.pop[class*=" "] .soon{background:color-mix(in srgb,var(--pc) 16%,transparent);color:inherit}
.pop .sw{display:flex;gap:6px;align-items:center;margin:8px 0 0;font-size:11.5px;opacity:.85}
.pop .sw i{width:14px;height:14px;border-radius:3px;background:var(--pb);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pc) 40%,transparent)}
.pop .soon{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:4px;background:var(--bar-line);color:var(--ink-2)}
`;

class Shell extends HTMLElement{
  connectedCallback(){
    if(this._r)return; this._r=1;
    const page=this.getAttribute('page');
    const root=this.attachShadow({mode:'open'});
    const DT=window.KM_DATES;
    const start=DT?DT.fmt(DT.wd(1)):'',end=DT?DT.fmt(DT.wd(P.close)):'';
    root.innerHTML=`<style>${CSS}</style>
    <div class="bar">
      <a class="id" href="index.html" title="Главная страница проекта">
        <img src="${LOGO}" alt="">
        <span><b>Проект «${esc(P.name)}»</b><small>${esc(P.org)} · Д1 ${start} → Д${P.close} ${end}</small></span>
      </a>
      <nav aria-label="Документы проекта">
        ${NAV.map(n=>`${n.k==='pmo'?'<span class="sep"></span>':''}<a class="btn ${n.k}${n.lock?' locked':''}" href="${n.href}" data-k="${n.k}" ${n.k===page?'aria-current="page"':''}${n.lock?' aria-label="'+n.t+' — раздел пока закрыт"':''}>${n.lock?LOCK:''}${n.t}${n.k==='charter'?`<span class="chk" aria-hidden="true">${P.charter.badge||'v'+P.charter.v}</span>`:''}</a>`).join('')}
      </nav>
    </div>
    <div class="pop" id="pop" role="tooltip" hidden></div>`;
    this.root=root;
    const cur=root.querySelector('.btn[aria-current]');if(cur){const nv=cur.parentElement;nv.scrollLeft=Math.max(0,cur.offsetLeft-nv.clientWidth/2+cur.offsetWidth/2);}
    const sync=()=>{const t=document.documentElement.getAttribute('data-theme');t?this.setAttribute('theme',t):this.removeAttribute('theme')};
    sync();new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    const pop=root.getElementById('pop');let tm=null;
    const coarse=matchMedia('(hover:none)').matches;
    const show=a=>{clearTimeout(tm);const n=NAV.find(x=>x.k===a.dataset.k);
      pop.className='pop '+n.k;pop.innerHTML=`<h4>${n.t} ${n.lock?'<span class="soon">скоро</span>':''}</h4><p class="sub">${esc(n.hint)}</p>${n.lock?'<p class="sub" style="margin:0">Раздел откроется на следующих занятиях тренинга.</p><p class="sw"><i></i>Цвет раздела: '+n.color+'</p>':`<a class="go" href="${n.href}">Открыть →</a>`}`;
      pop.hidden=false;const r=a.getBoundingClientRect(),w=pop.offsetWidth;
      pop.style.left=Math.min(Math.max(12,r.left),innerWidth-w-12)+'px';pop.style.top=(r.bottom+10)+'px';};
    const hide=()=>{tm=setTimeout(()=>{pop.hidden=true},180)};
    root.querySelectorAll('.btn').forEach(a=>{
      a.addEventListener('mouseenter',()=>{if(!coarse)tm=setTimeout(()=>show(a),260)});
      a.addEventListener('mouseleave',()=>{clearTimeout(tm);hide()});
      a.addEventListener('blur',hide);
    });
    pop.addEventListener('mouseenter',()=>clearTimeout(tm));pop.addEventListener('mouseleave',hide);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')pop.hidden=true});
    addEventListener('scroll',()=>{pop.hidden=true},{passive:true,capture:true});
  }
}
customElements.define('km-shell',Shell);
/* favicon и шрифт для всех страниц портала */
try{document.querySelectorAll('link[rel~="icon"]').forEach(n=>n.remove());const l=document.createElement('link');l.rel='icon';l.type='image/svg+xml';l.href=LOGO;document.head.appendChild(l);
  if(!document.querySelector('link[href*="IBM+Plex+Sans"]')){const f=document.createElement('link');f.rel='stylesheet';f.href='https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap';document.head.appendChild(f);}}catch(e){}
})();
