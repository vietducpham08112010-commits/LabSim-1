# V-Science 3D & AI Lab — Nền tảng Phòng Thí Nghiệm Đa Giác Quan 3D & Gia Sư AI Socratic (GDPT 2018)

**V-Science 3D & AI Lab** là nền tảng phòng thí nghiệm ảo 3D tương tác thời gian thực tích hợp Gia sư AI Socratic dành cho học sinh THPT Việt Nam (bám sát Chương trình GDPT 2018 ở cả 3 bộ môn Vật Lý, Hóa Học và Sinh Học), gói gọn hoàn chỉnh để vừa chạy trực tiếp mượt mà trên trình duyệt, vừa hỗ trợ xuất file độc lập phục vụ trình diễn thi đấu khoa học kỹ thuật.

---

## Xác Nhận Thiết Kế & Quyết Định Quan Trọng

> [!IMPORTANT]
> Các quyết định trọng tâm dưới đây đã được thống nhất từ yêu cầu của bạn và sẽ được thực thi đầy đủ 100% không dùng mã giữ chỗ (Zero-Placeholder Policy).

- **Quyết định đã xác nhận 1 — Kiến trúc Single-File & Xuất HTML Độc Lập**: Toàn bộ giao diện, mô phỏng Canvas 2D, không gian WebGL 3D (Three.js), đồ thị thời gian thực (Chart.js), giọng nói tiếng Việt (Web Speech API) và bộ máy AI được tích hợp chạy trực tiếp trên nền tảng kèm nút tải xuống file HTML độc lập chỉ với 1 cú nhấp chuột để mở trực tiếp trên mọi máy tính.
- **Quyết định đã xác nhận 2 — Hệ thống AI Kết Hợp Đa Tầng (Hybrid Gemini + Smart AI Offline)**: Hệ thống ưu tiên kết nối qua API proxy máy chủ an toàn tới mô hình Gemini hệ thống, đồng thời hỗ trợ tùy chọn cấu hình dự phòng khi mang file đi thuyết trình độc lập và tự động chuyển sang **Smart AI Simulation Engine** phân tích `window.currentLabState` theo thời gian thực khi ngoại tuyến.
- **Quyết định đã xác nhận 3 — Đề Thi Trắc Nghiệm AI Chuẩn THPT Mới (Bộ GD&ĐT 2025+)**: Bài kiểm tra AI tự động sinh câu hỏi dựa trên chính dữ liệu thực hành học sinh vừa thao tác, kết hợp **Phần I (Trắc nghiệm 4 lựa chọn)** và **Phần II (Trắc nghiệm Đúng/Sai 4 mệnh đề a, b, c, d)** kèm chấm điểm và giải thích bản chất khoa học chi tiết.

---

## 1. Tổng Quan & Giá Trị Cốt Lõi

- **Chức năng chính**: Cho phép học sinh thực hiện các thí nghiệm Hóa học (chuẩn độ, kết tủa, phản ứng kim loại - axit, cảnh báo an toàn pha loãng $H_2SO_4$ đặc), Vật lý (mạch điện một chiều/xoay chiều, định luật Ohm, đoản mạch, trường điện từ Solenoid & con lắc 3D trong các trường hấp dẫn Trái Đất/Mặt Trăng/Sao Hỏa) và Sinh học (nhân đôi & đột biến ADN xoắn kép 3D, sinh lý tim mạch & điện tâm đồ ECG dưới tác động của Adrenaline/Acetylcholine).
- **Đối tượng sử dụng**: Học sinh và giáo viên THPT Việt Nam theo chương trình GDPT 2018, ban giám khảo các cuộc thi Khoa học Kỹ thuật / STEM / EdTech.
- **Giá trị đột phá**:
  - **Text-to-Lab AI**: Nhập đề bài bằng ngôn ngữ tự nhiên tiếng Việt, hệ thống tự động bóc tách thông số, chuyển phòng bộ môn và dựng ngay thí nghiệm trước mắt.
  - **Cảnh báo An toàn Đa giác quan**: Phát hiện thao tác nguy hiểm (đổ nước vào axit đặc, thả Na lớn, đoản mạch $R \to 0$, nhịp tim vượt ngưỡng 180 BPM) với hiệu ứng rung chấn, tia lửa/bốc khói, còi cảnh báo Web Audio API và giọng đọc AI tiếng Việt (`vi-VN`) tức thời.
  - **Nhận thức Trạng thái Thực (`Live Lab State JSON`)**: Gia sư AI Socratic đọc trực tiếp toàn bộ biến số trên bàn thí nghiệm để giải thích hiện tượng, viết phương trình bản chất và gợi mở tư duy.

