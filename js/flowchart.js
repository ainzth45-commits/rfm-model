// ==================== FLOWCHART RENDERING ====================
const connPaths=[],connDots=[],connLabels=[],connLabelBgs=[];
let spotlightActive=false;

function getCenter(n){return{x:n.x+NW/2,y:n.y+NH/2}}

function makePath(from,to,conn,dupOffset){
  const fc=getCenter(from),tc=getCenter(to);
  const off=dupOffset||0;
  if(from.id===1&&to.id===2){
    const sx=fc.x+NW*0.3,sy=from.y+NH;
    const ex=tc.x-NW*0.3,ey=to.y+NH;
    const drop=120;
    return`M${sx},${sy} C${sx},${sy+drop} ${ex},${ey+drop} ${ex},${ey}`;
  }
  if(conn.self){
    const sx=from.x+NW+5,sy=fc.y-15+off*20,ey=fc.y+15+off*20;
    return`M${sx},${sy} C${sx+80},${sy-40} ${sx+80},${ey+40} ${sx},${ey}`;
  }
  const dx=tc.x-fc.x,dy=tc.y-fc.y,absDx=Math.abs(dx),absDy=Math.abs(dy);
  let sx,sy,ex,ey,c1x,c1y,c2x,c2y;
  if(absDx<30){
    if(dy>0){sx=fc.x+off*15;sy=from.y+NH;ex=tc.x+off*15;ey=to.y;c1x=sx;c1y=sy+absDy*0.35;c2x=ex;c2y=ey-absDy*0.35}
    else{const o=-60-off*25;sx=from.x;sy=fc.y+off*12;ex=to.x;ey=tc.y+NH*0.3;c1x=sx+o;c1y=sy;c2x=ex+o;c2y=ey}
  }else if(dy<-50){
    if(dx<0){sx=from.x;sy=fc.y-10+off*14;ex=to.x+NW;ey=tc.y+10+off*14;const cv=Math.min(absDx*0.3,100);c1x=sx-cv;c1y=sy-absDy*0.2;c2x=ex+cv;c2y=ey+absDy*0.2}
    else{sx=from.x+NW;sy=fc.y-10+off*14;ex=to.x;ey=tc.y+10+off*14;const cv=Math.min(absDx*0.3,100);c1x=sx+cv;c1y=sy-absDy*0.2;c2x=ex-cv;c2y=ey+absDy*0.2}
  }else if(absDy<30){
    if(dx>0){sx=from.x+NW;sy=fc.y+off*10;ex=to.x;ey=tc.y+off*10}else{sx=from.x;sy=fc.y+off*10;ex=to.x+NW;ey=tc.y+off*10}
    c1x=(sx+ex)/2;c1y=sy;c2x=(sx+ex)/2;c2y=ey;
  }else{
    if(dy>0){
      if(dx>0){sx=from.x+NW;sy=fc.y+NH*0.2+off*10;ex=to.x;ey=tc.y-NH*0.2}else{sx=from.x;sy=fc.y+NH*0.2+off*10;ex=to.x+NW;ey=tc.y-NH*0.2}
      c1x=sx+(ex-sx)*0.15;c1y=sy+absDy*0.5;c2x=sx+(ex-sx)*0.85;c2y=ey-absDy*0.1;
    }else{
      if(dx>0){sx=from.x+NW;sy=fc.y+off*14;ex=to.x;ey=tc.y+off*14}else{sx=from.x;sy=fc.y+off*14;ex=to.x+NW;ey=tc.y+off*14}
      c1x=sx+(ex-sx)*0.4;c1y=sy;c2x=sx+(ex-sx)*0.6;c2y=ey;
    }
  }
  return`M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`;
}

