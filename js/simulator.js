// ==================== SIMULATOR ====================
const simState={current:null,S:null,N:null,R:null,T:null,TisNull:null,suggestedCamp:null};

function getValidCampaigns(){
  const{S,N,R,T,TisNull}=simState;
  if(simState.current!=='unknown')return[];
  const sVals=S?[S]:['CRM','OTHER'];
  const nVals=N!==null?[N]:[1,2];
  const rIdx=R!==null?R_OPTS.findIndex(o=>o.value===R):-1;
  const tAll=TisNull===true?[null]:TisNull===false&&T!==null?[T]:[null,...T_OPTS.filter(o=>!o.isNull).map(o=>o.value)];
  const campMap=new Map();
  for(const camp of CAMPAIGNS){
    const ck=camp.key;
    const rEnabled=rRulesMap[ck]||[0,1,2,3,4,5];
    if(R!==null&&!rEnabled.includes(rIdx))continue;
    const rVals=R!==null?[R]:rEnabled.map(i=>R_OPTS[i].value);
    const isRel=['personal','lastchance'].includes(ck);
    const tVals=isRel?tAll:[null];
    const nodeIds=new Set();
    for(const s of sVals)for(const n of nVals)for(const r of rVals)for(const t of tVals)nodeIds.add(simLogic(ck,s,n,r,t).id);
    campMap.set(ck,{camp,nodeIds:[...nodeIds]});
  }
  return campMap;
}

function getPossibleResults(){
  const{current,S,N,R,T,TisNull}=simState;
  if(!current)return[];
  if(current==='unknown'){
    const ids=new Set();
    const sVals=S?[S]:['CRM','OTHER'];
    const nVals=N!==null?[N]:[1,2];
    const rIdx=R!==null?R_OPTS.findIndex(o=>o.value===R):-1;
    const tAll=TisNull===true?[null]:TisNull===false&&T!==null?[T]:[null,...T_OPTS.filter(o=>!o.isNull).map(o=>o.value)];
    const hasTSelected=TisNull===false&&T!==null;
    for(const camp of CAMPAIGNS){
      const ck=camp.key;
      const isRel=['personal','lastchance'].includes(ck);
      if(isRel&&!hasTSelected)continue;
      const rEnabled=rRulesMap[ck]||[0,1,2,3,4,5];
      if(R!==null&&!rEnabled.includes(rIdx))continue;
      const rVals=R!==null?[R]:rEnabled.map(i=>R_OPTS[i].value);
      const tVals=isRel?tAll:[null];
      for(const s of sVals)for(const n of nVals)for(const r of rVals)for(const t of tVals)ids.add(simLogic(ck,s,n,r,t).id);
    }
    return[...ids];
  }
  const sVals=S?[S]:['CRM','OTHER'];
  const nVals=N!==null?[N]:[1,2];
  const rEnabled=(rRulesMap[current]||[0,1,2,3,4,5]).map(i=>R_OPTS[i].value);
  const rVals=R!==null?[R]:rEnabled;
  const isRel=['personal','lastchance'].includes(current);
  let tVals;
  if(!isRel){tVals=[null]}
  else if(TisNull===true){tVals=[null]}
  else if(TisNull===false&&T!==null){tVals=[T]}
  else{
    const rIdx=R!==null?R_OPTS.findIndex(o=>o.value===R):-1;
    let tEnabled;
    if(current==='personal')tEnabled=(rIdx===2)?[2]:[1,2];
    else tEnabled=[2,3];
    tVals=tEnabled.map(i=>T_OPTS[i].value);
  }
  const ids=new Set();
  for(const s of sVals)for(const n of nVals)for(const r of rVals)for(const t of tVals)ids.add(simLogic(current,s,n,r,t).id);
  return[...ids];
}