---

## 2. Trải Nghiệm Người Dùng & Thiết Kế Thị Giác

### Luồng Trải Nghiệm Người Dùng (Key User Flows)
1. **Khởi tạo & Chuyển Bộ Môn**: Người dùng mở ứng dụng, chọn một trong 3 phòng bộ môn (**Vật Lý**, **Hóa Học**, **Sinh Học**) hoặc chọn nhanh một **Bài thí nghiệm chuẩn SGK** ở cột trái.
2. **Thao tác Thí nghiệm & Giả định "What-If"**: Người dùng đổ hóa chất / kéo thanh trượt thông số / tiêm hoạt chất sinh học, hoặc bật các kịch bản giả định (*Đưa phòng Lab lên Sao Hỏa*, *Tăng nhiệt độ 500°C*, *Đột biến điểm ADN*).
3. **Quan sát Đa chiều (2D Tương tác ↔ 3D WebGL & Đồ thị Live)**: Chuyển đổi tức thì giữa bàn thí nghiệm 2D và kính lúp phân tử / trường điện từ / giải phẫu 3D xoay 360°, trong khi đồ thị Chart.js phía dưới vẽ đường cong thời gian thực.
4. **Tương tác Gia sư AI & Đánh giá**: Đặt câu hỏi cho Socratic AI Co-Pilot ở cột phải, xuất **Báo Cáo Thực Hành** đầy đủ bảng số liệu + nhận xét sai số, hoặc làm **Bài Thi Trắc Nghiệm AI** chấm điểm trực tiếp.

### Ngôn Ngữ Thiết Kế & Bảng Màu Khoa Học
- **Phong cách chủ đạo**: *Precision Scientific Dark Glassmorphism* — lấy cảm hứng từ hệ thống điều khiển phòng thí nghiệm không gian hiện đại, ưu tiên độ tương phản cao, đường viền mảnh sắc nét và số liệu định dạng bảng (`tabular-nums`).
- **Phân bổ màu sắc (Quy tắc 60-30-10)**:
  - **60% Nền Không Gian Chính (`--background`)**: Đen xanh vũ trụ sâu (`#0B0F19` / `slate-950`) giúp làm nổi bật hiệu ứng phát sáng của dung dịch hóa học, hạt electron và mô hình 3D.
  - **30% Bề Mặt Cấu Trúc (`--surface`)**: Kính mờ kỹ thuật (`rgba(15, 23, 42, 0.78)`) với đường viền mảnh `1px solid rgba(148, 163, 184, 0.16)`.
  - **10% Điểm Nhấn Theo Bộ Môn (`--accent`)**:
    - **Phòng Vật Lý**: Xanh Cyan Điện Tử (`#06B6D4` / `#22D3EE`).
    - **Phòng Hóa Học**: Tím Hồng Neon Phân Tử (`#EC4899` / `#A855F7`).
    - **Phòng Sinh Học**: Xanh Lá Ngọc Lục Bảo (`#10B981` / `#34D399`).
    - **Trạng thái An toàn**: Xanh Nominal (`#10B981`), Vàng Chú ý (`#F59E0B`), Đỏ Nguy hiểm (`#EF4444`) luôn đi kèm biểu tượng và nhãn văn bản rõ ràng.
