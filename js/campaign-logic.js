// ==================== CAMPAIGN DATA & LOGIC ====================
const GROUPS=[
  {id:0,name:'Raw',label:'กลุ่ม 0',campaigns:['ไม่มีแคมเปญ'],desc:'ลูกค้าใหม่ที่เพิ่งเข้าระบบ รอจัดแคมเปญรอบถัดไป'},
  {id:1,name:'New',label:'กลุ่ม 1',campaigns:['ลูกค้าใหม่'],desc:'ลูกค้าซื้อครั้งแรกผ่านช่องทางอื่น (ไม่ใช่ CRM)'},
  {id:2,name:'Relationship',label:'กลุ่ม 2',campaigns:['ส่วนตัว 1-2 เดือน','โอกาสสุดท้าย เดือนที่ 3'],desc:'ลูกค้าที่ซื้อผ่าน CRM และอยู่ในช่วงดูแลใกล้ชิด'},
  {id:3,name:'Good',label:'กลุ่ม 3',campaigns:['หาคนดูแลใหม่','รอคนมาจีบให้ติด'],desc:'ลูกค้าที่ยังมีโอกาส ต้องเร่งดึงกลับ'},
  {id:4,name:'Not bad',label:'กลุ่ม 4',campaigns:['ถังกลาง 6 เดือน-1 ปี'],desc:'ลูกค้าที่เริ่มเฉื่อยชา ต้องกระตุ้น'},
  {id:5,name:'Excavate',label:'กลุ่ม 5',campaigns:['ถังกลาง 1-3 ปี','ถังโบราณ 3 ปี+'],desc:'ลูกค้าที่หายไปนาน ต้องขุดกลับ'},
];

const NODES=[
  {id:0,group:0,name:'ไม่มีแคมเปญ',sub:'Raw',x:530,y:20,conditions:'ลูกค้าใหม่ที่เข้าระบบระหว่างเดือน',detail:'ลูกค้าทุกคนที่เพิ่งเข้าระบบจะถูกพักไว้ที่นี่ก่อน เมื่อถึงวันจัดแคมเปญ (สิ้นเดือน) จึงจะถูกจัดเข้าแคมเปญที่เหมาะสม'},
  {id:1,group:1,name:'ลูกค้าใหม่',sub:'New',x:70,y:240,conditions:'ผู้ขาย ≠ CRM, ซื้อครั้งแรก, วันรับสินค้า ≤ 30',detail:'ลูกค้าที่ซื้อครั้งแรก ผ่านช่องทางอื่นที่ไม่ใช่ CRM และรับสินค้าไม่เกิน 30 วัน'},
  {id:2,group:2,name:'ส่วนตัว 1-2 เดือน',sub:'Relationship',x:430,y:240,conditions:'ผู้ขาย = CRM, วันรับสินค้า ≤ 60',detail:'ลูกค้าที่ซื้อผ่าน CRM ภายใน 60 วัน ได้รับการดูแลส่วนตัว ทุกรอบที่ยังเข้าเงื่อนไข วันที่เข้ากลุ่มส่วนตัวจะถูก reset'},
  {id:3,group:2,name:'โอกาสสุดท้าย\nเดือนที่ 3',sub:'Relationship',x:430,y:460,conditions:'อยู่กลุ่ม 2, วันที่เข้ากลุ่มส่วนตัว 61-90 วัน',detail:'ลูกค้าที่อยู่ใน Relationship แต่ไม่ได้ซื้อจาก CRM อีก วันที่เข้ากลุ่มส่วนตัวเพิ่มจนเข้าช่วง 61-90 วัน นี่คือโอกาสสุดท้ายก่อนหลุดจากกลุ่ม'},
  {id:4,group:3,name:'หาคนดูแลใหม่',sub:'Good',x:430,y:680,conditions:'วันที่เข้ากลุ่มส่วนตัว > 90 หรือ ผู้ขาย=CRM, วันรับสินค้า≤180',detail:'ลูกค้าที่หลุดจาก Relationship (วันที่เข้ากลุ่มส่วนตัว>90) แต่ผู้ขายล่าสุดยังเป็น CRM ถ้าวันรับสินค้า>180 จะหลุดไปถังกลาง'},
  {id:5,group:3,name:'รอคนมาจีบให้ติด',sub:'Good',x:890,y:240,conditions:'วันรับสินค้า ≤ 180 (ที่เหลือ)',detail:'ลูกค้าที่ไม่เข้าเงื่อนไขกลุ่มอื่น แต่รับสินค้าไม่เกิน 180 วัน ยังมีโอกาสดึงกลับ'},
  {id:6,group:4,name:'ถังกลาง\n6 เดือน-1 ปี',sub:'Not bad',x:890,y:460,conditions:'วันรับสินค้า 181-365 วัน',detail:'ลูกค้าที่ไม่ได้ซื้อสินค้ามา 6 เดือนถึง 1 ปี ต้องการการกระตุ้นพิเศษ'},
  {id:7,group:5,name:'ถังกลาง\n1-3 ปี',sub:'Excavate',x:890,y:680,conditions:'วันรับสินค้า 366-1095 วัน',detail:'ลูกค้าที่หายไป 1-3 ปี ต้องใช้ความพยายามมากในการดึงกลับ'},
  {id:8,group:5,name:'ถังโบราณ\n3 ปีขึ้นไป',sub:'Excavate',x:890,y:890,conditions:'วันรับสินค้า > 1095 วัน',detail:'ลูกค้าที่หายไปมากกว่า 3 ปี อยู่ที่นี่ตลอดไปจนกว่าจะกลับมาซื้อ'},
];