function buildSimSteps(){
  const panel=document.getElementById('simStepsPanel');
  panel.innerHTML='';
  const s1=makeStep(1,'แคมเปญปัจจุบัน');
  const unknownBtn=document.createElement('button');
  unknownBtn.className='sim-unknown-btn';
  unknownBtn.textContent='ไม่รู้ว่าอยู่แคมเปญไหน';
  unknownBtn.onclick=()=>{
    document.querySelectorAll('.sim-choice[data-step="1"]').forEach(b=>b.classList.remove('selected'));
    unknownBtn.classList.add('active');
    simState.current='unknown';simState.S=simState.N=simState.R=simState.T=null;simState.TisNull=null;simState.suggestedCamp=null;
    document.querySelectorAll('.sim-choice:not([data-step="1"])').forEach(b=>{b.classList.remove('selected');b.classList.remove('disabled')});
    const s2=document.getElementById('simStep2');
    const s3=document.getElementById('simStep3');
    const s4=document.getElementById('simStep4');
    s2.classList.remove('hidden');s3.classList.remove('hidden');s4.classList.remove('hidden');
    if(typeof gsap!=='undefined'){
      gsap.from(s2,{y:20,opacity:0,duration:0.4,ease:'power2.out'});
      gsap.from(s3,{y:20,opacity:0,duration:0.3,delay:0.1,ease:'power2.out'});
      gsap.from(s4,{y:20,opacity:0,duration:0.3,delay:0.2,ease:'power2.out'});
    }
    updateDisabledStates();updateMiniFlow();
  };
  s1.appendChild(unknownBtn);
  const g1=document.createElement('div');g1.className='sim-btn-grid';
  CAMPAIGNS.forEach(c=>{
    const btn=document.createElement('button');
    btn.className='sim-choice';btn.dataset.key=c.key;btn.dataset.step='1';
    const gc=GROUP_COLORS[c.group],gl=GROUP_LIGHT[c.group],gd=GROUP_DARK[c.group];
    btn.style.setProperty('--sel-color',gc);btn.style.setProperty('--sel-bg',gl);btn.style.setProperty('--sel-dark',gd);btn.style.setProperty('--sel-glow',gl);
    btn.innerHTML=`<span class="sim-choice-label" style="color:${gc}">${GROUPS[c.group].name}</span>${c.label}`;
    btn.onclick=()=>selectStep('current',c.key,btn,'1');
    g1.appendChild(btn);
  });
  s1.appendChild(g1);panel.appendChild(s1);

  const s2=makeStep(2,'วันนับจากรับสินค้า (R)');s2.id='simStep2';s2.classList.add('hidden');
  const g2=document.createElement('div');g2.className='sim-btn-grid';g2.style.gridTemplateColumns='repeat(3,1fr)';
  R_OPTS.forEach(o=>{
    const btn=document.createElement('button');btn.className='sim-choice';btn.dataset.step='2';btn.dataset.field='R';btn.dataset.value=o.value;
    btn.innerHTML=`<span class="sim-choice-label">${o.label}</span><span class="sim-choice-desc">${o.desc}</span>`;
    btn.onclick=()=>selectStep('R',o.value,btn,'2');
    g2.appendChild(btn);
  });
  s2.appendChild(g2);panel.appendChild(s2);

  const s3=document.createElement('div');s3.className='sim-step-group hidden';s3.id='simStep3';
  s3.innerHTML=`<div class="sim-step-header"><span class="sim-step-num">3</span><span>ผู้ขาย (S) และ ครั้งที่สั่งซื้อ (N)</span></div>`;
  const sLabel=document.createElement('div');sLabel.style.cssText='font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;font-family:var(--font-mono);letter-spacing:0.03em';sLabel.textContent='S — ผู้ขายล่าสุด';
  s3.appendChild(sLabel);
  const g3=document.createElement('div');g3.className='sim-btn-row';g3.style.marginBottom='14px';
  [{label:'CRM',val:'CRM',color:'var(--line-crm)'},{label:'OTHER',val:'OTHER',color:'var(--line-other)'}].forEach(o=>{
    const btn=document.createElement('button');btn.className='sim-choice';btn.dataset.step='3';btn.dataset.field='S';btn.dataset.value=o.val;btn.style.flex='1';
    btn.style.setProperty('--sel-color',o.color);btn.style.setProperty('--sel-bg',o.val==='CRM'?'rgba(0,122,255,0.08)':'rgba(232,133,12,0.08)');
    btn.style.setProperty('--sel-dark',o.color);btn.style.setProperty('--sel-glow',o.val==='CRM'?'rgba(0,122,255,0.15)':'rgba(232,133,12,0.15)');
    btn.innerHTML=`<span class="sim-choice-label" style="color:${o.color}">${o.label}</span>`;
    btn.onclick=()=>selectStep('S',o.val,btn,'3');
    g3.appendChild(btn);
  });
  s3.appendChild(g3);
  const nLabel=document.createElement('div');nLabel.style.cssText='font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;font-family:var(--font-mono);letter-spacing:0.03em';nLabel.textContent='N — ครั้งที่สั่งซื้อ';
  s3.appendChild(nLabel);
  const g3b=document.createElement('div');g3b.className='sim-btn-row';
  [{label:'N = 1',desc:'ครั้งแรก',val:1},{label:'N > 1',desc:'ซื้อซ้ำ',val:2}].forEach(o=>{
    const btn=document.createElement('button');btn.className='sim-choice';btn.dataset.step='3';btn.dataset.field='N';btn.dataset.value=o.val;btn.style.flex='1';
    btn.innerHTML=`<span class="sim-choice-label">${o.label}</span><span class="sim-choice-desc">${o.desc}</span>`;
    btn.onclick=()=>selectStep('N',o.val,btn,'3');
    g3b.appendChild(btn);
  });
  s3.appendChild(g3b);panel.appendChild(s3);

  const s5=makeStep(4,'วันในกลุ่ม Relationship (T)');s5.id='simStep4';s5.classList.add('hidden');
  const g5=document.createElement('div');g5.className='sim-btn-row';g5.style.flexWrap='wrap';
  T_OPTS.forEach((o,i)=>{
    if(i===0)return;
    const btn=document.createElement('button');btn.className='sim-choice';btn.dataset.step='4';btn.dataset.field='T';btn.dataset.value=o.value;btn.dataset.tIdx=i;btn.style.flex='1';btn.style.minWidth='80px';
    btn.innerHTML=`<span class="sim-choice-label">${o.label}</span><span class="sim-choice-desc">${o.desc}</span>`;
    btn.onclick=()=>{simState.TisNull=false;selectStep('T',o.value,btn,'4')};
    g5.appendChild(btn);
  });
  s5.appendChild(g5);panel.appendChild(s5);

  const resetBtn=document.createElement('button');
  resetBtn.className='sim-reset';resetBtn.innerHTML='<svg width="14" height="14"><use href="#icon-refresh"/></svg> เริ่มใหม่';
  resetBtn.onclick=resetSim;
  panel.appendChild(resetBtn);
}