- **Hệ thống Typography**:
  - **Tiêu đề & Giao diện**: `Plus Jakarta Sans` (SemiBold/Bold 600–700) hiện đại, hỗ trợ tiếng Việt hoàn hảo.
  - **Số liệu Đo lường, Công thức & JSON**: `JetBrains Mono` kết hợp `font-variant-numeric: tabular-nums` đảm bảo các thông số pH, nhiệt độ, Ampe kế, Vôn kế, BPM nhảy liên tục mà không làm rung bố cục.

---

## 3. Quyết Định Sản Phẩm & Đánh Đổi Kỹ Thuật

- **Quyết định 1: Kết hợp Canvas 2D Vật lý Hạt & Three.js WebGL 3D Thủ tục (Procedural 3D)**
  - *Giải pháp lựa chọn*: Xây dựng động cơ hạt 2D tốc độ cao cho cốc phản ứng hóa học và sơ đồ mạch điện, kết hợp cảnh Three.js 3D dựng bằng thuật toán hình học thủ tục (Ball-and-Stick phân tử kèm đám mây electron, cuộn dây Solenoid 3D kèm đường sức từ và hệ con lắc đơn, chuỗi xoắn kép ADN 24 cặp bazơ và mô hình tim 3D đa buồng co bóp).
  - *Lý do*: Không phụ thuộc vào các file `.glb`/`.png` bên ngoài (Zero-404), khởi chạy tức thì dưới 100ms, hoạt động 100% ngay cả khi người dùng tải file `index.html` về mở ngoại tuyến.
- **Quyết định 2: Bộ máy Phản ứng Hóa học & Vật lý Định lượng Thực**
  - *Giải pháp lựa chọn*: Tính toán nồng độ mol ($n = C_M \cdot V$), cân bằng $H^+$ / $OH^-$ để suy ra độ pH thực tế theo công thức logarit, tính nhiệt lượng tỏa ra $\Delta H$, định luật Ohm $I = \frac{U}{R + R_d}$, công suất $P = I^2 R_d$, chu kỳ con lắc $T = 2\pi\sqrt{l/g}$ và phương trình sóng điện tâm đồ P-Q-R-S-T động.
  - *Lý do*: Đảm bảo tính chính xác khoa học chuẩn SGK GDPT 2018 và tạo dữ liệu thực cho đồ thị Chart.js cùng Gia sư AI.
- **Quyết định 3: Âm thanh Tổng hợp Web Audio API + Giọng đọc Tiếng Việt Web Speech API**
  - *Giải pháp lựa chọn*: Dùng bộ dao động âm thanh `AudioContext` để tạo tiếng sủi bọt khí, tiếng nổ/tia lửa điện, tiếng bíp nhịp tim ECG và còi báo động an toàn, kết hợp `window.speechSynthesis` (`vi-VN`) cho lời nhắc của AI Mentor.
  - *Lý do*: Phản hồi âm thanh đa giác quan sống động mà không cần tải file âm thanh ngoài.

---

## 4. Kiến Trúc Kỹ Thuật & Luồng Dữ Liệu

### Sơ Đồ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         TOP NAVIGATION & TEXT-TO-LAB AI BAR                             │
│  [Logo + GDPT 2018] │ [⚡ Vật Lý | 🧪 Hóa Học | 🧬 Sinh Học] │ [Text-to-Lab] │ [Actions] │
└───────────────┬─────────────────────────────┬─────────────────────────────┬─────────────┘
                │                             │                             │
                ▼                             ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────────┐ ┌─────────────────────────┐