const CONNECTIONS=[
  {from:0,to:2,type:'crm',label:'ซื้อ CRM',info:'ผู้ขาย=CRM, วันรับสินค้า≤60 → Relationship'},
  {from:0,to:1,type:'other',label:'ซื้อ OTHER',info:'ผู้ขาย≠CRM, ซื้อครั้งแรก, วันรับสินค้า≤30 → ใหม่'},
  {from:0,to:5,type:'none',label:'อื่นๆ',info:'ผู้ขาย≠CRM, ซื้อมากกว่า 1 ครั้ง หรือ วันรับสินค้า>30'},
  {from:1,to:2,type:'crm',label:'ซื้อ CRM',info:'ผู้ขาย→CRM, วันรับสินค้า reset → Relationship'},
  {from:1,to:5,type:'other',label:'ซื้อ OTHER',info:'ผู้ขาย→OTHER, วันรับสินค้า reset → รอจีบ'},
  {from:1,to:5,type:'none',label:'ไม่ซื้อ',info:'วันรับสินค้าเพิ่ม → รอจีบ',dup:true},
  {from:2,to:2,type:'crm',label:'ซื้อ CRM',info:'ผู้ขาย=CRM, วันรับสินค้า≤60, วันที่เข้ากลุ่มส่วนตัว reset',self:true},
  {from:2,to:3,type:'other',label:'ซื้อ OTHER',info:'ผู้ขาย→OTHER, วันที่เข้ากลุ่มส่วนตัวเพิ่ม → 61-90 วัน'},
  {from:2,to:3,type:'none',label:'ไม่ซื้อ',info:'วันรับสินค้าเพิ่ม, วันที่เข้ากลุ่มส่วนตัวเพิ่ม → 61-90 วัน',dup:true},
  {from:3,to:2,type:'crm',label:'ซื้อ CRM',info:'ผู้ขาย→CRM, วันรับสินค้า≤60, วันที่เข้ากลุ่มส่วนตัว reset'},
  {from:3,to:4,type:'other',label:'ซื้อ OTHER',info:'ผู้ขาย→OTHER, วันที่เข้ากลุ่มส่วนตัว>90 → หาคนดูแล'},
  {from:3,to:4,type:'none',label:'ไม่ซื้อ',info:'วันรับสินค้าเพิ่ม, วันที่เข้ากลุ่มส่วนตัว>90 → หาคนดูแล',dup:true},
  {from:4,to:2,type:'crm',label:'ซื้อ CRM',info:'ผู้ขาย→CRM, วันรับสินค้า≤60 → Relationship'},
  {from:4,to:5,type:'other',label:'ซื้อ OTHER',info:'ผู้ขาย→OTHER, ลบวันที่เข้ากลุ่มส่วนตัว → รอจีบ'},
  {from:4,to:6,type:'none',label:'ไม่ซื้อ',info:'วันรับสินค้าเพิ่ม, วันรับสินค้า>180 → ถังกลาง'},
  {from:5,to:2,type:'crm',label:'ซื้อ CRM',info:'ผู้ขาย→CRM, วันรับสินค้า≤60 → Relationship'},
  {from:5,to:5,type:'other',label:'ซื้อ OTHER',info:'ผู้ขาย→OTHER, วันรับสินค้า reset → อยู่เดิม',self:true},
  {from:5,to:5,type:'none',label:'ไม่ซื้อ วันรับสินค้า≤180',info:'วันรับสินค้า≤180 → อยู่เดิม',self:true,dup:true},
  {from:5,to:6,type:'none',label:'ไม่ซื้อ วันรับสินค้า>180',info:'วันรับสินค้า>180 → ถังกลาง'},
  {from:6,to:2,type:'crm',label:'ซื้อ CRM',info:'ผู้ขาย→CRM, วันรับสินค้า≤60 → Relationship'},
  {from:6,to:5,type:'other',label:'ซื้อ OTHER',info:'ผู้ขาย→OTHER, วันรับสินค้า reset → รอจีบ'},
  {from:6,to:7,type:'none',label:'ไม่ซื้อ',info:'วันรับสินค้าเพิ่ม, วันรับสินค้า>365 → ถัง 1-3 ปี'},
  {from:7,to:2,type:'crm',label:'ซื้อ CRM',info:'ผู้ขาย→CRM, วันรับสินค้า≤60 → Relationship'},
  {from:7,to:5,type:'other',label:'ซื้อ OTHER',info:'ผู้ขาย→OTHER, วันรับสินค้า reset → รอจีบ'},
  {from:7,to:8,type:'none',label:'ไม่ซื้อ',info:'วันรับสินค้าเพิ่ม, วันรับสินค้า>1095 → ถังโบราณ'},
  {from:8,to:2,type:'crm',label:'ซื้อ CRM',info:'ผู้ขาย→CRM, วันรับสินค้า≤60 → Relationship'},
  {from:8,to:5,type:'other',label:'ซื้อ OTHER',info:'ผู้ขาย→OTHER, วันรับสินค้า reset → รอจีบ'},
  {from:8,to:8,type:'none',label:'ไม่ซื้อ',info:'วันรับสินค้าเพิ่ม → อยู่ตลอดไป',self:true},
];

