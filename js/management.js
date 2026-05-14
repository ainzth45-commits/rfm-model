// ==================== EXCEL FORMAT HELPERS ====================
function fmtCols(ws,formats){
  const range=XLSX.utils.decode_range(ws['!ref']);
  for(let c=range.s.c;c<=range.e.c;c++){
    const fmt=formats[c];
    if(!fmt)continue;
    for(let r=range.s.r+1;r<=range.e.r;r++){
      const addr=XLSX.utils.encode_cell({r,c});
      if(!ws[addr])continue;
      if(fmt==='@'){ws[addr].t='s';ws[addr].z='@';}
      else{ws[addr].z=fmt;}
    }
  }
}
function lockRange(ws){
  const range=XLSX.utils.decode_range(ws['!ref']);
  ws['!ref']=XLSX.utils.encode_range(range);
}

// ==================== MANAGEMENT ====================
let mgmtData=null;
let mgmtResult=null;
let mgmtCheckData=null;
let mgmtCheckResult=null;
let mgmtMode='assign';
let salePlanData=null;

function switchMode(mode){
  mgmtMode=mode;
  document.getElementById('modeCheckBtn').classList.toggle('active',mode==='check');
  document.getElementById('modeAssignBtn').classList.toggle('active',mode==='assign');

  const uploadArea=document.getElementById('mgmtUploadArea');
  uploadArea.classList.remove('mode-check','mode-assign');
  uploadArea.classList.add('mode-'+mode);

  const subtitle=document.getElementById('mgmtSubtitle');
  const colsEl=document.getElementById('mgmtUploadCols');
  if(mode==='check'){
    subtitle.textContent='อัปโหลดข้อมูลลูกค้าใหม่ ระบบจะตรวจสอบว่าแต่ละเบอร์ควรอยู่แคมเปญไหน';
    colsEl.innerHTML=['phone','R','S','N'].map(c=>`<span class="mgmt-col-chip">${c}</span>`).join('');
  }else{
    subtitle.textContent='อัปโหลดข้อมูลลูกค้า จัดแคมเปญใหม่อัตโนมัติ ดูผลเปรียบเทียบก่อน-หลัง';
    colsEl.innerHTML=['phone','campaign','R','S','N','T'].map(c=>`<span class="mgmt-col-chip">${c}</span>`).join('');
  }

  document.getElementById('mgmtError').classList.remove('show');
  document.getElementById('mgmtCheckSummary').classList.remove('show');
  document.getElementById('mgmtCheckResult').classList.remove('show');
  document.getElementById('mgmtSummary').classList.remove('show');
  document.getElementById('mgmtResult').classList.remove('show');
  document.getElementById('mgmtSalePlan').classList.remove('show');
  salePlanData=null;

  document.getElementById('mgmtFileInput').value='';
  mgmtData=null;mgmtResult=null;
  mgmtCheckData=null;mgmtCheckResult=null;
}

function downloadTemplate(){
  if(mgmtMode==='check'){
    const header=['phone','R','S','N'];
    const examples=[
      ['0812345678',45,'CRM',2],
      ['0898765432',10,'OTHER',1],
    ];
    const ws1=XLSX.utils.aoa_to_sheet([header,...examples]);
    ws1['!cols']=[{wch:14},{wch:8},{wch:8},{wch:8}];
    fmtCols(ws1,{0:'@',1:'#,##0',3:'#,##0'});
    lockRange(ws1);

    const refHeader=['key (ใช้อ้างอิง)','ชื่อแคมเปญ','กลุ่ม'];
    const refRows=CAMPAIGNS.map(c=>[c.key,c.label,GROUPS[c.group].name]);
    const ws2=XLSX.utils.aoa_to_sheet([refHeader,...refRows]);
    ws2['!cols']=[{wch:20},{wch:28},{wch:16}];
    lockRange(ws2);

    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws1,'ข้อมูลลูกค้า');
    XLSX.utils.book_append_sheet(wb,ws2,'รายชื่อแคมเปญ');
    XLSX.writeFile(wb,'check_template.xlsx');
  }else{
    const header=['phone','campaign','R','S','N','T'];
    const examples=[
      ['0812345678','waiting',45,'CRM',2,60],
      ['0898765432','new',10,'OTHER',1,''],
    ];
    const ws1=XLSX.utils.aoa_to_sheet([header,...examples]);
    ws1['!cols']=[{wch:14},{wch:28},{wch:8},{wch:8},{wch:8},{wch:8}];
    fmtCols(ws1,{0:'@',2:'#,##0',4:'#,##0',5:'#,##0'});
    lockRange(ws1);

    const refHeader=['key (ใช้กรอกในคอลัมน์ campaign)','ชื่อแคมเปญ','กลุ่ม'];
    const refRows=CAMPAIGNS.map(c=>[c.key,c.label,GROUPS[c.group].name]);
    const ws2=XLSX.utils.aoa_to_sheet([refHeader,...refRows]);
    ws2['!cols']=[{wch:34},{wch:28},{wch:16}];
    lockRange(ws2);

    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws1,'ข้อมูลลูกค้า');
    XLSX.utils.book_append_sheet(wb,ws2,'รายชื่อแคมเปญ');
    XLSX.writeFile(wb,'campaign_template.xlsx');
  }
}