│   LEFT SIDEBAR (20% W)    │ │   CENTER VIEWPORT (55% W)     │ │  RIGHT SIDEBAR (25% W)  │
│                           │ │                               │ │                         │
│ • Bài Thí Nghiệm Chuẩn SGK│ │ ┌───────────────────────────┐ │ │ • Safety Status Banner  │
│   (Lý / Hóa / Sinh)       │ │ │ Floating Viewport Toolbar │ │ │   (An toàn/Chú ý/Nguy)  │
│                           │ │ │ [2D Lab <-> 3D WebGL]     │ │ │                         │
│ • Tủ Hóa Chất / Dụng Cụ   │ │ │ [Làm lại][Tạm dừng][Voice]│ │ │ • Live Lab State JSON   │
│   & Thanh Trượt Thông Số  │ │ └─────────────┬─────────────┘ │ │   (window.currentLabState│
│                           │ │               ▼               │ │    Real-time Inspector) │
│ • Kịch Bản "What-If"      │ │ ┌───────────────────────────┐ │ │                         │
│   (Sao Hỏa, 500°C, X-Ray) │ │ │  2D Interactive Canvas    │ │ │ • Socratic AI Co-Pilot  │
│                           │ │ │           OR              │ │ │   + Quick Prompts       │
│ • Live Telemetry &        │ │ │  3D Three.js WebGL Stage  │ │ │   + Hybrid Gemini API & │
│   Nhật Ký Thao Tác        │ │ └─────────────┬─────────────┘ │ │     Smart Local Engine  │
│                           │ │               ▼               │ │                         │
│                           │ │ ┌───────────────────────────┐ │ │                         │
│                           │ │ │ Real-Time Chart.js Panel  │ │ │                         │
│                           │ │ │ (Chuẩn độ pH / I-U / ECG) │ │ │                         │
│                           │ │ └───────────────────────────┘ │ │                         │
└───────────────────────────┘ └───────────────────────────────┘ └─────────────────────────┘
                                              │
                ┌─────────────────────────────┴─────────────────────────────┐
                ▼                                                           ▼