const TYPE_COLORS={crm:'#007AFF',other:'#E8850C',none:'#8E8E93'};
const GROUP_COLORS=['#8E8E93','#28A745','#007AFF','#E8850C','#5856D6','#D64045'];
const GROUP_LIGHT=['#F2F2F4','#EBF7EE','#E5F1FF','#FEF3E2','#EEEEF9','#FDECEC'];
const GROUP_DARK=['#636366','#1E7E34','#0055B3','#A65E08','#3634A3','#A8282D'];

const CAMPAIGNS=[
  {key:'raw',nodeId:0,label:'ไม่มีแคมเปญ',group:0},
  {key:'new',nodeId:1,label:'ลูกค้าใหม่',group:1},
  {key:'personal',nodeId:2,label:'ส่วนตัว 1-2 เดือน',group:2},
  {key:'lastchance',nodeId:3,label:'โอกาสสุดท้าย เดือนที่ 3',group:2},
  {key:'newcare',nodeId:4,label:'หาคนดูแลใหม่',group:3},
  {key:'waiting',nodeId:5,label:'รอคนมาจีบให้ติด',group:3},
  {key:'notbad',nodeId:6,label:'ถังกลาง 6 เดือน-1 ปี',group:4},
  {key:'excavate1',nodeId:7,label:'ถังกลาง 1-3 ปี',group:5},
  {key:'excavate2',nodeId:8,label:'ถังโบราณ 3 ปี+',group:5},
];

const R_OPTS=[
  {label:'≤30',desc:'ภายใน 1 เดือน',value:15},
  {label:'31-60',desc:'1-2 เดือน',value:45},
  {label:'61-180',desc:'2-6 เดือน',value:120},
  {label:'181-365',desc:'6ด - 1 ปี',value:270},
  {label:'366-1095',desc:'1-3 ปี',value:730},
  {label:'1096+',desc:'3 ปีขึ้นไป',value:1200},
];

const T_OPTS=[
  {label:'ไม่มี',desc:'null',value:null,isNull:true},
  {label:'≤60',desc:'1-2 เดือน',value:30,isNull:false},
  {label:'61-90',desc:'เดือนที่ 3',value:75,isNull:false},
  {label:'>90',desc:'เกิน 3 เดือน',value:100,isNull:false},
];