function makeStep(num,title){
  const div=document.createElement('div');div.className='sim-step-group';
  div.innerHTML=`<div class="sim-step-header"><span class="sim-step-num">${num}</span><span>${title}</span></div>`;
  return div;
}

function selectStep(field,value,btn,stepNum){
  if(btn.classList.contains('selected')){
    btn.classList.remove('selected');
    simState[field]=null;
    if(field==='T')simState.TisNull=null;
    if(field==='current'){
      simState.S=simState.N=simState.R=simState.T=null;simState.TisNull=null;simState.suggestedCamp=null;
      document.querySelectorAll('.sim-choice').forEach(b=>{b.classList.remove('selected');b.classList.remove('disabled')});
      ['simStep2','simStep3','simStep4'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('hidden')});
    }
    updateDisabledStates();
    updateMiniFlow();
    return;
  }
  const siblings=btn.parentElement.querySelectorAll('.sim-choice');
  siblings.forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  simState[field]=value;

  if(field==='current'){
    const ub=document.querySelector('.sim-unknown-btn');if(ub)ub.classList.remove('active');
    simState.S=simState.N=simState.R=simState.T=null;simState.TisNull=null;
    document.querySelectorAll('.sim-choice:not([data-step="1"])').forEach(b=>{b.classList.remove('selected');b.classList.remove('disabled')});
    const s2=document.getElementById('simStep2');
    const s3=document.getElementById('simStep3');
    const s4=document.getElementById('simStep4');
    s2.classList.remove('hidden');s3.classList.remove('hidden');
    if(typeof gsap!=='undefined')gsap.from(s2,{y:20,opacity:0,duration:0.4,ease:'power2.out'});
    if(typeof gsap!=='undefined')gsap.from(s3,{y:20,opacity:0,duration:0.3,delay:0.1,ease:'power2.out'});
    const isRel=['personal','lastchance'].includes(value);
    if(isRel){
      s4.classList.remove('hidden');
      if(typeof gsap!=='undefined')gsap.from(s4,{y:20,opacity:0,duration:0.3,delay:0.2,ease:'power2.out'});
    }else{
      s4.classList.add('hidden');simState.TisNull=true;simState.T=null;
    }
    updateDisabledStates();
    updateMiniFlow();
    return;
  }

  const stepIdx=parseInt(stepNum);
  if(stepIdx===2){
    const s3=document.getElementById('simStep3');
    if(s3.classList.contains('hidden')){
      s3.classList.remove('hidden');
      if(typeof gsap!=='undefined')gsap.from(s3,{y:20,opacity:0,duration:0.4,ease:'power2.out'});
    }
  }
  if(simState.current==='unknown')simState.suggestedCamp=null;
  updateDisabledStates();
  updateMiniFlow();
}