┌───────────────────────────────────────────┐ ┌───────────────────────────────────────────┐
│     MODAL 1: BÁO CÁO THỰC HÀNH CHUẨN      │ │   MODAL 2: THI TRẮC NGHIỆM AI (THPT MỚI)  │
│ • Lịch sử thao tác & Bảng số liệu các lần │ │ • Phần I: Câu hỏi 4 lựa chọn (A, B, C, D) │
│ • Đánh giá sai số & Nhận xét từ AI        │ │ • Phần II: Câu Đúng/Sai 4 ý (a, b, c, d)  │
│ • In báo cáo / Xuất file HTML độc lập     │ │ • Chấm điểm tự động & Giải thích chi tiết │
└───────────────────────────────────────────┘ └───────────────────────────────────────────┘
```

### Mô Hình Trạng Thái Trung Tâm (`window.currentLabState`)
Toàn bộ trạng thái bàn thí nghiệm được đồng bộ hóa liên tục vào đối tượng `window.currentLabState` và hiển thị trực tiếp tại khung JSON ở cột phải:
- `subject`: `'chemistry' | 'physics' | 'biology'`
- `viewMode`: `'2d' | '3d'`
- `safetyLevel`: `'SAFE' | 'WARNING' | 'CRITICAL'` kèm thông điệp cảnh báo cụ thể.
- `chemistry`: Thể tích cốc (`totalVolumeMl`), nhiệt độ (`temperatureC`), độ pH (`pH`), danh sách chất đã thêm (`chemicals`), màu dung dịch RGBA, lượng kết tủa (`precipitateColor`, `precipitateAmount`), tốc độ sủi bọt khí (`gasRate`), phương trình phân tử & phương trình ion rút gọn hiện tại, phân tử 3D đang soi (`H2O`, `H2SO4`, `CH4`, `NaCl`, `CuSO4`).
- `physics`: Hiệu điện thế $U$ (V), biến trở $R$ ($\Omega$), điện trở đèn $R_d$ ($\Omega$), tần số $f$ (Hz), cường độ dòng điện $I$ (A), công suất $P$ (W), gia tốc trọng trường $g$ ($m/s^2$ — Trái Đất / Mặt Trăng / Sao Hỏa), trạng thái dây tóc bóng đèn (`intact` / `blown`), chế độ 3D (`solenoid` / `pendulum`).
- `biology`: Mô hình đang chọn (`dna` / `heart`), nhịp tim (`bpm`), huyết áp (`systolic`/`diastolic`), nồng độ $O_2$ (%), nhiệt độ cơ thể (°C), hoạt chất đã tiêm (`Adrenaline`, `Acetylcholine`), trạng thái nhân đôi ADN (`isReplicating`), tỷ lệ đột biến (`mutationRate`).
- `actionHistory` & `measurements`: Mảng lưu toàn bộ nhật ký thao tác có gắn mốc thời gian và các lần ghi số liệu phục vụ xuất báo cáo thực hành.

### Ánh Xạ Tương Tác & Xử Lý Sự Kiện (Interactive Component Mapping)
- **Bộ phân tích Text-to-Lab AI**: Khi người dùng nhập câu lệnh (ví dụ: *"Cho 20ml NaOH 1M vào 20ml CuSO4"*, *"Mắc mạch điện U=18V, R=3 Ohm"*, *"Tiêm Adrenaline vào tim"*), bộ phân tích NLP/AI trích xuất thực thể hóa học/vật lý/sinh học, tự động chuyển tab môn học, thực thi hàm nạp chất/chỉnh thanh trượt, ghi nhật ký và kích hoạt giọng nói thuyết minh.
- **Tương tác Phòng Hóa Học**:
  - Đổ từng hóa chất ($HCl$, $H_2SO_4$ đặc, $NaOH$, $Ba(OH)_2$, $AgNO_3$, $CuSO_4$, $Zn$, $Na$, $H_2O$, Phenolphtalein, Quỳ tím) với thanh chọn thể tích (5ml – 50ml) và thanh trượt nhiệt độ bếp đun.
  - Tự động nội suy màu sắc dung dịch, tạo hạt kết tủa lắng xuống đáy ($Cu(OH)_2$ xanh lơ, $BaSO_4$ trắng, $AgCl$ trắng), hạt bọt khí $H_2$ bay lên, hoặc kích hoạt cảnh báo đỏ + rung màn hình khi đổ nước vào $H_2SO_4$ đặc / thả $Na$ quá mức.
- **Tương tác Phòng Vật Lý**:
  - Điều chỉnh $U$, $R$, $R_d$, $f$, chọn hành tinh ($g$). Hạt electron chuyển động dọc mạch điện với vận tốc tỉ lệ với $I$; bóng đèn phát sáng theo công suất $P$.
  - Khi $R \to 0$ gây đoản mạch ($I > 5\text{A}$), dây tóc đứt kèm hiệu ứng tia lửa điện, nút "Thay bóng đèn & Lắp cầu chì" cho phép khôi phục mạch.
- **Tương tác Phòng Sinh Học**:
  - Chuyển đổi giữa **Chuỗi xoắn kép ADN 3D** (nút bật Tự nhân đôi tách mạch, nút gây Đột biến điểm thay thế cặp A-T bằng G-X) và **Giải phẫu Tim 3D** (tiêm Adrenaline tăng nhịp tim/huyết áp, tiêm Acetylcholine giảm nhịp, cảnh báo rung thất khi $>180$ BPM).
- **Hệ thống Báo Cáo & Thi Trắc Nghiệm AI**:
  - Modal Báo cáo tổng hợp bảng số liệu thực tế từ `window.currentLabState.measurements`, cho phép ghi điểm đo mới, in báo cáo PDF hoặc tải xuống file `index.html` hoàn chỉnh.
  - Modal Thi Trắc Nghiệm AI khởi tạo bộ đề bám sát thí nghiệm hiện tại, hỗ trợ chọn đáp án, nộp bài, chấm điểm thang 10 và hiển thị lời giải chi tiết từng ý.