const rRulesMap={
  raw:[0],new:[0,1],personal:[0,1,2],lastchance:[0,1,2],
  newcare:[0,1,2,3],waiting:[0,1,2,3],
  notbad:[0,3,4],excavate1:[0,4],excavate2:[0,5]
};

function simLogic(current,S,N,R,T){
  const isRel=['personal','lastchance'].includes(current);
  const isNewcare=current==='newcare';
  let result=null;
  if(current==='raw'&&S!=='CRM'&&N===1&&R<=30){result={id:1,group:1}}
  if(!result&&S==='CRM'&&R<=60){result={id:2,group:2}}
  if(!result&&isRel&&T!==null){
    if(T<=60)result=current==='lastchance'?{id:3,group:2}:{id:2,group:2};
    else if(T<=90)result={id:3,group:2};
    else result={id:4,group:3};
  }
  if(!result&&isNewcare){
    if(S==='CRM'&&R<=180)result={id:4,group:3};
    else if(S!=='CRM'&&R<=180)result={id:5,group:3};
  }
  if(!result&&R<=180)result={id:5,group:3};
  if(!result&&R<=365)result={id:6,group:4};
  if(!result&&R<=1095)result={id:7,group:5};
  if(!result)result={id:8,group:5};
  return result;
}

const NW=220,NH=100;