function updateDisabledStates(){
  const{current}=simState;
  if(!current)return;
  if(current==='unknown'){
    document.querySelectorAll('.sim-choice[data-field="R"]').forEach(b=>b.classList.remove('disabled'));
    const rIdx=simState.R!==null?R_OPTS.findIndex(o=>o.value===simState.R):-1;
    const hasRelCamp=rIdx<0||rIdx<=2;
    document.querySelectorAll('.sim-choice[data-field="T"]').forEach(b=>{
      if(hasRelCamp)b.classList.remove('disabled');
      else b.classList.add('disabled');
    });
    if(!hasRelCamp&&simState.T!==null){simState.T=null;simState.TisNull=null;
      document.querySelectorAll('.sim-choice[data-field="T"]').forEach(b=>b.classList.remove('selected'));
    }
    return;
  }
  const rEnabled=rRulesMap[current]||[0,1,2,3,4,5];
  const rBtns=document.querySelectorAll('.sim-choice[data-field="R"]');
  rBtns.forEach((btn,i)=>{
    if(rEnabled.includes(i)||btn.classList.contains('selected'))btn.classList.remove('disabled');
    else btn.classList.add('disabled');
  });
  if(simState.R!==null){
    const rIdx=R_OPTS.findIndex(o=>o.value===simState.R);
    if(!rEnabled.includes(rIdx)){
      simState.R=null;
      rBtns.forEach(b=>b.classList.remove('selected'));
    }
  }
  if(['personal','lastchance'].includes(current)){
    const rIdx=simState.R!==null?R_OPTS.findIndex(o=>o.value===simState.R):-1;
    let tEnabled;
    if(current==='personal'){
      tEnabled=(rIdx===2)?[2]:[1,2];
    }else{
      tEnabled=[2,3];
    }
    const tBtns=document.querySelectorAll('.sim-choice[data-field="T"]');
    tBtns.forEach(btn=>{
      const ti=parseInt(btn.dataset.tIdx);
      if(tEnabled.includes(ti))btn.classList.remove('disabled');
      else btn.classList.add('disabled');
    });
    if(simState.T!==null){
      const tIdx=T_OPTS.findIndex(o=>o.value===simState.T&&!o.isNull);
      if(tIdx>=0&&!tEnabled.includes(tIdx)){
        simState.T=null;simState.TisNull=null;
        tBtns.forEach(b=>b.classList.remove('selected'));
      }
    }
  }
}

function selectSuggestedCampaign(campKey){
  simState.suggestedCamp=simState.suggestedCamp===campKey?null:campKey;
  updateMiniFlow();
}

function resetSim(){
  simState.current=simState.S=simState.N=simState.R=simState.T=null;simState.TisNull=null;simState.suggestedCamp=null;
  document.querySelectorAll('.sim-choice').forEach(b=>{b.classList.remove('selected');b.classList.remove('disabled')});
  const ub=document.querySelector('.sim-unknown-btn');if(ub)ub.classList.remove('active');
  ['simStep2','simStep3','simStep4'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('hidden')});
  document.getElementById('simFlowEmpty').style.display='flex';
  document.getElementById('miniFlow').style.display='none';
}

