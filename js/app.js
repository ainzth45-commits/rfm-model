// ==================== PARTICLES ====================
(function initParticles(){
  const c=document.getElementById('particleCanvas');
  const ctx=c.getContext('2d');
  let w,h;
  const particles=[];
  function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight}
  resize();
  window.addEventListener('resize',resize);
  const colors=['rgba(0,122,255,','rgba(88,86,214,','rgba(40,167,69,','rgba(232,133,12,','rgba(214,64,69,','rgba(142,142,147,'];
  for(let i=0;i<30;i++){
    particles.push({x:Math.random()*w,y:Math.random()*h,r:1.5+Math.random()*3,vx:(Math.random()-0.5)*0.2,vy:-0.15-Math.random()*0.25,o:0.04+Math.random()*0.1,c:colors[Math.floor(Math.random()*6)]});
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;
      if(p.y<-10){p.y=h+10;p.x=Math.random()*w}
      if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c+p.o+')';ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ==================== OVERVIEW ====================
let currentSlide=0;
const TOTAL_SLIDES=10;

function renderOverview(){
  const track=document.getElementById('slideTrack');
  const dots=document.getElementById('slideDots');
  const tabs=document.getElementById('slideTabs');

  const s0=document.createElement('div');s0.className='slide';
  const titleHtml=`<h2 class="section-title" style="padding:0;margin-bottom:10px">กลุ่มและแคมเปญ</h2>
    <p class="section-subtitle" style="padding:0;margin-bottom:20px">ระบบแบ่งลูกค้าออกเป็น 6 กลุ่ม ตามพฤติกรรมการซื้อ แต่ละกลุ่มมีแคมเปญดูแลเฉพาะ</p>`;
  const grid=document.createElement('div');grid.className='group-grid';
  GROUPS.forEach(g=>{
    const card=document.createElement('div');card.className='group-card';
    const color=GROUP_COLORS[g.id],light=GROUP_LIGHT[g.id],dark=GROUP_DARK[g.id];
    card.style.setProperty('--card-accent',color);
    const firstCampIdx=CAMP_DETAILS.findIndex(c=>c.group===g.id);
    card.onclick=()=>slideToIdx(firstCampIdx+1);
    card.innerHTML=`
      <div class="group-card-header">
        <div class="group-dot" style="background:${color}"></div>
        <div class="group-card-title">${g.name}</div>
        <span class="group-card-label" style="background:${light};color:${dark}">${g.label}</span>
      </div>
      <p class="group-card-desc">${g.desc}</p>
      <div class="group-card-campaigns">
        ${g.campaigns.map(c=>`<div class="campaign-tag"><span class="campaign-tag-dot" style="background:${color}"></span>${c}</div>`).join('')}
      </div>`;
    grid.appendChild(card);
  });
  s0.innerHTML=titleHtml;
  s0.appendChild(grid);track.appendChild(s0);

  CAMP_DETAILS.forEach(camp=>{
    const s=document.createElement('div');s.className='slide';
    const g=GROUPS[camp.group];
    const color=GROUP_COLORS[camp.group],light=GROUP_LIGHT[camp.group],dark=GROUP_DARK[camp.group];
    s.innerHTML=`<div class="camp-detail">
      <div class="camp-detail-header">
        <div class="camp-detail-dot" style="background:${color}"></div>
        <div class="camp-detail-name" style="color:${dark}">${camp.name}</div>
        <span class="camp-detail-group" style="background:${light};color:${dark}">${g.name} — ${g.label}</span>
      </div>
      <p class="camp-detail-sub">${camp.desc}</p>
      <div class="camp-detail-section">
        <div class="camp-detail-section-title">เงื่อนไข</div>
        <div class="camp-detail-conditions">
          ${camp.conditions.map(c=>`<div class="camp-condition"><div class="camp-condition-icon" style="background:${light};color:${dark}">&#10003;</div><span>${c}</span></div>`).join('')}
        </div>
      </div>
      <div class="camp-detail-section">
        <div class="camp-detail-section-title">เส้นทางถัดไป</div>
        <div class="camp-detail-paths">
          ${camp.paths.map(p=>`<div class="camp-path" style="background:${p.color}10;color:${p.color};border:1px solid ${p.color}25"><div class="camp-path-dot" style="background:${p.color}"></div>${p.label}</div>`).join('')}
        </div>
      </div>
    </div>`;
    track.appendChild(s);
  });

  for(let i=0;i<TOTAL_SLIDES;i++){
    const dot=document.createElement('button');dot.className='slide-dot'+(i===0?' active':'');
    dot.onclick=()=>slideToIdx(i);
    dots.appendChild(dot);
  }

  const tabData=[{label:'กลุ่ม',idx:0},...CAMP_DETAILS.map((c,i)=>({label:c.name,idx:i+1}))];
  tabData.forEach(t=>{
    const btn=document.createElement('button');btn.className='slide-tab'+(t.idx===0?' active':'');
    btn.textContent=t.label;btn.onclick=()=>slideToIdx(t.idx);
    tabs.appendChild(btn);
  });

  updateSlideUI();
}

function slideToIdx(idx){
  currentSlide=Math.max(0,Math.min(TOTAL_SLIDES-1,idx));
  const track=document.getElementById('slideTrack');
  track.style.transform=`translateX(-${currentSlide*100}%)`;
  updateSlideUI();
  updateSlideHeight();
}

function slideGo(dir){slideToIdx(currentSlide+dir)}

function updateSlideUI(){
  document.querySelectorAll('.slide-dot').forEach((d,i)=>d.classList.toggle('active',i===currentSlide));
  document.querySelectorAll('.slide-tab').forEach((t,i)=>t.classList.toggle('active',i===currentSlide));
  document.getElementById('slideLeft').classList.toggle('hidden',currentSlide===0);
  document.getElementById('slideRight').classList.toggle('hidden',currentSlide===TOTAL_SLIDES-1);
  document.getElementById('slideTabs').classList.toggle('visible',currentSlide>0);
}

function updateSlideHeight(){
  if(window.innerWidth>768)return;
  const vp=document.getElementById('slideViewport');
  const slides=document.querySelectorAll('.slide');
  if(!vp||!slides[currentSlide])return;
  const h=slides[currentSlide].scrollHeight;
  vp.style.height=h+'px';
  vp.style.transition='height 0.3s ease';
}

// ==================== MOBILE PAN-ZOOM FLOWCHART ====================
let fcScale=0.3,fcX=0,fcY=0,fcIsMobile=false;
const FC_MIN=0.2,FC_MAX=1.0;
function initMobilePanZoom(){
  if(window.innerWidth>768)return;
  fcIsMobile=true;
  const vp=document.getElementById('flowchartViewport');
  const ct=document.getElementById('flowchartContainer');
  if(!vp||!ct)return;
  vp.style.display='block';
  document.getElementById('flowchartZoomControls').style.display='flex';
  fcScale=vp.clientWidth/1300;
  fcX=0;fcY=0;
  applyFcTransform();
  let startDist=0,startScale=0,startX=0,startY=0,startFcX=0,startFcY=0,isPinch=false;
  vp.addEventListener('touchstart',function(e){
    if(e.touches.length===2){
      isPinch=true;
      startDist=Math.hypot(e.touches[1].clientX-e.touches[0].clientX,e.touches[1].clientY-e.touches[0].clientY);
      startScale=fcScale;
    }else if(e.touches.length===1){
      isPinch=false;
      startX=e.touches[0].clientX;startY=e.touches[0].clientY;
      startFcX=fcX;startFcY=fcY;
    }
  },{passive:true});
  vp.addEventListener('touchmove',function(e){
    e.preventDefault();
    if(e.touches.length===2&&isPinch){
      const dist=Math.hypot(e.touches[1].clientX-e.touches[0].clientX,e.touches[1].clientY-e.touches[0].clientY);
      fcScale=Math.min(FC_MAX,Math.max(FC_MIN,startScale*(dist/startDist)));
      clampFcPosition();
      applyFcTransform();
    }else if(e.touches.length===1&&!isPinch){
      const dx=e.touches[0].clientX-startX;
      const dy=e.touches[0].clientY-startY;
      fcX=startFcX+dx;fcY=startFcY+dy;
      clampFcPosition();
      applyFcTransform();
    }
  },{passive:false});
  vp.addEventListener('touchend',function(){isPinch=false},{passive:true});
}
function clampFcPosition(){
  const vp=document.getElementById('flowchartViewport');
  if(!vp)return;
  const vw=vp.clientWidth,vh=vp.clientHeight;
  const cw=1300*fcScale,ch=1080*fcScale;
  const minX=Math.min(0,vw-cw),minY=Math.min(0,vh-ch);
  fcX=Math.max(minX,Math.min(0,fcX));
  fcY=Math.max(minY,Math.min(0,fcY));
}
function applyFcTransform(){
  const ct=document.getElementById('flowchartContainer');
  if(!ct)return;
  ct.style.transform=`translate(${fcX}px,${fcY}px) scale(${fcScale})`;
  const lbl=document.getElementById('fcZoomLevel');
  if(lbl)lbl.textContent=Math.round(fcScale*100)+'%';
}
function fcZoom(dir){
  const step=0.08;
  fcScale=Math.min(FC_MAX,Math.max(FC_MIN,fcScale+dir*step));
  clampFcPosition();
  applyFcTransform();
}
function fcReset(){
  const vp=document.getElementById('flowchartViewport');
  if(!vp)return;
  fcScale=vp.clientWidth/1300;
  fcX=0;fcY=0;
  applyFcTransform();
}
window.addEventListener('resize',function(){
  if(window.innerWidth<=768&&!fcIsMobile)initMobilePanZoom();
  if(window.innerWidth>768&&fcIsMobile){
    fcIsMobile=false;
    const ct=document.getElementById('flowchartContainer');
    if(ct)ct.style.transform='';
  }
  const svp=document.getElementById('slideViewport');
  if(window.innerWidth<=768){updateSlideHeight();}
  else if(svp){svp.style.height='';}
});

// ==================== FLOW MODE SWITCHER ====================
let flowMode='map';
function switchFlowMode(mode){
  flowMode=mode;
  document.getElementById('flowModeMap').classList.toggle('active',mode==='map');
  document.getElementById('flowModeSim').classList.toggle('active',mode==='sim');

  const mapEl=document.getElementById('flowContentMap');
  const simEl=document.getElementById('flowContentSim');
  const subtitle=document.getElementById('flowSubtitle');

  if(mode==='map'){
    mapEl.style.display='';
    simEl.style.display='none';
    subtitle.textContent='คลิกที่ node เพื่อดูรายละเอียด หรือกดปุ่มเส้นทางเพื่อดูการเชื่อมต่อ';
  }else{
    mapEl.style.display='none';
    simEl.style.display='';
    subtitle.textContent='เลือกทีละขั้นตอน เหมือนเล่นเกม — ดูผลลัพธ์เปลี่ยนแบบ real-time';
  }
}

// ==================== GSAP ANIMATIONS ====================
function initGSAP(){
  if(typeof gsap==='undefined')return;
  gsap.registerPlugin(ScrollTrigger);

  const tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.to('.hero-eyebrow',{opacity:1,y:0,duration:0.8},0.1)
    .to('.hero-title',{opacity:1,y:0,duration:1},0.2)
    .to('.hero-subtitle',{opacity:1,y:0,duration:0.8},0.5)
    .to('.hero-meta',{opacity:1,y:0,duration:0.8},0.7)
    .to('.scroll-indicator',{opacity:1,duration:0.6},1.2);

  gsap.from('.group-card',{scrollTrigger:{trigger:'.group-grid',start:'top 80%'},y:40,opacity:0,stagger:0.1,duration:0.7,ease:'power2.out'});

  gsap.utils.toArray('.section-title').forEach(t=>{
    gsap.from(t,{scrollTrigger:{trigger:t,start:'top 85%'},y:30,opacity:0,duration:0.7,ease:'power2.out'});
  });
  gsap.utils.toArray('.section-subtitle').forEach(t=>{
    gsap.from(t,{scrollTrigger:{trigger:t,start:'top 85%'},y:20,opacity:0,duration:0.6,ease:'power2.out',delay:0.15});
  });

  ScrollTrigger.create({trigger:'.flowchart-container',start:'top 80%',onEnter:()=>{
    gsap.fromTo('.node',{y:20},{y:0,stagger:0.06,duration:0.5,ease:'back.out(1.2)'});
  },once:true});

  gsap.from('.sim-steps-panel',{scrollTrigger:{trigger:'.sim-container',start:'top 80%'},x:-30,opacity:0,duration:0.6,ease:'power2.out'});
  gsap.from('.sim-flow-panel',{scrollTrigger:{trigger:'.sim-container',start:'top 80%'},x:30,opacity:0,duration:0.6,ease:'power2.out',delay:0.15});
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded',()=>{
  renderOverview();
  renderFlowchart();
  buildSimSteps();
  initManagement();
  setTimeout(initGSAP,100);
  setTimeout(initMobilePanZoom,200);
  setTimeout(updateSlideHeight,100);
  const nav=document.getElementById('mainNav');
  const hero=document.getElementById('hero');
  function checkNav(){
    const heroBottom=hero.getBoundingClientRect().bottom;
    if(heroBottom<=52)nav.classList.add('nav-scrolled');
    else nav.classList.remove('nav-scrolled');
  }
  window.addEventListener('scroll',checkNav,{passive:true});
  checkNav();
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(spotlightActive)deactivateSpotlight();else closePopup();closeMobileMenu()}
  });
  document.getElementById('popupOverlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closePopup()});
  document.getElementById('flowchartOverlay').addEventListener('click',deactivateSpotlight);
});

function toggleMobileMenu(){
  const overlay=document.getElementById('mobileMenuOverlay');
  const btn=document.getElementById('navHamburger');
  overlay.classList.toggle('open');
  btn.classList.toggle('open');
  document.body.style.overflow=overlay.classList.contains('open')?'hidden':'';
}
function closeMobileMenu(){
  document.getElementById('mobileMenuOverlay').classList.remove('open');
  document.getElementById('navHamburger').classList.remove('open');
  document.body.style.overflow='';
}

// ==================== PASSWORD GATE ====================
const PW_HASH='df3e04bce8087c8a61b87dd1b9c251158f1543b91cd0268dff59864c23a1b284';
let pwAttempts=0;
const MAX_ATTEMPTS=5;
let pwLocked=false;

(function(){
  if(sessionStorage.getItem('rfm_auth')==='1'){
    document.getElementById('pwGate').classList.add('unlocked');
  }
  document.getElementById('pwInput').addEventListener('keydown',e=>{
    if(e.key==='Enter')checkPassword();
  });
})();

async function sha256(msg){
  const data=new TextEncoder().encode(msg);
  const buf=await crypto.subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function checkPassword(){
  if(pwLocked)return;
  const input=document.getElementById('pwInput').value;
  if(!input)return;
  const hash=await sha256(input);
  if(hash===PW_HASH){
    sessionStorage.setItem('rfm_auth','1');
    document.getElementById('pwGate').classList.add('unlocked');
    document.getElementById('pwError').classList.remove('show');
  }else{
    pwAttempts++;
    document.getElementById('pwError').classList.add('show');
    document.getElementById('pwInput').value='';
    document.getElementById('pwInput').style.borderColor='rgba(214,64,69,0.5)';
    setTimeout(()=>{document.getElementById('pwInput').style.borderColor=''},800);
    if(pwAttempts>=MAX_ATTEMPTS){
      pwLocked=true;
      document.getElementById('pwError').textContent='ลองเกินจำนวนครั้ง กรุณารอ 30 วินาที';
      document.getElementById('pwBtn').style.opacity='0.4';
      document.getElementById('pwBtn').style.pointerEvents='none';
      let sec=30;
      document.getElementById('pwAttempts').textContent='รอ '+sec+' วินาที...';
      const iv=setInterval(()=>{
        sec--;
        document.getElementById('pwAttempts').textContent=sec>0?'รอ '+sec+' วินาที...':'';
        if(sec<=0){
          clearInterval(iv);pwLocked=false;pwAttempts=0;
          document.getElementById('pwError').textContent='รหัสผ่านไม่ถูกต้อง';
          document.getElementById('pwError').classList.remove('show');
          document.getElementById('pwBtn').style.opacity='';
          document.getElementById('pwBtn').style.pointerEvents='';
        }
      },1000);
    }else{
      document.getElementById('pwAttempts').textContent='เหลืออีก '+(MAX_ATTEMPTS-pwAttempts)+' ครั้ง';
    }
  }
}