const CAMP_DETAILS=[
  {node:0,name:'ไม่มีแคมเปญ',group:0,
   desc:'ลูกค้าใหม่ที่เพิ่งเข้าระบบระหว่างเดือน จะถูกพักไว้ที่นี่ก่อน เมื่อถึงวันจัดแคมเปญ (สิ้นเดือน) จึงจะถูกจัดเข้าแคมเปญที่เหมาะสม',
   conditions:['ลูกค้าทุกคนที่เพิ่งเข้าระบบจะเริ่มต้นที่นี่','ยังไม่ได้ถูกจัดแคมเปญใดๆ','รอจัดแคมเปญรอบถัดไป (สิ้นเดือน)'],
   paths:[{label:'ซื้อผ่าน CRM ภายใน 60 วัน → ส่วนตัว',color:'#007AFF'},{label:'ซื้อช่องทางอื่น ครั้งแรก ภายใน 30 วัน → ลูกค้าใหม่',color:'#E8850C'},{label:'อื่นๆ → รอคนมาจีบ',color:'#8E8E93'}]},
  {node:1,name:'ลูกค้าใหม่',group:1,
   desc:'ลูกค้าที่ซื้อครั้งแรก ผ่านช่องทางอื่นที่ไม่ใช่ CRM และรับสินค้ามาไม่เกิน 30 วัน',
   conditions:['ผู้ขายล่าสุดไม่ใช่ CRM','เป็นการสั่งซื้อครั้งแรก','รับสินค้ามาไม่เกิน 30 วัน'],
   paths:[{label:'ซื้อผ่าน CRM ภายใน 60 วัน → ส่วนตัว',color:'#007AFF'},{label:'ซื้อช่องทางอื่น หรือ ไม่ซื้อ → รอคนมาจีบ',color:'#E8850C'}]},
  {node:2,name:'ส่วนตัว 1-2 เดือน',group:2,
   desc:'ลูกค้าที่ซื้อผ่าน CRM ภายใน 60 วัน ได้รับการดูแลส่วนตัว ทุกรอบที่ยังเข้าเงื่อนไข วันในกลุ่มจะถูก reset ใหม่',
   conditions:['ผู้ขายล่าสุดเป็น CRM','รับสินค้ามาไม่เกิน 60 วัน'],
   paths:[{label:'ซื้อ CRM อีก ภายใน 60 วัน → อยู่เดิม (reset T)',color:'#007AFF'},{label:'ไม่ซื้อ CRM จนเข้าเดือนที่ 3 → โอกาสสุดท้าย',color:'#8E8E93'}]},
  {node:3,name:'โอกาสสุดท้าย เดือนที่ 3',group:2,
   desc:'ลูกค้าที่อยู่ในกลุ่ม Relationship แต่ไม่ได้ซื้อจาก CRM อีก จนวันในกลุ่มเข้าช่วง 61-90 วัน นี่คือโอกาสสุดท้ายก่อนหลุดจากกลุ่ม',
   conditions:['อยู่ในกลุ่ม Relationship อยู่แล้ว','วันในกลุ่มอยู่ในช่วง 61-90 วัน','ยังไม่ได้ซื้อผ่าน CRM อีก'],
   paths:[{label:'ซื้อ CRM ภายใน 60 วัน → กลับไปส่วนตัว (reset T)',color:'#007AFF'},{label:'ไม่ซื้อ CRM จนเกิน 90 วัน → หาคนดูแลใหม่',color:'#8E8E93'}]},
  {node:4,name:'หาคนดูแลใหม่',group:3,
   desc:'ลูกค้าที่หลุดจากกลุ่ม Relationship (อยู่เกิน 90 วัน) แต่ผู้ขายล่าสุดยังเป็น CRM ถ้ารับสินค้ามาเกิน 180 วัน จะหลุดไปถังกลาง',
   conditions:['หลุดจากกลุ่ม Relationship (วันในกลุ่มเกิน 90 วัน)','หรือ ผู้ขายล่าสุดเป็น CRM แต่รับสินค้ามา 61-180 วัน'],
   paths:[{label:'ซื้อ CRM ภายใน 60 วัน → กลับไปส่วนตัว',color:'#007AFF'},{label:'ซื้อช่องทางอื่น → รอคนมาจีบ',color:'#E8850C'},{label:'ไม่ซื้อจนเกิน 180 วัน → ถังกลาง',color:'#8E8E93'}]},
  {node:5,name:'รอคนมาจีบให้ติด',group:3,
   desc:'ลูกค้าที่ไม่เข้าเงื่อนไขกลุ่มอื่น แต่รับสินค้ามาไม่เกิน 180 วัน ยังมีโอกาสดึงกลับ เป็นกลุ่มพักรอที่ใหญ่ที่สุด',
   conditions:['ไม่เข้าเงื่อนไขกลุ่มอื่นทั้งหมด','รับสินค้ามาไม่เกิน 180 วัน'],
   paths:[{label:'ซื้อ CRM ภายใน 60 วัน → เข้ากลุ่มส่วนตัว',color:'#007AFF'},{label:'ซื้อช่องทางอื่น → อยู่เดิม (R reset)',color:'#E8850C'},{label:'ไม่ซื้อเกิน 180 วัน → ถังกลาง',color:'#8E8E93'}]},
  {node:6,name:'ถังกลาง 6 เดือน-1 ปี',group:4,
   desc:'ลูกค้าที่ไม่ได้ซื้อสินค้ามา 6 เดือนถึง 1 ปี เริ่มเฉื่อยชา ต้องการการกระตุ้นพิเศษเพื่อดึงกลับ',
   conditions:['รับสินค้ามาแล้ว 181-365 วัน'],
   paths:[{label:'ซื้อ CRM ภายใน 60 วัน → เข้ากลุ่มส่วนตัว',color:'#007AFF'},{label:'ซื้อช่องทางอื่น → รอคนมาจีบ',color:'#E8850C'},{label:'ไม่ซื้อเกิน 1 ปี → ถังกลาง 1-3 ปี',color:'#8E8E93'}]},
  {node:7,name:'ถังกลาง 1-3 ปี',group:5,
   desc:'ลูกค้าที่หายไป 1-3 ปี ต้องใช้ความพยายามมากในการดึงกลับ แต่ยังมีโอกาสหากได้รับการติดต่อที่เหมาะสม',
   conditions:['รับสินค้ามาแล้ว 366 วัน ถึง 3 ปี'],
   paths:[{label:'ซื้อ CRM ภายใน 60 วัน → เข้ากลุ่มส่วนตัว',color:'#007AFF'},{label:'ซื้อช่องทางอื่น → รอคนมาจีบ',color:'#E8850C'},{label:'ไม่ซื้อเกิน 3 ปี → ถังโบราณ',color:'#8E8E93'}]},
  {node:8,name:'ถังโบราณ 3 ปี+',group:5,
   desc:'ลูกค้าที่หายไปมากกว่า 3 ปี อยู่ที่นี่ตลอดไปจนกว่าจะกลับมาซื้อ เป็นกลุ่มที่ยากที่สุดในการดึงกลับ',
   conditions:['รับสินค้ามาแล้วมากกว่า 3 ปี'],
   paths:[{label:'ซื้อ CRM ภายใน 60 วัน → เข้ากลุ่มส่วนตัว',color:'#007AFF'},{label:'ซื้อช่องทางอื่น → รอคนมาจีบ',color:'#E8850C'},{label:'ไม่ซื้อ → อยู่ตลอดไป',color:'#8E8E93'}]},
];