function renderFlowchart(){
  const container=document.getElementById('flowchartContainer');
  const svg=document.getElementById('flowchartSvg');

  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  Object.entries(TYPE_COLORS).forEach(([type,color])=>{
    const marker=document.createElementNS('http://www.w3.org/2000/svg','marker');
    marker.setAttribute('id',`arrow-${type}`);marker.setAttribute('markerWidth','10');marker.setAttribute('markerHeight','7');
    marker.setAttribute('refX','9');marker.setAttribute('refY','3.5');marker.setAttribute('orient','auto');
    const arrow=document.createElementNS('http://www.w3.org/2000/svg','path');
    arrow.setAttribute('d','M0,0.5 L9,3.5 L0,6.5');arrow.setAttribute('fill','none');
    arrow.setAttribute('stroke',color);arrow.setAttribute('stroke-width','1.5');arrow.setAttribute('stroke-linejoin','round');
    marker.appendChild(arrow);defs.appendChild(marker);
  });
  svg.appendChild(defs);

  CONNECTIONS.forEach((conn,idx)=>{
    const from=NODES[conn.from],to=NODES[conn.to],color=TYPE_COLORS[conn.type];
    const dupOff=conn.dup?1:0;
    const d=makePath(from,to,conn,dupOff);

    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',d);path.setAttribute('stroke',color);path.classList.add('connection');path.dataset.idx=idx;
    path.setAttribute('marker-end',`url(#arrow-${conn.type})`);
    svg.appendChild(path);connPaths.push(path);

    const dots=document.createElementNS('http://www.w3.org/2000/svg','path');
    dots.setAttribute('d',d);dots.setAttribute('stroke',color);dots.classList.add('flow-dot','animate');dots.style.animationDelay=(idx*0.3)+'s';dots.dataset.idx=idx;
    svg.appendChild(dots);connDots.push(dots);

    setTimeout(()=>{
      if(!path.getTotalLength)return;
      const len=path.getTotalLength();
      const labelPos=conn.dup?0.35:conn.self?0.5:0.45;
      const mid=path.getPointAtLength(len*labelPos);
      const txt=conn.info||'';
      const textEl=document.createElementNS('http://www.w3.org/2000/svg','text');
      textEl.setAttribute('x',mid.x);textEl.setAttribute('y',mid.y+4);
      textEl.textContent=txt;textEl.classList.add('conn-label');textEl.dataset.idx=idx;
      const bgEl=document.createElementNS('http://www.w3.org/2000/svg','rect');
      bgEl.classList.add('conn-label-bg');bgEl.dataset.idx=idx;
      svg.appendChild(bgEl);svg.appendChild(textEl);
      connLabelBgs.push(bgEl);connLabels.push(textEl);
      const bb=textEl.getBBox();
      bgEl.setAttribute('x',bb.x-4);bgEl.setAttribute('y',bb.y-2);bgEl.setAttribute('width',bb.width+8);bgEl.setAttribute('height',bb.height+4);
    },150);
  });

  NODES.forEach((n,i)=>{
    const node=document.createElement('div');
    const g=GROUPS.find(g=>g.id===n.group);
    node.className='node breathe';node.dataset.group=n.group;node.dataset.nodeId=n.id;
    node.style.left=n.x+'px';node.style.top=n.y+'px';node.style.width=NW+'px';
    node.style.animationDelay=(i*0.6)+'s';
    const color=GROUP_COLORS[n.group],light=GROUP_LIGHT[n.group],dark=GROUP_DARK[n.group];
    const outgoing=CONNECTIONS.map((c,idx)=>({...c,idx})).filter(c=>c.from===n.id);
    const grouped={};
    outgoing.forEach(c=>{
      if(!grouped[c.type])grouped[c.type]={conns:[],label:c.type==='crm'?'ซื้อ CRM':c.type==='other'?'ซื้อ OTHER':'ไม่ซื้อ'};
      grouped[c.type].conns.push(c);
    });
    const pillsHTML=Object.values(grouped).map(g=>{
      const idxs=g.conns.map(c=>c.idx);
      if(idxs.length===1)return`<button class="node-pill ${g.conns[0].type}" data-conn-idx="${idxs[0]}" onclick="event.stopPropagation();activateSpotlight(${idxs[0]},this)">${g.label}</button>`;
      return`<button class="node-pill ${g.conns[0].type}" onclick="event.stopPropagation();activateSpotlightMulti([${idxs}],this)">${g.label}</button>`;
    }).join('');
    node.innerHTML=`
      <div class="node-group-label" style="background:${light};color:${dark}">${g.name}</div>
      <div class="node-name">${n.name.replace(/\n/g,'<br>')}</div>
      <div class="node-pills">${pillsHTML}</div>`;
    node.addEventListener('click',()=>{if(!spotlightActive)openPopup(n)});
    container.appendChild(node);
  });
}

// ==================== SPOTLIGHT ====================
function activateSpotlight(connIdx,pillEl){
  const conn=CONNECTIONS[connIdx];
  const container=document.getElementById('flowchartContainer');
  const info=document.getElementById('spotlightInfo');
  deactivateSpotlight();
  spotlightActive=true;
  container.classList.add('focus-mode');

  document.querySelectorAll('.node').forEach(el=>{
    const nid=parseInt(el.dataset.nodeId);
    if(nid===conn.from||nid===conn.to)el.classList.add('node-active');
  });
  connPaths[connIdx].classList.add('conn-active');
  connDots[connIdx].classList.add('dot-active');
  if(connLabels[connIdx]){connLabels[connIdx].classList.add('label-active');connLabelBgs[connIdx].classList.add('label-active')}
  if(pillEl)pillEl.classList.add('pill-active');

  const fromNode=NODES[conn.from],toNode=NODES[conn.to],color=TYPE_COLORS[conn.type];
  info.innerHTML=`
    <span style="font-weight:600">${fromNode.name.replace(/\n/g,' ')}</span>
    <span style="color:var(--text-tertiary)">&rarr;</span>
    <span class="spotlight-info-dot" style="background:${color}"></span>
    <span style="color:${color};font-weight:600;font-family:var(--font-mono);font-size:12px">${conn.label}</span>
    <span style="color:var(--text-tertiary)">&rarr;</span>
    <span style="font-weight:600">${conn.self?'(อยู่เดิม)':toNode.name.replace(/\n/g,' ')}</span>
    <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-tertiary);margin-left:8px">${conn.info}</span>`;
  info.classList.add('show');
}