function updateMiniFlow(){
  const{current}=simState;
  if(!current){document.getElementById('simFlowEmpty').style.display='flex';document.getElementById('miniFlow').style.display='none';return}
  document.getElementById('simFlowEmpty').style.display='none';
  const flow=document.getElementById('miniFlow');flow.style.display='flex';

  const possibles=getPossibleResults();

  if(current==='unknown'){
    const campMap=getValidCampaigns();
    const hasTSelected=simState.TisNull===false&&simState.T!==null;
    const filteredEntries=[...campMap.entries()].filter(([ck])=>{
      const needsT=['personal','lastchance'].includes(ck);
      if(needsT&&!hasTSelected)return false;
      return true;
    });
    const sc=simState.suggestedCamp;
    const scValid=sc&&filteredEntries.some(([ck])=>ck===sc);

    const gridHtml=filteredEntries.length>0?`<div class="mini-camp-suggest">
      <div class="mini-camp-suggest-title">แคมเปญที่คาดว่าจะอยู่ปัจจุบัน</div>
      <div class="mini-camp-suggest-grid">
        ${filteredEntries.map(([ck,{camp}])=>{
          const gc=GROUP_COLORS[camp.group],gl=GROUP_LIGHT[camp.group],gd=GROUP_DARK[camp.group];
          const isActive=ck===sc;
          return`<button class="mini-camp-suggest-btn ${isActive?'active':''}" onclick="selectSuggestedCampaign('${ck}')" style="--sg-color:${gc};--sg-bg:${gl};--sg-dark:${gd}">
            <span style="font-family:var(--font-mono);font-size:9px;font-weight:700;color:${gc};display:block;margin-bottom:2px">${GROUPS[camp.group].name}</span>
            ${camp.label}
          </button>`;
        }).join('')}
      </div>
    </div>`:'';

    let sourceHtml,scPossibles;
    if(scValid){
      const camp=CAMPAIGNS.find(c=>c.key===sc);
      const sn=NODES[camp.nodeId];
      const sColor=GROUP_COLORS[sn.group],sLight=GROUP_LIGHT[sn.group],sDark=GROUP_DARK[sn.group];
      sourceHtml=`<div class="mini-source" style="border-color:${sColor};background:${sLight};color:${sDark}">
        <span style="font-family:var(--font-mono);font-size:9px;opacity:0.7;display:block;margin-bottom:2px">${GROUPS[sn.group].name}</span>
        ${sn.name.replace(/\n/g,' ')}
      </div>`;
      const{S,N,R,T}=simState;
      const sVals=S?[S]:['CRM','OTHER'];const nVals=N!==null?[N]:[1,2];
      const rEnabled=(rRulesMap[sc]||[0,1,2,3,4,5]).map(i=>R_OPTS[i].value);
      const rVals=R!==null?[R]:rEnabled;
      const isRel=['personal','lastchance'].includes(sc);
      let tVals;
      if(!isRel)tVals=[null];
      else if(simState.TisNull===true)tVals=[null];
      else if(simState.TisNull===false&&T!==null)tVals=[T];
      else tVals=[null,...T_OPTS.filter(o=>!o.isNull).map(o=>o.value)];
      const ids=new Set();
      for(const s of sVals)for(const n of nVals)for(const r of rVals)for(const t of tVals)ids.add(simLogic(sc,s,n,r,t).id);
      scPossibles=[...ids];
    } else {
      sourceHtml=`<div class="mini-source" style="border-color:var(--text-tertiary);background:#f5f5f7;color:var(--text-secondary)">
        <span style="font-family:var(--font-mono);font-size:9px;opacity:0.7;display:block;margin-bottom:2px">ไม่ทราบ</span>
        แคมเปญปัจจุบัน?
      </div>`;
      scPossibles=possibles;
    }

    const outIds=scValid?[...new Set(CONNECTIONS.filter(c=>c.from===CAMPAIGNS.find(cc=>cc.key===sc).nodeId).map(c=>c.to))]:possibles;

    flow.innerHTML=`
      ${gridHtml}
      ${sourceHtml}
      <div class="mini-arrow"><div class="mini-arrow-line"></div><div class="mini-arrow-head">&#9660;</div></div>
      <div class="mini-dests">
        ${outIds.map(id=>{
          const n=NODES[id];const g=n.group;
          const c=GROUP_COLORS[g],l=GROUP_LIGHT[g],d=GROUP_DARK[g];
          const isPossible=scPossibles.includes(id);
          const isConfirmed=scPossibles.length===1&&isPossible;
          return`<div class="mini-dest ${isPossible?'possible':'impossible'} ${isConfirmed?'confirmed':''}" style="border-color:${c};background:${isPossible?l:'#f5f5f5'};color:${isPossible?d:'#ccc'};--glow:${c}30">
            <span style="font-family:var(--font-mono);font-size:9px;opacity:0.7;display:block;margin-bottom:2px">${GROUPS[g].name}</span>
            ${n.name.replace(/\n/g,' ')}
          </div>`;
        }).join('')}
      </div>
      ${scPossibles.length===1?(scValid?renderFinalResult(scPossibles[0]):renderFinalResultUnknown(scPossibles[0])):'<div style="text-align:center;margin-top:16px;font-size:12px;color:var(--text-tertiary);font-family:var(--font-mono)">'+(scValid?'เลือกเพิ่มเพื่อจำกัดผลลัพธ์':'เลือกแคมเปญด้านบน หรือเลือกเพิ่มเพื่อจำกัดผลลัพธ์')+` (${scPossibles.length} ที่เป็นไปได้)</div>`}
    `;
    return;
  }

  const camp=CAMPAIGNS.find(c=>c.key===current);
  const sourceNode=NODES[camp.nodeId];
  const sourceColor=GROUP_COLORS[sourceNode.group],sourceLight=GROUP_LIGHT[sourceNode.group],sourceDark=GROUP_DARK[sourceNode.group];

  const outConns=CONNECTIONS.filter(c=>c.from===camp.nodeId);
  const allDestIds=[...new Set(outConns.map(c=>c.to))];

  flow.innerHTML=`
    <div class="mini-source" style="border-color:${sourceColor};background:${sourceLight};color:${sourceDark}">
      <span style="font-family:var(--font-mono);font-size:9px;opacity:0.7;display:block;margin-bottom:2px">${GROUPS[sourceNode.group].name}</span>
      ${sourceNode.name.replace(/\n/g,' ')}
    </div>
    <div class="mini-arrow"><div class="mini-arrow-line"></div><div class="mini-arrow-head">&#9660;</div></div>
    <div class="mini-dests">
      ${allDestIds.map(id=>{
        const n=NODES[id];const g=n.group;
        const c=GROUP_COLORS[g],l=GROUP_LIGHT[g],d=GROUP_DARK[g];
        const isPossible=possibles.includes(id);
        const isConfirmed=possibles.length===1&&isPossible;
        return`<div class="mini-dest ${isPossible?'possible':'impossible'} ${isConfirmed?'confirmed':''}" style="border-color:${c};background:${isPossible?l:'#f5f5f5'};color:${isPossible?d:'#ccc'};--glow:${c}30">
          <span style="font-family:var(--font-mono);font-size:9px;opacity:0.7;display:block;margin-bottom:2px">${GROUPS[g].name}</span>
          ${n.name.replace(/\n/g,' ')}${id===camp.nodeId?' (เดิม)':''}
        </div>`;
      }).join('')}
    </div>
    ${possibles.length===1?renderFinalResult(possibles[0]):'<div style="text-align:center;margin-top:16px;font-size:12px;color:var(--text-tertiary);font-family:var(--font-mono)">เลือกเพิ่มเพื่อจำกัดผลลัพธ์ (${possibles.length} แคมเปญที่เป็นไปได้)</div>'}
  `;
}

