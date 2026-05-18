import React, { useState } from "react";
import "../../styles/HistorySandboxSection.css";

const PRESETS = [
  {
    id: "x-sin-x",
    label: "∫ x * sin(x) dx",
    formula: "x \\cdot \\sin(x)",
    eras: {
      "1687": {
        eraName: "Kỷ nguyên Newton & Leibniz (1687)",
        method: "Phương pháp Fluxion & Hình học Cổ điển",
        time: "~14 Giờ (Suy luận & Khảo sát Giấy da)",
        accuracy: "100% (Xác minh thủ công bởi nhà toán học)",
        platform: "Bộ não con người + Bàn tính gỗ + Mực lông chim",
        difficulty: "Cực kỳ gian nan - Đòi hỏi tư duy đột phá tối cao",
        visualType: "parchment",
        output: [
          "■ KHẢO SÁT PHƯƠNG PHÁP TÍCH PHÂN BẰNG HÌNH HỌC PHÁT SINH (FLUXIONS) ■",
          "Giả định biến số x tăng trưởng liên tục tạo ra lượng thông lượng dx.",
          "Áp dụng quy tắc đạo hàm tích số mới phát minh (Newton's Product Rule):",
          "   d(u · v) = u · dv + v · du  =>  u · dv = d(u · v) - v · du",
          "",
          "Đặt các đại lượng hình học đại diện:",
          "   u = x       => du = dx  (Thông lượng tuyến tính)",
          "   dv = sin(x) => v  = -cos(x) (Diện tích biến thiên hình sin)",
          "",
          "Tích phân hai vế theo luật vi phân Leibniz:",
          "   ∫ x · sin(x) dx = x · (-cos(x)) - ∫ (-cos(x)) dx",
          "                   = -x · cos(x) + ∫ cos(x) dx",
          "                   = -x · cos(x) + sin(x)",
          "",
          "Kết luận hình học cuối cùng (Thêm hằng số liên kết Flux C):",
          "   Q.E.D:  sin(x) - x·cos(x) + C"
        ]
      },
      "1968": {
        eraName: "Thời kỳ Mainframe LISP (1968)",
        method: "Thuật toán Khớp mẫu Moses' SIN (Symbolic Integrator)",
        time: "2420 Mili-giây (2.42 giây CPU)",
        accuracy: "78% (Hạn chế ở các dạng hàm phức tạp)",
        platform: "IBM 7094 Mainframe (Bộ nhớ lõi từ 32KB Magnetic Core)",
        difficulty: "Khá cao - Tối ưu hóa bộ nhớ RAM cực kỳ khắc nghiệt",
        visualType: "crt",
        output: [
          "LOADED FORTRAN-LISP COMPILER V1.2.6...",
          "ALLOCATING 12,000 WORDS OF CORE MEMORY.",
          "",
          "*(INTEGRATE '(TIMES X (SIN X)) 'X)",
          ">> PARSING SYMBOLIC MATHEMATICAL EXPRESSION TREE...",
          ">> EXPRESSION MATCHED PRE-DEFINED SCHATZMAN PATTERNS.",
          ">> INITIATING SUB-ALGORITHM SIN-PARTS (INTEGRATION BY PARTS):",
          "     U   = X",
          "     D-V = (SIN X)",
          ">> GENERATING DERIVATIVE SUB-GOAL: (DIFF 'X 'X) => 1",
          ">> GENERATING INTEGRAL SUB-GOAL: (INTEG '(SIN X) 'X) => (MINUS (COS X))",
          ">> RECURSIVE EVALUATION OF NEW TARGET...",
          ">> SOLVED SUB-GOAL: (INTEG '(MINUS (COS X)) 'X) => (MINUS (SIN X))",
          "",
          ">> COMBINING SYMBOLIC NODES...",
          ">> RUNNING SIMPLIFIER OVER TREE GRAPH...",
          "RESULT-TREE: (DIFFERENCE (SIN X) (TIMES X (COS X)))",
          "",
          "STATUS: SUCCESSFUL SOLUTION COMPLETED IN 2.42 SEC.",
          "CORE USAGE: 8,432 WORDS. GC COUNT: 1."
        ]
      },
      "1990": {
        eraName: "Kỷ nguyên Classic CAS (1990)",
        method: "Thuật toán Risch & Khử Đại số Cơ sở",
        time: "340 Mili-giây (0.34 giây)",
        accuracy: "92% (Chính xác tuyệt đối cho hàm sơ cấp)",
        platform: "NeXT Computer Workstation (Vi xử lý Motorola 68040 25MHz)",
        difficulty: "Trung bình - Đã có thư viện máy tính biểu thức hoàn thiện",
        visualType: "notebook",
        output: [
          "Mathematica 2.0 -- Terminal Interface",
          "Copyright 1988-1991 Wolfram Research, Inc.",
          "",
          "In[1]:= Integrate[x * Sin[x], x]",
          "",
          "(* Processing Risch transcendental algorithm decision tree *)",
          "(* Step 1: Define differential extension field K = Q(x, exp(ix)) *)",
          "(* Step 2: Establish polynomial integration boundary *)",
          "(* Step 3: Apply integration by parts table lookup Rule-420 *)",
          "   Term 1: -x * Cos[x]",
          "   Term 2: + Sin[x]",
          "",
          "Out[1]= Sin[x] - x Cos[x]",
          "",
          "In[2]:= LeafCount[Out[1]]",
          "Out[2]= 7",
          "",
          "In[3]:= Quit[]"
        ]
      },
      "2026": {
        eraName: "Deep Learning AI GNN Solver (2026)",
        method: "Graph Neural Network (GNN) + Mathematical Transformer",
        time: "12 Mili-giây (0.012 giây GPU)",
        accuracy: "99.98% (Độ tin cậy mô hình: 99.97%)",
        platform: "NVIDIA H100 Tensor Core GPU Cluster (Cloud API)",
        difficulty: "Dễ dàng - Tối ưu hóa suy luận song song tức thời",
        visualType: "neural",
        output: [
          "[SYSTEM] Kích hoạt Graph Neural Network (GNN) Solver Core...",
          "[GRAPH] Tải biểu thức vào đồ thị token toán học (12 Nodes, 11 Edges).",
          "[ATTENTION] Kích hoạt Multi-Head Attention (Đầu số 4 & 7 tập trung vào cụm vi phân):",
          "    - Node-1 [Integrate] -> liên kết trọng số cao (0.982) với Node-3 [Product]",
          "    - Node-5 [x] và Node-8 [sin] được gán nhãn [Polynomial] & [Trig]",
          "[INFERENCE] Dự đoán chuỗi Token giải tích tối ưu nhất qua GNN Classifier:",
          "    ↳ Dự đoán bước 1: 'sin(x) - x*cos(x)' (Độ tin cậy: 0.9998)",
          "    ↳ Dự đoán bước 2: '+ C' (Độ tin cậy: 0.9999)",
          "[DECODE] Chuyển đổi mã hóa Token sang định dạng Math LaTeX thành công.",
          "",
          "------------------ KẾT QUẢ GIẢI ĐỒ THỊ NEURAL ------------------",
          "  Hàm số: f(x) = x · sin(x)",
          "  Tích phân: F(x) = sin(x) - x · cos(x) + C",
          "  Trọng số suy luận: 0.999884",
          "  Độ trễ suy luận: 12ms",
          "-----------------------------------------------------------------"
        ]
      }
    }
  },
  {
    id: "inv-tan",
    label: "∫ 1 / (x^2 + 1) dx",
    formula: "\\frac{1}{x^2 + 1}",
    eras: {
      "1687": {
        eraName: "Kỷ nguyên Newton & Leibniz (1687)",
        method: "Khai triển Chuỗi Lũy thừa Vô hạn",
        time: "~22 Giờ (Bất đồng về đạo hàm lượng giác ngược)",
        accuracy: "100% (Chấp nhận dưới dạng chuỗi vô hạn hội tụ)",
        platform: "Bộ não Leibniz + Bản thảo hình học vi phân",
        difficulty: "Rất cao - Đòi hỏi phát minh ra chuỗi lượng giác ngược",
        visualType: "parchment",
        output: [
          "■ PHÂN TÍCH DIỆN TÍCH DƯỚI ĐƯỜNG CONG HYPERBOLA VÀ HÌNH TRÒN ■",
          "Khảo sát phương trình hàm số: y = 1 / (1 + x²)",
          "Thực hiện khai triển chuỗi lũy thừa hình học vô hạn (Leibniz Series):",
          "   1 / (1 + x²) = 1 - x² + x⁴ - x⁶ + x⁸ - x¹⁰ + ... (với |x| < 1)",
          "",
          "Thực hiện tích phân từng số hạng của chuỗi liên tục:",
          "   ∫ (1 - x² + x⁴ - x⁶ + ...) dx = x - x³/3 + x⁵/5 - x⁷/7 + x⁹/9 - ...",
          "",
          "Leibniz định nghĩa hàm số lượng giác ngược biểu trưng cho cung tròn:",
          "   Góc lượng giác biểu diễn tỉ số x chính là Arc-Tangent.",
          "   Do đó, tổng vô hạn trên hội tụ về giá trị của cung tròn (Arcus Tangent).",
          "",
          "Kết luận cuối cùng:",
          "   ∫ 1 / (1 + x²) dx = arctan(x) + C"
        ]
      },
      "1968": {
        eraName: "Thời kỳ Mainframe LISP (1968)",
        method: "Tra bảng Tích phân Cơ bản & Quy tắc Rập khuôn",
        time: "1150 Mili-giây (1.15 giây CPU)",
        accuracy: "95% (Hàm mẫu chuẩn trong bảng tra cứu)",
        platform: "IBM 7094 Mainframe",
        difficulty: "Thấp - Giải quyết nhanh nhờ cấu trúc bảng ánh xạ trực tiếp",
        visualType: "crt",
        output: [
          "STARTING ENGINE...",
          "READING INPUT STRING: '(INTEGRATE '(DIVIDE 1 (PLUS (EXPT X 2) 1)) 'X)",
          "",
          ">> PARSING NODES...",
          ">> DETECTED FRACTION STRUCTURE: 1 / (X^2 + A^2) WITH A=1",
          ">> SEARCHING PRIMARY SCHATZMAN TABLE...",
          ">> KEY MATCH FOUND IN TABLE-INDEX #184:",
          "     KEY: (INTEG '(DIVIDE 1 (PLUS (EXPT X 2) (EXPT A 2))) 'X)",
          "     VALUE: '(DIVIDE (ATAN (DIVIDE X A)) A)",
          "",
          ">> SUBSTITUTING A=1 INTO TEMPLATE...",
          ">> RESULT SIMPLIFIED TO: (ATAN X)",
          "",
          "STATUS: SUCCESSFUL PARSE AND TABLE RETRIEVAL.",
          "COMPUTATION TIME: 1.15 SECONDS."
        ]
      },
      "1990": {
        eraName: "Kỷ nguyên Classic CAS (1990)",
        method: "Risch Algorithm & Biến đổi Lượng giác Ngược",
        time: "90 Mili-giây (0.09 giây)",
        accuracy: "99% (Bảng tra thuật toán tối ưu hóa)",
        platform: "NeXT Computer Workstation",
        difficulty: "Rất thấp - Thuật toán cơ bản của thế hệ máy tính cá nhân",
        visualType: "notebook",
        output: [
          "In[1]:= Integrate[1 / (x^2 + 1), x]",
          "",
          "(* Initiating Risch Integration Table Lookup *)",
          "(* Expression matches rational type *)",
          "(* Applying algebraic factorization over complex numbers: *)",
          "   1/(x^2 + 1) = I/(2*(x + I)) - I/(2*(x - I))",
          "(* Integrate terms to get logarithmic representation: *)",
          "   Result = (I/2) * Log[x - I] - (I/2) * Log[x + I]",
          "(* Convert logarithmic form back to real ArcTan using identity *)",
          "",
          "Out[1]= ArcTan[x]",
          "",
          "In[2]:= D[Out[1], x]",
          "Out[2]= 1 / (1 + x^2)"
        ]
      },
      "2026": {
        eraName: "Deep Learning AI GNN Solver (2026)",
        method: "Graph Neural Network (GNN) + Mathematical Transformer",
        time: "6 Mili-giây (0.006 giây GPU)",
        accuracy: "99.99% (Độ tin cậy mô hình: 99.99%)",
        platform: "NVIDIA H100 GPU Cluster",
        difficulty: "Dễ dàng - Thời gian xử lý ở mức tối thiểu",
        visualType: "neural",
        output: [
          "[SYSTEM] Khởi chạy bộ giải tích GNN toán học...",
          "[GRAPH] Tải biểu thức (8 Nodes, 7 Edges).",
          "[ATTENTION] Độ tập trung phân bổ hoàn hảo vào ký hiệu phân số toán học.",
          "[INFERENCE] GNN nhận dạng hàm số hữu tỷ quen thuộc:",
          "    ↳ Dự đoán token: 'arctan(x) + C'",
          "    ↳ Trọng số tin cậy (Confidence): 0.99998",
          "[DECODE] Chuyển đổi mã hóa token toán học hoàn tất trong 6ms.",
          "",
          "------------------ KẾT QUẢ GIẢI ĐỒ THỊ NEURAL ------------------",
          "  Hàm số: f(x) = 1 / (x² + 1)",
          "  Tích phân: F(x) = arctan(x) + C",
          "  Trọng số suy luận: 0.99998",
          "  Độ trễ suy luận: 6ms",
          "-----------------------------------------------------------------"
        ]
      }
    }
  },
  {
    id: "e-x-cos-x",
    label: "∫ e^x * cos(x) dx",
    formula: "e^x \\cdot \\cos(x)",
    eras: {
      "1687": {
        eraName: "Kỷ nguyên Newton & Leibniz (1687)",
        method: "Phương pháp Vi tích phân Tuần hoàn (Bản thảo)",
        time: "~32 Giờ (Bận tâm về tính lặp vô hạn)",
        accuracy: "95% (Dễ nhầm lẫn dấu âm dương trong quá trình tính tay)",
        platform: "Bản thảo toán học của Leibniz & Bernoulli",
        difficulty: "Vô cùng phức tạp - Phải nhận ra vòng lặp tuần hoàn đại số",
        visualType: "parchment",
        output: [
          "■ KHẢO SÁT HÀM MŨ KẾT HỢP DAO ĐỘNG CONG (VI PHÂN TUẦN HOÀN) ■",
          "Cần tìm giá trị tích phân: I = ∫ e^x · cos(x) dx",
          "",
          "Áp dụng quy tắc tích phân từng phần lần thứ nhất:",
          "   u = e^x      => du = e^x dx",
          "   dv = cos(x) => v  = sin(x)",
          "   ↳ I = e^x · sin(x) - ∫ e^x · sin(x) dx",
          "",
          "Tiếp tục áp dụng tích phân từng phần lần thứ hai cho ∫ e^x · sin(x) dx:",
          "   u = e^x      => du = e^x dx",
          "   dv = sin(x)  => v  = -cos(x)",
          "   ↳ ∫ e^x · sin(x) = e^x · (-cos(x)) - ∫ (-cos(x)) · e^x dx",
          "                    = -e^x · cos(x) + ∫ e^x · cos(x) dx",
          "",
          "Thế ngược kết quả vào biểu thức ban đầu:",
          "   I = e^x · sin(x) - [ -e^x · cos(x) + I ]",
          "   I = e^x · sin(x) + e^x · cos(x) - I",
          "   2I = e^x (sin(x) + cos(x))",
          "",
          "Kết luận cuối cùng bằng phép chuyển vế đại số tuyệt vời:",
          "   Q.E.D: I = 1/2 · e^x (sin(x) + cos(x)) + C"
        ]
      },
      "1968": {
        eraName: "Thời kỳ Mainframe LISP (1968)",
        method: "Tích phân đệ quy & Kiểm soát vòng lặp tuần hoàn",
        time: "4890 Mili-giây (4.89 giây CPU)",
        accuracy: "62% (Nguy cơ tràn bộ nhớ stack do đệ quy sâu)",
        platform: "IBM 7094 Mainframe",
        difficulty: "Rất cao - Dễ dính lỗi lặp đệ quy vô hạn (Infinite Loop)",
        visualType: "crt",
        output: [
          "WARNING: INITIATING RECURSIVE SUB-GOAL EVALUATOR.",
          "DETERMINING STACK BOUNDS: MAX DEPTH SET TO 25.",
          "",
          "*(INTEGRATE '(TIMES (EXPT E X) (COS X)) 'X)",
          ">> CALLING INTEGRATION BY PARTS RULE ONCE...",
          "     GOAL-1: (MINUS (INTEG '(TIMES (EXPT E X) (SIN X)) 'X))",
          ">> STACK DEPTH: 1. INITIATING PARTS RULE ON GOAL-1...",
          "     GOAL-2: (INTEG '(TIMES (EXPT E X) (COS X)) 'X)",
          ">> STACK DEPTH: 2.",
          ">> ALGEBRAIC EQUIVALENCE MONITOR DETECTED CYCLIC STACK LOOP!",
          "     INITIAL-GOAL IDENTICAL TO CURRENT-SUB-GOAL: GOAL-2 == INITIAL",
          ">> TRIGGERING CYCLIC REDUCTION SUBROUTINE...",
          ">> FORMULATING ALGEBRAIC SOLVER: I = A - (B + I) => 2I = A - B",
          ">> SOLVING EQUATION FOR 'I...",
          "",
          ">> SUCCESS! EXTRACTING FINAL TREE NODES...",
          "RESULT-TREE: (TIMES 0.5 (EXPT E X) (PLUS (SIN X) (COS X)))",
          "",
          "STATUS: SUCCESSFUL LOOP DETECTED AND EXTRACTED.",
          "RUN TIME: 4.89 SECONDS. RECURSIVE STEPS: 2."
        ]
      },
      "1990": {
        eraName: "Kỷ nguyên Classic CAS (1990)",
        method: "Thuật toán Risch & Khử Đại số Phức Euler",
        time: "410 Mili-giây (0.41 giây)",
        accuracy: "95% (Thuật toán tối giản thông qua số phức)",
        platform: "NeXT Computer Workstation",
        difficulty: "Trung bình - Giải thuật Risch xử lý xuất sắc tích phân chu kỳ",
        visualType: "notebook",
        output: [
          "In[1]:= Integrate[Exp[x] * Cos[x], x]",
          "",
          "(* Converting cosine to exponential form using Euler's formula *)",
          "   Cos[x] = (Exp[I*x] + Exp[-I*x]) / 2",
          "(* Expression rewrites as standard complex exponentials: *)",
          "   Integrand = (Exp[(1 + I)*x] + Exp[(1 - I)*x]) / 2",
          "(* Integrate terms directly using standard exponential rules: *)",
          "   Result = Exp[(1 + I)*x] / (2*(1 + I)) + Exp[(1 - I)*x] / (2*(1 - I))",
          "(* Factoring and converting complex output back to real domain *)",
          "",
          "Out[1]= (Exp[x] * (Cos[x] + Sin[x])) / 2",
          "",
          "In[2]:= Simplify[Out[1]]",
          "Out[2]= 1/2 * e^x * (Cos[x] + Sin[x])"
        ]
      },
      "2026": {
        eraName: "Deep Learning AI GNN Solver (2026)",
        method: "Graph Neural Network (GNN) + Mathematical Transformer",
        time: "15 Mili-giây (0.015 giây GPU)",
        accuracy: "99.96% (Độ tin cậy mô hình: 99.94%)",
        platform: "NVIDIA H100 GPU Cluster",
        difficulty: "Dễ dàng - Giải tuần hoàn tức thời bằng Attention Map",
        visualType: "neural",
        output: [
          "[SYSTEM] Khởi chạy bộ giải tích toán học Transformer...",
          "[GRAPH] Tải đồ thị (14 Nodes, 13 Edges).",
          "[ATTENTION] Kích hoạt Multi-Head Attention.",
          "    - Đầu chú ý phát hiện cụm [e^x] liên kết tuần hoàn với [cos(x)].",
          "    - Trọng số tự động chuyển tiếp sang nhánh giải tích tuần hoàn.",
          "[INFERENCE] GNN Decoder phân tích và sinh chuỗi Token tối ưu nhất:",
          "    ↳ Token đích: '0.5 * e^x * (sin(x) + cos(x)) + C'",
          "    ↳ Trọng số tin cậy (Confidence): 0.9996",
          "[DECODE] Giải mã toán học LaTeX hoàn tất trong 15ms.",
          "",
          "------------------ KẾT QUẢ GIẢI ĐỒ THỊ NEURAL ------------------",
          "  Hàm số: f(x) = e^x · cos(x)",
          "  Tích phân: F(x) = 0.5 · e^x · (sin(x) + cos(x)) + C",
          "  Trọng số suy luận: 0.999642",
          "  Độ trễ suy luận: 15ms",
          "-----------------------------------------------------------------"
        ]
      }
    }
  }
];