function activateSpotlightMulti(connIdxs,pillEl){
  const container=document.getElementById('flowchartContainer');
  const info=document.getElementById('spotlightInfo');
  deactivateSpotlight();
  spotlightActive=true;
  container.classList.add('focus-mode');
  const nodeIds=new Set();
  connIdxs.forEach(idx=>{
    const conn=CONNECTIONS[idx];
    nodeIds.add(conn.from);nodeIds.add(conn.to);
    connPaths[idx].classList.add('conn-active');
    connDots[idx].classList.add('dot-active');
    if(connLabels[idx]){connLabels[idx].classList.add('label-active');connLabelBgs[idx].classList.add('label-active')}
  });
  document.querySelectorAll('.node').forEach(el=>{
    if(nodeIds.has(parseInt(el.dataset.nodeId)))el.classList.add('node-active');
  });
  if(pillEl)pillEl.classList.add('pill-active');
  const firstConn=CONNECTIONS[connIdxs[0]];
  const fromNode=NODES[firstConn.from];
  const pathsHTML=connIdxs.map(idx=>{
    const c=CONNECTIONS[idx];const toNode=NODES[c.to];const color=TYPE_COLORS[c.type];
    return`<span class="spotlight-info-dot" style="background:${color}"></span>
      <span style="color:${color};font-weight:600;font-family:var(--font-mono);font-size:12px">${c.label}</span>
      <span style="color:var(--text-tertiary)">&rarr;</span>
      <span style="font-weight:600">${c.self?'(อยู่เดิม)':toNode.name.replace(/\n/g,' ')}</span>
      <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-tertiary);margin-left:4px">${c.info}</span>`;
  }).join('<span style="margin:0 8px;color:var(--border-light)">|</span>');
  info.innerHTML=`<span style="font-weight:600">${fromNode.name.replace(/\n/g,' ')}</span><span style="color:var(--text-tertiary);margin:0 6px">&rarr;</span>${pathsHTML}`;
  info.classList.add('show');
}

function deactivateSpotlight(){
  spotlightActive=false;
  document.getElementById('flowchartContainer').classList.remove('focus-mode');
  document.querySelectorAll('.node-active').forEach(n=>n.classList.remove('node-active'));
  document.querySelectorAll('.conn-active').forEach(p=>p.classList.remove('conn-active'));
  document.querySelectorAll('.dot-active').forEach(d=>d.classList.remove('dot-active'));
  document.querySelectorAll('.label-active').forEach(l=>l.classList.remove('label-active'));
  document.querySelectorAll('.pill-active').forEach(p=>p.classList.remove('pill-active'));
  document.getElementById('spotlightInfo').classList.remove('show');
}

// ==================== POPUP ====================
function openPopup(node){
  if(spotlightActive)return;
  const overlay=document.getElementById('popupOverlay'),card=document.getElementById('popupCard');
  const g=GROUPS.find(g=>g.id===node.group);
  const color=GROUP_COLORS[node.group],light=GROUP_LIGHT[node.group],dark=GROUP_DARK[node.group];
  const transitions=CONNECTIONS.filter(c=>c.from===node.id);
  card.innerHTML=`
    <button class="popup-close" onclick="closePopup()"><svg width="16" height="16"><use href="#icon-x"/></svg></button>
    <div class="popup-group-badge" style="background:${light};color:${dark}">${g.label} &mdash; ${g.name}</div>
    <div class="popup-title">${node.name.replace(/\n/g,' ')}</div>
    <div class="popup-desc">${node.detail}</div>
    <div class="popup-conditions"><h4>เงื่อนไข</h4><div class="popup-cond-text">${node.conditions}</div></div>
    <div style="margin-top:16px">
      <div class="popup-trans-title">เส้นทาง</div>
      <div class="popup-transitions">
        ${transitions.map(t=>{
          const dest=NODES[t.to];
          return`<div class="popup-trans-row">
            <div class="popup-trans-dot" style="background:${TYPE_COLORS[t.type]}"></div>
            <div class="popup-trans-label" style="color:${TYPE_COLORS[t.type]}">${t.label}</div>
            <div class="popup-trans-dest">${dest.name.replace(/\n/g,' ')}${t.self?' (อยู่เดิม)':''}</div>
            <div class="popup-trans-info">${t.info||''}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  overlay.classList.add('open');
}

function closePopup(){document.getElementById('popupOverlay').classList.remove('open')}