function renderFinalResult(nodeId){
  const n=NODES[nodeId];const g=n.group;
  const c=GROUP_COLORS[g],l=GROUP_LIGHT[g],d=GROUP_DARK[g];
  const grp=GROUPS[g];
  const S=simState.S||'CRM',N=simState.N||1,R=simState.R||0,T=simState.T;
  const campKey=simState.current==='unknown'?simState.suggestedCamp:simState.current;
  const conn=CONNECTIONS.find(cn=>cn.from===(CAMPAIGNS.find(cc=>cc.key===campKey)||{}).nodeId&&cn.to===nodeId&&(S==='CRM'?cn.type==='crm':cn.type==='other'||cn.type==='none'));
  const campLabel=campKey?(CAMPAIGNS.find(cc=>cc.key===campKey)||{}).label||campKey:'ไม่ทราบ';
  const steps=[];
  steps.push({label:'แคมเปญปัจจุบัน',val:campLabel,pass:true});
  steps.push({label:'ผู้ขายล่าสุด (S)',val:S,pass:true});
  steps.push({label:'ครั้งที่สั่งซื้อ (N)',val:N===1?'ครั้งแรก':'ครั้งที่ 2+',pass:true});
  const rOpt=R_OPTS.find(o=>o.value===R);
  const rDisplay=rOpt?(rOpt.label.startsWith('≤')?'ไม่เกิน '+rOpt.label.slice(1)+' วัน':rOpt.label.includes('+')?'มากกว่า '+rOpt.label.replace('+','')+' วัน':'ช่วง '+rOpt.label+' วัน'):(R+' วัน');
  steps.push({label:'วันนับจากรับสินค้า (R)',val:rDisplay,pass:true});
  const tOpt=T!==null&&T!==undefined?T_OPTS.find(o=>o.value===T):null;
  const tDisplay=tOpt?(tOpt.label.startsWith('≤')?'ไม่เกิน '+tOpt.label.slice(1)+' วัน':tOpt.label.startsWith('>')?'มากกว่า '+tOpt.label.slice(1)+' วัน':'ช่วง '+tOpt.label+' วัน'):null;
  if(tDisplay)steps.push({label:'วันในกลุ่ม Relationship (T)',val:tDisplay,pass:true});
  else steps.push({label:'วันในกลุ่ม Relationship (T)',val:'ไม่มี (ไม่เคยอยู่กลุ่มนี้)',pass:true});
  const changeInfo=conn?conn.info:'';
  return`<div class="mini-result-card" style="background:${l};border:2px solid ${c}25">
    <div class="mini-result-label" style="color:${d}">${grp.label} — ${grp.name}</div>
    <div class="mini-result-name" style="color:${d}">${n.name.replace(/\n/g,' ')}</div>
    <div class="mini-result-info">เงื่อนไข: ${n.conditions}</div>
    ${changeInfo?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid ${c}20;font-size:12px;color:${d};opacity:0.8;font-family:var(--font-mono)">${changeInfo}</div>`:''}
  </div>
  <div class="mini-result-steps">
    <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">ขั้นตอนการจัดแคมเปญ</div>
    ${steps.map((s,i)=>`<div class="mini-step-row">
      <span class="mini-step-num">${i+1}</span>
      <span class="mini-step-label">${s.label}</span>
      <span class="mini-step-val">${s.val}</span>
    </div>`).join('')}
  </div>`;
}

function renderFinalResultUnknown(nodeId){
  const n=NODES[nodeId];const g=n.group;
  const c=GROUP_COLORS[g],l=GROUP_LIGHT[g],d=GROUP_DARK[g];
  const grp=GROUPS[g];
  const S=simState.S||'—',N=simState.N,R=simState.R,T=simState.T;
  const steps=[];
  steps.push({label:'แคมเปญปัจจุบัน',val:'ไม่ทราบ'});
  steps.push({label:'ผู้ขายล่าสุด (S)',val:S});
  steps.push({label:'ครั้งที่สั่งซื้อ (N)',val:N===1?'ครั้งแรก':N===2?'ครั้งที่ 2+':'—'});
  const rOpt2=R!==null?R_OPTS.find(o=>o.value===R):null;
  const rDisplay2=rOpt2?(rOpt2.label.startsWith('≤')?'ไม่เกิน '+rOpt2.label.slice(1)+' วัน':rOpt2.label.includes('+')?'มากกว่า '+rOpt2.label.replace('+','')+' วัน':'ช่วง '+rOpt2.label+' วัน'):'—';
  steps.push({label:'วันนับจากรับสินค้า (R)',val:rDisplay2});
  const tOpt2=T!==null&&T!==undefined?T_OPTS.find(o=>o.value===T):null;
  const tDisplay2=tOpt2?(tOpt2.label.startsWith('≤')?'ไม่เกิน '+tOpt2.label.slice(1)+' วัน':tOpt2.label.startsWith('>')?'มากกว่า '+tOpt2.label.slice(1)+' วัน':'ช่วง '+tOpt2.label+' วัน'):null;
  if(tDisplay2)steps.push({label:'วันในกลุ่ม Relationship (T)',val:tDisplay2});
  else steps.push({label:'วันในกลุ่ม Relationship (T)',val:'ไม่มี'});
  return`<div class="mini-result-card" style="background:${l};border:2px solid ${c}25">
    <div class="mini-result-label" style="color:${d}">${grp.label} — ${grp.name}</div>
    <div class="mini-result-name" style="color:${d}">${n.name.replace(/\n/g,' ')}</div>
    <div class="mini-result-info">เงื่อนไข: ${n.conditions}</div>
  </div>
  <div class="mini-result-steps">
    <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">ขั้นตอนการจัดแคมเปญ</div>
    ${steps.map((s,i)=>`<div class="mini-step-row">
      <span class="mini-step-num">${i+1}</span>
      <span class="mini-step-label">${s.label}</span>
      <span class="mini-step-val">${s.val}</span>
    </div>`).join('')}
  </div>`;
}