function initManagement(){
  const uploadArea=document.getElementById('mgmtUploadArea');
  const fileInput=document.getElementById('mgmtFileInput');
  uploadArea.classList.add('mode-'+mgmtMode);

  uploadArea.addEventListener('click',()=>fileInput.click());
  uploadArea.addEventListener('dragover',e=>{e.preventDefault();uploadArea.classList.add('drag-over')});
  uploadArea.addEventListener('dragleave',()=>uploadArea.classList.remove('drag-over'));
  uploadArea.addEventListener('drop',e=>{
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    if(e.dataTransfer.files.length)processFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change',e=>{
    if(e.target.files.length)processFile(e.target.files[0]);
  });
}

function processFile(file){
  if(mgmtMode==='check') return processCheckFile(file);
  return processAssignFile(file);
}

// ==================== CHECK MODE ====================
function processCheckFile(file){
  const errorEl=document.getElementById('mgmtError');
  const summaryEl=document.getElementById('mgmtCheckSummary');
  const resultEl=document.getElementById('mgmtCheckResult');
  errorEl.classList.remove('show');
  summaryEl.classList.remove('show');
  resultEl.classList.remove('show');
  mgmtCheckData=null;mgmtCheckResult=null;

  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const wb=XLSX.read(e.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{defval:''});

      if(rows.length===0){showError('ไฟล์ไม่มีข้อมูล กรุณาตรวจสอบไฟล์');return;}

      const headers=Object.keys(rows[0]);
      const phoneCol=findColumn(headers,['phone','เบอร์','เบอร์โทร','tel','mobile','หมายเลข']);
      const rCol=findColumn(headers,['r','recency','วันรับสินค้า','days','R']);
      const sCol=findColumn(headers,['s','seller','ผู้ขาย','S']);
      const nCol=findColumn(headers,['n','number','frequency','ครั้ง','จำนวน','N']);

      if(!phoneCol){showError('ไม่พบคอลัมน์เบอร์โทร — ต้องมีคอลัมน์ชื่อ: phone, เบอร์, เบอร์โทร, tel, mobile');return;}
      if(!rCol){showError('ไม่พบคอลัมน์ R (วันรับสินค้า) — ต้องมีคอลัมน์ชื่อ: R, recency, วันรับสินค้า, days');return;}
      if(!sCol){showError('ไม่พบคอลัมน์ S (ผู้ขาย) — ต้องมีคอลัมน์ชื่อ: S, seller, ผู้ขาย');return;}
      if(!nCol){showError('ไม่พบคอลัมน์ N (จำนวนครั้ง) — ต้องมีคอลัมน์ชื่อ: N, number, frequency, ครั้ง');return;}

      const parsed=[];
      const phoneSet=new Set();
      const duplicates=[];

      for(let i=0;i<rows.length;i++){
        const row=rows[i];
        const phone=String(row[phoneCol]).trim();
        if(!phone||phone==='')continue;

        if(phoneSet.has(phone)){
          duplicates.push({phone,row:i+2});
          continue;
        }
        phoneSet.add(phone);

        const R=parseFloat(row[rCol]);
        const S=String(row[sCol]).trim().toUpperCase();
        const N=parseInt(row[nCol]);

        if(isNaN(R)){showError(`แถวที่ ${i+2}: ค่า R ไม่ถูกต้อง "${row[rCol]}"`);return;}
        if(S!=='CRM'&&S!=='OTHER'){showError(`แถวที่ ${i+2}: ค่า S ต้องเป็น CRM หรือ OTHER แต่ได้ "${row[sCol]}"`);return;}
        if(isNaN(N)||N<1){showError(`แถวที่ ${i+2}: ค่า N ไม่ถูกต้อง "${row[nCol]}"`);return;}

        parsed.push({phone,R,S,N:N>1?2:1});
      }

      if(duplicates.length>0){
        showError(`พบเบอร์ซ้ำ ${duplicates.length} เบอร์:<br>${duplicates.slice(0,10).map(d=>`• ${d.phone} (แถวที่ ${d.row})`).join('<br>')}${duplicates.length>10?`<br>... และอีก ${duplicates.length-10} เบอร์`:''}`)
        return;
      }

      if(parsed.length===0){showError('ไม่พบข้อมูลที่ถูกต้องในไฟล์');return;}

      mgmtCheckData=parsed;
      renderCheckSummary();

    }catch(err){
      showError('ไม่สามารถอ่านไฟล์ได้: '+err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

function renderCheckSummary(){
  if(!mgmtCheckData)return;
  const summaryEl=document.getElementById('mgmtCheckSummary');
  const countEl=document.getElementById('mgmtCheckCount');
  countEl.textContent=mgmtCheckData.length.toLocaleString()+' เบอร์';
  summaryEl.classList.add('show');
  document.getElementById('mgmtCheckRunBtn').disabled=false;
}

function runCheckAssignment(){
  if(!mgmtCheckData)return;
  const btn=document.getElementById('mgmtCheckRunBtn');
  btn.disabled=true;
  btn.textContent='กำลังประมวลผล...';

  setTimeout(()=>{
    const counts={};
    CAMPAIGNS.forEach(c=>{counts[c.key]=0});

    const results=mgmtCheckData.map(d=>{
      const result=simLogic('raw',d.S,d.N,d.R,null);
      const camp=CAMPAIGNS.find(c=>c.nodeId===result.id);
      const key=camp?camp.key:'waiting';
      counts[key]++;
      return{...d,campaign:key,nodeId:result.id,group:result.group};
    });

    mgmtCheckResult=results;
    renderCheckResult(counts);
    renderSalePlan(counts);
    btn.textContent='ตรวจสอบแคมเปญ';
    btn.disabled=false;
  },100);
}

function renderCheckResult(counts){
  const resultEl=document.getElementById('mgmtCheckResult');
  const tableBody=document.getElementById('mgmtCheckResultBody');
  const total=mgmtCheckResult.length;

  tableBody.innerHTML=CAMPAIGNS.filter(c=>counts[c.key]>0).map(c=>{
    const color=GROUP_COLORS[c.group];
    const count=counts[c.key];
    const pct=total>0?((count/total)*100).toFixed(1):'0.0';
    return`<tr>
      <td><span class="camp-dot" style="background:${color}"></span>${c.label}</td>
      <td style="font-family:var(--font-mono);font-size:11px;color:${GROUP_DARK[c.group]}">${GROUPS[c.group].name}</td>
      <td class="num">${count.toLocaleString()}</td>
      <td class="num" style="color:var(--text-tertiary)">${pct}%</td>
    </tr>`;
  }).join('');

  resultEl.classList.add('show');
}

function exportCheckResult(){
  if(!mgmtCheckResult)return;
  const exportData=mgmtCheckResult.map(r=>{
    const camp=CAMPAIGNS.find(c=>c.key===r.campaign);
    return{
      'เบอร์โทร':r.phone,
      'แคมเปญที่จัดให้':camp?camp.label:r.campaign,
      'กลุ่ม':GROUPS[r.group]?GROUPS[r.group].name:'',
      'R':r.R,
      'S':r.S,
      'N':r.N,
    };
  });
  const ws=XLSX.utils.json_to_sheet(exportData);
  ws['!cols']=[{wch:14},{wch:28},{wch:16},{wch:10},{wch:8},{wch:8}];
  fmtCols(ws,{0:'@',3:'#,##0',5:'#,##0'});
  lockRange(ws);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'ผลตรวจสอบแคมเปญ');
  XLSX.writeFile(wb,'check_result.xlsx');
}

// ==================== ASSIGN MODE ====================
function processAssignFile(file){
  const errorEl=document.getElementById('mgmtError');
  const summaryEl=document.getElementById('mgmtSummary');
  const resultEl=document.getElementById('mgmtResult');
  errorEl.classList.remove('show');
  summaryEl.classList.remove('show');
  resultEl.classList.remove('show');
  mgmtData=null;
  mgmtResult=null;

  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const wb=XLSX.read(e.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{defval:''});

      if(rows.length===0){showError('ไฟล์ไม่มีข้อมูล กรุณาตรวจสอบไฟล์');return;}

      const headers=Object.keys(rows[0]);
      const phoneCol=findColumn(headers,['phone','เบอร์','เบอร์โทร','tel','mobile','หมายเลข']);
      const campCol=findColumn(headers,['campaign','แคมเปญ','camp','current_campaign','แคมเปญปัจจุบัน']);
      const rCol=findColumn(headers,['r','recency','วันรับสินค้า','days','R']);
      const sCol=findColumn(headers,['s','seller','ผู้ขาย','S']);
      const nCol=findColumn(headers,['n','number','frequency','ครั้ง','จำนวน','N']);
      const tCol=findColumn(headers,['t','time','วันในกลุ่ม','T']);

      if(!phoneCol){showError('ไม่พบคอลัมน์เบอร์โทร — ต้องมีคอลัมน์ชื่อ: phone, เบอร์, เบอร์โทร, tel, mobile');return;}
      if(!campCol){showError('ไม่พบคอลัมน์แคมเปญปัจจุบัน — ต้องมีคอลัมน์ชื่อ: campaign, แคมเปญ, แคมเปญปัจจุบัน');return;}
      if(!rCol){showError('ไม่พบคอลัมน์ R (วันรับสินค้า) — ต้องมีคอลัมน์ชื่อ: R, recency, วันรับสินค้า, days');return;}
      if(!sCol){showError('ไม่พบคอลัมน์ S (ผู้ขาย) — ต้องมีคอลัมน์ชื่อ: S, seller, ผู้ขาย');return;}
      if(!nCol){showError('ไม่พบคอลัมน์ N (จำนวนครั้ง) — ต้องมีคอลัมน์ชื่อ: N, number, frequency, ครั้ง');return;}

      const parsed=[];
      const phoneSet=new Set();
      const duplicates=[];

      for(let i=0;i<rows.length;i++){
        const row=rows[i];
        const phone=String(row[phoneCol]).trim();
        if(!phone||phone==='')continue;

        if(phoneSet.has(phone)){
          duplicates.push({phone,row:i+2});
          continue;
        }
        phoneSet.add(phone);

        const campRaw=String(row[campCol]).trim().toLowerCase();
        const campKey=matchCampaignKey(campRaw);
        if(!campKey){
          showError(`แถวที่ ${i+2}: แคมเปญ "${row[campCol]}" ไม่ตรงกับแคมเปญใดในระบบ`);
          return;
        }

        const R=parseFloat(row[rCol]);
        const S=String(row[sCol]).trim().toUpperCase();
        const N=parseInt(row[nCol]);
        const T=tCol?parseFloat(row[tCol]):null;

        if(isNaN(R)){showError(`แถวที่ ${i+2}: ค่า R ไม่ถูกต้อง "${row[rCol]}"`);return;}
        if(S!=='CRM'&&S!=='OTHER'){showError(`แถวที่ ${i+2}: ค่า S ต้องเป็น CRM หรือ OTHER แต่ได้ "${row[sCol]}"`);return;}
        if(isNaN(N)||N<1){showError(`แถวที่ ${i+2}: ค่า N ไม่ถูกต้อง "${row[nCol]}"`);return;}

        parsed.push({phone,currentCampaign:campKey,R,S,N:N>1?2:1,T:isNaN(T)?null:T});
      }

      if(duplicates.length>0){
        showError(`พบเบอร์ซ้ำ ${duplicates.length} เบอร์:<br>${duplicates.slice(0,10).map(d=>`• ${d.phone} (แถวที่ ${d.row})`).join('<br>')}${duplicates.length>10?`<br>... และอีก ${duplicates.length-10} เบอร์`:''}`)
        return;
      }

      if(parsed.length===0){showError('ไม่พบข้อมูลที่ถูกต้องในไฟล์');return;}

      mgmtData=parsed;
      renderPreSummary();

    }catch(err){
      showError('ไม่สามารถอ่านไฟล์ได้: '+err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

function findColumn(headers,keywords){
  for(const h of headers){
    const lower=h.toLowerCase().trim();
    if(keywords.includes(lower))return h;
  }
  return null;
}

function matchCampaignKey(raw){
  const map={
    'raw':'raw','ไม่มีแคมเปญ':'raw','ไม่มี':'raw',
    'new':'new','ลูกค้าใหม่':'new','ใหม่':'new',
    'personal':'personal','ส่วนตัว':'personal','ส่วนตัว 1-2 เดือน':'personal',
    'lastchance':'lastchance','โอกาสสุดท้าย':'lastchance',
    'newcare':'newcare','หาคนดูแลใหม่':'newcare','หาคนดูแล':'newcare',
    'waiting':'waiting','รอคนมาจีบ':'waiting','รอคนมาจีบให้ติด':'waiting',
    'notbad':'notbad','not bad':'notbad','ถังกลาง 6ด-1ปี':'notbad','ถังกลาง 6 เดือน-1 ปี':'notbad',
    'excavate1':'excavate1','ถังกลาง 1-3 ปี':'excavate1',
    'excavate2':'excavate2','ถังโบราณ':'excavate2','ถังโบราณ 3ปี+':'excavate2','ถังโบราณ 3 ปี+':'excavate2',
  };
  if(map[raw])return map[raw];
  for(const[k,v] of Object.entries(map)){
    if(raw.includes(k))return v;
  }
  return null;
}

function showError(msg){
  const el=document.getElementById('mgmtError');
  el.innerHTML=msg;
  el.classList.add('show');
}

function renderPreSummary(){
  if(!mgmtData)return;
  const summaryEl=document.getElementById('mgmtSummary');
  const countEl=document.getElementById('mgmtTotalCount');
  const tableBody=document.getElementById('mgmtPreTableBody');

  countEl.textContent=mgmtData.length.toLocaleString()+' เบอร์';

  const counts={};
  CAMPAIGNS.forEach(c=>{counts[c.key]=0});
  mgmtData.forEach(d=>{counts[d.currentCampaign]=(counts[d.currentCampaign]||0)+1});

  tableBody.innerHTML=CAMPAIGNS.map(c=>{
    const color=GROUP_COLORS[c.group];
    const count=counts[c.key]||0;
    const pct=mgmtData.length>0?((count/mgmtData.length)*100).toFixed(1):'0.0';
    return`<tr>
      <td><span class="camp-dot" style="background:${color}"></span>${c.label}</td>
      <td style="font-family:var(--font-mono);font-size:11px;color:${GROUP_DARK[c.group]}">${GROUPS[c.group].name}</td>
      <td class="num">${count.toLocaleString()}</td>
      <td class="num" style="color:var(--text-tertiary)">${pct}%</td>
    </tr>`;
  }).join('');

  summaryEl.classList.add('show');
  document.getElementById('mgmtRunBtn').disabled=false;
}

function runCampaignAssignment(){
  if(!mgmtData)return;
  const btn=document.getElementById('mgmtRunBtn');
  btn.disabled=true;
  btn.textContent='กำลังประมวลผล...';

  setTimeout(()=>{
    const beforeCounts={};
    const afterCounts={};
    CAMPAIGNS.forEach(c=>{beforeCounts[c.key]=0;afterCounts[c.key]=0});

    const results=mgmtData.map(d=>{
      beforeCounts[d.currentCampaign]++;
      const result=simLogic(d.currentCampaign,d.S,d.N,d.R,d.T);
      const newCamp=CAMPAIGNS.find(c=>c.nodeId===result.id);
      const newKey=newCamp?newCamp.key:'waiting';
      afterCounts[newKey]++;
      return{...d,newCampaign:newKey,newNodeId:result.id,newGroup:result.group};
    });

    mgmtResult=results;
    renderResult(beforeCounts,afterCounts);
    renderSalePlan(afterCounts);
    btn.textContent='จัดแคมเปญใหม่';
    btn.disabled=false;
  },100);
}

function renderResult(beforeCounts,afterCounts){
  const resultEl=document.getElementById('mgmtResult');
  const tableBody=document.getElementById('mgmtResultTableBody');

  tableBody.innerHTML=CAMPAIGNS.map(c=>{
    const color=GROUP_COLORS[c.group];
    const before=beforeCounts[c.key]||0;
    const after=afterCounts[c.key]||0;
    const net=after-before;
    const changed=before!==after;

    let movedOut=0,movedIn=0;
    if(mgmtResult){
      movedOut=mgmtResult.filter(r=>r.currentCampaign===c.key&&r.newCampaign!==c.key).length;
      movedIn=mgmtResult.filter(r=>r.currentCampaign!==c.key&&r.newCampaign===c.key).length;
    }

    return`<tr${changed?' style="background:rgba(0,113,227,0.02)"':''}>
      <td><span class="camp-dot" style="background:${color}"></span>${c.label}</td>
      <td class="num">${before.toLocaleString()}</td>
      <td class="num change-out">${movedOut>0?'-'+movedOut.toLocaleString():'—'}</td>
      <td class="num change-in">${movedIn>0?'+'+movedIn.toLocaleString():'—'}</td>
      <td class="num" style="font-weight:700">${after.toLocaleString()}</td>
      <td class="num change-net ${net>0?'positive':net<0?'negative':''}">${net>0?'+'+net:net<0?net:'—'}</td>
    </tr>`;
  }).join('');

  resultEl.classList.add('show');
}

function exportResult(){
  if(!mgmtResult)return;
  const exportData=mgmtResult.map(r=>{
    const oldCamp=CAMPAIGNS.find(c=>c.key===r.currentCampaign);
    const newCamp=CAMPAIGNS.find(c=>c.key===r.newCampaign);
    return{
      'เบอร์โทร':r.phone,
      'แคมเปญเดิม':oldCamp?oldCamp.label:r.currentCampaign,
      'แคมเปญใหม่':newCamp?newCamp.label:r.newCampaign,
      'เปลี่ยน':r.currentCampaign!==r.newCampaign?'ใช่':'ไม่',
      'R':r.R,
      'S':r.S,
      'N':r.N,
      'T':r.T!==null?r.T:'',
    };
  });
  const ws=XLSX.utils.json_to_sheet(exportData);
  ws['!cols']=[{wch:14},{wch:28},{wch:28},{wch:8},{wch:10},{wch:8},{wch:8},{wch:10}];
  fmtCols(ws,{0:'@',4:'#,##0',6:'#,##0',7:'#,##0'});
  lockRange(ws);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'ผลจัดแคมเปญ');
  XLSX.writeFile(wb,'campaign_result.xlsx');
}

// ==================== SALE PLAN ====================
function renderSalePlan(counts){
  salePlanData=CAMPAIGNS.filter(c=>counts[c.key]>0).map(c=>({
    key:c.key,label:c.label,group:c.group,count:counts[c.key],conRate:0,sizeOrder:0
  }));

  const tbody=document.getElementById('mgmtSalePlanBody');
  tbody.innerHTML=salePlanData.map((sp,i)=>{
    const color=GROUP_COLORS[sp.group];
    return`<tr>
      <td><span class="camp-dot" style="background:${color}"></span>${sp.label}</td>
      <td class="num">${sp.count.toLocaleString()}</td>
      <td style="text-align:center"><input type="number" min="0" max="100" step="1" placeholder="0" data-sp="${i}" data-field="conRate" oninput="updateSalePlanCalc()">%</td>
      <td style="text-align:center"><input type="number" min="0" step="1" placeholder="0" data-sp="${i}" data-field="sizeOrder" oninput="updateSalePlanCalc()"></td>
      <td class="num sp-revenue" id="spRev${i}">0</td>
    </tr>`;
  }).join('');

  document.getElementById('spTotalCount').textContent=salePlanData.reduce((s,sp)=>s+sp.count,0).toLocaleString();
  document.getElementById('spTotalRevenue').textContent='0';
  document.getElementById('mgmtSalePlan').classList.add('show');
}

function updateSalePlanCalc(){
  if(!salePlanData)return;
  const inputs=document.querySelectorAll('.mgmt-saleplan-table input[data-sp]');
  inputs.forEach(inp=>{
    const idx=parseInt(inp.dataset.sp);
    const field=inp.dataset.field;
    salePlanData[idx][field]=parseFloat(inp.value)||0;
  });

  let totalRev=0;
  salePlanData.forEach((sp,i)=>{
    const rev=sp.count*(sp.conRate/100)*sp.sizeOrder;
    sp.revenue=rev;
    document.getElementById('spRev'+i).textContent=Math.round(rev).toLocaleString();
    totalRev+=rev;
  });
  document.getElementById('spTotalRevenue').textContent=Math.round(totalRev).toLocaleString();
}

function exportSalePlan(){
  if(!salePlanData)return;
  const results=mgmtMode==='check'?mgmtCheckResult:mgmtResult;
  if(!results)return;

  const customerData=results.map(r=>{
    const campKey=mgmtMode==='check'?r.campaign:r.newCampaign;
    const sp=salePlanData.find(s=>s.key===campKey);
    const perCustomer=sp&&sp.count>0&&sp.revenue>0?Math.round(sp.revenue/sp.count):0;
    const campObj=CAMPAIGNS.find(c=>c.key===campKey);

    if(mgmtMode==='check'){
      return{
        'เบอร์โทร':r.phone,
        'แคมเปญที่จัดให้':campObj?campObj.label:campKey,
        'กลุ่ม':GROUPS[r.group]?GROUPS[r.group].name:'',
        'R':r.R,'S':r.S,'N':r.N,
        'ยอดต่อลูกค้า':perCustomer
      };
    }else{
      const oldCamp=CAMPAIGNS.find(c=>c.key===r.currentCampaign);
      return{
        'เบอร์โทร':r.phone,
        'แคมเปญเดิม':oldCamp?oldCamp.label:r.currentCampaign,
        'แคมเปญใหม่':campObj?campObj.label:campKey,
        'เปลี่ยน':r.currentCampaign!==r.newCampaign?'ใช่':'ไม่',
        'R':r.R,'S':r.S,'N':r.N,
        'T':r.T!==null?r.T:'',
        'ยอดต่อลูกค้า':perCustomer
      };
    }
  });

  const planData=salePlanData.map(sp=>({
    'แคมเปญ':sp.label,
    'จำนวนลูกค้า':sp.count,
    'Con Rate':sp.conRate/100,
    'Size Order':sp.sizeOrder,
    'ยอดที่จะได้':Math.round(sp.revenue||0),
    'ยอดต่อลูกค้า':sp.count>0&&sp.revenue>0?Math.round(sp.revenue/sp.count):0
  }));

  const ws1=XLSX.utils.json_to_sheet(customerData);
  if(mgmtMode==='check'){
    ws1['!cols']=[{wch:14},{wch:28},{wch:16},{wch:10},{wch:8},{wch:8},{wch:14}];
    fmtCols(ws1,{0:'@',3:'#,##0',5:'#,##0',6:'#,##0'});
  }else{
    ws1['!cols']=[{wch:14},{wch:28},{wch:28},{wch:8},{wch:10},{wch:8},{wch:8},{wch:10},{wch:14}];
    fmtCols(ws1,{0:'@',4:'#,##0',6:'#,##0',7:'#,##0',8:'#,##0'});
  }
  lockRange(ws1);

  const ws2=XLSX.utils.json_to_sheet(planData);
  ws2['!cols']=[{wch:28},{wch:14},{wch:14},{wch:14},{wch:14},{wch:14}];
  fmtCols(ws2,{1:'#,##0',2:'0.00%',3:'#,##0',4:'#,##0',5:'#,##0'});
  lockRange(ws2);

  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws1,'ข้อมูลลูกค้า');
  XLSX.utils.book_append_sheet(wb,ws2,'Sale Plan');
  XLSX.writeFile(wb,'sale_plan_result.xlsx');
}
