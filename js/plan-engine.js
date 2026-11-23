/* Движок плана: разбор текстовой ИСР, расчёт расписания методом критического пути, утверждённый план и день статуса. */
(()=>{
const toNum=s=>{const n=parseFloat(String(s||'').replace(/[^\d,.\-−]/g,'').replace('−','-').replace(',','.'));return isFinite(n)?n:0;};
/* исполнители: «Ершов, РП ×0,25» → [{id:'Ершов',u:1},{id:'РП',u:0.25}] */
const parseRes=s=>String(s||'').split(/,(?!\d)/).map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(.*?)\s*[×x]\s*([\d.,]+)$/);return m?{id:m[1].trim(),u:toNum(m[2])}:{id:x,u:1};});
function parseText(txt){
  const out={project:'',result:'',ext:[],items:[],status:null,resources:[],facts:{}};
  for(const line of txt.split(/\r?\n/)){
    let l=line.trim(),m; if(!l)continue;
    if((m=l.match(/^#\s*Проект:\s*(.+)$/i))){out.project=m[1].trim();continue;}
    if((m=l.match(/^#\s*Результат:\s*(.+)$/i))){out.result=m[1].trim();continue;}
    if((m=l.match(/^#\s*Резерв[^:]*:\s*(.+)$/i))){const f=m[1].split('|'); out.reserve={cont:toNum(f[0]),mgmt:toNum(f[1])};continue;}
    if((m=l.match(/^#\s*Статус:\s*Д?\s*(\d+)/i))){out.status=+m[1];continue;}
    if((m=l.match(/^#\s*Ресурс:\s*(.+)$/i))){const f=m[1].split('|').map(s=>s.trim()); out.resources.push({id:f[0],name:f[1]||f[0],type:/подряд/i.test(f[2]||'')?'contractor':/внеш/i.test(f[2]||'')?'external':'staff',cap:Math.max(1,parseInt(f[3],10)||1),rate:toNum(f[4])});continue;}
    if((m=l.match(/^#\s*Факт:\s*([\d.]+?)\.?\s*\|(.*)$/i))){const f={}; for(const part of m[2].split('|')){const s=part.trim(); let q; if((q=s.match(/^Длит[^:]*:\s*(\d+)/i)))f.dur=+q[1]; else if((q=s.match(/^Дата[^:]*:\s*Д\s*(\d+)/i)))f.fix=+q[1]; else if((q=s.match(/^Прогресс[^:]*:\s*(\d+)/i)))f.pct=+q[1]; else if((q=s.match(/^Затрат[^:]*:\s*(.+)$/i)))f.ac=toNum(q[1]);} out.facts[m[1]]=f; continue;}
    if((m=l.match(/^#\s*Внешнее:\s*Д\s*(\d+)\s*\|\s*([^|]+?)\s*(?:\|\s*(.+))?$/i))){out.ext.push({day:+m[1],name:m[2],note:m[3]||''});continue;}
    if(l.startsWith('#'))continue;
    m=l.match(/^(?:\[(дальн)\]\s+)?(\d+(?:\.\d+)*)\.?\s+([^\[|]+?)\s*(?:\[(\d+)\s*д?\]|\[(LOE)\])?\s*((?:\|.*)?)$/i);
    if(!m)continue;
    const it={code:m[2],name:m[3].trim(),wave:!!m[1],loe:!!m[5],dur:m[4]!=null?+m[4]:null,pc:[],sq:[],res:'',pur:0,pct:0,pctSet:false,ml:0,dl:null,fix:null,pin:null,blk:null};
    for(const p of m[6].split('|').map(s=>s.trim()).filter(Boolean)){
      let q;
      if((q=p.match(/^Предш[^:]*:\s*(.*)$/i)))it.pc=q[1].split(/[,;\s]+/).filter(s=>s&&!/^[—-]$/.test(s)).map(s=>s.replace(/\.$/,''));
      else if((q=p.match(/^Очер[^:]*:\s*(.*)$/i)))it.sq=q[1].split(/[,;\s]+/).filter(Boolean).map(s=>s.replace(/\.$/,''));
      else if((q=p.match(/^Блок[^:]*:\s*(.*)$/i)))it.blk=q[1].trim();
      else if((q=p.match(/^Было[^:]*:\s*(.*)$/i)))it.was=q[1].trim();
      else if((q=p.match(/^Исп[^:]*:\s*(.*)$/i)))it.res=q[1].trim();
      else if((q=p.match(/^Прогресс[^:]*:\s*(\d+)/i))){it.pct=Math.min(100,+q[1]);it.pctSet=true;}
      else if((q=p.match(/^Закупк[^:]*:\s*(.+)$/i)))it.pur=toNum(q[1]);
      else if((q=p.match(/^Закрепл[^:]*:\s*Д\s*(\d+)/i)))it.pin=+q[1];
      else if((q=p.match(/^Веха[^:]*:\s*(\d)/i)))it.ml=+q[1];
      else if((q=p.match(/^Срок[^:]*:\s*Д\s*(\d+)/i)))it.dl=+q[1];
      else if((q=p.match(/^Дата[^:]*:\s*Д\s*(\d+)/i)))it.fix=+q[1];
    }
    out.items.push(it);
  }
  return out;
}

/* иерархия по кодам, затем прямой и обратный проход в рабочих днях (es=0 — начало Д1, ef=N — конец дня ДN) */
function derive(M){
  const I=M.items, by={}, problems=[];
  I.forEach(it=>{by[it.code]=it; it.kids=[]; it.succ=[]; it.prob=[];});
  I.forEach(it=>{const pc=it.code.split('.').slice(0,-1).join('.'); it.parent=pc&&by[pc]?pc:null; it.depth=it.code.split('.').length; if(it.parent)by[it.parent].kids.push(it.code);});
  I.forEach(it=>{it.anc=[]; let p=it.parent; while(p){it.anc.push(p); p=by[p].parent;}});
  I.forEach(it=>{it.kind=it.kids.length?'sum':it.loe?'loe':it.dur===0?'ms':'task';});
  /* гамак: суммарный элемент, все дочерние которого — работы «на всё время проекта» (LOE) */
  I.forEach(it=>{if(it.kind==='sum'&&it.kids.every(c=>by[c].kind==='loe'))it.kind='ham';});
  const net=I.filter(t=>t.kind==='task'||t.kind==='ms');
  net.forEach(t=>{t.soft=new Set(t.sq); t.pc=t.pc.concat(t.sq.filter(c=>!t.pc.includes(c)));});
  net.forEach(t=>{t.p=t.pc.filter(c=>{const q=by[c]; if(!q){t.prob.push('нет работы '+c);return false;} if(q.kind==='sum'||q.kind==='loe'){t.prob.push('связь с суммарной '+c);return false;} return true;});});
  const st={};
  const fwd=t=>{ if(st[t.code]===2)return t.ef; if(st[t.code]===1){t.prob.push('цикл');return 0;} st[t.code]=1;
    let es=0; t.p.forEach(c=>{es=Math.max(es,fwd(by[c]));});
    if(t.fix!=null){ if(es>t.fix)t.prob.push('предшественники позже фиксированной даты'); t.es=t.ef=t.fix; }
    else if(t.pin!=null){ if(es>t.pin)t.prob.push('предшественники позже закреплённой даты'); t.es=t.pin-(t.dur||0); t.ef=t.pin; }
    else if(M.status!=null&&t.dur>0&&t.pct<100){ const S=M.status;
      if(t.pct===0){t.es=Math.max(es,S); t.ef=t.es+t.dur;} else {t.es=es; t.ef=Math.max(es+t.dur,S+Math.ceil(t.dur*(100-t.pct)/100));} }
    else {t.es=es; t.ef=es+t.dur;}
    st[t.code]=2; return t.ef; };
  net.forEach(fwd);
  net.forEach(t=>t.p.forEach(c=>by[c].succ.push(t.code)));
  const END=Math.max(...net.map(t=>t.ef));
  /* обратный проход дважды: до конца проекта (критический путь) и с учётом крайних сроков (запас до жёсткого срока) */
  const back=useDl=>{ const lf={};
    const b=t=>{ if(lf[t.code]!=null)return lf[t.code]-(t.ef-t.es);
      let f=t.succ.length?Math.min(...t.succ.map(c=>b(by[c]))):END;
      if(useDl&&t.dl!=null)f=Math.min(f,t.dl);
      if(t.fix!=null||t.pin!=null)f=t.ef;
      lf[t.code]=f; return f-(t.ef-t.es); };
    net.forEach(b); return lf; };
  const L0=back(false), L1=back(true);
  net.forEach(t=>{ const fx=t.fix!=null;
    t.lf=L0[t.code]; t.ls=t.lf-(t.ef-t.es); t.slack=fx?null:t.ls-t.es;
    t.dslack=fx?null:L1[t.code]-t.ef;
    t.crit=t.slack!=null&&t.slack<=0;
    t.dlcrit=!t.crit&&t.dslack!=null&&t.dslack<=0&&t.dslack<t.slack;
    if(t.dl!=null&&t.ef>t.dl)t.prob.push('позже крайнего срока Д'+t.dl);});
  const START=Math.min(...net.map(t=>t.es));
  I.filter(t=>t.kind==='loe'||t.kind==='ham').forEach(t=>{t.es=START;t.ef=END;t.dur=END-START;});
  /* прогресс: работы на всё время проекта идут вместе с календарём, суммарные — взвешенно по длительности */
  I.filter(t=>t.kind==='loe'||t.kind==='ham').forEach(t=>{t.pct=M.status!=null?Math.min(100,Math.round(100*Math.max(0,M.status-START)/(END-START))):0;});
  net.filter(t=>t.kind==='ms').forEach(t=>{t.pct=t.p.length&&t.p.every(c=>by[c].pct>=100)?100:t.pct;});
  const span=s=>{ if(s.kind!=='sum')return; s.kids.forEach(c=>span(by[c])); const k=s.kids.map(c=>by[c]);
    s.es=Math.min(...k.map(x=>x.es)); s.ef=Math.max(...k.map(x=>x.ef)); s.dur=s.ef-s.es;
    const lv=I.filter(x=>x.anc&&x.anc.includes(s.code)&&(x.kind==='task')), w=lv.reduce((a,x)=>a+x.dur,0);
    s.pct=w?Math.round(lv.reduce((a,x)=>a+x.dur*x.pct,0)/w):0;
    s.slack=Math.min(...k.filter(x=>x.slack!=null).map(x=>x.slack)); };
  I.filter(t=>!t.parent).forEach(span);
  I.forEach(t=>{if(t.prob.length)problems.push(t.code+': '+t.prob.join(', '));});
  return {by,END,START,net,problems};
}


const clone=M=>JSON.parse(JSON.stringify(M));
/* модель: утверждённый план (без фактов и дня статуса) и текущее состояние на день статуса */
function model(src){
  const M0=parseText(src);
  const MB=clone(M0); MB.status=null; MB.items.forEach(t=>{t.pct=0;}); const B=derive(MB); const base={}; Object.values(B.by).forEach(t=>base[t.code]={es:t.es,ef:t.ef,dur:t.dur});
  const M=clone(M0);
  if(M.status!=null){
    M.items.forEach(t=>{const f=M.facts[t.code]; if(!f)return; if(f.dur!=null)t.dur=f.dur; if(f.fix!=null)t.fix=f.fix; if(f.pct!=null){t.pct=f.pct;t.pctSet=true;} if(f.ac!=null)t.acFact=f.ac;});
    /* работы без явного прогресса идут по графику: прогресс — по положению относительно дня статуса */
    const S=M.status, P1=clone(M); P1.status=null; const D1=derive(P1);
    M.items.forEach(t=>{ if(t.pctSet||t.dur==null)return; const q=D1.by[t.code]; if(!q||q.kind!=='task')return;
      t.pct=q.ef<=S?100:q.es>=S?0:Math.round(100*(S-q.es)/(q.ef-q.es)); });
  }
  const D=derive(M);
  /* базовый план из другой версии (утверждённый до исправлений): строки сопоставляются по «Было: код» */
  const BS=typeof window!=='undefined'&&window.KM_PLAN_BASE_SRC;
  if(BS){ const MO=parseText(BS); MO.status=null; MO.items.forEach(t=>{t.pct=0;}); const BO=derive(MO).by;
    Object.keys(base).forEach(k=>delete base[k]);
    M0.items.forEach(t=>{ const w=t.was&&BO[t.was]; if(w)base[t.code]=t.dur===0?{es:w.ef,ef:w.ef,dur:0}:{es:w.es,ef:w.ef,dur:w.ef-w.es}; }); }
  /* новый базовый план: утверждается прогноз на день статуса */
  if(typeof window!=='undefined'&&window.KM_BASE_FROM_FORECAST){ Object.keys(base).forEach(k=>delete base[k]);
    Object.values(D.by).forEach(t=>base[t.code]={es:t.es,ef:t.ef,dur:t.ef-t.es}); }
  const R={M,D,base,hasBase:M.status!=null,status:M.status};
  R.ev=evm(R); return R;
}
/* освоенный объём. Бюджет работы (BAC) — по утверждённому плану: ставка × доля × длительность + закупка.
   PV — по утверждённому плану (труд — равномерно, закупка — в день окончания).
   EV — труд по % выполнения, закупка по правилу 0/100, работы на всё время проекта — по прошедшему времени.
   AC — факт из строк «Факт: … | Затраты», иначе — отработанные дни × ставка и полученные закупки. */
function evm(R){
  const {M,D,base}=R, S=R.status, RS={}; (M.resources||[]).forEach(r=>RS[r.id]=r);
  const rateOf=t=>parseRes(t.res).reduce((a,x)=>a+((RS[x.id]&&RS[x.id].rate)||0)*x.u,0);
  const leaves=Object.values(D.by).filter(t=>t.kind==='task'||t.kind==='loe');
  const rows={}, curve={pv:[],ev:[],ac:[]};
  const bEND=Math.max(...Object.values(base).map(b=>b.ef||0)), xMax=Math.max(D.END,bEND);
  const clamp=v=>Math.max(0,Math.min(1,v));
  leaves.forEach(t=>{
    const b=base[t.code]||{es:t.es,ef:t.ef,dur:t.dur}, rate=rateOf(t), bdur=b.ef-b.es;
    t.cost={lab:rate*bdur, pur:t.pur||0}; t.cost.bac=t.cost.lab+t.cost.pur;
    const loe=t.kind==='loe';
    t.pvAt=d=>t.cost.lab*(bdur>0?clamp((d-b.es)/bdur):(d>=b.es?1:0))+(d>=b.ef?t.cost.pur:0);
    let ev=0,ac=0,span=0;
    if(S!=null){
      if(loe){ ev=t.pvAt(S); span=Math.max(0,S-t.es); ac=rate*span; }
      else { const pc=(t.pct||0)/100; span=pc>=1?t.ef-t.es:Math.max(0,Math.min(S,t.ef)-t.es); if(pc===0)span=0;
        ev=t.cost.lab*pc+(pc>=1?t.cost.pur:0); ac=rate*span+(pc>=1?t.cost.pur:0); }
      if(t.acFact!=null)ac=t.acFact;
    }
    t.evm={bac:t.cost.bac,pv:S!=null?t.pvAt(S):0,ev,ac,span};
    /* для S-кривой: освоение и затраты распределяем по фактически отработанному отрезку */
    t.evAt=d=>{ if(S==null||d>S)return null; if(loe)return t.pvAt(d); const lab=ev-((t.pct>=100)?t.cost.pur:0), f=span>0?clamp((d-t.es)/span):0; return lab*f+((t.pct>=100&&d>=t.ef)?t.cost.pur:0); };
    /* закупку относим на день получения (или день статуса, если оплачено, но не получено), труд — равномерно */
    const purAC=t.cost.pur?Math.max(0,ac-rate*span):0, labAC=ac-purAC, purDay=(t.pct>=100)?t.ef:S;
    t.acAt=d=>{ if(S==null||d>S)return null; if(!ac)return 0; if(loe)return ac*clamp(d/Math.max(1,S));
      return (span>0?labAC*clamp((d-t.es)/span):(d>=purDay?labAC:0))+(d>=purDay?purAC:0); };
  });
  const add=(k,o)=>{const x=rows[k]||(rows[k]={bac:0,pv:0,ev:0,ac:0}); x.bac+=o.bac; x.pv+=o.pv; x.ev+=o.ev; x.ac+=o.ac;};
  leaves.forEach(t=>{add('',t.evm); t.anc.forEach(a=>add(a,t.evm)); add(t.code,t.evm);});
  for(const k in rows){const x=rows[k]; x.sv=x.ev-x.pv; x.cv=x.ev-x.ac; x.spi=x.pv>0?x.ev/x.pv:null; x.cpi=x.ac>0?x.ev/x.ac:null;
    x.eac=x.cpi?x.bac/x.cpi:x.bac; x.etc=x.eac-x.ac; x.vac=x.bac-x.eac; x.tcpi=x.bac-x.ac>0?(x.bac-x.ev)/(x.bac-x.ac):null;}
  for(let d=0;d<=xMax;d++){ let a=0,e=0,c=0; leaves.forEach(t=>{a+=t.pvAt(d); if(S!=null&&d<=S){e+=t.evAt(d); c+=t.acAt(d);}}); curve.pv.push(a); if(S!=null&&d<=S){curve.ev.push(e); curve.ac.push(c);} }
  return {rows,P:rows['']||{bac:0,pv:0,ev:0,ac:0},curve,xMax,reserve:M.reserve||null};
}
window.KM_ENGINE={parseText,derive,model,parseRes,toNum};
})();