export default function HistorySandboxSection() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [selectedEra, setSelectedEra] = useState("2026");

  const currentPreset = PRESETS[selectedPresetIndex];
  const eraData = currentPreset.eras[selectedEra];

  return (
    <section className="history-snap-section history-sandbox-section">
      <div className="sandbox-wrapper">
        {/* Header Title with premium gradient */}
        <div className="sandbox-header">
          <div className="sandbox-badge">INTERACTIVE SIMULATION</div>
          <h2 className="sandbox-title">Trình Giả Lập Tiến Hóa Toán Học</h2>
          <p className="sandbox-subtitle">
            Trực tiếp kiểm thử sự phát triển vượt bậc của khoa học vi tích phân và trí tuệ nhân tạo. Chọn bài toán của bạn và quan sát cách giải qua các thời kỳ lịch sử.
          </p>
        </div>

        {/* Playground Layout Container */}
        <div className="sandbox-playground">
          
          {/* Top Control Bar: Pick Preset and Era */}
          <div className="sandbox-controls">
            {/* Left: Formula Presets */}
            <div className="control-group">
              <label className="control-label">1. Chọn bài toán tích phân:</label>
              <div className="preset-tabs">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={preset.id}
                    className={`preset-tab-btn ${selectedPresetIndex === idx ? "active" : ""}`}
                    onClick={() => setSelectedPresetIndex(idx)}
                  >
                    <span className="formula-text">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Era Selectors */}
            <div className="control-group">
              <label className="control-label">2. Chọn thời kỳ lịch sử giải bài:</label>
              <div className="era-tabs">
                {Object.keys(currentPreset.eras).map((era) => {
                  const label = 
                    era === "1687" ? "1687 Newton/Leibniz" :
                    era === "1968" ? "1968 Mainframe LISP" :
                    era === "1990" ? "1990 Classic CAS" : "2026 Deep AI GNN";
                  return (
                    <button
                      key={era}
                      className={`era-tab-btn ${selectedEra === era ? "active" : ""}`}
                      onClick={() => setSelectedEra(era)}
                    >
                      <span className="era-tab-year">{era}</span>
                      <span className="era-tab-title">{label.split(" ")[1] || ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sandbox Core Visualizers: Left Specs, Right Output Screen */}
          <div className="sandbox-display-panel">
            
            {/* Left Column: Era Specifications Dashboard */}
            <div className="sandbox-specs-col">
              <div className="specs-glass-card">
                <div className="specs-card-header">
                  <span className="specs-dot glowing" />
                  <h4>THÔNG SỐ KỸ THUẬT THỜI KỲ</h4>
                </div>

                <div className="specs-list">
                  <div className="spec-item">
                    <span className="spec-label">Thời kỳ:</span>
                    <span className="spec-val highlight-era">{eraData.eraName}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Giải thuật:</span>
                    <span className="spec-val">{eraData.method}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Thời gian giải:</span>
                    <span className="spec-val highlight-time">{eraData.time}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Độ chính xác:</span>
                    <span className="spec-val">{eraData.accuracy}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Phần cứng:</span>
                    <span className="spec-val">{eraData.platform}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Độ khó giải thuật:</span>
                    <span className="spec-val">{eraData.difficulty}</span>
                  </div>
                </div>

                {/* Micro Neon Analytics Ring */}
                <div className="specs-ring-chart">
                  <div className="ring-visual">
                    <svg className="svg-ring" viewBox="0 0 100 100">
                      <circle className="ring-bg" cx="50" cy="50" r="40" />
                      <circle 
                        className={`ring-progress ring-color-${selectedEra}`} 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        strokeDasharray={
                          selectedEra === "1687" ? "250 250" :
                          selectedEra === "1968" ? "190 250" :
                          selectedEra === "1990" ? "230 250" : "250 250"
                        }
                      />
                    </svg>
                    <div className="ring-label">
                      <span className="ring-percent">
                        {selectedEra === "1687" ? "100%" :
                         selectedEra === "1968" ? "78%" :
                         selectedEra === "1990" ? "92%" : "99.9%"}
                      </span>
                      <span className="ring-text">HIỆU NĂNG</span>
                    </div>
                  </div>
                  <div className="ring-caption">
                    {selectedEra === "2026" ? "Tối ưu hóa GPU tăng tốc suy luận tức thời cực đỉnh." :
                     selectedEra === "1990" ? "Tính toán đại số đáng tin cậy cho hàm sơ cấp." :
                     selectedEra === "1968" ? "Thuật toán khớp mẫu cổ điển bị giới hạn bởi RAM." :
                     "Suy luận tư duy toán học lý thuyết tuyệt đối xuất sắc."}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Simulated Terminal Screen */}
            <div className="sandbox-output-col">
              <div className={`terminal-outer-frame frame-${eraData.visualType}`}>
                
                {/* Top Titlebar of simulated software */}
                <div className="terminal-titlebar">
                  <div className="titlebar-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <span className="titlebar-text">
                    {selectedEra === "1687" ? "IsaacNewton_Parchment_Draft.txt" :
                     selectedEra === "1968" ? "IBM-7094-CONSOLE::TTY0" :
                     selectedEra === "1990" ? "Wolfram_Mathematica_2.0.nb" : "DeepMind_Integral_GNN_Solver.log"}
                  </span>
                  <span className="titlebar-badge">{selectedEra}</span>
                </div>

                {/* The dynamic terminal screens with distinct designs */}
                <div className={`terminal-screen screen-${eraData.visualType}`}>
                  
                  {/* Parchment background for 1687 */}
                  {eraData.visualType === "parchment" && (
                    <div className="parchment-texture-overlay" />
                  )}
                  
                  {/* Scanline CRT overlay for 1968 */}
                  {eraData.visualType === "crt" && (
                    <>
                      <div className="crt-scanlines" />
                      <div className="crt-flicker-overlay" />
                    </>
                  )}

                  {/* Neural circuit overlay for 2026 */}
                  {eraData.visualType === "neural" && (
                    <div className="neural-grid-bg" />
                  )}

                  {/* Simulated terminal lines */}
                  <div className="terminal-content">
                    {eraData.output.map((line, idx) => {
                      // Highlight special terms or headers dynamically
                      let isHeader = line.startsWith("■") || line.startsWith("---");
                      let isSystem = line.startsWith("[SYSTEM]") || line.startsWith("[GRAPH]") || line.startsWith("[ATTENTION]") || line.startsWith("[INFERENCE]") || line.startsWith("[DECODE]");
                      
                      return (
                        <div 
                          key={idx} 
                          className={`terminal-line ${isHeader ? "line-header" : ""} ${isSystem ? "line-system" : ""}`}
                        >
                          {isSystem ? (
                            <>
                              <span className="system-tag">{line.split(" ")[0]}</span>
                              <span className="system-content">{line.substring(line.indexOf(" "))}</span>
                            </>
                          ) : (
                            line
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
