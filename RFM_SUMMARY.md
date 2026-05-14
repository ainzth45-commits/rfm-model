# Campaign Management — สรุประบบและลอจิกแคมเปญ

> เอกสารสรุปทั้งหมดของเว็บ Campaign Management System
> อัปเดตล่าสุด: 2026-05-14

---

## 1. ภาพรวมระบบ

เว็บ **Campaign Management** เป็นเครื่องมือจำแนกลูกค้าเข้าแคมเปญอัตโนมัติ โดยระบบจะ **จัดแคมเปญทุกสิ้นเดือน** ดึงรายชื่อลูกค้าทั้งหมดมาตรวจสอบเงื่อนไขทีละขั้นตอน ลูกค้าแต่ละคนจะถูกจัดเข้า **1 แคมเปญเท่านั้น** ต่อรอบ

### เทคโนโลยี
- Multi-file architecture: HTML + CSS + 5 JS files (ไม่ใช่ ES modules, ใช้ `<script src>` เพื่อรองรับ file://)
- GSAP 3.12.5 + ScrollTrigger (CDN) — scroll animation
- SheetJS (XLSX) 0.20.3 (CDN) — Excel import/export
- SVG — flowchart connections + arrowheads (27 เส้น)
- Canvas — particle background (30 อนุภาค 6 สี)
- Web Crypto API — SHA-256 password hashing
- Google Fonts — Sarabun (สำหรับตัวเลข)
- Responsive Design — รองรับ Desktop, Tablet, Mobile

### Hosting
- **GitHub Repository:** https://github.com/ainzth45-commits/rfm-model
- **GitHub Pages (Public):** https://ainzth45-commits.github.io/rfm-model/
- **Password Protected** — หน้า login ด้วย SHA-256 hash

---

## 2. ตัวแปรที่ใช้ตัดสิน

| ตัวแปร | ชื่อเต็ม | คำอธิบาย | ค่าที่เป็นไปได้ |
|--------|---------|----------|----------------|
| **S** | Seller | ผู้ขายล่าสุด | `CRM` หรือ `OTHER` |
| **N** | Number | ลำดับครั้งที่สั่งซื้อล่าสุด | `1` = ครั้งแรก, `>1` = ซื้อซ้ำ |
| **R** | Recency | วันนับจากรับสินค้าล่าสุดถึงวันจัดแคมเปญ | 0 ถึง ∞ (วัน) |
| **T** | Time in Relationship | วันนับจากเข้ากลุ่ม Relationship ถึงวันจัดแคมเปญ | `null` (ไม่อยู่กลุ่ม 2) หรือ 0 ถึง ∞ (วัน) |

### ช่วงค่า R ที่ใช้ใน Simulator

| ช่วง | คำอธิบาย | ค่าตัวแทน |
|------|----------|----------|
| ≤30 | ภายใน 1 เดือน | 15 |
| 31-60 | 1-2 เดือน | 45 |
| 61-180 | 2-6 เดือน | 120 |
| 181-365 | 6 เดือน - 1 ปี | 270 |
| 366-1095 | 1-3 ปี | 730 |
| 1096+ | 3 ปีขึ้นไป | 1200 |

### ช่วงค่า T ที่ใช้ใน Simulator

| ช่วง | คำอธิบาย | ค่าตัวแทน |
|------|----------|----------|
| ไม่มี (null) | ไม่เคยอยู่กลุ่ม Relationship | null |
| ≤60 | 1-2 เดือน | 30 |
| 61-90 | เดือนที่ 3 | 75 |
| >90 | เกิน 3 เดือน | 100 |

---

## 3. กลุ่มและแคมเปญ

### 6 กลุ่ม — 9 แคมเปญ

| กลุ่ม | ชื่อ | Label | แคมเปญ | คำอธิบายกลุ่ม |
|-------|------|-------|--------|--------------|
| **0** | Raw | กลุ่ม 0 | ไม่มีแคมเปญ | ลูกค้าใหม่ที่เพิ่งเข้าระบบ รอจัดแคมเปญรอบถัดไป |
| **1** | New | กลุ่ม 1 | ลูกค้าใหม่ | ลูกค้าซื้อครั้งแรกผ่านช่องทางอื่น (ไม่ใช่ CRM) |
| **2** | Relationship | กลุ่ม 2 | ส่วนตัว 1-2 เดือน, โอกาสสุดท้าย เดือนที่ 3 | ลูกค้าที่ซื้อผ่าน CRM และอยู่ในช่วงดูแลใกล้ชิด |
| **3** | Good | กลุ่ม 3 | หาคนดูแลใหม่, รอคนมาจีบให้ติด | ลูกค้าที่ยังมีโอกาส ต้องเร่งดึงกลับ |
| **4** | Not bad | กลุ่ม 4 | ถังกลาง 6 เดือน-1 ปี | ลูกค้าที่เริ่มเฉื่อยชา ต้องกระตุ้น |
| **5** | Excavate | กลุ่ม 5 | ถังกลาง 1-3 ปี, ถังโบราณ 3 ปี+ | ลูกค้าที่หายไปนาน ต้องขุดกลับ |

---

### รายละเอียดแคมเปญทั้ง 9 รายการ

#### 1. ไม่มีแคมเปญ (กลุ่ม 0 — Raw)
- **Node ID:** 0
- **ตำแหน่ง Flowchart:** x:530, y:20
- **เงื่อนไข Node:** ลูกค้าใหม่ที่เข้าระบบระหว่างเดือน
- **คำอธิบาย:** ลูกค้าใหม่ที่เพิ่งเข้าระบบระหว่างเดือน จะถูกพักไว้ที่นี่ก่อน เมื่อถึงวันจัดแคมเปญ (สิ้นเดือน) จึงจะถูกจัดเข้าแคมเปญที่เหมาะสม
- **เงื่อนไข (Overview):**
  1. ลูกค้าทุกคนที่เพิ่งเข้าระบบจะเริ่มต้นที่นี่
  2. ยังไม่ได้ถูกจัดแคมเปญใดๆ
  3. รอจัดแคมเปญรอบถัดไป (สิ้นเดือน)
- **เส้นทางถัดไป:**
  - ซื้อผ่าน CRM ภายใน 60 วัน → ส่วนตัว (น้ำเงิน)
  - ซื้อช่องทางอื่น ครั้งแรก ภายใน 30 วัน → ลูกค้าใหม่ (ส้ม)
  - อื่นๆ → รอคนมาจีบ (เทา)

#### 2. ลูกค้าใหม่ (กลุ่ม 1 — New)
- **Node ID:** 1
- **ตำแหน่ง Flowchart:** x:70, y:240
- **เงื่อนไข Node:** S ≠ CRM, N = 1, R ≤ 30
- **คำอธิบาย:** ลูกค้าที่ซื้อครั้งแรก ผ่านช่องทางอื่นที่ไม่ใช่ CRM และรับสินค้ามาไม่เกิน 30 วัน
- **เงื่อนไข (Overview):**
  1. ผู้ขายล่าสุดไม่ใช่ CRM
  2. เป็นการสั่งซื้อครั้งแรก
  3. รับสินค้ามาไม่เกิน 30 วัน
- **เส้นทางถัดไป:**
  - ซื้อผ่าน CRM ภายใน 60 วัน → ส่วนตัว (น้ำเงิน)
  - ซื้อช่องทางอื่น หรือ ไม่ซื้อ → รอคนมาจีบ (ส้ม)

#### 3. ส่วนตัว 1-2 เดือน (กลุ่ม 2 — Relationship)
- **Node ID:** 2
- **ตำแหน่ง Flowchart:** x:430, y:240
- **เงื่อนไข Node:** S = CRM, R ≤ 60
- **คำอธิบาย:** ลูกค้าที่ซื้อผ่าน CRM ภายใน 60 วัน ได้รับการดูแลส่วนตัว ทุกรอบที่ยังเข้าเงื่อนไข วันในกลุ่มจะถูก reset ใหม่
- **เงื่อนไข (Overview):**
  1. ผู้ขายล่าสุดเป็น CRM
  2. รับสินค้ามาไม่เกิน 60 วัน
- **เส้นทางถัดไป:**
  - ซื้อ CRM อีก ภายใน 60 วัน → อยู่เดิม (reset T) (น้ำเงิน)
  - ไม่ซื้อ CRM จนเข้าเดือนที่ 3 → โอกาสสุดท้าย (เทา)

#### 4. โอกาสสุดท้าย เดือนที่ 3 (กลุ่ม 2 — Relationship)
- **Node ID:** 3
- **ตำแหน่ง Flowchart:** x:430, y:460
- **เงื่อนไข Node:** อยู่กลุ่ม 2, T 61-90 วัน
- **คำอธิบาย:** ลูกค้าที่อยู่ในกลุ่ม Relationship แต่ไม่ได้ซื้อจาก CRM อีก จนวันในกลุ่มเข้าช่วง 61-90 วัน นี่คือโอกาสสุดท้ายก่อนหลุดจากกลุ่ม
- **เงื่อนไข (Overview):**
  1. อยู่ในกลุ่ม Relationship อยู่แล้ว
  2. วันในกลุ่มอยู่ในช่วง 61-90 วัน
  3. ยังไม่ได้ซื้อผ่าน CRM อีก
- **เส้นทางถัดไป:**
  - ซื้อ CRM ภายใน 60 วัน → กลับไปส่วนตัว (reset T) (น้ำเงิน)
  - ไม่ซื้อ CRM จนเกิน 90 วัน → หาคนดูแลใหม่ (เทา)

#### 5. หาคนดูแลใหม่ (กลุ่ม 3 — Good)
- **Node ID:** 4
- **ตำแหน่ง Flowchart:** x:430, y:680
- **เงื่อนไข Node:** T > 90 หรือ S=CRM, R≤180
- **คำอธิบาย:** ลูกค้าที่หลุดจากกลุ่ม Relationship (อยู่เกิน 90 วัน) แต่ผู้ขายล่าสุดยังเป็น CRM ถ้ารับสินค้ามาเกิน 180 วัน จะหลุดไปถังกลาง
- **เงื่อนไข (Overview):**
  1. หลุดจากกลุ่ม Relationship (วันในกลุ่มเกิน 90 วัน)
  2. หรือ ผู้ขายล่าสุดเป็น CRM แต่รับสินค้ามา 61-180 วัน
- **เส้นทางถัดไป:**
  - ซื้อ CRM ภายใน 60 วัน → กลับไปส่วนตัว (น้ำเงิน)
  - ซื้อช่องทางอื่น → รอคนมาจีบ (ส้ม)
  - ไม่ซื้อจนเกิน 180 วัน → ถังกลาง (เทา)

#### 6. รอคนมาจีบให้ติด (กลุ่ม 3 — Good)
- **Node ID:** 5
- **ตำแหน่ง Flowchart:** x:890, y:240
- **เงื่อนไข Node:** R ≤ 180 (ที่เหลือ)
- **คำอธิบาย:** ลูกค้าที่ไม่เข้าเงื่อนไขกลุ่มอื่น แต่รับสินค้ามาไม่เกิน 180 วัน ยังมีโอกาสดึงกลับ เป็นกลุ่มพักรอที่ใหญ่ที่สุด
- **เงื่อนไข (Overview):**
  1. ไม่เข้าเงื่อนไขกลุ่มอื่นทั้งหมด
  2. รับสินค้ามาไม่เกิน 180 วัน
- **เส้นทางถัดไป:**
  - ซื้อ CRM ภายใน 60 วัน → เข้ากลุ่มส่วนตัว (น้ำเงิน)
  - ซื้อช่องทางอื่น → อยู่เดิม (R reset) (ส้ม)
  - ไม่ซื้อเกิน 180 วัน → ถังกลาง (เทา)

#### 7. ถังกลาง 6 เดือน-1 ปี (กลุ่ม 4 — Not bad)
- **Node ID:** 6
- **ตำแหน่ง Flowchart:** x:890, y:460
- **เงื่อนไข Node:** R 181-365 วัน
- **คำอธิบาย:** ลูกค้าที่ไม่ได้ซื้อสินค้ามา 6 เดือนถึง 1 ปี เริ่มเฉื่อยชา ต้องการการกระตุ้นพิเศษเพื่อดึงกลับ
- **เงื่อนไข (Overview):**
  1. รับสินค้ามาแล้ว 181-365 วัน
- **เส้นทางถัดไป:**
  - ซื้อ CRM ภายใน 60 วัน → เข้ากลุ่มส่วนตัว (น้ำเงิน)
  - ซื้อช่องทางอื่น → รอคนมาจีบ (ส้ม)
  - ไม่ซื้อเกิน 1 ปี → ถังกลาง 1-3 ปี (เทา)

#### 8. ถังกลาง 1-3 ปี (กลุ่ม 5 — Excavate)
- **Node ID:** 7
- **ตำแหน่ง Flowchart:** x:890, y:680
- **เงื่อนไข Node:** R 366-1095 วัน
- **คำอธิบาย:** ลูกค้าที่หายไป 1-3 ปี ต้องใช้ความพยายามมากในการดึงกลับ แต่ยังมีโอกาสหากได้รับการติดต่อที่เหมาะสม
- **เงื่อนไข (Overview):**
  1. รับสินค้ามาแล้ว 366 วัน ถึง 3 ปี
- **เส้นทางถัดไป:**
  - ซื้อ CRM ภายใน 60 วัน → เข้ากลุ่มส่วนตัว (น้ำเงิน)
  - ซื้อช่องทางอื่น → รอคนมาจีบ (ส้ม)
  - ไม่ซื้อเกิน 3 ปี → ถังโบราณ (เทา)

#### 9. ถังโบราณ 3 ปี+ (กลุ่ม 5 — Excavate)
- **Node ID:** 8
- **ตำแหน่ง Flowchart:** x:890, y:890
- **เงื่อนไข Node:** R > 1095 วัน
- **คำอธิบาย:** ลูกค้าที่หายไปมากกว่า 3 ปี อยู่ที่นี่ตลอดไปจนกว่าจะกลับมาซื้อ เป็นกลุ่มที่ยากที่สุดในการดึงกลับ
- **เงื่อนไข (Overview):**
  1. รับสินค้ามาแล้วมากกว่า 3 ปี
- **เส้นทางถัดไป:**
  - ซื้อ CRM ภายใน 60 วัน → เข้ากลุ่มส่วนตัว (น้ำเงิน)
  - ซื้อช่องทางอื่น → รอคนมาจีบ (ส้ม)
  - ไม่ซื้อ → อยู่ตลอดไป (เทา)

---

## 4. ลอจิกการจัดแคมเปญ (ลำดับการเช็ค)

ระบบเช็คเงื่อนไขจาก **บนลงล่าง** เงื่อนไขแรกที่ตรง = หยุด จัดเข้าแคมเปญนั้น

```
START
  |
  +-- Q1: current = raw AND S != CRM AND N = 1 AND R <= 30?
  |   +-- YES -> [Node 1] ลูกค้าใหม่
  |
  +-- Q2: S = CRM AND R <= 60?
  |   +-- YES -> [Node 2] ส่วนตัว 1-2 เดือน (เข้ากลุ่ม Relationship, T reset = 0)
  |
  +-- Q3: current เป็น Relationship (personal/lastchance) AND T != null?
  |   +-- T <= 60 AND current = personal -> [Node 2] ส่วนตัว (อยู่เดิม)
  |   +-- T <= 60 AND current = lastchance -> [Node 3] โอกาสสุดท้าย (อยู่เดิม)
  |   +-- T <= 90 -> [Node 3] โอกาสสุดท้าย เดือนที่ 3
  |   +-- T > 90 -> [Node 4] หาคนดูแลใหม่ (ลบ T, ออกจากกลุ่ม 2)
  |
  +-- Q4: current = newcare?
  |   +-- S = CRM AND R <= 180 -> [Node 4] หาคนดูแลใหม่ (อยู่เดิม)
  |   +-- S != CRM -> [Node 5] รอคนมาจีบให้ติด
  |
  +-- Q5: R <= 180?
  |   +-- YES -> [Node 5] รอคนมาจีบให้ติด
  |
  +-- Q6: R <= 365?
  |   +-- YES -> [Node 6] ถังกลาง 6 เดือน-1 ปี
  |
  +-- Q7: R <= 1095?
  |   +-- YES -> [Node 7] ถังกลาง 1-3 ปี
  |
  +-- Q8: R > 1095
      +-- -> [Node 8] ถังโบราณ 3 ปีขึ้นไป
```

### simLogic() — ลอจิกใน JavaScript

```javascript
function simLogic(current, S, N, R, T) {
  // Q1: Raw + OTHER + first buy + within 30 days
  if (current === 'raw' && S !== 'CRM' && N === 1 && R <= 30) -> Node 1

  // Q2: CRM seller + within 60 days
  if (S === 'CRM' && R <= 60) -> Node 2

  // Q3: Currently in Relationship + T exists
  if (isRelationship && T !== null) {
    if (T <= 60) -> stay in current (Node 2 or 3)
    if (T <= 90) -> Node 3
    if (T > 90) -> Node 4
  }

  // Q4: Currently in newcare
  if (current === 'newcare') {
    if (S === 'CRM' && R <= 180) -> Node 4 (stay)
    if (S !== 'CRM') -> Node 5
  }

  // Q5-Q8: Fallback by R value
  if (R <= 180) -> Node 5
  if (R <= 365) -> Node 6
  if (R <= 1095) -> Node 7
  else -> Node 8
}
```

---

## 5. Flowchart — เส้นเชื่อมและเส้นทาง

### ประเภทเส้นทาง

| ประเภท | สี | Hex | ความหมาย |
|--------|-----|-----|----------|
| **ซื้อ CRM** | น้ำเงิน | #007AFF | ผู้ขายล่าสุด = CRM |
| **ซื้อ OTHER** | ส้ม | #E8850C | ผู้ขายล่าสุด != CRM |
| **ไม่ซื้อ** | เทา | #8E8E93 | ไม่มีการซื้อในรอบนั้น |

### เส้นเชื่อมทั้งหมด (27 เส้น)

#### Node 0: ไม่มีแคมเปญ (Raw) — 3 เส้น
| # | ประเภท | ปลายทาง | เงื่อนไข | พิเศษ |
|---|--------|---------|---------|-------|
| 1 | ซื้อ CRM | Node 2 ส่วนตัว | S=CRM, R≤60 → Relationship | — |
| 2 | ซื้อ OTHER | Node 1 ลูกค้าใหม่ | S≠CRM, N=1, R≤30 → ใหม่ | — |
| 3 | อื่นๆ | Node 5 รอคนมาจีบ | S≠CRM, N>1 หรือ R>30 | type=none |

#### Node 1: ลูกค้าใหม่ (New) — 3 เส้น
| # | ประเภท | ปลายทาง | เงื่อนไข | พิเศษ |
|---|--------|---------|---------|-------|
| 4 | ซื้อ CRM | Node 2 ส่วนตัว | S→CRM, R reset → Relationship | — |
| 5 | ซื้อ OTHER | Node 5 รอคนมาจีบ | S→OTHER, R reset → รอจีบ | — |
| 6 | ไม่ซื้อ | Node 5 รอคนมาจีบ | R เพิ่ม → รอจีบ | dup (ซ้อนกับ #5) |

#### Node 2: ส่วนตัว 1-2 เดือน (Relationship) — 3 เส้น
| # | ประเภท | ปลายทาง | เงื่อนไข | พิเศษ |
|---|--------|---------|---------|-------|
| 7 | ซื้อ CRM | Node 2 (ตัวเอง) | S=CRM, R≤60, T reset | self-loop |
| 8 | ซื้อ OTHER | Node 3 โอกาสสุดท้าย | S→OTHER, T เพิ่ม → 61-90 วัน | — |
| 9 | ไม่ซื้อ | Node 3 โอกาสสุดท้าย | R เพิ่ม, T เพิ่ม → 61-90 วัน | dup |

#### Node 3: โอกาสสุดท้าย (Relationship) — 3 เส้น
| # | ประเภท | ปลายทาง | เงื่อนไข | พิเศษ |
|---|--------|---------|---------|-------|
| 10 | ซื้อ CRM | Node 2 ส่วนตัว | S→CRM, R≤60, T reset | — |
| 11 | ซื้อ OTHER | Node 4 หาคนดูแล | S→OTHER, T>90 → หาคนดูแล | — |
| 12 | ไม่ซื้อ | Node 4 หาคนดูแล | R เพิ่ม, T>90 → หาคนดูแล | dup |

#### Node 4: หาคนดูแลใหม่ (Good) — 3 เส้น
| # | ประเภท | ปลายทาง | เงื่อนไข | พิเศษ |
|---|--------|---------|---------|-------|
| 13 | ซื้อ CRM | Node 2 ส่วนตัว | S→CRM, R≤60 → Relationship | — |
| 14 | ซื้อ OTHER | Node 5 รอคนมาจีบ | S→OTHER, ลบ T → รอจีบ | — |
| 15 | ไม่ซื้อ | Node 6 ถังกลาง | R เพิ่ม, R>180 → ถังกลาง | — |

#### Node 5: รอคนมาจีบให้ติด (Good) — 4 เส้น
| # | ประเภท | ปลายทาง | เงื่อนไข | พิเศษ |
|---|--------|---------|---------|-------|
| 16 | ซื้อ CRM | Node 2 ส่วนตัว | S→CRM, R≤60 → Relationship | — |
| 17 | ซื้อ OTHER | Node 5 (ตัวเอง) | S→OTHER, R reset → อยู่เดิม | self-loop |
| 18 | ไม่ซื้อ R≤180 | Node 5 (ตัวเอง) | R≤180 → อยู่เดิม | self-loop, dup |
| 19 | ไม่ซื้อ R>180 | Node 6 ถังกลาง | R>180 → ถังกลาง | — |

#### Node 6: ถังกลาง 6ด-1ปี (Not bad) — 3 เส้น
| # | ประเภท | ปลายทาง | เงื่อนไข | พิเศษ |
|---|--------|---------|---------|-------|
| 20 | ซื้อ CRM | Node 2 ส่วนตัว | S→CRM, R≤60 → Relationship | — |
| 21 | ซื้อ OTHER | Node 5 รอคนมาจีบ | S→OTHER, R reset → รอจีบ | — |
| 22 | ไม่ซื้อ | Node 7 ถัง 1-3 ปี | R เพิ่ม, R>365 → ถัง 1-3 ปี | — |

#### Node 7: ถังกลาง 1-3ปี (Excavate) — 3 เส้น
| # | ประเภท | ปลายทาง | เงื่อนไข | พิเศษ |
|---|--------|---------|---------|-------|
| 23 | ซื้อ CRM | Node 2 ส่วนตัว | S→CRM, R≤60 → Relationship | — |
| 24 | ซื้อ OTHER | Node 5 รอคนมาจีบ | S→OTHER, R reset → รอจีบ | — |
| 25 | ไม่ซื้อ | Node 8 ถังโบราณ | R เพิ่ม, R>1095 → ถังโบราณ | — |

#### Node 8: ถังโบราณ 3ปี+ (Excavate) — 3 เส้น
| # | ประเภท | ปลายทาง | เงื่อนไข | พิเศษ |
|---|--------|---------|---------|-------|
| 26 | ซื้อ CRM | Node 2 ส่วนตัว | S→CRM, R≤60 → Relationship | — |
| 27 | ซื้อ OTHER | Node 5 รอคนมาจีบ | S→OTHER, R reset → รอจีบ | — |
| 28 | ไม่ซื้อ | Node 8 (ตัวเอง) | R เพิ่ม → อยู่ตลอดไป | self-loop |

### เส้นเชื่อมพิเศษ
- **Node 1→2:** เส้นโค้งจากด้านล่าง (drop=120px) เพราะอยู่ Y เดียวกัน
- **Self-loop:** เส้นโค้งออกจากขวาของ node และกลับเข้ามา (Node 2→2, 5→5, 8→8)
- **dup:** เส้นที่ไปปลายทางเดียวกับเส้นอื่น ใช้ offset เพื่อไม่ให้ซ้อนกัน

---

## 6. Simulator — กฎปุ่มที่กดได้ในแต่ละแคมเปญ

### ขั้นตอนการใช้งาน
1. เลือกแคมเปญปัจจุบัน (9 ปุ่ม)
2. เลือกค่า R — วันนับจากรับสินค้า (6 ช่วง)
3. เลือกค่า S — ผู้ขายล่าสุด (CRM/OTHER) และ N — ครั้งที่สั่งซื้อ (1/2+)
4. เลือกค่า T — วันในกลุ่ม Relationship (เฉพาะ ส่วนตัว/โอกาสสุดท้าย เท่านั้น)

### rRulesMap — R ที่กดได้ในแต่ละแคมเปญ (index 0-5)

| แคมเปญ (key) | R indexes ที่กดได้ | ค่า R |
|--------------|-------------------|-------|
| raw | [0] | ≤30 เท่านั้น |
| new | [0,1] | ≤30, 31-60 |
| personal | [0,1,2] | ≤30, 31-60, 61-180 |
| lastchance | [0,1,2] | ≤30, 31-60, 61-180 |
| newcare | [0,1,2,3] | ≤30, 31-60, 61-180, 181-365 |
| waiting | [0,1,2,3] | ≤30, 31-60, 61-180, 181-365 |
| notbad | [0,3,4] | ≤30, 181-365, 366-1095 |
| excavate1 | [0,4] | ≤30, 366-1095 |
| excavate2 | [0,5] | ≤30, 1096+ |

### ตาราง R — ปุ่มที่กดได้

| ปุ่ม | ≤30 | 31-60 | 61-180 | 181-365 | 366-1095 | 1096+ |
|------|:---:|:-----:|:------:|:-------:|:--------:|:-----:|
| ไม่มีแคมเปญ | O | - | - | - | - | - |
| ลูกค้าใหม่ | O | O | - | - | - | - |
| ส่วนตัว | O | O | O | - | - | - |
| โอกาสสุดท้าย | O | O | O | - | - | - |
| หาคนดูแลใหม่ | O | O | O | O | - | - |
| รอคนมาจีบ | O | O | O | O | - | - |
| ถังกลาง 6ด-1ปี | O | - | - | O | O | - |
| ถังกลาง 1-3ปี | O | - | - | - | O | - |
| ถังโบราณ 3ปี+ | O | - | - | - | - | O |

### T — ปุ่มที่กดได้ (เฉพาะ Relationship)

| แคมเปญ | เงื่อนไข R | ≤60 | 61-90 | >90 |
|--------|-----------|:---:|:-----:|:---:|
| ส่วนตัว | R ≤30 หรือ 31-60 | O | O | - |
| ส่วนตัว | R = 61-180 | - | O | - |
| โอกาสสุดท้าย | ทุกค่า R | O | O | O |

### S และ N — ทุกปุ่มกดได้เสมอทุกแคมเปญ

---

## 7. Simulator — ผลลัพธ์ที่เป็นไปได้ (กดแค่แคมเปญ)

| แคมเปญปัจจุบัน | ผลลัพธ์ที่เป็นไปได้ |
|---------------|-------------------|
| ไม่มีแคมเปญ | ลูกค้าใหม่, ส่วนตัว, รอคนมาจีบ |
| ลูกค้าใหม่ | ส่วนตัว, รอคนมาจีบ |
| ส่วนตัว | ส่วนตัว, โอกาสสุดท้าย |
| โอกาสสุดท้าย | ส่วนตัว, โอกาสสุดท้าย, หาคนดูแลใหม่ |
| หาคนดูแลใหม่ | ส่วนตัว, หาคนดูแลใหม่, รอคนมาจีบ, ถังกลาง 6ด-1ปี |
| รอคนมาจีบ | ส่วนตัว, รอคนมาจีบ, ถังกลาง 6ด-1ปี |
| ถังกลาง 6ด-1ปี | ส่วนตัว, รอคนมาจีบ, ถังกลาง 6ด-1ปี, ถังกลาง 1-3ปี |
| ถังกลาง 1-3ปี | ส่วนตัว, รอคนมาจีบ, ถังกลาง 1-3ปี |
| ถังโบราณ 3ปี+ | ส่วนตัว, รอคนมาจีบ, ถังโบราณ |

---

## 8. โครงสร้างเว็บ

### Sections (5 ส่วน)

| # | Section | Background | Padding (Desktop) | รายละเอียด |
|---|---------|-----------|-------------------|-----------|
| 1 | **Hero** | #000 (ดำ + glow) | 128px 80px 96px | ชื่อระบบ + สถิติ 6/9/4 + scroll indicator |
| 2 | **Overview** | #F5F5F7 (bg-secondary) | 48px 0 96px | Carousel 10 หน้า: กลุ่ม + 9 แคมเปญ |
| 3 | **Campaign Flow** | gradient ขาว→#FAFBFE | 96px 40px 80px | รวม State Machine + Simulator ด้วย mode switcher |
| 4 | **Management** | #FFFFFF | 96px 80px | Excel import/export, 2 mode: ตรวจสอบ/จัดแคมเปญใหม่ + Sale Plan |
| 5 | **Footer** | #FFFFFF | 48px 80px | ข้อความเดียว |

### Overview Carousel — โครงสร้าง

| ส่วน | Element | รายละเอียด |
|------|---------|-----------|
| Tabs | `.slide-tabs` | ปุ่มข้อความด้านบน — ซ่อนในหน้า 0, แสดงหน้า 1-9 (visibility toggle) |
| Viewport | `.slide-viewport` | overflow-x:clip, overflow-y:visible |
| Track | `.slide-track` | flex container, translateX(-N*100%) สำหรับเลื่อน |
| Slides | `.slide` | display:flow-root (BFC), padding:0 80px |
| Arrows | `.slide-arrows` | ลูกศรซ้าย/ขวา (ซ่อนที่หน้าแรก/สุดท้าย) |
| Dots | `.slide-dots` | position:absolute, bottom:16px |

**หน้า 0:** Title + Subtitle + Group Grid (3 columns, 6 cards) — คลิกการ์ดจะไปหน้าแคมเปญแรกของกลุ่มนั้น
**หน้า 1-9:** Campaign Detail — header (dot + name + group badge) + description + เงื่อนไข + เส้นทางถัดไป

### Interactions

| Interaction | ส่วน | พฤติกรรม |
|------------|------|----------|
| **Node click** | Flowchart | เปิด popup glassmorphism — แสดงรายละเอียด, เงื่อนไข, เส้นทาง |
| **Pill click** | Flowchart | Spotlight mode — blur ส่วนอื่น, highlight เส้นทางที่เลือก + info bar ด้านบน |
| **Pill click (multi)** | Flowchart | เมื่อมีหลายเส้นไปปลายทางเดียวกัน แสดงทุกเส้นพร้อมกัน |
| **Overlay/ESC click** | Flowchart | ปิด spotlight mode |
| **Group card click** | Overview | เลื่อน carousel ไปหน้าแคมเปญแรกของกลุ่ม |
| **Tab/Dot/Arrow click** | Overview | เลื่อน carousel ไปหน้าที่กด |
| **Sim button click** | Simulator | อัปเดต mini flowchart ทันที, disable ปุ่มที่ไม่ valid |
| **Sim toggle (click ซ้ำ)** | Simulator | ยกเลิกการเลือก (deselect) |
| **Sim result (1 ผลลัพธ์)** | Simulator | แสดง result card + ขั้นตอนการจัดแคมเปญ |
| **Nav brand click** | Nav | scroll กลับบนสุด (smooth) |
| **Scroll ผ่าน hero** | Nav | เปลี่ยนจาก transparent dark → white glass |
| **ESC key** | ทั่วไป | ปิด spotlight → popup → mobile menu |

### Animations

| Animation | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Hero entrance | GSAP timeline | eyebrow → title → subtitle → meta → scroll indicator (stagger) |
| Group cards | GSAP ScrollTrigger | y:40 + opacity:0 → stagger 0.1s |
| Section titles | GSAP ScrollTrigger | y:30 + opacity:0 |
| Flowchart nodes | GSAP ScrollTrigger | y:20 → 0 + stagger 0.06s + back.out easing |
| Simulator panels | GSAP ScrollTrigger | x:-30/+30 + opacity:0 |
| SVG flowing dots | CSS @keyframes | stroke-dasharray animation, 2.5s infinite, stagger delay |
| Node breathing | CSS @keyframes | box-shadow glow pulse, 5s infinite, stagger delay |
| Hero glow | CSS @keyframes | radial-gradient scale 1→1.15, 6s infinite |
| Canvas particles | requestAnimationFrame | 30 particles ลอยขึ้น, 6 สีกลุ่ม, opacity 0.04-0.14 |
| Nav brand shimmer | CSS @keyframes | background-position gradient shift, 4s infinite |
| Carousel slide | CSS transition | transform translateX, 0.5s cubic-bezier(0.25,1,0.5,1) |
| Popup open | CSS transition | scale(0.92)→1 + translateY(10px)→0, spring easing |
| Spotlight info | CSS transition | opacity + translateY(-10px)→0, spring easing |
| Sim step reveal | GSAP | y:20 + opacity:0, 0.3-0.4s, power2.out |
| Result card | CSS @keyframes | translateY(12px)→0 + opacity, spring easing |
| Confirm glow | CSS @keyframes | scale(1.1) + box-shadow glow → normal |

---

## 9. ระบบรหัสผ่าน (Password Gate)

### วิธีการทำงาน
1. เปิดเว็บ → เจอหน้า login เต็มจอ (พื้นหลังดำ + glow effect)
2. พิมพ์รหัส → กด Enter หรือปุ่ม "เข้าสู่ระบบ"
3. ระบบ hash input ด้วย SHA-256 (Web Crypto API) แล้วเทียบกับ hash ที่เก็บไว้
4. ถูก → fade out หน้า login → เข้าเว็บ + จำไว้ใน sessionStorage
5. ผิด → แสดง error + นับจำนวนครั้ง

### ความปลอดภัย
| มาตรการ | รายละเอียด |
|---------|-----------|
| **SHA-256 Hash** | เก็บเฉพาะ hash ใน code ไม่เก็บรหัสจริง |
| **Rate Limiting** | ใส่ผิด 5 ครั้ง → ล็อค 30 วินาที |
| **Session Memory** | sessionStorage จำว่า login แล้ว ไม่ต้องใส่ซ้ำ |
| **Auto Focus** | input autofocus เมื่อเปิดหน้า |
| **Enter Key** | กด Enter ส่งรหัสได้ทันที |

### ค่าคงที่
- **PW_HASH:** `df3e04bce8087c8a61b87dd1b9c251158f1543b91cd0268dff59864c23a1b284`
- **MAX_ATTEMPTS:** 5
- **LOCK_DURATION:** 30 วินาที
- **Session Key:** `rfm_auth`

---

## 10. Design System

### Typography

| Role | Font Stack | Size | Weight |
|------|-----------|------|--------|
| Display | SF Pro Display → -apple-system → Segoe UI → Leelawadee UI → system-ui | ตาม element | 600-700 |
| Body | SF Pro Text → -apple-system → Segoe UI → Leelawadee UI → system-ui | 12-17px | 400-500 |
| Mono | SF Mono → ui-monospace → Cascadia Code → Menlo | 9-16px | 500-700 |

### Color Palette

#### Group Colors
| กลุ่ม | ชื่อ | Primary | Light | Dark |
|-------|------|---------|-------|------|
| 0 Raw | Slate | #8E8E93 | #F2F2F4 | #636366 |
| 1 New | Emerald | #28A745 | #EBF7EE | #1E7E34 |
| 2 Relationship | Sapphire | #007AFF | #E5F1FF | #0055B3 |
| 3 Good | Amber | #E8850C | #FEF3E2 | #A65E08 |
| 4 Not bad | Indigo | #5856D6 | #EEEEF9 | #3634A3 |
| 5 Excavate | Rose | #D64045 | #FDECEC | #A8282D |

#### Base Colors
| ชื่อ | Hex | ใช้กับ |
|------|-----|--------|
| bg-primary | #FFFFFF | พื้นหลังหลัก |
| bg-secondary | #F5F5F7 | Overview, Simulator background |
| text-primary | #1D1D1F | หัวข้อ, เนื้อหาหลัก |
| text-secondary | #6E6E73 | คำอธิบาย, เนื้อหารอง |
| text-tertiary | #AEAEB2 | placeholder, disabled |
| border-light | #E8E8ED | เส้นแบ่ง, ขอบการ์ด |
| border-subtle | #F0F0F5 | เส้นแบ่งจาง |
| accent | #0071E3 | interactive elements |
| accent-hover | #0077ED | hover state |

#### Connection Colors
| ประเภท | Hex | CSS Variable |
|--------|-----|-------------|
| CRM | #007AFF | --line-crm |
| OTHER | #E8850C | --line-other |
| ไม่ซื้อ | #8E8E93 | --line-none |

### Shadows (Elevation)
| Level | CSS Variable | ใช้กับ |
|-------|-------------|--------|
| 1 | --shadow-1 | การ์ด, node ปกติ, sim panels |
| 2 | --shadow-2 | hover state |
| 3 | --shadow-3 | popup, spotlight info, active node |
| 4 | --shadow-4 | modal overlay |

### Border Radius
| ขนาด | ค่า | ใช้กับ |
|------|-----|--------|
| sm | 4-8px | tags, node-pills, labels |
| md | 10-12px | buttons, inputs, sim-choices, paths |
| lg | 14-16px | cards, nodes, group-cards |
| xl | 20px | popup modal, sim-flow-panel |
| full | 999px/50% | pills, dots, circles |

### Animation Timing
| ชื่อ | ค่า | ใช้กับ |
|------|-----|--------|
| ease-out | cubic-bezier(0.25,1,0.5,1) | ส่วนใหญ่ — hover, slide, transform |
| ease-spring | cubic-bezier(0.34,1.56,0.64,1) | popup entrance, spotlight info |

---

## 11. Responsive Design

### Breakpoints

| Breakpoint | ขนาด | อุปกรณ์ |
|-----------|------|---------|
| Desktop | >1024px | เดิม (ไม่เปลี่ยน) |
| Tablet | ≤1024px | iPad, tablet |
| Mobile | ≤768px | iPhone, Android |
| Small Mobile | ≤480px | iPhone SE, มือถือเล็ก |

### การเปลี่ยนแปลงตาม Breakpoint

| ส่วน | Desktop | Tablet (≤1024) | Mobile (≤768) | Small (≤480) |
|------|---------|---------------|--------------|-------------|
| **Nav** | ลิงก์ปกติ, padding 80px | padding 32px | Hamburger menu, padding 20px | เหมือน mobile |
| **Hero title** | 76px | 56px | 40px | 34px |
| **Hero padding** | 128px 80px | 96px 40px | 80px 24px | เหมือน mobile |
| **Section title** | 44px | 36px | 28px | 24px |
| **Overview grid** | 3 columns | 2 columns, max 700px | 1 column | เหมือน mobile |
| **Slide padding** | 80px | 40px | 20px | เหมือน mobile |
| **Camp detail title** | 36px | 28px | 22px | 20px |
| **Flowchart** | 1300px ปกติ | scale(0.7) | scroll ซ้าย-ขวา + hint | เหมือน mobile |
| **Simulator** | 2 columns | 2 columns | 1 column stack | sim-btn-grid 2 columns |
| **Popup** | max-width 520px | 520px | 94% width, max-height 85vh, scroll | เหมือน mobile |
| **Slide tabs** | flex-wrap center | padding 40px | horizontal scroll, no wrap | เหมือน mobile |

### Hamburger Menu (Mobile ≤768px)
- ซ่อน `.nav-links` → แสดง `.nav-hamburger` (3 ขีด)
- กด → เปิด overlay + slide-down menu
- กดลิงก์ → ปิด menu + scroll ไป section
- Animation: ขีดหมุนเป็น X เมื่อเปิด
- ESC key ปิด menu ได้

### Flowchart บนมือถือ
- **Tablet:** scale(0.7) ด้วย CSS transform + margin-bottom ลดลงตาม
- **Mobile:** ไม่ scale, ให้ scroll ซ้าย-ขวาได้ + แสดงข้อความ "เลื่อนซ้าย-ขวาเพื่อดูทั้งหมด"

---

## 12. ไฟล์ในโปรเจค

### โครงสร้าง Multi-file Architecture

```
/
├── index.html              ← HTML หลัก + password gate + SVG sprites
├── css/
│   └── styles.css          ← CSS ทั้งหมด + password gate CSS
├── js/
│   ├── campaign-logic.js   ← ข้อมูลกลุ่ม/แคมเปญ, rRulesMap, simLogic()
│   ├── flowchart.js        ← SVG flowchart rendering, spotlight, popup
│   ├── simulator.js        ← Simulator UI 4 ขั้นตอน, unknown mode
│   ├── management.js       ← Excel import/export, check/assign mode, sale plan
│   └── app.js              ← Nav, carousel, particles, GSAP, password gate JS
├── DESIGN_SPEC.md          ← Design specification — typography, colors, spacing
├── RFM_SUMMARY.md          ← เอกสารสรุปนี้
└── .gitignore              ← ไม่ push: .DS_Store, .claude/, backup_*, TASK.md, campaign-management/, test*.xlsx
```

### ลำดับการโหลด Script (สำคัญ — ไม่ใช่ ES modules)

ใช้ `<script src>` โหลดตามลำดับ เพราะต้องรองรับ `file://` protocol:

1. **campaign-logic.js** — ประกาศ globals (GROUPS, NODES, CAMPAIGNS, rRulesMap, simLogic ฯลฯ)
2. **flowchart.js** — ใช้ globals จาก campaign-logic.js
3. **simulator.js** — ใช้ globals จาก campaign-logic.js
4. **management.js** — ใช้ globals จาก campaign-logic.js
5. **app.js** — orchestrator, init ทุกอย่าง + password gate
